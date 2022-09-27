import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { body } = req;
  console.log(body);
  res.send("success");
});

export default router;
