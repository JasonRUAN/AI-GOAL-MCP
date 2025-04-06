import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { cli } from "../utils/suiCli.js";

app.post(
  "/set-current-network",
  describeTool({
    name: "set-current-network",
    description: "Set the current Sui network",
  }),
  mValidator(
    "json",
    z.object({
      alias: z.string(),
      url: z.string().optional(),
    })
  ),
  async (c) => {
    const { alias, url } = c.req.valid("json");

    const [envs] = await cli.envs();
    if (!envs.find((env) => env.alias === alias)) {
      if (!url) {
        throw new Error("Network is not yet configured, URL is required");
      }
      await cli.newEnv(alias, url);
    }

    await cli.switchEnv(alias);

    return c.json<ToolResponseType>({
      content: [{ type: "text", text: `Switched to "${alias}"` }],
    });
  }
);

app.post(
  "/get-current-network",
  describeTool({
    name: "get-current-network",
    description: "Get the current Sui network",
  }),
  mValidator("json", z.object({})),
  async (c) => {
    const env = await cli.getActiveEnv();

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: `The network is set to "${env.alias}", RPC URL "${env.rpc}"`,
      },
    ]);
  }
);

app.post(
  "/list-networks",
  describeTool({
    name: "list-networks",
    description: "List all available Sui networks",
  }),
  mValidator("json", z.object({})),
  async (c) => {
    const [envs, activeEnv] = await cli.envs();

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(
          {
            envs: envs.map((env) => ({
              alias: env.alias,
              url: env.rpc,
            })),
            current: activeEnv,
          },
          null,
          2
        ),
      },
    ]);
  }
);
