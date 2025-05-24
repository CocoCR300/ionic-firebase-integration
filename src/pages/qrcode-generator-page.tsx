import { IonButton, IonIcon, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { PageWrapper } from "../components/page-wrapper";
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHintALLOption } from "@capacitor/barcode-scanner";
import { QRCodeSVG } from "qrcode.react";
import { UserSessionContext } from "../components/user-session-provider";
import { checkmarkCircleOutline, closeCircle, closeCircleOutline } from "ionicons/icons";

const intervals = [
  { label: '20 segundos',	value: 20000 },
  { label: '1 minuto',		value: 60000 },
  { label: '5 minutos',		value: 300000 },
  { label: '15 minutos',	value: 900000 },
  { label: '25 minutos',	value: 1500000 },
];

export default function QrCodeGeneratorPage()
{
	const userSession = useContext(UserSessionContext);
	const [generatedQrCodeData, setGeneratedQrCodeData] = useState("");
	const [scannedQrCodeData, setScannedQrCodeData] = useState<any>();
	const [selectedInterval, setSelectedInterval] = useState(intervals[0].value);
	const [validScannedQrCode, setValidScannedQrCode] = useState(false);

	useEffect(() => {
		generateQrCode();
	}, [selectedInterval]);

	function generateQrCode() {
		if (!userSession.loggedIn) {
			console.error("User is not logged in?");
			return;
		}

		console.log("Generating new QR code");

		const now = new Date();
		const expiry = new Date(now.getTime() + selectedInterval);
		const qrCodeData = {
			userId: userSession.user!.id,
			emailAddress: userSession.user!.emailAddress,
			creationDate: now.toISOString(),
			expiryDate: expiry.toISOString()
		};


		const qrCodeDataString = JSON.stringify(qrCodeData);
		console.log("QR code data: ", qrCodeDataString);
		setGeneratedQrCodeData(qrCodeDataString);
	}

	async function enterQrCodeScanner() {
		const scanResult = await CapacitorBarcodeScanner.scanBarcode({
			hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
		});

		if (!scanResult) {
			return;
		}

		try {
			const data = JSON.parse(scanResult.ScanResult);
			setScannedQrCodeData(data)
			setValidScannedQrCode(data.userId && data.emailAddress && data.creationDate && data.expiryDate);
		}
		catch (err) {
			setValidScannedQrCode(false);
			console.log("QR code does not contain JSON");
			console.error(err);
		}
	}

	let scannedQrCodeDataView = null;
	if (scannedQrCodeData) {
		if (validScannedQrCode) {
			let displayName = "Anonymous (We don't know)";
			if (scannedQrCodeData.emailAddress) {
				const emailAddress = scannedQrCodeData.emailAddress;
				const index = emailAddress.indexOf("@");

				if (index > 0) {
					displayName = emailAddress.substring(0, index);
				}
			}

			let creationDateString = "Created centuries ago (We don't know)";
			if (scannedQrCodeData.creationDate) {
				const date = new Date(scannedQrCodeData.creationDate);
				creationDateString = `Created at: ${date.toLocaleString()}`;
			}

			let icon;
			let color;
			let expiryDateString = "We have no idea when this expired";
			if (scannedQrCodeData.expiryDate) {
				const now = Date.now();
				const date = new Date(scannedQrCodeData.expiryDate);

				if (now < date.getTime()) {
					color = "success";
					icon = checkmarkCircleOutline;
					expiryDateString = `Expires at: ${date.toLocaleString()}`;
				}
				else {
					color = "danger";
					icon = closeCircleOutline;
					expiryDateString = `Expired at: ${date.toLocaleString()}`;
				}
			}

			scannedQrCodeDataView = (
				<div>
					<h2 style={{ marginBottom: "1em", textAlign: "center" }}>Scanned data</h2>
					<h5 style={{ marginBottom: "1em", textAlign: "center" }}>Created by: { displayName }</h5>
					<h5 style={{ marginBottom: "1em", textAlign: "center" }}>{ creationDateString }</h5>
					<IonLabel color={color}>
						<IonIcon icon={icon} style={{ verticalAlign: "sub" }}/>
						<h5 style={{ display: "inline" , marginLeft: "0.5em", textAlign: "center" }}>{ expiryDateString }</h5>
					</IonLabel>
				</div>
			);
		}
		else {
			scannedQrCodeDataView = (
				<div>
					<h2 style={{ textAlign: "center" }}>Scanned data</h2>
					<IonLabel color="danger">
						<IonIcon icon={closeCircleOutline} style={{ verticalAlign: "sub" }}/>
						<h5 style={{ marginLeft: "0.5em", textAlign: "center" }}>QR code is not valid</h5>
					</IonLabel>
				</div>
			);
		}
	}

	return (
		<PageWrapper title="QR code generator">
			<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
				<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
					<IonSelect	defaultValue={intervals[0].value} label="QR code validity"
								labelPlacement="stacked" onIonChange={ event => setSelectedInterval(event.detail.value) }
								value={selectedInterval}>
						{
							intervals.map(interval => (
								<IonSelectOption value={interval.value}>{ interval.label }</IonSelectOption>
							))
						}
					</IonSelect>
					<QRCodeSVG size={192} style={{ alignSelf: "center" }} value={generatedQrCodeData}/>
					<IonButton onClick={e => enterQrCodeScanner() }>Scan QR code</IonButton>
					<IonLabel>
						{ scannedQrCodeDataView }
					</IonLabel>
				</div>
			</div>
		</PageWrapper>
	);
}
