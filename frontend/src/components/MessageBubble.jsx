import React from "react";
import "./MessageBubble.css";


const MessageBubble = ({ sender, content }) => {
  const isUser = sender === "user"? true : false;
  return (
    <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"}`} style={{ alignSelf: isUser ? "flex-end" : "flex-start" }}>
      <div className="avatar">
        {isUser ? <span>🧑</span> : <span>🤖</span>}
      </div>
      <div className="bubble-content">{content}</div>
    </div>
  );
};

export default MessageBubble;
