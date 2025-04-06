import { command, string, run, boolean } from "@drizzle-team/brocli";
import { getLogger, setLogger } from "./logger.js";
import { pino } from "pino";
import { startServer } from "./server/index.js";
import path from "path";

const start = command({
  name: "start",
  options: {},
  handler: (opts) => {
    getLogger().debug("Starting server");

    startServer();
  },
});

run([start], {
  name: "sui-mcp",
  description: "SuiMCP CLI",
  omitKeysOfUndefinedOptions: true,
  version: "0.0.1",
  globals: {
    clear: boolean().alias("c").desc("Clear the log file").default(false),

    logfile: string()
      .desc("The file you want to log to")
      .alias("f")
      .default(path.join(import.meta.dirname, "./sui-mcp.log")),

    loglevel: string()
      .enum("info", "debug", "warn", "error")
      .desc("The log level you want to use")
      .default("info"),
  },
  hook: (event, command, globals) => {
    if (event === "before") {
      const logger = pino(
        { level: globals.loglevel },
        pino.destination({ dest: globals.logfile, append: !globals.clear })
      );

      setLogger(logger);

      logger.debug(`Running command: ${JSON.stringify(command, null, 2)}`);
    } else if (event === "after") {
      getLogger().debug(
        `Command finished: ${JSON.stringify(command, null, 2)}`
      );
    }
  },
});
