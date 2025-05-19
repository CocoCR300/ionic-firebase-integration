import { Directory, Filesystem } from "@capacitor/filesystem";
import { getFilenameFromDate } from "../util/date";
import { act } from "react";

const FOLDER_NAME = "images";

export interface SaveImageResult
{
	filename: string;
	uri: string;
}

export async function getImageFileUris(): Promise<string[]>
{
	let result;
	try {
		result = await Filesystem.readdir({
			directory: Directory.Data,
			path: FOLDER_NAME
		});

	}
	catch (err: any) {
		console.error(err);
		let actualError = err as Error;

		if (actualError.message.includes("does not exist")) {
			return [];
		}

		throw err;
	}

	const filePaths = result.files.map(fileInfo => fileInfo.uri);
	return filePaths;
}

export async function saveImage(existingImagePath: string): Promise<SaveImageResult>
{
	try {
		await Filesystem.mkdir({
			directory: Directory.Data,
			path: FOLDER_NAME,
			recursive: true
		});
	} catch (error: any) {
		const actualError = error as Error; // It's ridiculous that you have to do this
		if (!actualError.message.includes("File exists")) {
			console.error("Couldn't create images folder: ", error);
		}
	}

	const filename = getFilenameFromDate("jpg");
	const result = await Filesystem.copy({
		from: existingImagePath,
		to: `${FOLDER_NAME}/${filename}`,
		toDirectory: Directory.Data
	});

	return { filename, uri: result.uri };
}
