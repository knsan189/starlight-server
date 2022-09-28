import { Router } from "express";
import log4js from "log4js";
import path from "path";

const router = Router();

interface MessageData {
  /** 방 이름 */
  room: string;

  /** 메세지 */
  msg: string;

  /** 발신자 */
  sender: string;

  /** 단톡방유무 */
  isGroupChat: boolean;

  imageDB: string;

  packageName: string;
}

const logger = log4js.getLogger("message");

router.post("/", (req, res) => {
  const { msg, room, sender, isGroupChat }: MessageData = req.body;
  logger.level = "debug";
  logger.info(`${sender} : ${msg}`);

  const response: MessageResponse = {
    status: "ok",
  };

  if (msg.indexOf("/메세지")) {
    response.reply = msg.replace("/메세지", "").trim();
  }

  res.status(200).send(response);
});

export default router;
