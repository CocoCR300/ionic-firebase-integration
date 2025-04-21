export interface AppUser
{
	id: string;
	emailAddress: string | null;
	name: string | null;
	roles: string[];
}
