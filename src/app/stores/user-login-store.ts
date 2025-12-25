import { makeAutoObservable } from 'mobx';
import UserApi from '@api/user/user.api';

import { RefreshTokenResponce, UserLoginResponce } from '@/models/user/user.model';

export default class UserLoginStore {
    private timeoutHandler: NodeJS.Timeout = null;

    private static tokenStorageName = 'token';

    private static refreshTokenStorageName = 'refreshToken';

    private static dateStorageName = 'expireAt';

    public userLoginResponce?: UserLoginResponce;

    public isUserLoggedIn: boolean = false;

    private callback?:()=>void;

    public constructor() {
        makeAutoObservable(this);
        // Check initial login state from localStorage
        const token = UserLoginStore.getToken();
        const expireAt = UserLoginStore.getExpiredDate();
        this.isUserLoggedIn = !!token && expireAt > Date.now();
    }

    private static getExpiredDate():number {
        const expireAt = localStorage.getItem(UserLoginStore.dateStorageName);
        if (!expireAt) return 0;
        return Number(expireAt);
    }

    private static setExpiredDate(date: string):void {
        localStorage.setItem(UserLoginStore.dateStorageName, date);
    }

    public static getToken() {
        return localStorage.getItem(UserLoginStore.tokenStorageName);
    }

    public static setToken(newToken:string) {
        return localStorage.setItem(UserLoginStore.tokenStorageName, newToken);
    }

    public static getRefreshToken() {
        return localStorage.getItem(UserLoginStore.refreshTokenStorageName);
    }

    public static setRefreshToken(refreshToken: string) {
        return localStorage.setItem(UserLoginStore.refreshTokenStorageName, refreshToken);
    }

    private static clearToken() {
        localStorage.removeItem(UserLoginStore.tokenStorageName);
        localStorage.removeItem(UserLoginStore.refreshTokenStorageName);
    }

    public setCallback(func:()=>void) {
        this.callback = func;
    }

    public static get isLoggedIn():boolean {
        return UserLoginStore.getExpiredDate() > new Date(Date.now()).getTime();
    }

    public clearUserData() {
        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
        }
        localStorage.removeItem(UserLoginStore.tokenStorageName);
        localStorage.removeItem(UserLoginStore.refreshTokenStorageName);
        localStorage.removeItem(UserLoginStore.dateStorageName);
        this.userLoginResponce = undefined;
        this.isUserLoggedIn = false;
    }

    public async logout() {
        const refreshToken = UserLoginStore.getRefreshToken();
        if (refreshToken) {
            try {
                await UserApi.logout({ refreshToken });
            } catch (e) {
                console.log('Logout error:', e);
            }
        }
        this.clearUserData();
    }

    public setUserLoginResponce(user:UserLoginResponce, func:()=>void) {
        try {
            // If expireAt is not provided, set a default expiration of 24 hours
            const expireAt = user.expireAt ? new Date(user.expireAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            const timeNumber = expireAt.getTime();
            UserLoginStore.setExpiredDate(timeNumber.toString());
            const expireForSeconds = timeNumber - new Date().getTime();
            this.setCallback(func);
            this.userLoginResponce = user;
            UserLoginStore.setToken(user.token);
            if (user.refreshToken) {
                UserLoginStore.setRefreshToken(user.refreshToken);
            }
            this.isUserLoggedIn = true;
            if (expireForSeconds > 10000) {
                this.timeoutHandler = setTimeout(() => {
                    if (this.callback) {
                        this.callback();
                    }
                }, expireForSeconds - 10000);
            }
        } catch (e) {
            console.log(e);
        }
    }

    public refreshToken = ():Promise<RefreshTokenResponce> => (
        UserApi.refreshToken({ token: UserLoginStore.getToken() ?? '' })
            .then((refreshToken) => {
                const expireForSeconds = (new Date(refreshToken.expireAt)).getTime() - new Date().getTime();
                this.timeoutHandler = setTimeout(() => {
                    if (this.callback) {
                        this.callback();
                    }
                }, expireForSeconds);
                UserLoginStore.setExpiredDate((new Date(refreshToken.expireAt)).getTime().toString());
                UserLoginStore.setToken(refreshToken.token);
                return refreshToken;
            }));
}
