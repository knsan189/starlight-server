import { Router } from "express";
import pkg from "lodash";
import log4js from "log4js";
import { formatDistanceToNow } from "date-fns";
import ko from "date-fns/locale/ko/index.js";
import asciifyImage from "asciify-image";
import { PoolConnection } from "mysql";
import { getConnection } from "../config/db.config.js";
import { MessageRequest, MessageResponse } from "../@types/message";
import { DiscordMember, Fortune } from "../@types/types";
import userScraper from "../utils/userScraper.js";
import HistoryService from "../services/history.js";
import MemberService from "../services/member.js";

const { shuffle } = pkg;
const router = Router();
const logger = log4js.getLogger("message");

let timeStamp = new Date();
let fortuneIndexArray: number[] = [];
const fortuneSet = new Set<string>();

function getParsedSender(sender: string) {
  return sender.split("/")[0].trim();
}

String.prototype.format = function (...args: any[]) {
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] === "undefined" ? match : args[index];
  });
};

function shuffleFortuneArray(): Promise<void> {
  return new Promise((resolve, reject) => {
    getConnection((connection: PoolConnection) => {
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
      connection.release();
    });
  });
}

router.post("/", async (req, res) => {
  try {
    const { msg, room, sender, isGroupChat }: MessageRequest = req.body;
    let parsedSender = getParsedSender(sender);

    if (parsedSender.length > 2) {
      parsedSender = parsedSender.substring(1);
    }

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

      if (fortuneSet.has(parsedSender)) {
        const response: MessageResponse = {
          status: "ok",
          reply: "운세는 하루에 한번만 사용 하실수 있습니다.",
        };
        return res.send(response);
      }

      getConnection((connection: PoolConnection) => {
        connection.query(
          `SELECT * FROM Fortune where id=${index}`,
          (err, result: Fortune[]) => {
            if (err) throw new Error(err.message);
            const data = result[0];
            const response: MessageResponse = {
              status: "ok",
              reply: data.fortune.format(parsedSender),
              secondReply: data.msg?.format(parsedSender),
              delayTime: data.delayTime,
            };
            fortuneSet.add(parsedSender);
            res.status(200).send(response);
          }
        );
        connection.release();
      });
      return;
    }

    if (msg.indexOf("/유저") === 0) {
      const nickname = msg.replace("/유저", "").trim();
      const userData = await userScraper(nickname);
      const response = await asciifyImage(userData.charImg, {
        color: false,
        fit: "box",
        width: 50,
      });
    }

    if (msg.includes("승호") && msg.includes("언제")) {
      const histories = await HistoryService.getHistories({
        nickname: "승호",
      });
      const lastIndex = histories.length - 1;
      const { type, time } = histories[lastIndex];

      const date = formatDistanceToNow(new Date(time), {
        addSuffix: true,
        locale: ko,
      });

      if (type === "join") {
        res.send({
          status: "ok",
          reply: `지금 접속중이신걸요?`,
          secondReply: `${date}에 접속하셔서 아직 계십니담. 또 언제 사라지실지는 모르겠지만요`,
        });
        return;
      }
      res.send({
        status: "ok",
        reply: `디코 ${date}에 마지막으로 접속하시구`,
        secondReply: "다시 안오셨어요 ㅠㅠ",
      });
      return;
    }

    if (
      msg.includes("디코에") &&
      msg.includes("누구") &&
      msg.includes("지금")
    ) {
      const members = await MemberService.getMembers();
      const currentUser: DiscordMember[] = [];

      members.forEach((member) => {
        if (member.lastLeaveTime) {
          const joinTime = new Date(member.lastJoinedTime).getTime();
          const leaveTime = new Date(member.lastLeaveTime).getTime();
          if (joinTime > leaveTime) {
            currentUser.push(member);
          }
        } else {
          currentUser.push(member);
        }
      });

      if (currentUser.length === 0) {
        res.send({
          status: "ok",
          reply: `지금 아무도 접속 안하고 있는거 같아요 !`,
        });
        return;
      }

      let reply = "지금 ";
      currentUser.forEach((member) => {
        reply += `${getParsedSender(member.nickname)}님 `;
      });

      reply += "접속해 계시는거 같아요 !";
      res.send({
        status: "ok",
        reply,
      });
      return;
    }

    return res.send("ok");
  } catch (error) {
    console.log(error);
    return res.send({ status: "error", reply: "에러났어요 ㅠ" + error });
  }
});

export default router;
