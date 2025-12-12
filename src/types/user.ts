export enum UserRole {
	SUPER_ADMIN = "super-admin",
	ADMIN = "admin",
	EDITOR = "editor",
	CONTENT_MANAGER = "content-manager",
}

export interface IUser {
	_id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ILoginRequest {
	email: string;
	password: string;
}

export interface IAuthResponse {
	success: boolean;
	user: IUser;
	token: string;
	refreshToken: string;
}
