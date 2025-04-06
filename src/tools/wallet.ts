import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
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
  "/get-balance",
  describeTool({
    name: "get-balance",
    description: "Get the balance of a wallet",
  }),
  mValidator(
    "json",
    z.object({
      address: z
        .string()
        .optional()
        .describe(
          "The address of the wallet you'd like to get the balance of. If empty, defaults to the current wallet."
        ),
      coinType: z
        .string()
        .describe(
          "The coin type you'd like to get the balance for. Defaults to the SUI coin type."
        )
        .default(SUI_TYPE_ARG),
    })
  ),
  async (c) => {
    const { address = await cli.activeAddress(), coinType } =
      c.req.valid("json");

    const suiClient = await cli.getSuiClient();

    // TODO: Coin metadata + decimals formatting:
    const balance = await suiClient.getBalance({
      owner: address,
      coinType,
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: `Balance for ${address} (${coinType}) is ${balance}`,
      },
    ]);
  }
);
