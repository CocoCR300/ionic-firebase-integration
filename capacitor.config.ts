import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'me.cococr300.mobile_dev_test',
	appName: 'Firebase Integration',
	webDir: 'dist',
	server: {
		cleartext: true,
		androidScheme: "http"
	},
	plugins: {
		Camera: {
			permissions: ["camera", "photos"]
		},
		FirebaseAuthentication: {
			skipNativeAuth: false,
			providers: [
				"google.com"
			]
		},
		PushNotifications: {
			presentationOptions: ["badge", "sound", "alert"]
		}
	}
};

export default config;
