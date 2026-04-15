import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Card, InputGroup } from "react-bootstrap";

const ChatWindow = ({
  selectedChat,
  messages,
  socket,
  currentUser,
  isTyping,
}) => {
  const [text, setText] = useState("");
  const scrollRef = useRef();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const roomId =
      selectedChat.type === "private"
        ? [currentUser.id, selectedChat.id].sort().join("-")
        : selectedChat.id;

    const messageData = {
      roomId,
      sender: currentUser.id, // Sending ID string to backend
      content: text,
      chatType: selectedChat.type,
      receiver: selectedChat.type === "private" ? selectedChat.id : null,
      groupId: selectedChat.type === "group" ? selectedChat.id : null,
    };

    socket.emit("send_message", messageData);
    setText("");
  };

  if (!selectedChat) {
    return (
      <div className="d-flex h-100 align-items-center justify-content-center text-muted">
        <div className="text-center">
          <h3>💬</h3>
          <p>Select a friend to start chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 p-3 bg-light">
      <Card className="flex-grow-1 overflow-hidden border-0 shadow-sm d-flex flex-column">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0">
            <span className="text-primary me-2">●</span>
            {selectedChat.name}
          </h5>
        </Card.Header>

        <Card.Body className="overflow-auto p-3 bg-white">
          {messages.map((msg, index) => {
            // FIX: Handle both object sender (from DB) and string ID
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUser.id;

            return (
              <div
                key={index}
                className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"} mb-3`}
              >
                <div
                  className={`p-2 px-3 rounded-3 shadow-sm ${
                    isMe ? "bg-primary text-white" : "bg-light text-dark border"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  {/* Show name for group chats or other users */}
                  {!isMe && (
                    <small
                      className="d-block fw-bold mb-1"
                      style={{ fontSize: "0.75rem", opacity: 0.8 }}
                    >
                      {msg.sender?.username || "Friend"}
                    </small>
                  )}

                  <div style={{ wordBreak: "break-word" }}>{msg.content}</div>

                  <small
                    className={`d-block mt-1 text-end ${isMe ? "text-white-50" : "text-muted"}`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </small>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="text-muted small mb-2 animate-pulse">
              <em>{selectedChat.name} is typing...</em>
            </div>
          )}

          <div ref={scrollRef} />
        </Card.Body>

        <Card.Footer className="bg-white border-top p-3">
          <Form onSubmit={handleSend}>
            <InputGroup>
              <Form.Control
                className="border-0 bg-light"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
              />
              <Button variant="primary" type="submit" className="px-4">
                Send
              </Button>
            </InputGroup>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ChatWindow;
