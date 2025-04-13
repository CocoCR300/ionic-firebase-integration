import { User } from "@firebase/auth";

export class UserSession
{
	readonly user: User | null;

	get loggedIn(): boolean {
		return this.user != null;
	}

	constructor(user: User | null)
	{
		this.user = user;
	}
}

