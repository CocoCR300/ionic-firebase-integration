import { IonButton, IonLabel } from "@ionic/react";
import { useContext, useState } from "react";
import { UserSessionContext } from "../components/user-session-provider";
import { PageWrapper } from "../components/page-wrapper";
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHintALLOption } from "@capacitor/barcode-scanner";

export default function BarcodeScannerPage()
{
	const [barcodeData, setBarcodeData] = useState("");
	async function enterBarcodeScanner() {
		const scanResult = await CapacitorBarcodeScanner.scanBarcode({
			hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
		});

		setBarcodeData(scanResult.ScanResult)
	}

	let barcodeDataView = null;
	if (barcodeData != "") {
		barcodeDataView = (
			<div>
			<h5>Scanned data</h5>
				<h1 style={{ marginBottom: "1em", textAlign: "center" }}>{ barcodeData }</h1>
			</div>
		);
	}

	return (
		<PageWrapper title="Barcode scanner">
			<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
				<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
					<IonLabel>
						{ barcodeDataView }
					</IonLabel>
					<IonButton onClick={e => enterBarcodeScanner() }>Scan barcode</IonButton>
				</div>
			</div>
		</PageWrapper>
	);
}
