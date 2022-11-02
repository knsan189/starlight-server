import { PoolConnection } from "mysql";
import { MessageResponse } from "../@types/message.js";
import { Fortune } from "../@types/types.js";
import { getConnection } from "../config/db.config.js";

export default class FortuneService {
  public static async getFortune(id: number): Promise<Fortune> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          getConnection((connection: PoolConnection) => {
            connection.query(
              `SELECT * FROM Fortune where id=${id}`,
              (err, result: Fortune[]) => {
                if (err) throw new Error(err.message);
                if (!result[0]) throw new Error("운세 다 떨어짐");
                resolve(result[0]);
              }
            );
            connection.release();
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }
}
