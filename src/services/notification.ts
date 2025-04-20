import { PushNotifications, PushNotificationSchema } from "@capacitor/push-notifications";

import { savePushToken } from "../services/firebase";

export interface AppNotification
{
	id: string;
	title: string;
	body: string;
	data: string;
	read: boolean;
}

export default class NotificationService
{
	private static _instance: NotificationService;

	private _deviceToken: string;
	private listeners: Function[] = [];
	private _notifications: AppNotification[] = [];

	static get instance(): NotificationService {
		if (!NotificationService._instance) {
			NotificationService._instance = new NotificationService();
		}
		return NotificationService._instance;
	}

	get deviceToken() { return this._deviceToken; }

	get notifications(): AppNotification[] {
		return this._notifications;
	}

	get unreadCount(): number {
		return this._notifications.filter(n => !n.read).length;
	}

	private constructor() {
		// Constructor privado para Singleton
		this._deviceToken = "";
	}

	// Inicializar el servicio de notificaciones
	async initialize(uid: string) {
		await this.initializeNative(uid);

		this._loadSavedNotifications();
	}

	// Inicializar para dispositivos nativos
	private async initializeNative(uid: string) {
		try {
			// Solicitar permiso para notificaciones push
			const result = await PushNotifications.requestPermissions();

			if (result.receive === "granted") {
				// Registrar para recibir notificaciones push
				await PushNotifications.register();

				// Escuchar por eventos de notificaciones push
				PushNotifications.addListener("registration", (token) => {
					console.log("Successfully registered to push notifications");
					this._deviceToken = token.value;
					savePushToken(token.value, uid);
				});

				PushNotifications.addListener("pushNotificationReceived", (notification) => {
					console.log("Notificación recibida");
					console.log(JSON.stringify(notification));
					this._addNotification(notification);
				});

				PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
					console.log("Acción realizada en notificación:", notification);
					this._addNotification(notification.notification);
					this._notifyListeners();
				});
			}
		} catch (error) {
			alert("Error al inicializar notificaciones nativas:");
		}
	}

	private _addNotification(receivedNotification: PushNotificationSchema) {
		if (this._notifications.some(notification => notification.id == receivedNotification.id)) {
			return;
		}
		const newNotification = {
			id: receivedNotification.id,
			title: receivedNotification.title || "Sin título",
			body: receivedNotification.body || "",
			data: receivedNotification.data || {},
			read: false,
			date: new Date().toISOString()
		};

		this._notifications = [newNotification, ...this._notifications];
		this._saveNotifications();
		this._notifyListeners();
	}

	private _saveNotifications() {
		localStorage.setItem("notifications", JSON.stringify(this._notifications));
	}

	private _loadSavedNotifications() {
		const saved = localStorage.getItem("notifications");
		if (saved) {
			try {
				this._notifications = JSON.parse(saved);
			} catch (e) {
				this._notifications = [];
			}
		}
	}

	private _notifyListeners() {
		this.listeners.forEach(listener => listener());
	}

	markAsRead(id: string) {
		this._notifications = this._notifications.map(n =>
			n.id === id ? { ...n, read: true } : n
		);
		this._saveNotifications();
		this._notifyListeners();
	}

	markAllAsRead() {
		this._notifications = this._notifications.map(n => ({ ...n, read: true }));
		this._saveNotifications();
		this._notifyListeners();
	}

	deleteNotification(id: string) {
		this._notifications = this._notifications.filter(n => n.id !== id);
		this._saveNotifications();
		this._notifyListeners();
	}

	addListener(listener: Function) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter(l => l !== listener);
		};
	}
}

