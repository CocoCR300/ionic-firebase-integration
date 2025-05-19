import { useState, ReactNode, useContext } from "react";
import { IonButton, IonFooter, IonIcon, IonImg, IonLabel } from "@ionic/react";
import { PageWrapper } from "../components/page-wrapper";

import { useHistory, useLocation } from "react-router";
import { Capacitor } from "@capacitor/core";
import { pencil, trash } from "ionicons/icons";
import { Dialog } from "@capacitor/dialog";
import { GalleryContext } from "../components/gallery-provider";

export interface ImagePageData
{
	index: number;
	imageUri: string;
}

export default function ImagePage()
{
	const [error, setError] = useState(false);
	const gallery = useContext(GalleryContext);
	const location = useLocation();
	const navigator = useHistory();

	const data = location.state as ImagePageData;

	async function deleteImage() {
		const confirmation = await Dialog.confirm({
			message: "Are you sure you want to delete this image?"
		});
		if (!confirmation.value) {
			return;
		}

		await gallery.deleteImage(data.index);
		navigator.goBack();
	}

	let imageUri = "";
	if (data) {
		imageUri = Capacitor.convertFileSrc(data.imageUri);
	}

	let imageView: ReactNode;
	if (error) {
		imageView = (
			<IonLabel>An error occurred while loading the image :(</IonLabel>
		);
	}
	else if (imageUri.length === 0) {
		imageView = (
			<IonLabel>No image was selected</IonLabel>
		);
	}
	else {
		imageView = (
			<IonImg src={imageUri}/>
		);
	}

	return (
		<PageWrapper title="Image" showMenuButton={false}>
			<div className="center-container">
				{ imageView }
			</div>

			<IonFooter style={{ padding: "0.5em" }}>
				<div style={{ display: "flex", justifyContent: "space-evenly" }} onClick={ _ => deleteImage() }>
					<IonButton color="danger" fill="clear">
						<IonIcon icon={trash} slot="start"/>
						Delete
					</IonButton>
					<IonButton color="secondary" fill="clear">
						<IonIcon icon={pencil} slot="start"/>
						Metadata
					</IonButton>
				</div>
			</IonFooter>
		</PageWrapper>
	);
};

