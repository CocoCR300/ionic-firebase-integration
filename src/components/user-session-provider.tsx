import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { firebaseAuthentication, firebasePersistencePromise } from "../services/firebase";
import { UserSession } from "../model/user-sesion";
import { fetchUserRoles } from "../services/user-data";
import { UserRole } from "../model/user-role";
import { AppUser } from "../model/user";

export const UserSessionContext = createContext<UserSession>(new UserSession(null));

export function UserSessionProvider({ children }: PropsWithChildren)
{
	const [user, setUser] = useState<AppUser | null>(null);
	const userSession = new UserSession(user);

	useEffect(() => {
		firebasePersistencePromise.then(() => {
			const unsubscribe = onAuthStateChanged(firebaseAuthentication, user => {
				setUserData(user);
			});

			return () => unsubscribe();
		});
	}, []);

	async function setUserData(newUser: User | null) {
		let user: AppUser | null = null;
		let userRoles: UserRole[] = [];
		if (newUser != null) {
			userRoles = await fetchUserRoles(newUser.uid);
			user = {
				id: newUser.uid,
				emailAddress: newUser.email,
				name: newUser.displayName,
				roles: userRoles.flatMap(role => role.roleNames)
			};
		}

		setUser(user);
	}

	return <UserSessionContext.Provider value={ userSession }>{ children }</UserSessionContext.Provider>;
};

