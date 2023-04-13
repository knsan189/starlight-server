import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const IndexRouter = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

IndexRouter.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

export default IndexRouter;
