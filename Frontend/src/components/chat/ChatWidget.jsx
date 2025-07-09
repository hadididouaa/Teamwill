import React, { useState } from 'react';
import Lottie from 'lottie-react';
import LottieLogo from '../../../public/assets/img/lotti/chatb.json';
import './styles.css';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const toggleChat = () => setOpen(!open);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }], // Match backend's expected format
        }),
        credentials: 'include', // Include credentials if using cookies or auth
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botMessage = { text: data.content, sender: 'bot' }; // Use 'content' from backend response
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error during fetch:', err);
      setMessages((prev) => [...prev, { text: 'Erreur de connexion', sender: 'bot' }]);
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
            <button onClick={toggleChat}>✖</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;