import { IonLabel } from "@ionic/react";
import { useContext } from "react";
import { UserSessionContext } from "../components/user-session-provider";
import { PageWrapper } from "../components/page-wrapper";

export default function UserInfoPage()
{
	const userSession = useContext(UserSessionContext);

	const user = userSession.user!;
	let displayName;
	let rolesDisplay = user.roles.join(", ");
	if (user.name) {
		displayName = user.name;
	}
	else {
		displayName = user.emailAddress?.split("@", 2)[0];
	}

	if (rolesDisplay == "") {
		rolesDisplay = "*Gasp* You don't have any roles! That's so weird...";
	}

	return (
		<PageWrapper title="User info">
			<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
				<div style={{ display: "flex", flexFlow: "column", gap: "1em" }}>
					<IonLabel>
						<h1 style={{ marginBottom: "1em", textAlign: "center" }}>Welcome, {displayName}</h1>
						<h5>Email Address: {user.emailAddress}</h5>
						<h5>Roles: {rolesDisplay}</h5>
					</IonLabel>
				</div>
			</div>
		</PageWrapper>
	);
}
