import React, { useContext, useEffect, useState } from "react";
import { IonIcon, IonBadge, IonPopover, IonList, IonItem, IonLabel, IonButton } from "@ionic/react";
import { checkmarkDone, trash, notificationsOutline, checkmark } from "ionicons/icons";
import NotificationService from "../../services/notification";
import { firebaseAuthentication, firebasePersistencePromise } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import "./notification-popup.css";
import { UserSessionContext } from "../user-session-provider";

export default function NotificationsPopup()
{
	const userSession = useContext(UserSessionContext);
	const notificationService = NotificationService.instance;

	const [unreadCount, setUnreadCount] = useState(0);
	const [showPopover, setShowPopover] = useState(false);
	const [popoverEvent, setPopoverEvent] = useState<any>(null);
	const [notifications, setNotifications] = useState<any[]>([]);

	useEffect(() => {
		setUpNotifications();
	}, []);

	async function setUpNotifications() {
		await firebasePersistencePromise;

		const user = userSession.user!;
		notificationService.initialize(user.id);
		
		const removeListener = notificationService.addListener(() => {
			setUnreadCount(notificationService.unreadCount);
			setNotifications(notificationService.notifications);
		});

		setUnreadCount(notificationService.unreadCount);
		setNotifications(notificationService.notifications);

		return () => {
			removeListener();
		};
	}

	function notificationMarkAsReadButton(notification: any) {
		if (notification.read) {
			return undefined;
		}

		return (
			<IonButton fill="clear" size="small" onClick={() => handleMarkAsRead(notification.id)}>
				<IonIcon slot="icon-only" icon={checkmark} />
			</IonButton>
		);
	}

	function presentPopover(e: React.MouseEvent) {
		e.persist();
		setPopoverEvent(e.nativeEvent);
		setShowPopover(true);
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	function handleMarkAsRead(id: string) {
		notificationService.markAsRead(id);
	}

	function handleDeleteNotification(id: string) {
		notificationService.deleteNotification(id);
	}

	function handleMarkAllAsRead() {
		notificationService.markAllAsRead();
	}

	let unreadCountBadge = undefined;
	let markAllAsReadButton = undefined;
	if (unreadCount > 0) {
		unreadCountBadge = (
			<IonBadge color="danger" className="notification-badge">
				{unreadCount}
			</IonBadge>
		);
		markAllAsReadButton = (
			<IonButton fill="clear" size="small" onClick={handleMarkAllAsRead}>
				<IonIcon slot="icon-only" icon={checkmarkDone} />
			</IonButton>
		);
	}

	let notificationsView = undefined;
	if (notifications.length == 0) {
		notificationsView = (
			<IonItem lines="none">
				<IonLabel className="ion-text-center">You don't have notifications</IonLabel>
			</IonItem>
		);
	}
	else {
		notificationsView = (
			notifications.map((notification) => (
				<IonItem key={notification.id} className={notification.read ? "notification-read" : "notification-unread"}>
					<div className="notification-item">
						<h2>{notification.title}</h2>
						<p>{notification.body}</p>
						<small>{formatDate(notification.date)}</small>

						<div className="notification-actions">
							{ notificationMarkAsReadButton(notification) }

							<IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteNotification(notification.id)}>
								<IonIcon slot="icon-only" icon={trash} />
							</IonButton>
						</div>
					</div>
				</IonItem>
			))
		);
	}

	return (
		<div>
			<div className="notification-icon-container" onClick={presentPopover}>
				<IonIcon icon={notificationsOutline} size="large" style={{ verticalAlign: "middle" }} />
				{ unreadCountBadge }
			</div>

			<IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={() => setShowPopover(false)} className="notifications-popover">
				<div className="notifications-header">
					<h4>Notifications</h4>
					{ markAllAsReadButton }
				</div>

				<IonList className="notifications-list">
					{ notificationsView }
				</IonList>
			</IonPopover>
		</div>
	);
};

