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
import { useNavigate } from "react-router-dom"; // ✅ add this

// socket will be created per-component so we can attach auth token


const Chat = () => {
  const chats = useSelector((state) => state.chat.chats);
  const activeChatIndex = useSelector((state) => state.chat.activeChatIndex);
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const textareaRef = useRef(null);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate(); // ✅ add this

  // send cookies by default for all axios requests (backend uses cookie auth)
  axios.defaults.withCredentials = true;


  const handleSend = async () => {
    if (!input.trim()) return;
    const currentChat = chats[activeChatIndex];
    const chatId = currentChat._id;
  dispatch(addMessage({ chat: chatId, role: "user", content: input }));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";
    try {
      // await axios.post(
      //   `http://localhost:3000/api/chats/${chatId}/messages`,
      //   { content: input },
      //   { withCredentials: true }
      // );
      // send via socket if connected, else fall back to HTTP (if backend supports it)
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("ai-message", { chat: chatId, content: input });
      } else {
        // optional: attempt HTTP POST if socket not available
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
    // install interceptor to catch 401 globally and redirect to login
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
        // attach token from localStorage if available
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        // create socket with token auth (so server can verify websocket)
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

        const res = await axios.get("https://chatgpt-clone-ruzm.onrender.com/api/chats", {
          withCredentials: true,
        });
        console.log(res);
        
        const chatsFromDb = Array.isArray(res.data)
          ? res.data.map((chat) => ({ ...chat, messages: chat.messages || [] }))
          : [{ title: "Chat", messages: [] }];
        dispatch(setChats(chatsFromDb));
      } catch (err) {
        // If unauthorized, interceptor already navigates; return early to avoid noisy logs
        if (err?.response?.status === 401) return;
        console.error("Failed to fetch chats:", err);
      }
    }
    fetchChats();

    // When AI responds (wire up socket listeners if socket exists)
    if (socketRef.current) {
      socketRef.current.on("ai-response", async (data) => {
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
        // optional: disconnect socket when component unmounts
        try {
          socketRef.current.disconnect();
        } catch (e) {
          /* ignore */
        }
        socketRef.current = null;
      }
      // cleanup axios interceptor
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
            <button onClick={() => setShowInput((v) => !v)} title="Add Chat">
              +
            </button>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle Sidebar"
            >
              {sidebarOpen ? "⏴" : "⏵"}
            </button>
          </div>
        </div>

        {showInput && (
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

      {/* Main Chat */}
      <div className="main-chat">
        <div className="messages" ref={chatBoxRef}>
          {chats[activeChatIndex] &&
          Array.isArray(chats[activeChatIndex].messages) ? (
            chats[activeChatIndex].messages.map((msg, i) => (
              <MessageBubble
                key={i}
                sender={msg.role}
                content={msg.content}
              />
            ))
          ) : (
            <div className="empty">No messages</div>
          )}
        </div>

        {/* Input */}
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
