import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addMessage,
  setActiveChat,
  addChat,
  setChats,
} from "../slices/chatSlice";
import MessageBubble from "../components/MessageBubble";
import { io } from "socket.io-client";
import axios from "axios";
import "./chat.css";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const chats = useSelector((state) => state.chat.chats);
  const activeChatIndex = useSelector((state) => state.chat.activeChatIndex);
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // ❌ default false for mobile
  const textareaRef = useRef(null);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentChat = chats[activeChatIndex];
    const chatId = currentChat._id;

    dispatch(addMessage({ chat: chatId, role: "user", content: input }));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";

    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("ai-message", { chat: chatId, content: input });
      } else {
        await axios.post(
          `https://chatgpt-clone-ruzm.onrender.com/api/chats/${chatId}/messages`,
          { content: input }
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        addMessage({
          chat: chatId,
          role: "model",
          content: "⚠️ Server error, please try again.",
        })
      );
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    async function fetchChats() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        if (!socketRef.current) {
          try {
            const s = io("https://chatgpt-clone-ruzm.onrender.com", {
              transports: ["websocket"],
              withCredentials: true,
              auth: { token: token || null },
            });
            socketRef.current = s;
          } catch {
            console.warn("Socket init failed");
          }
        }

        const res = await axios.get(
          "https://chatgpt-clone-ruzm.onrender.com/api/chats",
          { withCredentials: true }
        );

        const chatsFromDb = Array.isArray(res.data)
          ? res.data.map((chat) => ({ ...chat, messages: chat.messages || [] }))
          : [{ title: "Chat", messages: [] }];

        dispatch(setChats(chatsFromDb));
      } catch (err) {
        if (err?.response?.status === 401) return;
        console.error("Failed to fetch chats:", err);
      }
    }

    fetchChats();

    if (socketRef.current) {
      socketRef.current.on("ai-response", (data) => {
        dispatch(
          addMessage({ chat: data.chat, role: "model", content: data.content })
        );
      });

      socketRef.current.on("ai-error", (err) => {
        dispatch(
          addMessage({
            chat: err.chat,
            role: "model",
            content: "⚠️ AI error.",
          })
        );
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("ai-response");
        socketRef.current.off("ai-error");
        try {
          socketRef.current.disconnect();
        } catch {}
        socketRef.current = null;
      }
      axios.interceptors.response.eject(interceptorId);
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats, activeChatIndex]);

  const handleChatSelect = (idx) => {
    dispatch(setActiveChat(idx));
    if (window.innerWidth <= 768) {
      setSidebarOpen(false); // ✅ Auto-close on mobile
    }
  };

  const handleAddChat = async () => {
    if (!newChatTitle.trim()) return;
    try {
      const res = await axios.post(
        "https://chatgpt-clone-ruzm.onrender.com/api/chats",
        { title: newChatTitle },
        { withCredentials: true }
      );
      dispatch(addChat(res.data));
      setNewChatTitle("");
      setShowInput(false);
    } catch (err) {
      console.error("Failed to add chat:", err);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Chats</h2>}
          <div className="sidebar-buttons">
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} title="Close Sidebar">
                ✖
              </button>
            )}
            <button onClick={() => setShowInput((v) => !v)} title="Add Chat">
              +
            </button>
          </div>
        </div>

        {showInput && sidebarOpen && (
          <div className="new-chat">
            <input
              type="text"
              placeholder="New chat title..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
            />
            <button onClick={handleAddChat}>Save</button>
          </div>
        )}

        <ul className="chat-list">
          {Array.isArray(chats) && chats.length > 0 ? (
            chats.map((chat, i) => (
              <li
                key={chat._id || i}
                className={i === activeChatIndex ? "active" : ""}
                onClick={() => handleChatSelect(i)}
              >
                {sidebarOpen ? chat.title : "💬"}
              </li>
            ))
          ) : (
            <li className="empty">No chats found</li>
          )}
        </ul>
      </div>

     {/* Hamburger only when sidebar closed */}
{!sidebarOpen && (
  <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
    ☰
  </button>
)}


      {/* Main Chat */}
      <div className="main-chat">
        <div className="messages" ref={chatBoxRef}>
          {chats[activeChatIndex] &&
          Array.isArray(chats[activeChatIndex].messages) ? (
            chats[activeChatIndex].messages.map((msg, i) => (
              <MessageBubble key={i} sender={msg.role} content={msg.content} />
            ))
          ) : (
            <div className="empty">No messages</div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button onClick={handleSend} title="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
