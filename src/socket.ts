import { Server } from "socket.io";

export const io = new Server({
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
