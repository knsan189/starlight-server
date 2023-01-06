import { Router } from "express";
import pkg from "lodash";
import log4js from "log4js";
import { formatDistanceToNow } from "date-fns";
import ko from "date-fns/locale/ko/index.js";
import { MessageRequest, MessageResponse } from "../@types/message";
import { DiscordMember } from "../@types/types";
import MemberService from "../services/member.js";
import FortuneService from "../services/fortune.js";

const { shuffle } = pkg;
const MessageRouter = Router();
const logger = log4js.getLogger("message");

let timeStamp = new Date();
let fortuneIndexArray: number[] = [];
const fortuneSet = new Set<string>();

function getParsedSender(sender: string) {
  return sender.split("/")[0].trim();
}

String.prototype.format = function (...args: string[]) {
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] === "undefined" ? match : args[index];
  });
};

async function shuffleFortuneArray(): Promise<void> {
  const count = await FortuneService.getCount();
  for (let i = 1; i <= count; i++) {
    fortuneIndexArray.push(i);
  }
  fortuneIndexArray = shuffle(fortuneIndexArray);
}

MessageRouter.post("/", async (req, res) => {
  try {
    const { msg, sender }: MessageRequest = req.body;

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
      return res.send(response);
    }

    if (msg === "/운세") {
      if (!fortuneIndexArray.length || timeStamp.getDate() !== new Date().getDate()) {
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

      const { fortune, msg, delayTime } = await FortuneService.getFortune(index);
      const reply = fortune.format(parsedSender);
      const secondReply = msg?.format(parsedSender);

      const response: MessageResponse = {
        status: "ok",
        reply,
        secondReply,
        delayTime,
      };

      logger.info(`별빛 : ${reply}`);

      if (secondReply) {
        logger.info(`별빛 : ${secondReply}`);
      }

      return res.send(response);
    }

    // if (msg.indexOf("/유저") === 0) {
    //   const nickname = msg.replace("/유저", "").trim();
    //   const userData = await userScraper(nickname);
    // }

    if (msg.includes("승호") && msg.includes("언제")) {
      const member: DiscordMember = await MemberService.getMember("승호");

      if (!member) throw new Error("no user found");

      const { lastJoinedTime, lastLeaveTime } = member;

      if (new Date(lastJoinedTime).getTime() > new Date(lastLeaveTime).getTime()) {
        const date = formatDistanceToNow(new Date(lastJoinedTime), {
          addSuffix: true,
          locale: ko,
        });

        return res.send({
          status: "ok",
          reply: `지금 접속중이신걸요?`,
          secondReply: `${date}에 접속하셔서 아직 계십니담. 또 언제 사라지실지는 모르겠지만요`,
        });
      }

      const date = formatDistanceToNow(new Date(lastLeaveTime), {
        addSuffix: true,
        locale: ko,
      });

      return res.send({
        status: "ok",
        reply: `디코 ${date}에 마지막으로 접속하시구`,
        secondReply: "다시 안오셨어요 ㅠㅠ",
      });
    }

    if (msg.includes("디코") && msg.includes("누구") && msg.includes("지금")) {
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
        return res.send({
          status: "ok",
          reply: `지금 아무도 접속 안하고 있는거 같아요 !`,
        });
      }

      let reply = "지금 ";
      currentUser.forEach((member) => {
        reply += `${getParsedSender(member.nickname)}님 `;
      });

      reply += "접속해 계시는거 같아요 !";

      return res.send({
        status: "ok",
        reply,
      });
    }

    // if (msg.indexOf("/전달") === 0) {
    //   const reply = msg.replace("/전달", "").trim();
    //   return res.send({ status: "ok", reply });
    // }

    return res.send("ok");
  } catch (error) {
    logger.error(error);
    return res.send({ status: "error", reply: "에러났어요 ㅠ" + error });
  }
});

export default MessageRouter;
