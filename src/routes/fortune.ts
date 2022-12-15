import { Request, Response, Router } from "express";
import { Fortune } from "../@types/types";
import FortuneService from "../services/fortune.js";

const FortuneRouter = Router();

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

export default FortuneRouter;
