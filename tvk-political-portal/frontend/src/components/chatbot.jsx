import { useState } from "react";
import "./chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "வணக்கம்! எப்படி உதவலாம்?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { from: "user", text: input }]);

    // Dummy bot reply (you can connect API later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "உங்கள் கேள்வி பெறப்பட்டது!" }
      ]);
    }, 500);

    setInput("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button className="chatbot-button" onClick={() => setOpen(!open)}>
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>TVK உதவி</span>
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-msg ${msg.from === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input-box">
            <input
              type="text"
              placeholder="உங்கள் செய்தியை உள்ளிடவும்..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
