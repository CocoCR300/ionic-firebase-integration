import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonItem, IonLabel, IonLoading, IonPage, useIonLoading } from "@ionic/react";
import { useEffect, useState } from "react";
import { firebaseAuthentication, firebasePersistencePromise } from "../services/firebase";
import { AuthError, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential } from "firebase/auth";
import { useHistory } from "react-router";
import { logInOutline, logoGoogle, logOutOutline } from "ionicons/icons";
import { delay } from "../util/promise";

export default function LoginPage()
{
	const history = useHistory();
	const [present, dismiss] = useIonLoading();
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [asyncOperation, setAsyncOperation] = useState<Promise<void> | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (asyncOperation) {
			setLoading(true);
			asyncOperation.then(() => setLoading(false)).catch(_ => setLoading(false));
		}
	}, [asyncOperation]);

	useEffect(() => {
		if (loading) {
			present({
				spinner: "circular",
				message: "Cargando"
			});
		}
		else {
			dismiss();
		}
	}, [loading])

	async function logInOrSignUp() {
		const trimmedEmailAddress = emailAddress.trim();
		const trimmedPassword = password.trim();
		let userCredential: UserCredential;

		try {
			console.log("Performing sign up");
			userCredential = await createUserWithEmailAndPassword(firebaseAuthentication, trimmedEmailAddress, trimmedPassword);
		} catch (error) {
			const authError = error as AuthError;
			switch (authError.code) {
				case 'auth/email-already-in-use':
					console.log(`Email address ${trimmedEmailAddress} already in use. Performing login instead`);
					userCredential = await signInWithEmailAndPassword(firebaseAuthentication, trimmedEmailAddress, trimmedPassword);
					console.log("Login succesful");
					break;
				case 'auth/invalid-email':
					console.error(`Email address ${trimmedEmailAddress} is invalid`);
					break;
				case 'auth/operation-not-allowed':
					console.error(`Error during sign up`);
					break;
				case 'auth/weak-password':
					console.error('Password is not strong enough. Add additional characters including special characters and numbers');
					break;
				default:
					console.error(authError.message);
					break;
			}
		}

	}

	async function signInWithGoogle() {
		try {
			const result = await FirebaseAuthentication.signInWithGoogle();
			if (result && result.credential) {
				await firebasePersistencePromise;
				const credentials = GoogleAuthProvider.credential(result.credential.idToken);

				await signInWithCredential(firebaseAuthentication, credentials);
				history.replace("/");
			}
		} catch (error) {
			console.error("Sign in process has failed");
			console.error(error);
		}
	}

	async function logOut() {
		console.log("Performing log out");
		try {
			await delay(2000);

			await signOut(firebaseAuthentication);
			await FirebaseAuthentication.signOut();
			console.log("Log out successful");
		} catch (error) {
			console.error("An error occurred while performing log out");
			console.error(error);
		}
	}

	return (
		<IonPage>
			<IonContent fullscreen>
				<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
					<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
						<IonInput fill="outline" label="Email Address" labelPlacement="floating" onIonChange={e => setEmailAddress(e.detail.value!)} required type="email" value={emailAddress} />
						<IonInput fill="outline" label="Password" labelPlacement="floating" onIonChange={e => setPassword(e.detail.value!)} required type="password" value={password}>
							<IonInputPasswordToggle slot="end" />
						</IonInput>

						<IonButton expand="block" onClick={_ => setAsyncOperation(logInOrSignUp)}>
							<IonIcon icon={logInOutline} slot="start" />
							Log in/Sign up
						</IonButton>
						<IonButton expand="block" onClick={_ => setAsyncOperation(signInWithGoogle)}>
							<IonIcon icon={logoGoogle} slot="start" />
							Sign in with Google
						</IonButton>
						<IonButton expand="block" onClick={_ => setAsyncOperation(logOut)}>
							<IonIcon icon={logOutOutline} name="" slot="start" />
							Log out
						</IonButton>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
}
