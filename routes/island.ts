import { Router } from "express";
import puppeteer from "puppeteer";

interface LoaEvent {
  title: string;
  contents: Content[];
}

interface Content {
  time: string;
  name: string;
}

const router = Router();

router.get("/", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const url = "https://loahae.com";
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => {
      const target = document.querySelector(".sf-target-1")?.textContent;
      if (target && target.length) return true;
    });
    const islandBox = await page.$(".box_main-cc1_cc1");
    const islandData = await islandBox?.$$eval("tr", (elements) => {
      const island: { name: string; reward: string }[] = [];
      const time = elements[0].querySelector(".td-event-date")?.textContent;
      elements.forEach((element) => {
        const name = element.querySelector(".sf-target-1")?.textContent;
        const reward = element.querySelector(".td-item")?.textContent;
        if (name && reward) island.push({ name, reward });
      });
      return { time, island };
    });

    const eventData = await page.$$eval(".list-box", (elements: Element[]) => {
      const eventName = [
        "카오스게이트",
        "로웬",
        "점령 이벤트",
        "유령선",
        "필드보스",
        "점령전",
      ];
      const events: LoaEvent[] = [];
      elements.forEach((element) => {
        const titleText = element.querySelector(".list-title")?.textContent;
        const contentCheck = element.querySelector(".sf-target-1");
        if (contentCheck) {
          const parsedTitle = titleText?.replace("캘린더 : ", "");
          if (parsedTitle && eventName.includes(parsedTitle)) {
            const contentBox = element.querySelectorAll("tr");
            const contentList: Content[] = [];
            contentBox.forEach((content) => {
              const time = content.querySelector(".td-event-date")?.textContent;
              const name = content.querySelector(".sf-target-1")?.textContent;
              if (time && name) contentList.push({ time, name });
            });
            events.push({ title: parsedTitle, contents: contentList });
          }
        }
      });
      return events;
    });
    res.send({ islandData, eventData });
    browser.close();
  } catch (err) {
    res.status(404).send("not found");
    console.log(err);
  }
});

export default router;
