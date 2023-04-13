import { fileURLToPath } from "url";
import cors from "cors";
import log4js from "log4js";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import IndexRouter from "./routes/index.js";
import islandRouter from "./routes/island.js";
import membersRouter from "./routes/members.js";
import raidsRouter from "./routes/raids.js";
import FortuneRouter from "./routes/fortune.js";
import HistoryRouter from "./routes/history.js";
import MapRouter from "./routes/map.js";
import LostarkRouter from "./routes/lostark.js";
import { logConfig } from "./config/log.config.js";

const isDev = `${process.env.NODE_ENV}`.trim() === "development";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log4js.configure(logConfig);

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");
app.use(logger(isDev ? "dev" : "common"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/map", MapRouter);
app.use("/api/lostark", LostarkRouter);
app.use("/api/history", HistoryRouter);
app.use("/api/island", islandRouter);
app.use("/api/members", membersRouter);
app.use("/api/raid", raidsRouter);
app.use("/api/fortune", FortuneRouter);
app.use("/*", IndexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
