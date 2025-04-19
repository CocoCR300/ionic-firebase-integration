import { useState, useEffect } from "react";
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonList,
	IonItem,
	IonLabel,
	IonToggle,
	IonToast,
    IonButtons,
    IonMenuButton,
} from "@ionic/react";
import { getToken } from "firebase/messaging";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { PushNotifications } from "@capacitor/push-notifications";
import { firestore, firebaseMessaging } from "../../services/firebase";
import NotificationsPopup from "./notification-popup";
import NotificationService from "../../services/notification";

interface Topic
{
	id: string;
	name: string;
	subscribed: boolean;
}

export default function TopicSubscription()
{
	const fcmToken = NotificationService.instance.deviceToken;
	const [topics, setTopics] = useState<Topic[]>([
		{ id: "sports", name: "Deportes", subscribed: false },
		{ id: "challenges", name: "Nuevos Retos", subscribed: false },
	]);

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

			const topic = updatedTopics.find(t => t.id === topicId);
			setToastMessage(`${topic?.subscribed ? "Suscrito a" : "Desuscrito de"} ${topic?.name}`);
			setShowToast(true);

		} catch (error) {
			console.error("Error updating subscription:", error);
			setToastMessage("Error al actualizar la suscripción");
			setShowToast(true);
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>

					<IonTitle>Topic subscriptions</IonTitle>

					<IonButtons slot="end">
						<NotificationsPopup />
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					{topics.map((topic) => (
						<IonItem key={topic.id}>
							<IonLabel>{topic.name}</IonLabel>
							<IonToggle
								checked={topic.subscribed}
								onIonChange={() => handleToggle(topic.id)}
							/>
						</IonItem>
					))}
				</IonList>
				<IonToast
					isOpen={showToast}
					onDidDismiss={() => setShowToast(false)}
					message={toastMessage}
					duration={2000}
				/>
			</IonContent>
		</IonPage>
	);
};

