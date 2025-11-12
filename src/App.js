import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  // Check if the user is asking who made the assistant
  const checkWhoMadeQuestion = (message) => {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('who made you') || 
           lowerMessage.includes('who created you') || 
           lowerMessage.includes('who built you') || 
           lowerMessage.includes('who developed you') ||
           lowerMessage.includes('who is your creator') ||
           lowerMessage.includes('who is your developer');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setChatLog((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    // Check for the "who made you" question
    if (checkWhoMadeQuestion(userInput)) {
      setTimeout(() => {
        const aiMessage = {
          role: 'assistant',
          content: 'I was created by idcare19! 🚀',
          timestamp: new Date()
        };
        setChatLog((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 500); // Small delay to simulate thinking
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      const aiMessage = {
        role: 'assistant',
        content: data.message?.content || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date()
      };

      setChatLog((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to the server. Please try again.');
      setChatLog((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatLog([]);
    setError(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-content">
            <h1>IDCARE AI Assistant</h1>
            <p className="subtitle">Your intelligent companion for support and guidance</p>
          </div>
          <button onClick={clearChat} className="clear-btn" title="Clear chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
            </svg>
          </button>
        </header>

        <div className="chat-messages">
          {chatLog.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h2>Welcome to IDCARE!</h2>
              <p>Start a conversation by typing your message below. I'm here to help!</p>
              <div className="suggested-questions">
                <p>Try asking:</p>
                <button onClick={() => setInput('Who made you?')}>Who made you?</button>
              </div>
            </div>
          ) : (
            chatLog.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'} ${msg.isError ? 'error-message' : ''}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <div className="user-avatar">You</div>
                  ) : (
                    <div className="ai-avatar">IDCARE</div>
                  )}
                </div>
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-avatar">
                <div className="ai-avatar">IDCARE</div>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {error && (
          <div className="error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="input-container">
          <textarea
            className="message-input"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            className={`send-button ${input.trim() && !isLoading ? 'active' : ''}`}
          >
            {isLoading ? (
              <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" values="31.416;0"/>
                </circle>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .chat-container {
          width: 100%;
          max-width: 800px;
          height: 90vh;
          max-height: 800px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .header-content h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .subtitle {
          margin: 4px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f8f9fa;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          margin: 0 0 8px 0;
          color: #495057;
        }

        .suggested-questions {
          margin-top: 20px;
        }

        .suggested-questions p {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6c757d;
        }

        .suggested-questions button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s;
        }

        .suggested-questions button:hover {
          transform: scale(1.05);
        }

        .message {
          display: flex;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-message {
          flex-direction: row-reverse;
        }

        .user-message .message-content {
          background: #667eea;
          color: white;
          margin-right: 12px;
          margin-left: auto;
        }

        .ai-message .message-content {
          background: white;
          color: #333;
          margin-left: 12px;
        }

        .error-message .message-content {
          background: #fff5f5;
          border: 1px solid #feb2b2;
          color: #c53030;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
        }

        .user-avatar {
          background: #667eea;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .ai-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .message-content p {
          margin: 0;
          line-height: 1.5;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
          display: block;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .input-container {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 12px;
        }

        .message-input {
          flex: 1;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          resize: none;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .message-input:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: #e9ecef;
          color: #6c757d;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.05);
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: 0;
          }
          
          .chat-container {
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          
          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
