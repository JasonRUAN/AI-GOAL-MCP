import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { cli } from "../utils/suiCli.js";

app.post(
  "/current-address",
  describeTool({
    name: "current-address",
    description: "Get the current wallet address",
  }),
  mValidator("json", z.object({})),
  async (c) => {
    const address = await cli.activeAddress();

    return c.json<ToolResponseType>([{ type: "text", text: address }]);
  }
);

app.post(
  "/list-addresses",
  describeTool({
    name: "list-addresses",
    description: "List all addresses for the current wallet",
  }),
  mValidator("json", z.object({})),
  async (c) => {
    const { addresses, activeAddress } = await cli.address();

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(
          {
            addresses: addresses.map(([alias, address]) => ({
              alias,
              address,
            })),
            activeAddress,
          },
          null,
          2
        ),
      },
    ]);
  }
);

app.post(
  "/switch-address",
  describeTool({
    name: "switch-address",
    description: "Switch to a different address",
  }),
  mValidator(
    "json",
    z.object({
      aliasOrAddress: z
        .string()
        .describe("The alias or address of the wallet to switch to"),
    })
  ),
  async (c) => {
    const { aliasOrAddress } = c.req.valid("json");

    await cli.switchAddress(aliasOrAddress);

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: `Switched to "${aliasOrAddress}"`,
      },
    ]);
  }
);
