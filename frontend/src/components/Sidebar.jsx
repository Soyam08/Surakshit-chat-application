import React, { useState, useEffect } from "react";
import { ListGroup, Nav, Spinner } from "react-bootstrap";
import axios from "axios";

const Sidebar = ({ onSelectChat }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users");
        // Filter out the logged-in user so you don't chat with yourself
        const filteredUsers = res.data.filter((u) => u._id !== currentUser.id);
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser.id]);

  // Mock groups for now - in a full app, you'd fetch these too
  const mockGroups = [
    { id: "g1", username: "MERN Project Group", type: "group" },
  ];

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h4 className="mb-4">Chat App</h4>

      <Nav variant="pills" defaultActiveKey="users" className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="users">Active Users</Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="flex-grow-1 overflow-auto">
        <ListGroup variant="flush">
          <small className="text-muted fw-bold uppercase">Groups</small>
          {mockGroups.map((group) => (
            <ListGroup.Item
              action
              key={group.id}
              className="border-0 rounded mb-1"
              onClick={() =>
                onSelectChat({
                  id: group.id,
                  name: group.username,
                  type: "group",
                })
              }
            >
              # {group.username}
            </ListGroup.Item>
          ))}

          <small className="text-muted fw-bold uppercase mt-3 d-block">
            Direct Messages
          </small>

          {loading ? (
            <div className="text-center mt-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            users.map((user) => (
              <ListGroup.Item
                action
                key={user._id}
                className="border-0 rounded mb-1"
                onClick={() =>
                  onSelectChat({
                    id: user._id,
                    name: user.username,
                    type: "private",
                  })
                }
              >
                👤 {user.username}
              </ListGroup.Item>
            ))
          )}

          {users.length === 0 && !loading && (
            <small className="text-center d-block mt-2 text-muted">
              No other users found
            </small>
          )}
        </ListGroup>
      </div>

      <div className="mt-auto pt-3 border-top">
        <div className="d-flex align-items-center mb-3">
          <div
            className="bg-success rounded-circle me-2"
            style={{ width: "10px", height: "10px" }}
          ></div>
          <small className="text-muted">
            Logged in as: <strong>{currentUser.username}</strong>
          </small>
        </div>
        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
