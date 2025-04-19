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
		console.error("Error fetching user roles: ", error);
		return [];
	}

	const userRoles: UserRole[] = [];

	for (const document of querySnapshot.docs) {
		const data = document.data();

		userRoles.push({
			document_id: document.id,
			role_id: data.user_id,
			name: data.role_name,
		});
	}

	return userRoles;
};
