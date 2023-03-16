import { Server } from "socket.io";
import dgram from "dgram";

export const io = new Server({
  cors: {
    origin: "*",
  },
});

const udp = dgram.createSocket("udp4");

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("client-message", (message: string) => {
    const string = JSON.stringify({
      event: "chat",
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
    msg: message.data.text,
    sender: message.data.room,
    imageDB: "",
    date: new Date().toString(),
  });
});
