import { format } from "date-fns";
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

LostarkRouter.get("/calendar", async (req, res) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const response = await LostarkService.getCalendar();
    const temp: any = [];
    response.forEach((content) => {
      if (
        content.StartTimes.some((time) => time.includes(today)) &&
        content.CategoryName !== "로웬" &&
        content.CategoryName !== "섬" &&
        content.CategoryName !== "항해"
      ) {
        temp.push({
          name: content.ContentsName,
          reward: content.RewardItems.find(
            (item) =>
              item.StartTimes?.some((time) => time.includes(today)) &&
              (item.Name === "실링" ||
                item.Name === "해적 주화" ||
                item.Name === "골드" ||
                item.Name.includes("카드")),
          ),
        });
      }
    });
    return res.send(temp);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default LostarkRouter;
