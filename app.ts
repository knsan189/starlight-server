import { fileURLToPath } from "url";
import log4js from "log4js";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./src/routes/index.js";
import islandRouter from "./src/routes/island.js";
import fortuneRouter from "./src/routes/fortune.js";
import messageRouter from "./src/routes/message.js";
import fs from "fs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// view engine setup

log4js.configure(path.join(__dirname, "log4js.json"));

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

if (process.env.NODE_ENV === "production") {
  app.use(
    logger("combined", {
      stream: fs.createWriteStream(`app.log`, { flags: "w" }),
    })
  );
} else {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/island*", islandRouter);
app.use("/api/fortune*", fortuneRouter);
app.use("/api/message*", messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler

const log = log4js.getLogger();

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  log.error(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
