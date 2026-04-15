import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import io from "socket.io-client";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const socket = io.connect("http://localhost:5000");

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Helper function to ensure Room ID is always identical regardless of who clicks first
  const getRoomId = (chat) => {
    if (!chat) return null;
    return chat.type === "private"
      ? [currentUser.id, chat.id].sort((a, b) => a.localeCompare(b)).join("-")
      : chat.id;
  };

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (selectedChat) {
        setMessages([]); // Clear screen for new chat
        const roomId = getRoomId(selectedChat);

        console.log("🔍 Fetching history for Room ID:", roomId);

        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/messages/${roomId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log("✅ History received:", res.data.length, "messages");
          setMessages(res.data);
        } catch (err) {
          console.error("❌ Error fetching history:", err);
        }
      }
    };

    fetchChatHistory();
  }, [selectedChat, currentUser.id]);

  // 2. Real-time Socket Logic
  useEffect(() => {
    if (selectedChat) {
      const roomId = getRoomId(selectedChat);

      socket.emit("join_chat", roomId);

      socket.off("new_message");
      socket.on("new_message", (newMessage) => {
        // Direct comparison with the roomId property from the backend
        if (newMessage.roomId === roomId) {
          setMessages((prev) => {
            if (prev.find((m) => m._id === newMessage._id)) return prev;
            return [...prev, newMessage];
          });
        }
      });

      socket.off("user_typing");
      socket.on("user_typing", (data) => {
        if (data.user !== currentUser.username && data.roomId === roomId) {
          setIsTyping(true);
          const timer = setTimeout(() => setIsTyping(false), 3000);
          return () => clearTimeout(timer);
        }
      });
    }

    return () => {
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [selectedChat, currentUser.id, currentUser.username]);

  return (
    <Container fluid className="vh-100 p-0 overflow-hidden bg-white">
      <Row className="g-0 h-100">
        <Col md={3} className="bg-light border-end d-flex flex-column h-100">
          <Sidebar onSelectChat={setSelectedChat} />
        </Col>

        <Col md={9} className="d-flex flex-column h-100">
          {selectedChat ? (
            <ChatWindow
              selectedChat={selectedChat}
              messages={messages}
              socket={socket}
              currentUser={currentUser}
              isTyping={isTyping}
            />
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted bg-light">
              <div className="mb-3" style={{ fontSize: "50px" }}>
                💬
              </div>
              <h4>Welcome, {currentUser.username}!</h4>
              <p>Select a user to start a secure conversation.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
