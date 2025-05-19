import { Filesystem } from "@capacitor/filesystem";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { getImageFileUris, saveImage, SaveImageResult } from "../services/images";

export class Gallery
{
	private readonly setImageFileUris: (uris: string[]) => void;

	readonly imageFileUris: string[];

	constructor(imageFileUris: string[], setImageFileUris: (uris: string[]) => void)
	{
		this.imageFileUris = imageFileUris;
		this.setImageFileUris = setImageFileUris;
	}

	async addImage(uri: string): Promise<SaveImageResult>
	{
		const result = await saveImage(uri);

		// This is just ridiculous
		this.imageFileUris.push(uri);
		this.setImageFileUris(this.imageFileUris.slice(0));

		return result;
	}

	async deleteImage(index: number): Promise<string>
	{
		const uri = this.imageFileUris[index];
		await Filesystem.deleteFile({
			path: uri
		});

		// This is just ridiculous
		this.imageFileUris.splice(index, 1);
		this.setImageFileUris(this.imageFileUris.slice(0));

		return uri;
	}
}

export const GalleryContext = createContext<Gallery>({ } as Gallery);

export default function GalleryProvider({ children }: PropsWithChildren)
{
	const [imageFileUris, setImageFileUris] = useState<string[]>([]);
	const gallery = new Gallery(imageFileUris, setImageFileUris);

	useEffect(() => {
		getImages();
	}, []);

	async function getImages() {
		try {
			const filePaths = await getImageFileUris();
			setImageFileUris(filePaths);

			console.log(`Read ${filePaths.length} images`);
		}
		catch (err) {
			console.error(err);
		}
	}


	return <GalleryContext.Provider value={ gallery }>{ children }</GalleryContext.Provider>
}
