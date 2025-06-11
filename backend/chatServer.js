const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "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"; // ← thay đúng key

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Missing message field" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo-0613",
        messages: [
          { role: "system", 
            content: "Bạn là trợ lý hỗ trợ người dùng về website NutriScan. Một website cung cấp các tính năng như nhận diện món ăn quan ảnh, tính calories từ các thông số người dùng nhập vào. Gợi ý thực đơn dựa trên lượng calories người dùng nhập. Tự tạo thực đơn cá nhân và track lại những thứ đã ăn hoặc uống. Người dùng cần phải đăng nhập mới có thể sử dụng các tính năng trên. Sau khi đăng nhập người dùng sẽ ở trang dashboard. Để nhận diện món ăn, bấm vào trang Food Recognition. Để tính calories, bấm vào trang Calories Calculator. Để tự tạo thực đơn cá nhân hoá, bấm vào trang Create Menu. Để được gợi ý thực đơn, bấm vào trang Dỉe Recommender. Ngoài ra người dùng còn có thể đổi mật khẩu ở trang Setting." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("❌ Lỗi phản hồi:", data);
      return res.status(500).json({ error: "Phản hồi từ AI không hợp lệ" });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("❌ Lỗi khi xử lý request:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi server." });
  }
});

app.listen(3000, () => {
  console.log("✅ Chatbot server đang chạy tại http://localhost:3000");
});
