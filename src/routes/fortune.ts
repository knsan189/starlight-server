import { Request, Response, Router } from "express";
import { Fortune } from "../@types/types";
import { getConnection } from "../config/db.config.js";

const FortuneRouter = Router();

type Params = {};
type ResBody = {};
type ReqBody = {};
type ReqQuery = {
  size: number;
  page: number;
};

FortuneRouter.get(
  "/",
  (req: Request<Params, ResBody, ReqBody, ReqQuery>, res: Response) => {
    try {
      const { size = 10, page = 0 } = req.query;

      const sql = `SELECT * FROM Fortune ORDER BY id DESC LIMIT ${size} OFFSET ${
        size * page
      }`;

      getConnection((connection) => {
        connection.query(sql, (error, result: Fortune[]) => {
          if (error) throw new Error(error.message);
          res.send(result);
        });
        connection.release();
      });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

export default FortuneRouter;
