import Agent from '@api/agent.api';

import { API_ROUTES } from '@/app/common/constants/api-routes.constants';
import {
    LogoutRequest,
    RefreshTokenRequest, RefreshTokenResponce,
    UserLoginRequest, UserLoginResponce,
    UserRegisterRequest,
} from '@/models/user/user.model';

const UserApi = {
    register: (registerData: UserRegisterRequest) => Agent.post<UserLoginResponce>(
        API_ROUTES.USERS.REGISTER,
        registerData,
    ),
    login: (loginParams: UserLoginRequest) => Agent.post<UserLoginResponce>(
        API_ROUTES.USERS.LOGIN,
        loginParams,
    ),
    logout: (logoutData: LogoutRequest) => Agent.post<void>(
        API_ROUTES.USERS.LOGOUT,
        logoutData,
    ),
    refreshToken: (token: RefreshTokenRequest) => Agent.post<RefreshTokenResponce>(
        API_ROUTES.USERS.REFRESH_TOKEN,
        token,
    ),
};

export default UserApi;
