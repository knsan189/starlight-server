import { Router } from "express";
import LostarkService from "../services/lostark.js";

const LostarkRouter = Router();

LostarkRouter.get("/guardian", async (req, res) => {
  try {
    const response = await LostarkService.getGuardians();
    return res.send(response);
  } catch (error) {
    return res.status(500).send(error);
  }
});

LostarkRouter.get("/abyss", async (req, res) => {
  try {
    const response = await LostarkService.getAbyss();
    return res.send(response);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default LostarkRouter;
