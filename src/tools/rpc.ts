import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

app.post(
  "/call-rpc",
  describeTool({
    name: "call-rpc",
    description: "Call a Sui RPC method",
  }),
  mValidator(
    "json",
    z.object({
      method: z.string().describe("The Sui RPC method to call"),
      params: z.record(z.any()),
    })
  ),
  async (c) => {
    const { method, params } = c.req.valid("json");
    const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

    try {
      const result = await client.call(method, [params]);

      return c.json<ToolResponseType>([
        { type: "text", text: `${JSON.stringify(result)}` },
      ]);
    } catch (error) {
      return c.json<ToolResponseType>([
        { type: "text", text: `${JSON.stringify(error)}` },
      ]);
    }
  }
);
