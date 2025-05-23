import { useState, useEffect } from "react";
import {
	IonContent,
	IonList,
	IonItem,
	IonToggle,
	IonToast,
} from "@ionic/react";
import { getToken } from "firebase/messaging";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { PushNotifications } from "@capacitor/push-notifications";
import { firestore } from "../services/firebase";
import NotificationService from "../services/notification";
import { Topic, TOPICS } from "../model/topic";
import { PageWrapper } from "../components/page-wrapper";
import { NotificationSender } from "../services/notification-sender";

export default function TopicsPage()
{
	const fcmToken = NotificationService.instance.deviceToken;
	const [topics, setTopics] = useState<Topic[]>(TOPICS);

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	//const [fcmToken, setFcmToken] = useState<string | null>(null);

	useEffect(() => {
		initializePushNotifications();
	}, []);

	async function initializePushNotifications() {
		try {
			const permStatus = await PushNotifications.requestPermissions();

			if (permStatus.receive === "granted") {
				await PushNotifications.register();

				const token = fcmToken;
				// https://github.com/firebase/quickstart-js/issues/334
				//const token = await getToken(firebaseMessaging);
				//setFcmToken(token);

				await loadUserSubscriptions(token);
			}
		} catch (error) {
			console.error("Error initializing push notifications");
			console.error(error);
		}
	};

	async function loadUserSubscriptions(token: string) {
		try {
			const userDoc = await getDoc(doc(firestore, "users", token));

			if (userDoc.exists()) {
				const userData = userDoc.data();
				setTopics(prevTopics =>
					prevTopics.map(topic => ({
						...topic,
						subscribed: userData.topics?.includes(topic.id) || false
					}))
				);
			}
		} catch (error) {
			console.error("Error loading subscriptions:");
			console.error(error);
		}
	};

	async function handleToggle(topicId: string) {
		if (!fcmToken) {
			setToastMessage("Error: No se pudo obtener el token de registro");
			setShowToast(true);
			return;
		}

		try {
			const sender = NotificationSender.instance
			const foundTopic = topics.find(topic => topic.id == topicId);

			if (!foundTopic) {
				return;
			}

			let subscribed = foundTopic.subscribed;
			let action = "subscribe";
			if (subscribed) {
				action = "unsubscribe";
			}
			subscribed = !subscribed;

			const response = await sender.manageTopicSubscription(action, topicId, fcmToken);
			if (!response.success) {
				setToastMessage(`An error occurred while changing subscription to ${foundTopic.name}`);
				setShowToast(true);

				return;
			}

			const updatedTopics = topics.map(topic => {
				if (topic.id === topicId) {
					return { ...topic, subscribed: !topic.subscribed };
				}

				return topic;
			});

			setTopics(updatedTopics);

			await setDoc(doc(firestore, "users", fcmToken), {
				topics: updatedTopics.filter(t => t.subscribed).map(t => t.id),
				token: fcmToken,
				lastUpdated: new Date().toISOString()
			}, { merge: true });

			setToastMessage(`${subscribed ? "Subscribed to" : "Unsubscribed from"} ${foundTopic?.name}`);
			setShowToast(true);

		} catch (error) {
			console.error("Error updating subscription:", error);
			setToastMessage("Error al actualizar la suscripción");
			setShowToast(true);
		}
	};

	return (
		<PageWrapper title="Topics">
			<IonContent>
				<div style={{ margin: "1em" }}>
					<h5>Subscribe to topics</h5>
					<IonList>
						{
							topics.map((topic) => (
								<IonItem key={ topic.id }>
									<IonToggle
										checked={ topic.subscribed }
										onIonChange={ () => handleToggle(topic.id) }>
										{ topic.name }
									</IonToggle>
								</IonItem>
							))
						}
					</IonList>
					<IonToast
						isOpen={showToast}
						onDidDismiss={() => setShowToast(false)}
						message={toastMessage}
						duration={2000}
					/>
				</div>
			</IonContent>
		</PageWrapper>
	);
};

