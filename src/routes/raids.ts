import { Router } from "express";
import connection from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const { id } = req.query;
  const sql = "SELECT * FROM Raids WHERE id=?";
  connection.query(sql, id, (err, result, fields) => {
    if (err) {
      res.status(400).send("bad request");
      return;
    }
    const [data] = result;
    res.send({ ...data, parties: JSON.parse(data.parties) });
  });
});

router.post("/", (req, res) => {
  const { title } = req.body;
  const parties = [[]];
  const data = { title, parties: JSON.stringify(parties) };
  const sql = "INSERT INTO Raids SET ?";
  connection.query(sql, data, (error, result) => {
    if (error) {
      res.send(400).send("bad request");
      return;
    }
    res.send({ title, id: result.insertId, parties });
  });
});

router.put("/", (req, res) => {
  const { id, raid } = req.body;
  const { parties, title } = raid;
  const sql = "UPDATE Raids SET title=?, parties=? WHERE id=?";
  connection.query(sql, [title, JSON.stringify(parties), id], (err, result) => {
    if (err) {
      res.status(400).send("bad request");
      return;
    }
    res.send("success");
  });
});

router.get("/list", (req, res) => {
  const sql = "SELECT id, title FROM Raids";
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(400).send("bad request");
      return;
    }
    res.send(result);
  });
});

export default router;
