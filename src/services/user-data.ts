import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "./firebase";
import { UserRole } from "../model/user-role";

const USER_ROLE_COLLECTION_NAME = "roluser";

export async function fetchUserRoles(userId: string)
{
	let querySnapshot;
	try {
		const userRoleQuery = query(collection(firestore, USER_ROLE_COLLECTION_NAME), where("user_id", "==", userId));
		querySnapshot = await getDocs(userRoleQuery);
	} catch (error: any) {
		console.error("Error fetching user roles");
		console.error(error);
		return [];
	}

	const userRoles: UserRole[] = [];

	for (const document of querySnapshot.docs) {
		const data = document.data();

		userRoles.push({
			documentId: document.id,
			userId: data.user_id,
			roleNames: data.rol,
		});
	}

	return userRoles;
};
