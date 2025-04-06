import { pino } from "pino";

let logger: pino.Logger;

export function setLogger(newLogger: pino.Logger) {
  logger = newLogger;
}

export function getLogger() {
  if (!logger) {
    throw new Error("Logger not yet initialized");
  }

  return logger;
}
