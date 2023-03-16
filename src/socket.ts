import { Server } from "socket.io";
import dgram from "dgram";

export const io = new Server({
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
    // credentials: true,
  },
});

const udp = dgram.createSocket("udp4");

// {
//   "event": "chat",
//   "session": false,
//   "success": {},
//   "data": {
//     "sender": "테스트",
//     "content": "/테스트"
//   }
// }

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("message", (message: string) => {
    const string = JSON.stringify({
      event: "chat",
      session: undefined,
      success: undefined,
      data: {
        sender: "테스트",
        content: message,
        room: "진하늘",
        isGroupChat: false,
        profileImage: "",
        packageName: "com.kakao.talk",
      },
    });

    const buffer = Buffer.from(string);
    udp.send(buffer, 4000, "127.0.0.1");
  });
});

udp.on("message", (msg) => {
  console.log(msg);
});
