import { Router } from "express";
import { getConnection } from "../config/db.config.js";

const router = Router();

router.get("/", (req, res) => {
  const { id } = req.query;
  const sql = "SELECT * FROM Raids WHERE id=?";
  getConnection((connection) => {
    connection.query(sql, id, (err, result, fields) => {
      try {
        if (err) throw new Error(err.message);
        const [data] = result;
        res.send({ ...data, parties: JSON.parse(data.parties) });
      } catch (error) {
        res.status(500).send(error);
      }
    });
    connection.release();
  });
});

router.post("/", (req, res) => {
  const { title } = req.body;
  const parties = [[]];
  const data = { title, parties: JSON.stringify(parties) };
  const sql = "INSERT INTO Raids SET ?";
  getConnection((connection) => {
    connection.query(sql, data, (error, result) => {
      if (error) {
        res.send(400).send("bad request");
        return;
      }
      res.send({ title, id: result.insertId, parties });
    });
    connection.release();
  });
});

router.put("/", (req, res) => {
  const { id, raid } = req.body;
  const { parties, title } = raid;
  const sql = "UPDATE Raids SET title=?, parties=? WHERE id=?";
  getConnection((connection) => {
    connection.query(
      sql,
      [title, JSON.stringify(parties), id],
      (err, result) => {
        if (err) {
          res.status(400).send("bad request");
          return;
        }
        res.send("success");
      }
    );
    connection.release();
  });
});

router.get("/list", (req, res) => {
  const sql = "SELECT id, title FROM Raids";

  getConnection((connection) => {
    connection.query(sql, (err, result) => {
      if (err) {
        res.status(400).send("bad request");
        return;
      }
      res.send(result);
    });
    connection.release();
  });
});

export default router;
