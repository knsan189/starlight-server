import { Request, Response, Router } from "express";
import log4js from "log4js";
import { DiscordHistory, DiscordMember } from "../@types/types";
import HistoryService from "../services/history.js";
import MemberService from "../services/member.js";

const logger = log4js.getLogger("history");

const HistoryRouter = Router();

HistoryRouter.post("/", async (req: Request<unknown, unknown, DiscordHistory>, res: Response) => {
  try {
    const history = req.body;
    const member = await MemberService.getMember(history.nickname);
    if (!member) {
      await MemberService.addMember(history);
    } else {
      await MemberService.editMember(history);
    }
    await HistoryService.addHistory(history);
    return res.send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

interface QueryString {
  nickname: string;
  date?: string;
}

HistoryRouter.get(
  "/",
  async (req: Request<unknown, unknown, unknown, QueryString>, res: Response) => {
    try {
      const { nickname, date } = req.query;
      const result = await HistoryService.getHistories({ nickname, date });
      return res.send(result);
    } catch (error) {
      logger.error(error);
      return res.status(500).send(error);
    }
  },
);

interface SyncRequestBody {
  nicknames: DiscordMember["nickname"][];
}

HistoryRouter.post("/sync", async (req: Request<unknown, unknown, SyncRequestBody>, res) => {
  try {
    const { nicknames } = req.body;
    const dbMembers = await MemberService.getMembers();
    const promiseArray: Promise<any>[] = [];
    const time = new Date().toString();

    nicknames.forEach((nickname) => {
      if (nickname) {
        const target = dbMembers.find((member) => member.nickname === nickname);
        if (target && target.lastJoinedTime && target.lastLeaveTime) {
          const joinTime = new Date(target.lastJoinedTime).getTime();
          const leaveTime = new Date(target.lastLeaveTime).getTime();
          // 종료시간이 접속시간보다 큰데, 접속 중인 경우
          if (leaveTime > joinTime) {
            logger.info(`오프라인으로 저장되었는데, 온라인 상태인 유저 [${target.nickname}]`);
            const history: DiscordHistory = { nickname, type: "join", time };
            promiseArray.push(MemberService.editMember(history));
            promiseArray.push(HistoryService.addHistory(history));
          }
        } else {
          logger.info(`미등록 유저 [${nickname}]`);
          const history: DiscordHistory = { nickname, type: "join", time };
          promiseArray.push(MemberService.addMember(history));
          promiseArray.push(HistoryService.addHistory(history));
        }
      }
    });

    dbMembers.forEach((member) => {
      if (member.lastJoinedTime && member.lastLeaveTime) {
        const joinTime = new Date(member.lastJoinedTime).getTime();
        const leaveTime = new Date(member.lastLeaveTime).getTime();

        if (joinTime > leaveTime && !nicknames.includes(member.nickname)) {
          logger.info(`온라인으로 저장되었는데 오프라인 상태인 유저 [${member.nickname}]`);

          const history: DiscordHistory = {
            nickname: member.nickname,
            type: "leave",
            time,
          };
          promiseArray.push(MemberService.editMember(history));
          promiseArray.push(HistoryService.addHistory(history));
        }
      }
    });
    await Promise.all(promiseArray);
    return res.send("ok");
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error);
  }
});

export default HistoryRouter;
