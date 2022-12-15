import { PoolConnection } from "mysql";
import { Fortune } from "../@types/types.js";
import { getConnection } from "../config/db.config.js";

export default class FortuneService {
  public static async getFortunes(
    page: number,
    size: number
  ): Promise<Fortune[]> {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection: PoolConnection) => {
          try {
            const sql = `SELECT * FROM Fortune ORDER BY id DESC LIMIT ${size} OFFSET ${
              size * page
            }`;
            connection.query(sql, (err, result: Fortune[]) => {
              if (err) throw new Error(err.message);
              resolve(result);
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

  public static async getFortune(id: number): Promise<Fortune> {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection: PoolConnection) => {
          try {
            connection.query(
              `SELECT * FROM Fortune where id=${id}`,
              (err, result: Fortune[]) => {
                if (err) throw new Error(err.message);
                if (!result[0]) throw new Error("운세 다 떨어짐");
                resolve(result[0]);
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

  public static async getCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection: PoolConnection) => {
          try {
            connection.query(
              "SELECT COUNT(*) AS count FROM Fortune",
              (err, result) => {
                if (err) throw new Error(err.message);
                const { count } = result[0];
                resolve(count);
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

  public static async editFortune(
    id: number,
    fortune: Fortune
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      (async () => {
        getConnection((connection: PoolConnection) => {
          try {
            const sql =
              "UPDATE Fortune SET fortune=?, msg=?, delayTime=? WHERE id=?";
            const values = [
              fortune.fortune,
              fortune.msg,
              fortune.delayTime,
              id,
            ];
            connection.query(sql, values, (err, result) => {
              if (err) throw new Error(err.message);
              resolve("ok");
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
