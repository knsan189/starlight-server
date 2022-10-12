import { fileURLToPath } from "url";
import cors from "cors";
import log4js from "log4js";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import requestIp from "request-ip";
import indexRouter from "./src/routes/index.js";
import islandRouter from "./src/routes/island.js";
import messageRouter from "./src/routes/message.js";
import membersRouter from "./src/routes/members.js";
import raidsRouter from "./src/routes/raids.js";
import FortuneRouter from "./src/routes/fortune.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log4js.configure(path.join(__dirname, "log4js.json"));

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

app.use(requestIp.mw());
app.use((req, res, next) => {
  const ip = req.clientIp;
  console.log(`Request From : ${ip}`);
  next();
});
app.use(logger("dev"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/island*", islandRouter);
app.use("/api/message*", messageRouter);
app.use("/api/members*", membersRouter);
app.use("/api/raid", raidsRouter);
app.use("/api/fortune", FortuneRouter);
app.use("*", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
