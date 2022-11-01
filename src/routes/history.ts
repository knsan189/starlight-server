import { Request, Response, Router } from "express";
import { DiscordHistory } from "../@types/types";
import HistoryService from "../services/historyService.js";

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

HistoryRouter.get(
  "/",
  async (
    req: Request<{}, {}, {}, { nickname: string; date?: string }>,
    res
  ) => {
    const { nickname, date } = req.query;
    console.log(nickname);
    const response = await HistoryService.getHistories({
      nickname,
      date: date ? new Date(date) : undefined,
    });
    console.log(response);
    res.send("ok");
  }
);

export default HistoryRouter;
