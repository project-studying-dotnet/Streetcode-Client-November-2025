import './LoginPage.styles.scss';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, message } from 'antd';

import UserApi from '@/app/api/user/user.api';
import FRONTEND_ROUTES from '@/app/common/constants/frontend-routes.constants';
import useMobx from '@/app/stores/root-store';

const LoginPage = () => {
    const navigate = useNavigate();
    const { userLoginStore } = useMobx();
    const [messageApi, contextHolder] = message.useMessage();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const showSuccessMessage = (text: string) => {
        messageApi.open({
            type: 'success',
            content: text,
            className: 'custom-success-message',
            duration: 3,
        });
    };

    const showErrorMessage = (text: string) => {
        messageApi.open({
            type: 'error',
            content: text,
            duration: 3,
        });
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            showErrorMessage('Будь ласка, заповніть всі поля');
            return;
        }

        setIsLoading(true);
        try {
            const response = await UserApi.login({
                email: formData.email,
                password: formData.password,
            });
            
            userLoginStore.setUserLoginResponce(response, () => {
                userLoginStore.refreshToken();
            });
            
            showSuccessMessage('Ви успішно увійшли в систему.');
            setTimeout(() => navigate(FRONTEND_ROUTES.BASE), 1500);
        } catch (error: any) {
            console.error('Login error:', error);
            showErrorMessage('Невірний email або пароль');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // Implement Google OAuth login here
    };

    const handleForgotPassword = () => {
        console.log('Forgot password clicked');
        // Implement forgot password flow here
    };

    return (
        <div className="loginPage">
            {contextHolder}
            <div className="loginCard">
                <div className="loginHeader">
                    <h1>Вхід</h1>
                    <p>Введіть свої дані для входу</p>
                </div>

                <div className="loginForm">
                    <div className="inputGroup">
                        <label>Електронна адреса</label>
                        <div className="inputWrapper">
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                maxLength={256}
                            />
                            <span className="charCount">{formData.email.length}/256</span>
                        </div>
                    </div>

                    <div className="inputGroup">
                        <label>Пароль</label>
                        <div className="inputWrapper">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="********"
                            />
                            <span 
                                className="passwordToggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </span>
                        </div>
                    </div>

                    <div className="loginOptions">
                        <span className="forgotPassword" onClick={handleForgotPassword}>
                            Забули пароль?
                        </span>
                        <div className="rememberMe">
                            <Checkbox 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Запам'ятати мене</span>
                        </div>
                    </div>

                    <Button 
                        type="primary" 
                        className="submitButton"
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Увійти
                    </Button>

                    <div className="switchMode">
                        Немає облікового запису?{' '}
                        <span onClick={() => navigate(FRONTEND_ROUTES.OTHER_PAGES.SIGNUP)}>
                            Зареєструватися
                        </span>
                    </div>

                    <div className="divider">
                        <div className="line" />
                        <span>або продовжити через</span>
                        <div className="line" />
                    </div>

                    <button type="button" className="googleButton" onClick={handleGoogleLogin}>
                        <svg className="googleIcon" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default observer(LoginPage);
