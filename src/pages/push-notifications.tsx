import { IonButton, IonContent, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonTitle, useIonLoading, useIonToast, useIonViewDidEnter } from "@ionic/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FormTextField } from "../components/form-field";
import { collection, getDocs, query, Timestamp } from "@firebase/firestore";
import { firestore } from "../services/firebase";
import { Topic, TOPICS } from "../model/topic";
import { ApiResponse, NotificationSender } from "../services/notification-sender";
import { PageWrapper } from "../components/page-wrapper";

interface DeviceToken
{
	token: string;
	updatedAt: Timestamp;
}

export default function PushNotificationsPage()
{
	const sender = NotificationSender.instance;

	const defaultInput = useRef<HTMLIonInputElement>(null);
	const [showLoadingIndicator, dismissLoadingIndicator] = useIonLoading();
	const [showToast, _] = useIonToast();
	const [validContent, setValidContent] = useState(false);
	const [validTitle, setValidTitle] = useState(false);
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");
	const [deviceTokens, setDeviceTokens] = useState<DeviceToken[]>([]);
	const [itemType, setItemType] = useState("devices");

	const valid = validContent && validTitle;

	useIonViewDidEnter(() => {
		if (defaultInput.current != null) {
			defaultInput.current.focus();
		}
	});

	useEffect(() => {
		startAsync(getDeviceTokens, "Cargando");
		//getDeviceTokens();
	}, []);

	async function getDeviceTokens() {
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
			return "You must enter the notification title";
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

	async function startAsync(execute: () => Promise<void>, message: string) {
		showLoadingIndicator({ message });
		try {
			await execute();
		} finally {
			dismissLoadingIndicator();
		}
	}

	async function sendNotification(item: DeviceToken | Topic) {
		if (!valid) {
			return;
		}

		let response: ApiResponse;

		if ((item as DeviceToken).token) {
			console.log("Sending notification to specific device");

			const token = item as DeviceToken;
			response = await sender.sendToDevice(title, content, token.token);
		}
		else {
			const topic = item as Topic;
			console.log(`Sending notification to devices subscribed to: ${topic.name}`);

			response = await sender.sendToTopic(title, content, topic.id);
		}

		if (response.success) {
			showToast({ duration: 3000, message: "Notification sent successfully" });
		}
		else {
			showToast({ duration: 5000, message: "Failed to send notification" });
		}
	}

	let items: any[];
	let itemMapper: (item: any, i: number) => ReactNode;
	if (itemType == "devices") {
		items = deviceTokens;
		itemMapper = (token: DeviceToken, i: number) => (
			<IonLabel style={{ marginRight: "1em", wordBreak: "break-word" }}>
				<h2>Device #{ i }</h2>
				<h4>Device token: { token.token }</h4>
				<h4>Updated at: { token.updatedAt.toDate().toString() }</h4>
			</IonLabel>
		);
	}
	else {
		items = TOPICS;
		itemMapper = (topic: Topic, _: number) => (
			<IonLabel style={{ marginRight: "1em", wordBreak: "break-word" }}>
				<h2>{ topic.name }</h2>
			</IonLabel>
		);
	}

	return (
		<PageWrapper title="Push notifications">
			<IonContent fullscreen scrollY={false}>
				<div style={{ display: "flex", flexFlow: "column", height: "100%", padding: "1em" }}>
					<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
						<h5>Send push notification</h5>

						<FormTextField ref={defaultInput} changed={titleChanged} label="Title" validate={validateTitle} />
						<FormTextField changed={contentChanged} label="Content" validate={validateContent}/>

						<IonSegment value={itemType} onIonChange={e => setItemType(e.target.value as string)}>
							<IonSegmentButton value="devices">
								<IonLabel>Devices</IonLabel>
							</IonSegmentButton>
							<IonSegmentButton value="topics">
								<IonLabel>Topics</IonLabel>
							</IonSegmentButton>
					  	</IonSegment>
					</div>

					<IonList style={{ flex: 1, overflowY: "scroll" }}>
					{
						items.map((item, i) => (
							<IonItem key={i}>
							{ itemMapper(item, i) }
							<IonButton onClick={_ => sendNotification(item)} size="default">Send</IonButton>
							</IonItem>
						))
					}
					</IonList>
				</div>
			</IonContent>
		</PageWrapper>
	);
}
