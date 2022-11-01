import { DiscordHistory, DiscordMember } from "../@types/types.js";
import { getConnection } from "../config/db.config.js";

export default class MemberService {
  public static async addMember(history: DiscordHistory) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const value: Partial<DiscordMember> = { nickname: history.nickname };
          const date = new Date(history.time);

          if (history.type === "join") {
            value.lastJoinedTime = date;
          } else {
            value.lastLeaveTime = date;
          }

          getConnection((connection) => {
            connection.query(
              "INSERT INTO DiscordMember SET ?",
              value,
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

  public static async getMember(
    nickname: DiscordHistory["nickname"]
  ): Promise<DiscordMember> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          getConnection((connection) => {
            connection.query(
              `SELECT * FROM DiscordMember WHERE nickname='${nickname}'`,
              (error, results: DiscordMember[]) => {
                if (error) throw new Error(error.message);
                resolve(results?.[0]);
              }
            );
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  public static async editMember(history: DiscordHistory) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let sql = "UPDATE DiscordMember SET ";
          if (history.type === "join") {
            sql += `lastJoinedTime=? `;
          } else {
            sql += `lastLeaveTime=? `;
          }
          sql += `WHERE nickname='${history.nickname}'`;
          getConnection((connection) => {
            connection.query(sql, [new Date(history.time)], (error) => {
              if (error) throw new Error(error.message);
              resolve("success");
            });
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  public static async getMembers(date?: Date): Promise<DiscordMember[]> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          getConnection((connection) => {
            connection.query(
              `SELECT * FROM DiscordMember`,
              (error, results: DiscordMember[]) => {
                if (error) throw new Error(error.message);
                resolve(results);
              }
            );
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }
}
