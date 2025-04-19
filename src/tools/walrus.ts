import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { type ToolResponseType, describeTool, mValidator } from "muppet";
import { z } from "zod";
import { app } from "../server/app.js";
import { getKeypair } from "../state/index.js";
import { optionalAddress, optionalNetwork } from "../utils/schema.js";
import { retrieveBlob, writeFileBlob } from "../utils/walrus.js";

app.post(
	"/upload_file_to_walrus",
	describeTool({
		name: "upload_file_to_walrus",
		description:
			"Upload a file to the walrus and get blobId from the response.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			address: optionalAddress,
			file_path: z.string().describe("The file path you'd like to upload."),
			epochs: z
				.number()
				.optional()
				.default(50)
				.describe("The number of epochs to store the blob for."),
		}),
	),
	async (c) => {
		const { network, address, file_path, epochs } = c.req.valid("json");

		const fileBlobId = await writeFileBlob(
			network.walrusClient,
			await getKeypair(address),
			file_path,
			epochs,
		);

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: fileBlobId,
			},
		]);
	},
);

app.post(
	"/download_file_from_walrus",
	describeTool({
		name: "download_file_from_walrus",
		description:
			"Download a file from the walrus and save it to the given file path.",
	}),
	mValidator(
		"json",
		z.object({
			network: optionalNetwork,
			fileBlobId: z
				.string()
				.describe("The blobId of the file you'd like to download."),
			outputFilePath: z
				.string()
				.describe("The file path you'd like to save the file to."),
		}),
	),
	async (c) => {
		const { network, fileBlobId, outputFilePath } = c.req.valid("json");

		const file = await retrieveBlob(network.walrusClient, fileBlobId);
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// 写入文件
		await writeFile(outputFilePath, buffer);

		// 计算MD5
		const md5 = createHash("md5").update(buffer).digest("hex");

		// 获取文件大小（以字节为单位）
		const fileSize = buffer.length;

		return c.json<ToolResponseType>([
			{
				type: "text",
				text: JSON.stringify(
					{
						fileBlobId,
						fileSize,
						md5,
					},
					null,
					2,
				),
			},
		]);
	},
);
