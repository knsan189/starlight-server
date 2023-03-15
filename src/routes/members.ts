import { Request, Router } from "express";
import { getConnection } from "../config/db.config.js";
import MemberService from "../services/member.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const sql = "SELECT * FROM Members ORDER BY createdTime DESC";
    getConnection((connection) => {
      connection.query(sql, (error, result) => {
        if (error) {
          throw new Error(error.message);
        }
        const members = result.map((member) => ({
          ...member,
          tags: JSON.parse(member.tags),
          createdTime: new Date().toISOString(),
        }));
        res.send(members);
      });
      connection.release();
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/", (req, res) => {
  const { user } = req.body;
  const sql = "INSERT INTO Members SET ?";
  const checkSql = `SELECT * FROM Members where charName='${user.charName}'`;

  const member = {
    ...user,
    createdTime: new Date(),
    tags: JSON.stringify(user.tags),
    memo: user.memo ? user.memo : undefined,
  };

  getConnection((connection) => {
    connection.query(checkSql, (error, result) => {
      try {
        if (error) throw new Error(error.message);
        if (result?.length) throw new Error("이미 등록되어있는 닉네임입니다.");
        connection.query(sql, member, (error) => {
          if (error) throw new Error(error.message);
          connection.query(checkSql, (error, result) => {
            if (error) throw new Error(error.message);
            const [data] = result;
            res.send({ ...data, tags: JSON.parse(data.tags) });
          });
        });
      } catch (error) {
        res.status(400).send(error);
      }
    });
    connection.release();
  });
});

router.put("/", (req, res) => {
  const { charName, user } = req.query;
  const userData = JSON.parse(user as string);

  const member = {
    ...userData,
    tags: JSON.stringify(userData.tags),
    memo: userData.memo ? userData.memo : undefined,
  };

  const { tags, loadTime, charLevel, itemLevel, memo, guildName, serverName } = member;

  const sql =
    "UPDATE Members SET tags=?, loadTime=?, charLevel=?, itemLevel=?, memo=?, guildName=?, serverName=? WHERE charName=?";

  const values = [tags, loadTime, charLevel, itemLevel, memo, guildName, serverName, charName];

  getConnection((connection) => {
    connection.query(sql, values, (error) => {
      if (error) {
        throw new Error(error.message);
      }
      res.send("edit success");
    });
    connection.release();
  });
});

router.delete("/", (req, res) => {
  const { userCode } = req.query;
  const sql = "DELETE FROM Members WHERE userCode=?";

  getConnection((connection) => {
    connection.query(sql, [userCode], (error) => {
      if (error) {
        res.status(400).send("Bad Request");
      }
      res.send("success");
    });
    connection.release();
  });
});

router.get("/list", async (req, res) => {
  try {
    const response = await MemberService.getMembers();
    return res.send(response);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

router.get("/list/:id", async (req: Request<{ id: string }>, res) => {
  try {
    const { id } = req.params;
    const response = await MemberService.getMember(id);
    return res.send(response);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

export default router;
