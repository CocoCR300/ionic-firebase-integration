import { IonButtons, IonContent, IonHeader, IonLabel, IonMenuButton, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { UserSessionContext } from "../components/user-session-provider";
import { fetchUserRoles } from "../services/user-data";
import { UserRole } from "../model/user-role";

export default function UserInfoPage()
{
	const userSession = useContext(UserSessionContext);
	const [userRoles, setUserRoles] = useState<UserRole[]>([]);

	const user = userSession.user!;
	let displayName;
	let rolesDisplay = userRoles.map(role => role.name).join(", ");
	if (user.displayName) {
		displayName = user.displayName;
	}
	else {
		displayName = user.email?.split("@", 2)[0];
	}

	if (rolesDisplay == "") {
		rolesDisplay = "*Gasp* You don't have any roles! That's so weird...";
	}

	async function getUserRoles() {
		const userRoles = await fetchUserRoles(user.uid);
		setUserRoles(userRoles);
	}

	useEffect(() => {
		getUserRoles();
	}, []);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>
					<IonTitle>User info</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
					<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
						<IonLabel>
							<h1 style={{ marginBottom: "1em", textAlign: "center" }}>Welcome, {displayName}</h1>
							<h5>Email Address: {user.email}</h5>
							<h5>Roles: { rolesDisplay }</h5>
						</IonLabel>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
}
