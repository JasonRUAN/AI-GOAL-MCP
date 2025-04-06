import { z } from "zod";
import { cli } from "./suiCli.js";
import { stat } from "node:fs/promises";
import fg from "fast-glob";
import { getLogger } from "../logger.js";
import path from "node:path";

export const optionalAddress = z
  .string()
  .optional()
  .describe(
    "The address of the wallet you'd like to use. If empty, defaults to the current wallet."
  )
  .transform(async (address) => {
    if (!address || !address.trim()) {
      return await cli.activeAddress();
    }

    return address;
  });

export const moveDirectory = z
  .string()
  .startsWith("/")
  .describe(
    "The directory of the Move package. Must be an absolute path, starting with /"
  )
  .transform(async (directory) => {
    if (!(await stat(directory)).isDirectory()) {
      throw new Error("Directory does not exist");
    }

    const moveToml = await fg(["**/Move.toml"], { cwd: directory });

    if (moveToml.length === 0) {
      throw new Error("Move.toml not found");
    }

    if (moveToml.length > 1) {
      // TODO: Use the shortest path
      getLogger().warn("Multiple Move.toml files found, using the first one");
    }

    return path.join(directory, path.dirname(moveToml[0]));
  });
