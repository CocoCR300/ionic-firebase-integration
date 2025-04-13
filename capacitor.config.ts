import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'me.cococr300.mobile_dev_test',
	appName: 'Firebase Integration',
	webDir: 'dist',
	bundledWebRuntime: false,
	plugins: {
		FirebaseAuthentication: {
			skipNativeAuth: false,
			providers: [
				"google.com"
			]
		}
	}
};

export default config;
