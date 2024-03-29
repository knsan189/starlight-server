export const logConfig = {
  appenders: {
    app: {
      type: "console",
    },
    infoFile: {
      type: "file",
      filename: "./log/info.log",
      maxLogSize: 524288,
      numBackups: 3,
      compress: true,
    },
    info: {
      type: "logLevelFilter",
      level: "INFO",
      appender: "infoFile",
    },
    errorFile: {
      type: "file",
      filename: "./log/errors.log",
      maxLogSize: 524288,
      numBackups: 3,
      compress: true,
    },
    errors: {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile",
    },
    everything: { type: "dateFile", filename: "all-the-logs.log" },
  },
  categories: {
    default: {
      appenders: ["app", "errors", "info", "everything"],
      level: "info",
    },
    message: {
      appenders: ["app", "errors", "info", "everything"],
      level: "info",
    },
    history: {
      appenders: ["app", "errors", "info", "everything"],
      level: "info",
    },
  },
};

export default {};
