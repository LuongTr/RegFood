const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// Replace this with your valid API key
// IMPORTANT: Don't expose this in production code - use environment variables
const API_KEY = "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"; 

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Missing message field" });
    }

    console.log("📤 Sending request to OpenRouter API...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        // Add HTTP_REFERER header (required by OpenRouter)
        "HTTP_REFERER": "https://localhost:3000",
        // Add X-Title header (recommended by OpenRouter)
        "X-Title": "NutriScan Chatbot"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { 
            role: "system", 
            content: "Bạn là trợ lý hỗ trợ người dùng về website NutriScan. Một website cung cấp các tính năng như nhận diện món ăn quan ảnh, tính calories từ các thông số người dùng nhập vào. Gợi ý thực đơn dựa trên lượng calories người dùng nhập. Tự tạo thực đơn cá nhân và track lại những thứ đã ăn hoặc uống. Người dùng cần phải đăng nhập mới có thể sử dụng các tính năng trên. Sau khi đăng nhập người dùng sẽ ở trang dashboard. Để nhận diện món ăn, bấm vào trang Food Recognition. Để tính calories, bấm vào trang Calories Calculator. Để tự tạo thực đơn cá nhân hoá, bấm vào trang Create Menu. Để được gợi ý thực đơn, bấm vào trang Diet Recommender. Ngoài ra người dùng còn có thể đổi mật khẩu ở trang Setting." 
          },
          { 
            role: "user", 
            content: userMessage 
          }
        ]
      })
    });

    const data = await response.json();
    console.log("📥 Received response:", JSON.stringify(data).substring(0, 200) + "...");

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Lỗi phản hồi:", data);
      return res.status(500).json({ error: "Phản hồi từ AI không hợp lệ", details: data });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("❌ Lỗi khi xử lý request:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi server.", details: error.message });
  }
});

app.listen(3001, () => {
  console.log("✅ Chatbot server đang chạy tại http://localhost:3001");
});
