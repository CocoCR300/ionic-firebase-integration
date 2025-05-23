import { ReactNode, useContext, useEffect, useState } from "react";
import { IonButton, IonChip, IonFooter, IonIcon, IonImg, IonLabel } from "@ionic/react";
import { PageWrapper } from "../components/page-wrapper";

import { useHistory, useLocation } from "react-router";
import { Capacitor } from "@capacitor/core";
import { add, close, closeCircle, exit, pencil, trash } from "ionicons/icons";
import { Dialog } from "@capacitor/dialog";
import { GalleryContext } from "../components/gallery-provider";
import { deleteObject, getMetadata, ref, SettableMetadata, updateMetadata } from "firebase/storage";
import { firebaseStorage } from "../services/firebase";

export interface ImagePageData
{
	index: number;
	imageUri: string;
}

export default function ImagePage()
{
	const gallery = useContext(GalleryContext);
	const location = useLocation();
	const navigator = useHistory();
	const [tags, setTags] = useState<string[]>([]);
	const [imageFileName, setImageFileName] = useState("");

	const data = location.state as ImagePageData;

	useEffect(() => {
		const imageUri = data.imageUri;
		const imageFileNameStartIndex = imageUri.lastIndexOf("/");
		const filename = imageUri.substring(imageFileNameStartIndex + 1);
		setImageFileName(filename);

		getImageMetadata(filename);
	}, []);

	async function getImageMetadata(filename: string) {
		const path = `images/${filename}`;
		const storageReference = ref(firebaseStorage, path);
		const metadata = await getMetadata(storageReference);

		if (metadata.customMetadata && metadata.customMetadata["tags"]) {
			const tags = JSON.parse(metadata.customMetadata["tags"]);
			console.log(tags);
			setTags(tags);
		}
	}

	async function addTag() {
		const result = await Dialog.prompt({
			message: "Add tag",
		});

		if (result.cancelled) {
			return;
		}

		if (tags.includes(result.value)) {
			return;
		}

		const tagsCopy = [...tags, result.value];
		updateTags(tagsCopy);
	}

	async function removeTag(tag: string) {
		const result = await Dialog.confirm({
			message: "Are you sure you want to remove this tag?",
		});

		if (!result.value) {
			return;
		}

		const index = tags.findIndex(existingTag => existingTag == tag);
		const tagsCopy = [...tags];
		tagsCopy.splice(index, 1);

		updateTags(tagsCopy);
	}

	async function updateTags(tags: string[]) {
		const metadata: SettableMetadata = {
			customMetadata: {
				tags: JSON.stringify(tags)
			}
		};

		const storageReference = ref(firebaseStorage, `images/${imageFileName}`);
		await updateMetadata(storageReference, metadata);

		setTags(tags);
	}

	async function deleteImage() {
		const confirmation = await Dialog.confirm({
			message: "Are you sure you want to delete this image?"
		});
		if (!confirmation.value) {
			return;
		}

		const uri = await gallery.deleteImage(data.index);
		const imageFileNameStartIndex = uri.lastIndexOf("/");
		const imageFileName = uri.substring(imageFileNameStartIndex + 1);
		console.log(`Image file to be deleted: ${imageFileName}`);

		const photoRef = ref(firebaseStorage, `images/${imageFileName}`);
		try {
			await deleteObject(photoRef)
			console.log("Successfully deleted image from Firebase Storage");
		}
		catch (err: any) {
			console.log(`Couldn't delete image from Firebase Storage: ${err.code}`);
		}

		navigator.goBack();
	}

	let imageSrcUri = "";
	if (data) {
		imageSrcUri = Capacitor.convertFileSrc(data.imageUri);
	}

	let imageView: ReactNode;
	if (imageSrcUri.length === 0) {
		imageView = (
			<IonLabel>No image was selected</IonLabel>
		);
	}
	else {
		imageView = (
			<IonImg src={imageSrcUri}/>
		);
	}

	return (
		<PageWrapper title="Image" showMenuButton={false}>
			<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
				{ imageView }
				<div style={{ alignItems: "center", display: "inherit", flexFlow: "inherit", gap: "inherit" }}>
					<IonLabel><h2>{ imageFileName }</h2></IonLabel>
					<div>
						{
							tags.map(tag => (
								<IonChip onClick={ _ => removeTag(tag) }>
									{ tag }
									<IonIcon icon={closeCircle}/>
								</IonChip>
							))
						}
					</div>
					<IonButton color="secondary" fill="clear" onClick={ _ => addTag() }>
						<IonIcon icon={add} slot="start"/>
						Add tag
					</IonButton>
				</div>
			</div>

			<IonFooter style={{ padding: "0.5em" }}>
				<div style={{ display: "flex", justifyContent: "center" }} onClick={ _ => deleteImage() }>
					<IonButton color="danger" fill="clear">
						<IonIcon icon={trash} slot="start"/>
						Delete
					</IonButton>
				</div>
			</IonFooter>
		</PageWrapper>
	);
};

