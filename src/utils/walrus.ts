import type { Keypair } from "@mysten/sui/cryptography";
import type { WalrusClient } from "@mysten/walrus";
import * as fs from 'fs';

export async function retrieveBlob(walrusClient: WalrusClient, blobId: string) {
	const blobBytes = await walrusClient.readBlob({ blobId });
	return new Blob([new Uint8Array(blobBytes)]);
}

export async function writeBlob(
	walrusClient: WalrusClient,
	keypair: Keypair,
	content: string,
	epochs: number,
) {
	const { blobId } = await walrusClient.writeBlob({
		blob: new TextEncoder().encode(content),
		deletable: false,
		epochs,
		signer: keypair,
	});
	return blobId;
}

export async function writeFileBlob(
	walrusClient: WalrusClient,
	keypair: Keypair,
	file_path: string,
	epochs: number,
) {
	const fileBuffer = fs.readFileSync(file_path);
	const fileBlob = new Uint8Array(fileBuffer);

	const { blobId } = await walrusClient.writeBlob({
		blob: fileBlob,
		deletable: false,
		epochs,
		signer: keypair,
	});

	return blobId;
}
