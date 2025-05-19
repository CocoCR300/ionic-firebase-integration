import { useState, useCallback, ReactNode, useContext } from "react";
import { IonToolbar, IonButton, IonIcon, IonImg, IonProgressBar, IonSpinner, IonAlert, IonItem, IonLabel, IonButtons, IonFooter, IonNote, AlertButton, IonLoading, } from "@ionic/react";
import { camera, cloudUploadOutline, checkmarkCircleOutline, refreshOutline, imageOutline, closeCircleOutline, } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { firebaseStorage } from "../services/firebase";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { PageWrapper } from "../components/page-wrapper";
import { getFilenameFromDate } from "../util/date";
import { saveImage } from "../services/images";
import { Nullable } from "../util/typedef";
import { Capacitor } from "@capacitor/core";
import { GalleryContext } from "../components/gallery-provider";

type ButtonDefinition = string | AlertButton;

interface AlertInfo
{
	isOpen: boolean;
	header?: string;
	message: string;
	buttons?: ButtonDefinition[];
}

interface AnalysisResult
{
	isRecyclable: boolean;
	category?: "orgánico" | "plástico" | "aluminio";
	reason?: string;
}

const DEFAULT_BUTTONS: ButtonDefinition[] = [
	{ text: "OK" }
];

export default function CameraPage()
{
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
	const [uploading, setUploading] = useState<boolean>(false);
	const [lastDownloadURL, setLastDownloadURL] = useState<string | null>(null);
	const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
	const [alertInfo, setAlertInfo] = useState<AlertInfo>({ isOpen: false, message: "" });
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
	const [filename, setFilename] = useState("");
	const gallery = useContext(GalleryContext);

	const showAlert = useCallback((header: string, message: string, buttons = DEFAULT_BUTTONS) => {
		setAlertInfo({ isOpen: true, header, message, buttons });
	}, []);

	const resetMainPhotoStates = useCallback(() => {
		setImagePreview(null);
		setTakingPhoto(false);
		setUploading(false);
		setLastDownloadURL(null);
		setUploadedFilePath(null);
		setAnalysisResult(null);
		setFilename("");
	}, []);

	const checkCameraPermissions = async () => {
		try {
			const permissionStatus = await Camera.checkPermissions();
			if (permissionStatus.camera !== "granted" || permissionStatus.photos !== "granted") {
				const result = await Camera.requestPermissions({ permissions: ["camera", "photos"] });
				if (result.camera !== "granted" || result.photos !== "granted") {
					showAlert("Permisos Necesarios", "Por favor, habilita los permisos de cámara y galería.");
					return false;
				}
			}

			return true;
		} catch (error) {
			console.error("Error verificando permisos:", error);
			showAlert("Error", "Couldn't get permission to access the camera");
			return false;
		}
	};

	async function takePicture() {
		const hasPermissions = await checkCameraPermissions();
		if (!hasPermissions) {
			return;
		}

		resetMainPhotoStates();
		setTakingPhoto(true);

		try {
			const image: Photo = await Camera.getPhoto({
				quality: 70,
				allowEditing: false,
				resultType: CameraResultType.Uri,
				source: CameraSource.Prompt,
				promptLabelHeader: "Source",
				promptLabelPhoto: "Gallery",
				promptLabelPicture: "Camera",
				saveToGallery: false,
			});

			console.log("Taken picture path: ", image.path);
			if (image.path) {
				const result = await gallery.addImage(image.path);
				// https://stackoverflow.com/a/62161813
				const uri = Capacitor.convertFileSrc(result.uri); // Why do I have to do this?
				setImagePreview(uri);

				setFilename(result.filename);
				console.log("Saved file name: ", result.filename);
			}
		} catch (error: any) {
			console.error("Error al tomar/seleccionar foto:", error);
			if (!error.message?.toLowerCase().includes("cancelled")) {
				showAlert("Error", "Couldn't access the camera");
			}
		} finally {
			setTakingPhoto(false);
		}
	};

	async function uploadImage() {
		if (!imagePreview) {
			showAlert("Upload", "There is no image selected");
			return;
		}
		if (uploading) return;

		setUploading(true);
		setLastDownloadURL(null);
		setUploadedFilePath(null);

		const filepath = `images/${filename}`;
		const storageReference = ref(firebaseStorage, filepath);

		try {
			const uploadResult = await uploadString(storageReference, imagePreview, "data_url");

			const downloadURL = await getDownloadURL(storageReference);
			console.log("URL de descarga de Firebase:", downloadURL);
			if (downloadURL.startsWith("https://firebasestorage.googleapis.com/")) {
				setLastDownloadURL(downloadURL);
				setUploadedFilePath(filepath);
				showAlert("Upload", "The image has been successfully uploaded");
			} else {
				throw new Error("URL de descarga inválida");
			}
		} catch (error: any) {
			console.error("Error en la subida:", error);
			showAlert("Error", `An error has occurred: ${error.message || "Unknown error"}.`);
			setLastDownloadURL(null);
		} finally {
			console.log("Finalizando handleUploadPhoto - isUploading se establecerá en false");
			setUploading(false);
		}
	};

	const deleteImage = async () => {
		if (!uploadedFilePath) {
			showAlert("Upload", "There is no image selected");
			return;
		}

		const confirmDelete = () => {
			const photoRef = ref(firebaseStorage, uploadedFilePath);
			deleteObject(photoRef)
				.then(() => {
					showAlert("Delete", "The image has been successfully deleted");
					resetMainPhotoStates();
				})
				.catch((error) => {
					console.error("Error borrando foto:", error);
					showAlert("Delete", `Couldn't delete image: ${error.code}`);
				});
		};

		showAlert("Delete", "Are you sure you want to delete the image", [
			{ cssClass: "alert-button-cancel", role: "cancel", text: "Cancelar" },
			{ cssClass: "alert-button-danger", handler: confirmDelete, text: "Eliminar" },
		]);
	};

	let buttons: ReactNode | null;
	let imagePreviewView: ReactNode;
	if (imagePreview) {
		imagePreviewView = (
			<IonImg
				src={imagePreview}
				style={{ maxHeight: "300px", maxWidth: "100%", objectFit: "contain" }}
				onIonError={(e) => {
					console.error("Failed to load image preview");
					showAlert("Error", "Couldn't preview image");
					setImagePreview(null);
				}}
			/>
		);
	}
	else {
		imagePreviewView = (
			<IonIcon icon={imageOutline} style={{ fontSize: "64px", color: "var(--ion-color-medium)" }} />
		);
	}

	if (imagePreview && !uploading && !takingPhoto) {
		buttons = (
			<IonButtons style={{ width: "100%", display: "flex", justifyContent: "space-around", padding: "0.5rem 0" }}>
				<IonButton onClick={takePicture} fill="outline" color="medium" disabled={takingPhoto || uploading}>
					<IonIcon slot="start" icon={refreshOutline} />
					Take another 
				</IonButton>
				<IonButton onClick={uploadImage} fill="solid" color="success" disabled={uploading}>
					<IonIcon slot="start" icon={cloudUploadOutline} />
					Upload
				</IonButton>
			</IonButtons>
		);
	}
	else if (!uploading && !takingPhoto) {
		buttons = (
			<IonButton style={{ margin: "0.5rem" }} expand="full" onClick={takePicture} disabled={takingPhoto || uploading}>
				<IonIcon slot="start" icon={camera} />
				Take picture
			</IonButton>
		)
	}

	return (
		<PageWrapper title="Camera">
			<div style={{
				alignItems: "center",
				background: "var(--ion-color-light-tint)",
				border: "1px dashed var(--ion-color-medium)",
				borderRadius: "8px",
				display: "flex",
				marginLeft: "1em",
				marginBottom: "1em",
				marginRight: "1em",
				minHeight: "200px",
				justifyContent: "center",
				overflow: "hidden",
			}}>
				{ imagePreviewView }
			</div>

			{
				uploading && (
					<div style={{ marginBottom: "1rem" }}>
						<IonLoading />
						<IonLabel color="medium" style={{ textAlign: "center", display: "block", marginTop: "0.25rem" }}>
							Uploading
						</IonLabel>
					</div>
				)
			}

			{
				takingPhoto && (
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "1rem 0" }}>
						<IonSpinner name="crescent" color="primary" />
						<IonLabel color="medium" style={{ marginLeft: "0.5rem" }}>Procesando...</IonLabel>
					</div>
				)
			}

			{
				lastDownloadURL && !uploading && analysisResult && (
					<IonItem lines="none" color="light" style={{ marginTop: "1rem", borderRadius: "8px" }}>
						<IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
						<IonLabel>
							<p>Uploaded successfully</p>
							<IonNote>
								<a href={lastDownloadURL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ion-color-primary)", textDecoration: "underline" }}>
									Ver Foto
								</a>
							</IonNote>
						</IonLabel>
						{
							uploadedFilePath && (
								<IonButton slot="end" fill="clear" color="danger" onClick={deleteImage} disabled={uploading}>
									<IonIcon icon={closeCircleOutline} />
								</IonButton>
							)
						}
					</IonItem>
				)
			}

			<IonAlert
				isOpen={ alertInfo.isOpen }
				header={ alertInfo.header }
				message={ alertInfo.message }
				buttons={ alertInfo.buttons || DEFAULT_BUTTONS }
				onDidDismiss={ () => setAlertInfo({ isOpen: false, message: "" }) }
			/>

			<IonFooter style={{ borderTop: "1px solid var(--ion-color-step-150, #e0e0e0)" }}>
				<IonToolbar>
					{ buttons }
				</IonToolbar>
			</IonFooter>
		</PageWrapper>
	);
};

