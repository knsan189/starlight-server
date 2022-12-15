import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = `${process.env.NODE_ENV}`.trim() === "development";

router.get("/", function (req, res) {
  res.sendFile(
    path.join(__dirname, isDev ? "../../public/index.html" : "../../../public/index.html"),
  );
});

export default router;
