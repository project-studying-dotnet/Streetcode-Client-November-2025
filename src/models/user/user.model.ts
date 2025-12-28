export default interface User {
    id:number;
    name:string;
    surname:string;
    email:string;
    userName:string;
    password:string;
    phoneNumber:string;
    role:UserRole;
}

export interface UserRegisterRequest {
    name: string;
    surname: string;
    email: string;
    userName: string;
    password: string;
    phoneNumber: string;
    role: UserRole;
}

export interface UserLoginRequest {
    email:string;
    password:string;
}

export interface UserLoginResponce {
    user:User;
    token:string;
    refreshToken:string;
    expireAt:Date;
}

export interface LogoutRequest {
    refreshToken:string;
}

export interface RefreshTokenRequest {
    token:string;
}

export interface RefreshTokenResponce {
    token:string;
    expireAt:Date;
}

export enum UserRole {
    User = 0,
    MainAdministrator = 1,
    Administrator = 2,
    Moderator = 3,
}
