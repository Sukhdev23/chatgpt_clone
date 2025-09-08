import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [
    { title: 'Chat 1', messages: [] }, 
  ],
  activeChatIndex: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // Find the chat by id if provided, else use activeChatIndex
      if (action.payload.chat) {
        const idx = state.chats.findIndex(c => c._id === action.payload.chat);
        if (idx !== -1) {
          state.chats[idx].messages = state.chats[idx].messages || [];
          state.chats[idx].messages.push({
            role: action.payload.role,
            content: action.payload.content,
          });
        }
      } else {
        state.chats[state.activeChatIndex].messages = state.chats[state.activeChatIndex].messages || [];
        state.chats[state.activeChatIndex].messages.push({
          role: action.payload.role,
          content: action.payload.content,
        });
      }
    },
    setActiveChat: (state, action) => {
      state.activeChatIndex = action.payload;
    },
    addChat: (state, action) => {
      if (typeof action.payload === "string") {
        state.chats.push({ title: action.payload, messages: [] });
      } else {
        // If backend returns chat object, use it directly
        state.chats.push({
          title: action.payload.title,
          messages: action.payload.messages || [],
          _id: action.payload._id,
          lastActivity: action.payload.lastActivity,
          user: action.payload.user
        });
      }
      state.activeChatIndex = state.chats.length - 1;
    },
    setChats: (state, action) => {
  state.chats = action.payload;
},
  },
});

export const { addMessage, setActiveChat, addChat, setChats } = chatSlice.actions;
export default chatSlice.reducer;
