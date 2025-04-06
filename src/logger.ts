import { pino } from "pino";
import pretty from "pino-pretty";

let logger: pino.Logger;

export function initLogger({
	logfile,
	loglevel,
	clear,
}: {
	logfile?: string;
	loglevel: string;
	clear?: boolean;
}) {
	logger = pino(
		{ level: loglevel },
		pino.multistream(
			[
				// NOTE: We need to pass in the destination as 2 (stderr) since stdout is already being used
				// for communication via MCP.
				pretty({ destination: 2 }),

				logfile
					? pino.destination({ dest: logfile, append: !clear })
					: undefined,
			].filter(Boolean) as pino.DestinationStream[],
		),
	);
}

export function getLogger() {
	if (!logger) {
		throw new Error("Logger not yet initialized");
	}

	return logger;
}
