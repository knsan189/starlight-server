import { Router } from "express";
import pkg from "lodash";
import mysql from "mysql";

const { shuffle } = pkg;

const connection = mysql.createConnection({
  host: "starlight.cafe24app.com",
  user: "knsansora",
  password: "sky5420090",
  database: "knsansora",
  port: 3306,
});

let timeStamp = new Date();
let fortuneIndexArray: number[] = [];
const router = Router();

function shuffleFortuneArray(): Promise<void> {
  return new Promise((resolve) => {
    connection.query(
      "SELECT COUNT(*) AS count FROM Fortune",
      (error, result) => {
        console.log(result);
        const { count } = result[0];
        for (let i = 1; i <= count; i++) {
          fortuneIndexArray.push(i);
        }
        fortuneIndexArray = shuffle(fortuneIndexArray);
        resolve();
      }
    );
  });
}

router.get("/", async function (req, res) {
  try {
    if (
      !fortuneIndexArray.length ||
      timeStamp.getDate() !== new Date().getDate()
    ) {
      await shuffleFortuneArray();
      timeStamp = new Date();
    }
    const index = fortuneIndexArray.shift();
    connection.query(
      `SELECT * FROM Fortune where id=${index}`,
      (err, result) => {
        const data = result[0];
        res.send(data.fortune);
      }
    );
  } catch (error) {
    res.status(400).send("error");
  }
});

export default router;
