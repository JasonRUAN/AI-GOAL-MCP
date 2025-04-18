import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { getKeypair } from "../state/index.js";
import { optionalAddress, optionalNetwork } from "../utils/schema.js";
import { retrieveBlob, writeFileBlob } from "../utils/walrus.js";

app.post(
	"/upload_file",
	describeTool({
		name: "upload_file",
		description:
			"Upload a file to the walrus and get blobId from the response.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			address: optionalAddress,
			file: z.instanceof(File).describe("The file you'd like to upload."),
			epochs: z
				.number()
				.optional()
				.default(50)
				.describe("The number of epochs to store the blob for."),
		}),
	),
	async (c) => {
		const { network, address, file, epochs } = c.req.valid("json");

		const fileBlobId = await writeFileBlob(
			network.walrusClient,
			await getKeypair(address),
			file,
			epochs,
		);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify({ fileBlobId }, null, 2),
			},
		]);
	},
);

app.post(
	"/download_file",
	describeTool({
		name: "download_file",
		description:
			"Download a file from the walrus and get the file from the response.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			fileBlobId: z
				.string()
				.describe("The blobId of the file you'd like to download."),
		}),
	),
	async (c) => {
		const { network, fileBlobId } = c.req.valid("json");

		const file = await retrieveBlob(network.walrusClient, fileBlobId);
		const arrayBuffer = await file.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(
					{ fileBlobId, fileBase64Content: base64 },
					null,
					2,
				),
			},
		]);
	},
);
