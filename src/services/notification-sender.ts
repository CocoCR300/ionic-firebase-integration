const API_URL = import.meta.env.VITE_MESSAGING_API_URL;

export interface ApiResponse
{
	success: boolean;
	message: string;
	error: string;
}

export class NotificationSender
{
	private static _instance: NotificationSender | null;

	static get instance() {
		if (this._instance == null) {
			this._instance = new NotificationSender();
		}

		return this._instance;
	}

	private constructor() { }

	private _fullUrl(endpoint: string): string {
		return `${API_URL}/${endpoint}`;
	}

	private async _sendRequest(endpoint: string, requestBody: any): Promise<ApiResponse> {
		try {
			const response = await fetch(this._fullUrl(endpoint), {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(requestBody)
			});

			return response.json();
		}
		catch (error) {
			return {
				success: false,
				message: "Failed to send request",
				error: JSON.stringify(error)
			};
		}
	}

	async sendToDevice(title: string, content: string, token: string): Promise<ApiResponse> {
		const response = await this._sendRequest("send-notification", {
			token,
			title,
			body: content
		});

		return response;
	}

	async sendToTopic(title: string, content: string, topicId: string): Promise<ApiResponse> {
		const response = await this._sendRequest("send-topic-notification", {
			topic: topicId,
			title,
			body: content
		});

		return response;
	}
}
