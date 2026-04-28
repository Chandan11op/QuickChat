import { create } from "zustand";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (userId) => {
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      query: { userId },
    });

    socket.on("connect", () => set({ isConnected: true }));
    socket.on("disconnect", () => set({ isConnected: false }));

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));
