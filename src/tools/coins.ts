import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { cli } from "../utils/suiCli.js";
import { optionalAddress } from "../utils/schema.js";

app.post(
  "/get-balance",
  describeTool({
    name: "get-balance",
    description: "Get the balance of a specific coin type for a wallet",
  }),
  mValidator(
    "json",
    z.object({
      address: optionalAddress,
      coinType: z
        .string()
        .describe(
          "The coin type you'd like to get the balance for. Defaults to the SUI coin type."
        )
        .default(SUI_TYPE_ARG),
    })
  ),
  async (c) => {
    const { address, coinType } = c.req.valid("json");

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

app.post(
  "/get-all-balances",
  describeTool({
    name: "get-all-balances",
    description: "Get all balances for a wallet",
  }),
  mValidator(
    "json",
    z.object({
      address: optionalAddress,
    })
  ),
  async (c) => {
    const { address } = c.req.valid("json");

    const suiClient = await cli.getSuiClient();

    const balances = await suiClient.getAllBalances({
      owner: address,
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(balances, null, 2),
      },
    ]);
  }
);

app.post(
  "/get-owned-coin-objects",
  describeTool({
    name: "get-owned-coin-objects",
    description: "Get coin objects owned by a wallet, by coin type",
  }),
  mValidator(
    "json",
    z.object({
      address: optionalAddress,
      coinType: z
        .string()
        .describe(
          "The coin type you'd like to get the coins for. Defaults to the SUI coin type."
        )
        .default(SUI_TYPE_ARG),
    })
  ),
  async (c) => {
    const { address, coinType } = c.req.valid("json");

    const suiClient = await cli.getSuiClient();

    const coins = await suiClient.getCoins({
      owner: address,
      coinType,
      // TODO: Pagination:
      limit: 50,
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(coins, null, 2),
      },
    ]);
  }
);
