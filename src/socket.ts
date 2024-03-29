import { Server } from "socket.io";
import dgram from "dgram";

export const io = new Server({
  cors: {
    origin: "*",
  },
});

const udp = dgram.createSocket("udp4");

io.on("connection", (socket) => {
  console.log("소켓 연결 :", socket.id);
  socket.on("client-message", (message: string, event: "sendText" | "chat") => {
    const string = JSON.stringify({
      event,
      success: undefined,
      data: {
        sender: "진하늘",
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

  socket.on("remote-message", (msg) => {
    io.emit("server-message", {
      msg: msg.content,
      sender: msg.sender.name,
      imageDB: msg.profileImage,
      date: new Date().toString(),
    });
  });
});

udp.on("message", (msg, info) => {
  const message = JSON.parse(decodeURIComponent(msg.toString()));
  const { event, data, session } = message;
  const reply = JSON.stringify({
    event: undefined,
    session,
    success: true,
    data: undefined,
  });

  udp.send(Buffer.from(reply), 4000, "127.0.0.1");
  io.emit("server-message", {
    msg: data.text,
    sender: data.room,
    imageDB: "",
    date: new Date().toString(),
  });
});
