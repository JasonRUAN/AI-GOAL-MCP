import type { Keypair } from "@mysten/sui/cryptography";
import type { WalrusClient } from "@mysten/walrus";
import * as fs from 'fs';
import { CONSTANTS } from "../constants/index.js";

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

	// const { blobId } = await walrusClient.writeBlob({
	// 	blob: fileBlob,
	// 	deletable: false,
	// 	epochs,
	// 	signer: keypair,
	// });

    const blobId = await storeBlob(fileBlob, epochs);

	return blobId;
}

export const storeBlob = async (blobData: Uint8Array, epochs: number) => {
    const url = `${CONSTANTS.WALRUS.PUBLISHER_URL}/v1/blobs?epochs=${epochs}`;
    console.log(`storeBlob url: ${url}`);
    return fetch(url, {
        method: "PUT",
        body: blobData,
    }).then(async (response) => {
        if (response.status === 200) {
            const blobInfo = await response.json();

            let blobId = "";
            if (blobInfo.alreadyCertified) {
                blobId = blobInfo.alreadyCertified.blobId;
            } else if (blobInfo.newlyCreated) {
                blobId = blobInfo.newlyCreated.blobObject.blobId;
            } else {
                throw new Error("Response does not contain expected bolbId");
            }

            return blobId;
        }

        throw new Error(
            `Something went wrong when storing the blob!, ${JSON.stringify(
                response,
                null,
                2
            )}`
        );
    });
};