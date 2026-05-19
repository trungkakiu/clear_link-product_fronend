import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Star, Cpu, X, MessageSquare } from "lucide-react";
import { useChat } from "../Context/ChatContext";
import "../scss/volt/components/TraceChainAIChat.scss";
import { MessageRenderer } from "./Helper_component_AI_label";

const TraceChainAIChat = () => {
  const { messages, sendMessage, isTyping, isOpen, setIsOpen } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleToggleChat = () => {
    if (isOpen) {
      setIsClosing(true);
      // Thời gian chờ 300ms khớp với animation slideDown trong SCSS
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="nexus-ai-container">
      {(isOpen || isClosing) && (
        <div className={`chat-window shadow-lg ${isClosing ? "closing" : ""}`}>
          <div className="chat-header">
            <div className="d-flex align-items-center">
              <div
                className="bg-primary p-2 rounded-circle me-2 d-flex align-items-center justify-content-center"
                style={{ width: "35px", height: "35px" }}
              >
                <Bot size={20} color="white" />
              </div>
              <div>
                <h6
                  className="mb-0 text-white fw-bold"
                  style={{ fontSize: "0.9rem" }}
                >
                  TraceChain AI{" "}
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                </h6>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  <Cpu size={10} /> AI-Agent 3.0 Active
                </small>
              </div>
            </div>
            <button
              className="btn-close btn-close-white shadow-none"
              onClick={handleToggleChat}
            ></button>
          </div>

          <div className="chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`msg ${msg.type}`}
                style={{ whiteSpace: "pre-line" }}
              >
                <MessageRenderer msg={msg} />
              </div>
            ))}

            {isTyping && (
              <div className="d-flex flex-column gap-1">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <small
                  className="text-muted ms-2 italic"
                  style={{ fontSize: "0.75rem" }}
                >
                  Con đang suy nghĩ...
                </small>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <div className="input-box">
              <textarea
                rows="2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleSendMessage())
                }
                placeholder="Yêu cầu của bạn?"
              />
              <button
                className="btn-send"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="chat-trigger-btn" onClick={handleToggleChat}>
        {!isOpen && <div className="pulse-ring"></div>}
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default TraceChainAIChat;
