import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuthentication, firebasePersistencePromise } from "../services/firebase";
import { UserSession } from "../model/user-sesion";

export const UserSessionContext = createContext<UserSession>(new UserSession(null));

export function UserSessionProvider({ children }: PropsWithChildren)
{
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		firebasePersistencePromise.then(() => {
			const unsubscribe = onAuthStateChanged(firebaseAuthentication, user => {
				setUser(user);
			});

			return () => unsubscribe();
		});
	}, []);

	const userSession = new UserSession(user);
	return <UserSessionContext.Provider value={ userSession }>{ children }</UserSessionContext.Provider>;
};

