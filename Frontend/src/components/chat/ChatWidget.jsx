import React, { useState } from 'react';
import Lottie from 'lottie-react';
import LottieLogo from '../../../public/assets/img/lotti/chatb.json';
import './styles.css';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis FreudBot. Comment puis-je vous aider aujourd'hui ?", sender: 'bot' },
     { text: "Hello! I'm FreudBot. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setOpen(!open);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
        }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const botMessage = { text: data.content, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error during fetch:', err);
      setMessages((prev) => [...prev, { 
        text: "Sorry, I'm experiencing technical difficulties. Please try again later", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="lottie-launcher" onClick={toggleChat}>
        <Lottie animationData={LottieLogo} loop />
      </div>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
        <span> 🧠 FreudBot  </span>
            <button onClick={toggleChat} aria-label="Close chat">
              ✖
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="msg bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;