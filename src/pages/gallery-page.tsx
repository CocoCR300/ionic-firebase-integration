import { useState, ReactNode, useContext } from "react";
import { IonImg, IonLabel } from "@ionic/react";
import { PageWrapper } from "../components/page-wrapper";
import { GalleryContext } from "../components/gallery-provider";
import { ListView } from "../components/list-view/list-view";
import { ImagePageData } from "./image-page";
import { useHistory } from "react-router";
import { Capacitor } from "@capacitor/core";

import "./gallery-page.css";

export default function GalleryPage()
{
	const gallery = useContext(GalleryContext);
	const navigator = useHistory();
	const imageFileUris = gallery.imageFileUris;

	function showImage(index: number, uri: string) {
		navigator.push(`/image`, { index, imageUri: uri } as ImagePageData);
	}

	let imagesView: ReactNode;
	if (imageFileUris.length === 0) {
		imagesView = (
			<div className="center-container">
				<IonLabel>No images found</IonLabel>
			</div>
		);
	}
	else {
		imagesView = (
			<ListView items={imageFileUris} itemTemplate={ (index, uri) =>
				{
					const srcUri = Capacitor.convertFileSrc(uri); // Why do I have to do this?
					return (
						<IonImg onClick={ _ => showImage(index, uri) } src={srcUri} style={{ height: "100%", objectFit: "cover" }}/>
					);
				}
			}/>
		);
	}

	return (
		<PageWrapper title="Gallery">
			{ imagesView }
		</PageWrapper>
	);
};

