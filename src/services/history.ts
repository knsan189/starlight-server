import { DiscordHistory } from "../@types/types";
import { getConnection } from "../config/db.config.js";

export default class HistoryService {
  public static async addHistory(history: DiscordHistory) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          getConnection((connection) => {
            connection.query(
              "INSERT INTO DiscordHistory SET ?",
              { ...history, time: new Date(history.time) },
              (error) => {
                if (error) throw new Error(error.message);
                resolve("success");
              }
            );
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  public static async getHistories(request: { nickname: string; date?: Date }) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let sql = `SELECT * FROM DiscordHistory WHERE nickname='${request.nickname}' LIMIT 10`;
          if (request.date) sql += `, DATE_FORMAT(${request.date}, '%Y-%m-%d')`;
          getConnection((connection) => {
            connection.query(sql, (error, results) => {
              if (error) throw new Error(error.message);
              resolve(results);
            });
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }
}
