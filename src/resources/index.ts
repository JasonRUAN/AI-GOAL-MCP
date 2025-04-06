import { registerResources, type Resource } from "muppet";
import { app } from "../server/app.js";

app.post(
  "/documents",
  registerResources((c) =>
    c.json<Resource[]>([
      {
        uri: "https://sdk.mystenlabs.com/llms.txt",
        name: "Sui TypeScript SDK Docs",
        description:
          "The documentation for the Sui TypeScript SDK (@mysten/sui), including React SDKs (@mysten/dapp-kit).",
        mimeType: "text/plain",
      },
      {
        uri: "https://docs.sui.io/sui-api-ref",
        name: "Sui JSON RPC Reference",
        description:
          "The documentation for the Sui JSON RPC API, which is the primary way to interact with the Sui blockchain.",
        mimeType: "text/html",
      },
    ])
  )
);
