import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';
import { FaRobot, FaTimes, FaChevronDown, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo NutriScan. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const minimizeChatbot = () => {
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: userMessage
      });
      
      // Add bot response after a small delay to simulate typing
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
      }, 500);
    } catch (error) {
      console.error('Error fetching response from chatbot:', error);
      setIsTyping(false);
      
      // Use a basic fallback response system for common questions
      const fallbackResponse = generateFallbackResponse(userMessage);
      setMessages(prev => [...prev, { sender: 'bot', text: fallbackResponse }]);
    }
  };

  // Add this helper function outside handleSubmit but inside the component:
  const generateFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('login') || lowerMessage.includes('đăng nhập')) {
      return 'Để đăng nhập vào NutriScan, bạn cần truy cập vào trang đăng nhập và nhập thông tin tài khoản của mình.';
    } 
    else if (lowerMessage.includes('calories') || lowerMessage.includes('calo')) {
      return 'Để tính calories, bạn có thể sử dụng tính năng Calories Calculator trong menu chính.';
    }
    else if (lowerMessage.includes('diet') || lowerMessage.includes('thực đơn')) {
      return 'Chúng tôi có tính năng Diet Recommender để gợi ý thực đơn phù hợp với nhu cầu của bạn.';
    }
    else if (lowerMessage.includes('meal plan') || lowerMessage.includes('kế hoạch')) {
      return 'Bạn có thể tạo và theo dõi kế hoạch ăn uống của mình trong tính năng Meal Plan.';
    }
    else if (lowerMessage.includes('food') || lowerMessage.includes('nhận diện')) {
      return 'Tính năng Food Recognition cho phép bạn nhận diện món ăn qua hình ảnh.';
    }
    else {
      return 'Rất tiếc, hiện tại tôi không thể kết nối đến máy chủ. Bạn có thể thử lại sau hoặc liên hệ với quản trị viên để được hỗ trợ.';
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot button */}
      <button 
        className={`chatbot-button ${isOpen ? 'hidden' : ''}`} 
        onClick={toggleChatbot}
        aria-label="Open chatbot"
      >
        <FaRobot />
      </button>

      {/* Chatbot dialog */}
      <div className={`chatbot-dialog ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <FaRobot className="bot-icon" />
            <h3>NutriScan Assistant</h3>
          </div>
          <div className="chatbot-controls">
            <button onClick={minimizeChatbot} className="chatbot-control-btn minimize">
              <FaChevronDown />
            </button>
            <button onClick={toggleChatbot} className="chatbot-control-btn close">
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chatbot-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChange={handleInputChange}
            ref={inputRef}
          />
          <button type="submit" className="send-button" disabled={!inputValue.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;