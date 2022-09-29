import { Router } from "express";
import pkg from "lodash";
import log4js from "log4js";
import connection from "../db.js";
import { MessageRequest, MessageResponse } from "../@types/message";
import { Fortune } from "../@types/types";

const { shuffle } = pkg;
const router = Router();
const logger = log4js.getLogger("message");

let timeStamp = new Date();
let fortuneIndexArray: number[] = [];
const fortuneSet = new Set<string>();

String.prototype.format = function (...args: any[]) {
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] === "undefined" ? match : args[index];
  });
};

function shuffleFortuneArray(): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT COUNT(*) AS count FROM Fortune",
      (error, result) => {
        try {
          const { count } = result[0];
          for (let i = 1; i <= count; i++) {
            fortuneIndexArray.push(i);
          }
          fortuneIndexArray = shuffle(fortuneIndexArray);
          resolve();
        } catch (err) {
          reject(error);
        }
      }
    );
  });
}

router.post("/", async (req, res) => {
  const { msg, room, sender, isGroupChat }: MessageRequest = req.body;
  logger.level = "debug";
  logger.info(`${sender} : ${msg}`);

  if (msg.indexOf("/메시지") === 0) {
    const response: MessageResponse = {
      status: "ok",
      reply: msg.replace("/메세지", "").trim(),
      secondReply: "5초후 답장 테스트",
      delayTime: 5000,
    };
    return res.status(200).send(response);
  }

  if (msg === "/운세") {
    if (
      !fortuneIndexArray.length ||
      timeStamp.getDate() !== new Date().getDate()
    ) {
      await shuffleFortuneArray();
      timeStamp = new Date();
      fortuneSet.clear();
    }

    const index = fortuneIndexArray.shift();

    if (fortuneSet.has(sender)) {
      const response: MessageResponse = {
        status: "ok",
        reply: "운세는 하루에 한번만 사용 하실수 있습니다.",
      };
      return res.send(response);
    }

    connection.query(
      `SELECT * FROM Fortune where id=${index}`,
      (err, result: Fortune[]) => {
        const data = result[0];
        const response: MessageResponse = {
          status: "ok",
          reply: data.fortune.format(sender),
          secondReply: data.msg,
        };
        fortuneSet.add(sender);
        res.status(200).send(response);
      }
    );
    return;
  }

  return res.send({ status: "ok" });
});

export default router;
