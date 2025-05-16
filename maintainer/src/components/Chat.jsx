import React, { useState } from 'react';

function Chat({ user }) {
  const [message, setMessage] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    console.log(`${user.email}: ${message}`);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="profile-pic"></div>
        <span>{user.email}</span>
      </div>
      <div className="chat-box">
        <form onSubmit={sendMessage} className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
