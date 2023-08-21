import { Router } from "express";
import path from "path";
import { PUBLIC_PATH } from "../config/path.js";

const IndexRouter = Router();

IndexRouter.get("/", function (req, res) {
  res.sendFile(path.join(PUBLIC_PATH, "index.html"));
});

export default IndexRouter;
