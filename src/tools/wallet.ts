import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../app.js";
import { z } from "zod";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// TODO: This should be stored somewhere...
const WALLET = new Ed25519Keypair();

app.post(
  "/current-address",
  describeTool({
    name: "current-address",
    description: "Get the current wallet address",
  }),
  mValidator("json", z.object({})),
  (c) => {
    return c.json<ToolResponseType>([
      { type: "text", text: WALLET.toSuiAddress() },
    ]);
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
        )
        .default(() => WALLET.toSuiAddress()),
      coinType: z
        .string()
        .describe(
          "The coin type you'd like to get the balance for. Defaults to the SUI coin type."
        )
        .default(SUI_TYPE_ARG),
    })
  ),
  (c) => {
    const { address, coinType } = c.req.valid("json");

    return c.json<ToolResponseType>([
      { type: "text", text: `Balance for ${address} (${coinType}) is ${100}` },
    ]);
  }
);
