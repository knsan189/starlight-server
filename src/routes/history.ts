import { Request, Response, Router } from "express";
import { DiscordHistory, DiscordMember } from "../@types/types";
import HistoryService from "../services/history.js";
import MemberService from "../services/member.js";

const HistoryRouter = Router();

HistoryRouter.post("/", async (req: Request<{}, {}, DiscordHistory>, res) => {
  try {
    const history = req.body;
    const member = await MemberService.getMember(history.nickname);
    if (!member) {
      await MemberService.addMember(history);
    } else {
      await MemberService.editMember(history);
    }
    await HistoryService.addHistory(history);
    res.send("ok");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

interface QueryString {
  nickname: string;
  date?: string;
}

HistoryRouter.get("/", async (req: Request<{}, {}, {}, QueryString>, res) => {
  try {
    const { nickname, date } = req.query;
    const result = await HistoryService.getHistories({ nickname, date });
    console.log(result);
    res.send("ok");
  } catch (error) {
    res.status(500).send(error);
  }
});

interface SyncRequestBody {
  nicknames: DiscordMember["nickname"][];
}

HistoryRouter.post(
  "/sync",
  async (req: Request<{}, {}, SyncRequestBody>, res) => {
    try {
      const { nicknames } = req.body;
      const dbMembers = await MemberService.getMembers();
      const promiseArray = [];
      const time = new Date().toString();

      nicknames.forEach((nickname) => {
        const target = dbMembers.find((member) => member.nickname === nickname);
        if (target) {
          console.log(
            `오프라인으로 저장되었는데, 온라인 상태인 유저 [${target.nickname}]`
          );
          const joinTime = new Date(target.lastJoinedTime).getTime();
          const leaveTime = new Date(target.lastLeaveTime).getTime();

          // 종료시간이 접속시간보다 큰데, 접속 중인 경우
          if (leaveTime > joinTime) {
            promiseArray.push(
              MemberService.editMember({
                nickname,
                type: "join",
                time,
              })
            );
          }
        } else {
          console.log(`미등록 유저 [${target.nickname}]`);
          promiseArray.push(
            MemberService.addMember({ nickname, type: "join", time })
          );
        }
      });

      dbMembers.forEach((member) => {
        const joinTime = new Date(member.lastJoinedTime).getTime();
        const leaveTime = new Date(member.lastLeaveTime).getTime();

        if (joinTime > leaveTime && !nicknames.includes(member.nickname)) {
          console.log(
            `온라인으로 저장되었는데 오프라인 상태인 유저 [${member.nickname}]`
          );
          promiseArray.push(
            MemberService.editMember({
              nickname: member.nickname,
              type: "leave",
              time,
            })
          );
        }
      });

      await Promise.all(promiseArray);
      res.send("ok");
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

export default HistoryRouter;
