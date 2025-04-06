import { describeTool, mValidator, type ToolResponseType } from "muppet";
import { app } from "../server/app.js";
import { z } from "zod";
import { cli } from "../utils/suiCli.js";
import { optionalAddress } from "../utils/schema.js";

app.post(
  "/get-object",
  describeTool({
    name: "get-object",
    description: "Get an object by its ID",
  }),
  mValidator(
    "json",
    z.object({
      id: z.string().describe("The ID of the object you'd like to get."),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const suiClient = await cli.getSuiClient();

    const object = await suiClient.getObject({
      id,
      options: {
        showType: true,
        showContent: true,
        showDisplay: true,
        showOwner: true,
        showPreviousTransaction: true,
        showStorageRebate: true,
      },
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(object, null, 2),
      },
    ]);
  }
);

app.post(
  "/get-owned-objects",
  describeTool({
    name: "get-owned-objects",
    description: "Get objects owned by a wallet",
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

    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showType: true,
        showDisplay: true,
        showContent: true,
        showPreviousTransaction: true,
        showStorageRebate: true,
      },
      // Filter out coin objects:
      filter: { MatchNone: [{ StructType: "0x2::coin::Coin" }] },
      // TODO: Pagination:
      limit: 50,
    });

    return c.json<ToolResponseType>([
      {
        type: "text",
        text: JSON.stringify(objects, null, 2),
      },
    ]);
  }
);
