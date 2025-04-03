import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../app.js";
import { z } from "zod";

app.post(
  "/set-current-network",
  describeTool({
    name: "set-current-network",
    description: "Set the current Sui network",
  }),
  mValidator(
    "json",
    z.object({
      network: z.enum(["mainnet", "testnet", "devnet", "localnet"]),
    })
  ),
  (c) => {
    const { network } = c.req.valid("json");

    return c.json<ToolResponseType>({
      content: [{ type: "text", text: network }],
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
  (c) => {
    return c.json<ToolResponseType>([{ type: "text", text: "mainnet" }]);
  }
);
