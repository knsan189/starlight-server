import { format } from "date-fns";
import { Request, Router } from "express";
import LostarkService from "../services/lostark.js";

const LostarkRouter = Router();
let timeStamp = new Date();

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

const ResultMap = new Map<string, Calendar[]>();

LostarkRouter.get("/calendar", async (req, res) => {
  try {
    if (timeStamp.getDate() !== new Date().getDate()) {
      ResultMap.clear();
    }

    const today = format(new Date(), "yyyy-MM-dd");
    let calenders = ResultMap.get(today);

    if (!calenders) {
      const response = await LostarkService.getCalendar();
      calenders = [];
      response.forEach((content) => {
        if (
          content.StartTimes.some((time) => time.includes(today)) &&
          content.CategoryName !== "로웬" &&
          content.CategoryName !== "섬" &&
          content.CategoryName !== "항해"
        ) {
          const items: Calendar["RewardItems"] = content.RewardItems.filter(
            (item) =>
              (item.Name === "실링" ||
                item.Name === "해적 주화" ||
                item.Name === "골드" ||
                item.Name.includes("카드 팩")) &&
              item.StartTimes &&
              item.StartTimes.some((time) => time.includes(today)),
          ).map((item) => ({
            ...item,
            StartTimes: item.StartTimes?.filter((time) => time.includes(today)) || [],
          }));
          calenders?.push({
            ...content,
            StartTimes: content.StartTimes.filter((time) => time.includes(today)),
            RewardItems: items,
          });
        }
      });
      ResultMap.set(today, calenders);
    }

    return res.send(calenders);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

LostarkRouter.get(
  "/user",
  async (req: Request<unknown, unknown, unknown, { userName: string }>, res) => {
    try {
      const { userName } = req.query;

      if (!userName) {
        return res.status(400).send("Bad Request");
      }
      const response = await LostarkService.getUser(encodeURIComponent(userName));
      return res.send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
);

LostarkRouter.post("/auction", async (req: Request<unknown, unknown, { keyword: string }>, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).send("Bad Request");
    }
    const response = await LostarkService.searchAuction(keyword);
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

LostarkRouter.post("/market", async (req: Request<unknown, unknown, { keyword: string }>, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).send("Bad Request");
    }
    const response = await LostarkService.searchMarket(keyword);
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default LostarkRouter;
