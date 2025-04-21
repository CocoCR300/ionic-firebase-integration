export interface UserRole
{
	documentId: string;
	userId: number;
	roleNames: string[];
}

export enum UserRoleName
{
	Basic = "basic",
	Admin = "admin"
}
