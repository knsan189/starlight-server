import { DiscordHistory } from "../@types/types";
import { getConnection } from "../config/db.config.js";

export default class HistoryService {
  public static async addHistory(history: DiscordHistory) {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection) => {
          try {
            connection.query(
              "INSERT INTO DiscordHistory SET ?",
              { ...history, time: new Date(history.time) },
              (error) => {
                if (error) throw new Error(error.message);
                resolve("success");
              }
            );
          } catch (error) {
            reject(error);
          } finally {
            connection.release();
          }
        });
      })();
    });
  }

  public static async getHistories(request: {
    nickname: string;
    date?: string;
  }): Promise<DiscordHistory[]> {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection) => {
          try {
            let sql = `SELECT * FROM DiscordHistory WHERE LOCATE('${request.nickname}', nickname)`;
            if (request.date) {
              sql += `,DATE_FORMAT(${new Date(request.date)}, '%Y-%m-%d')`;
            }
            sql += `LIMIT 10`;
            connection.query(sql, (error, results: DiscordHistory[]) => {
              if (error) throw new Error(error.message);
              resolve(results);
            });
          } catch (error) {
            reject(error);
          } finally {
            connection.release();
          }
        });
      })();
    });
  }
}
