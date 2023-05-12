import { Request, Response, Router } from "express";
import { Fortune } from "../@types/types";
import FortuneService from "../services/fortune.js";
import pkg from "lodash";
const { shuffle } = pkg;

let fortuneIndexArray: number[] = [];
let timeStamp = new Date();

const FortuneRouter = Router();

async function shuffleFortuneArray(): Promise<void> {
  const count = await FortuneService.getCount();
  for (let i = 1; i <= count; i++) {
    fortuneIndexArray.push(i);
  }
  fortuneIndexArray = shuffle(fortuneIndexArray);
}

type Params = {
  id: number;
};

type ReqBody = {
  fortune: Fortune;
};

type ReqQuery = {
  size: number;
  page: number;
};

FortuneRouter.get("/", async (req: Request<Params, unknown, ReqBody, ReqQuery>, res: Response) => {
  try {
    const { size = 10, page = 0 } = req.query;
    const fortunes = await FortuneService.getFortunes(page, size);
    return res.send(fortunes);
  } catch (err) {
    return res.status(500).send(err);
  }
});

FortuneRouter.put("/:id", async (req: Request<Params, unknown, ReqBody>, res: Response) => {
  try {
    await FortuneService.editFortune(req.params.id, req.body.fortune);
    return res.send("ok");
  } catch (err) {
    return res.status(500).send(err);
  }
});

FortuneRouter.get("/random", async (req, res) => {
  try {
    if (fortuneIndexArray.length === 0 || timeStamp.getDate() !== new Date().getDate()) {
      await shuffleFortuneArray();
      timeStamp = new Date();
    }
    let response: Fortune | undefined;

    while (Boolean(!response?.fortune.length)) {
      if (fortuneIndexArray.length === 0) {
        await shuffleFortuneArray();
      }
      const index = fortuneIndexArray.shift() || 0;
      response = await FortuneService.getFortune(index);
    }
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default FortuneRouter;
