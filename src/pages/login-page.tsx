import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonPage, useIonLoading } from "@ionic/react";
import { useContext, useState } from "react";
import { firebaseAuthentication, firebasePersistencePromise } from "../services/firebase";
import { AuthError, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut, UserCredential, validatePassword } from "firebase/auth";
import { logInOutline, logoGoogle, logOutOutline } from "ionicons/icons";
import { delay } from "../util/promise";
import { UserSessionContext } from "../components/user-session-provider";
import { FormTextField } from "../components/form-field";

export default function LoginPage()
{
	const userSession = useContext(UserSessionContext);
	const [showLoadingIndicator, dismissLoadingIndicator] = useIonLoading();
	const [validEmailAddress, setValidEmailAddress] = useState(false);
	const [validPassword, setValidPassword] = useState(false);
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");

	const valid = validEmailAddress && validPassword;

	function validateEmailAddress(emailAddress: string): string {
		if (emailAddress == "") {
			return "You must enter your email address";
		}

		const match = emailAddress.match(
			  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		);

		if (match == null) {
			return "Invalid email address";
		}

		return "";
	}

	async function validatePasswordLocal(password: string): Promise<string> {
		if (password == "") {
			return "You must enter your password";
		}

		const status = await validatePassword(firebaseAuthentication, password);
		if (!status.isValid) {
			const requirements = status.passwordPolicy.customStrengthOptions;
			const maxLength = requirements.maxPasswordLength;
			const minLength = requirements.minPasswordLength;

			return `Password must be between ${minLength} and ${maxLength} characters long`;
		}

		return "";
	}

	function emailAddressChanged(emailAddress: string, valid: boolean) {
		setEmailAddress(emailAddress);
		setValidEmailAddress(valid);
	}

	function passwordChanged(password: string, valid: boolean) {
		setPassword(password);
		setValidPassword(valid);
	}

	function startAsync(execute: () => Promise<void>, message: string) {
		showLoadingIndicator({ message });
		execute().then(() => dismissLoadingIndicator()).catch(_ => dismissLoadingIndicator());
	}

	async function logInOrSignUp() {
		if (!valid) {
			return;
		}

		const trimmedEmailAddress = emailAddress.trim();
		const trimmedPassword = password.trim();
		let userCredential: UserCredential;

		try {
			console.log("Performing sign up");
			userCredential = await createUserWithEmailAndPassword(firebaseAuthentication, trimmedEmailAddress, trimmedPassword);
			console.log("Sign up successful");
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
			}
		} catch (error) {
			console.error("Google sign in failed");
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
						<FormTextField changed={emailAddressChanged} label="Email Address" validate={validateEmailAddress} />
						<FormTextField changed={passwordChanged} fieldType="password" label="Password" validate={validatePasswordLocal}>
							<IonInputPasswordToggle slot="end" />
						</FormTextField>

						<IonButton disabled={!valid} expand="block" onClick={_ => startAsync(logInOrSignUp, "Signing in")}>
							<IonIcon icon={logInOutline} slot="start" />
							Log in/Sign up
						</IonButton>
						<IonButton expand="block" onClick={_ => startAsync(signInWithGoogle, "Signing in")}>
							<IonIcon icon={logoGoogle} slot="start" />
							Sign in with Google
						</IonButton>
						{
							userSession.loggedIn &&
								<IonButton expand="block" onClick={_ => startAsync(logOut, "Signing out")}>
									<IonIcon icon={logOutOutline} name="" slot="start" />
									Log out
								</IonButton>
						}
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
}
