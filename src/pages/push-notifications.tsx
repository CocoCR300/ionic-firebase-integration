import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonTitle, useIonLoading } from "@ionic/react";
import { useEffect, useState } from "react";
import { FormTextField } from "../components/form-field";
import { collection, getDocs, query, Timestamp } from "@firebase/firestore";
import { firestore } from "../services/firebase";

interface DeviceToken
{
	token: string;
	updatedAt: Timestamp;
}

export default function PushNotificationsPage()
{
	const [showLoadingIndicator, dismissLoadingIndicator] = useIonLoading();
	const [validContent, setValidContent] = useState(false);
	const [validTitle, setValidTitle] = useState(false);
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");
	const [deviceTokens, setDeviceTokens] = useState<DeviceToken[]>([]);

	const valid = validContent && validTitle;

	useEffect(() => {
		fetchDeviceTokens();
	}, []);

	async function fetchDeviceTokens() {
		let querySnapshot;
		try {
			const deviceTokensQuery = query(collection(firestore, "deviceTokens"));
			querySnapshot = await getDocs(deviceTokensQuery);

			const tokens: any[] = [];

			for (const document of querySnapshot.docs) {
				const data = document.data();

				tokens.push({
					token: data.token,
					updatedAt: data.updatedAt,
				});
			}

			setDeviceTokens(tokens);
		} catch (error: any) {
			console.error("Error fetching tokens", error);
		}
	}

	function validateContent(content: string): string {
		if (content == "") {
			return "You must enter the notification content";
		}

		return "";
	}

	async function validateTitle(title: string): Promise<string> {
		if (title == "") {
			return "You must enter your password";
		}

		return "";
	}

	function contentChanged(content: string, valid: boolean) {
		setContent(content);
		setValidContent(valid);
	}

	function titleChanged(title: string, valid: boolean) {
		setTitle(title);
		setValidTitle(valid);
	}

	function startAsync(execute: () => Promise<void>, message: string) {
		showLoadingIndicator({ message });
		execute().then(() => dismissLoadingIndicator()).catch(_ => dismissLoadingIndicator());
	}

	function sendNotification(token: DeviceToken) {
		console.log(token);
	}

	return (
		<IonPage>
			<IonContent fullscreen>
				<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
					<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
						<IonTitle>Send push notification</IonTitle>

						<FormTextField changed={titleChanged} label="Title" validate={validateTitle} />
						<FormTextField changed={contentChanged} label="Content" validate={validateContent}/>

						<IonList style={{ maxHeight: "50%", overflow: "scroll" }}>
						{
							deviceTokens.map((token, i) => (
								<IonItem key={i}>
									<IonLabel>
										<h2>Device #{ i }</h2>
										<h4>Device token: { token.token }</h4>
										<h4>Updated at: { token.updatedAt.toDate().toString() }</h4>
									</IonLabel>
									<IonButton onClick={_ => sendNotification(token)}>Send</IonButton>
								</IonItem>
							))
						}
						</IonList>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
}
