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
  const messageData: MessageData = req.body;
  logger.level = "debug";
  logger.info(messageData.msg);
  res.send("success");
});

export default router;
