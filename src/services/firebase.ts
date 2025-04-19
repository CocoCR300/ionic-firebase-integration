import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfiguration = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
	//measurementId: import.meta.env.VITE_MEASUREMENT_ID || ""
};

export const firebaseApp = initializeApp(firebaseConfiguration);
export const firebaseAuthentication = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const firebasePersistencePromise = setupPersistence();
export const firebaseMessaging = getMessaging(firebaseApp);

export async function savePushToken(token: string, uid: string)
{
	try {
		await setDoc(doc(firestore, "deviceTokens", uid), {
			token,
			updatedAt: new Date(),
		});
	} catch (error) {
		alert("Error al guardar token: " + error);
	}
};

async function setupPersistence()
{
	try {
		const persistence = await setPersistence(firebaseAuthentication, browserLocalPersistence);
		console.log("Persistence set up correctly");

		return persistence;
	} catch (error) {
		console.error("Failed to set up persistence");
	}
}


