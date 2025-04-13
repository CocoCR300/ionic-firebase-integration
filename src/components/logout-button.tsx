import { IonButton, IonIcon, useIonLoading } from "@ionic/react";
import { logOutSharp } from "ionicons/icons";
import { delay } from "../util/promise";
import { signOut } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { firebaseAuthentication } from "../services/firebase";

export function LogOutButton()
{
	const [show, dismiss] = useIonLoading();

	async function logOut() {
		console.log("Performing log out");
		show({ message: "Signing out", spinner: "circular" });

		try {
			await delay(2000);

			await signOut(firebaseAuthentication);
			await FirebaseAuthentication.signOut();
			console.log("Log out successful");
		} catch (error) {
			console.error("An error occurred while performing log out");
			console.error(error);
		}

		dismiss();
	}
	return (
		<IonButton expand="block" onClick={logOut}>
			<IonIcon icon={logOutSharp}/>
			Log out
		</IonButton>
	);
}
