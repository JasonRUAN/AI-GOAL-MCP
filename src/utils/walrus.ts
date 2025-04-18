import type { Keypair } from "@mysten/sui/cryptography";
import type { WalrusClient } from "@mysten/walrus";

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
	file: File,
	epochs: number,
) {
	const fileBuffer = await file.arrayBuffer();
	const { blobId } = await walrusClient.writeBlob({
		blob: new Uint8Array(fileBuffer),
		deletable: false,
		epochs,
		signer: keypair,
	});

	return blobId;
}
