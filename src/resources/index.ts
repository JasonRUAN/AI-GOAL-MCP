import { registerResources, type Resource } from "muppet";
import { app } from "../app.js";

// TODO: Add TS SDK docs:
app.post(
  "/documents",
  registerResources((c) =>
    c.json<Resource[]>([
      {
        uri: "https://docs.sui.io/sui-api-ref",
        name: "Sui JSON RPC Reference",
        mimeType: "text/html",
      },
    ])
  )
);
