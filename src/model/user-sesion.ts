import { AppUser } from "./user";

export class UserSession
{
	readonly user: AppUser | null;

	get loggedIn(): boolean {
		return this.user != null;
	}

	constructor(user: AppUser | null)
	{
		this.user = user;
	}
}

