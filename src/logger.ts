import { pino } from "pino";
import pretty from "pino-pretty";

export const logger = pino(
	{ level: "info" },
	pino.multistream(
		[
			// 特别注意这里使用 stderr（2）而不是 stdout（1），因为 stdout 已被 MCP 通信占用
			// NOTE: We need to pass in the destination as 2 (stderr) since stdout is already being used
			// for communication via MCP.
			pretty({ destination: 2 }),
			process.env.SUI_MCP_LOG_FILE !== "off"
				? pino.destination({
						dest: process.env.SUI_MCP_LOG_FILE,
						append: false,
					})
				: undefined,
		].filter(Boolean) as pino.DestinationStream[], // 过滤掉数组中的 undefined 值，确保最终的输出流数组只包含有效的流对象
	),
);
