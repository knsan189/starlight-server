import { Request, Response, Router } from "express";
import { DiscordHistory } from "../@types/types";
import HistoryService from "../services/history.js";

const HistoryRouter = Router();

HistoryRouter.post("/", async (req: Request<{}, {}, DiscordHistory>, res) => {
  try {
    const history = req.body;
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
    const result = await HistoryService.getHistories({
      nickname,
      date,
    });
    console.log(result);
    res.send("ok");
  } catch (error) {
    res.status(500).send(error);
  }
});

export default HistoryRouter;
