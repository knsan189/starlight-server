import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.status(200).send("destoryed");
});

export default router;
