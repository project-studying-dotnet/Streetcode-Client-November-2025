import './SignupPage.styles.scss';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, message } from 'antd';

import UserApi from '@/app/api/user/user.api';
import FRONTEND_ROUTES from '@/app/common/constants/frontend-routes.constants';
import { UserRole } from '@/models/user/user.model';

const SignupPage = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToPolicy, setAgreeToPolicy] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [passwordStrength, setPasswordStrength] = useState({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (field === 'password') {
            setPasswordStrength({
                hasLength: value.length >= 8 && value.length <= 20,
                hasUppercase: /[A-Z]/.test(value),
                hasLowercase: /[a-z]/.test(value),
                hasNumber: /[0-9]/.test(value),
                hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            });
        }
    };

    const getPasswordStrengthBars = () => {
        const strength = Object.values(passwordStrength).filter(Boolean).length;
        return strength;
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

    const validateForm = (): boolean => {
        if (!formData.name || !formData.surname || !formData.email || !formData.password) {
            showErrorMessage('Будь ласка, заповніть всі обов\'язкові поля');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            showErrorMessage('Паролі не співпадають');
            return false;
        }
        if (!Object.values(passwordStrength).every(Boolean)) {
            showErrorMessage('Пароль не відповідає вимогам безпеки');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await UserApi.register({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                userName: formData.email, // Using email as username
                password: formData.password,
                phoneNumber: '', // Optional, can add field later
                role: UserRole.User,
            });
            
            showSuccessMessage('Ваш акаунт успішно створено.');
            setTimeout(() => navigate(FRONTEND_ROUTES.OTHER_PAGES.LOGIN), 1500);
        } catch (error: any) {
            console.error('Registration error:', error);
            showErrorMessage('Помилка реєстрації. Можливо, цей email вже використовується.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signupPage">
            {contextHolder}
            <div className="signupCard">
                <div className="signupHeader">
                    <h1>Реєстрація</h1>
                    <p>Створіть свій обліковий запис</p>
                </div>

                <div className="signupForm">
                    <div className="inputGroup">
                        <label>Ім'я</label>
                        <div className="inputWrapper">
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                maxLength={50}
                            />
                            <span className="charCount">{formData.name.length}/50</span>
                        </div>
                    </div>

                    <div className="inputGroup">
                        <label>Прізвище</label>
                        <div className="inputWrapper">
                            <Input
                                value={formData.surname}
                                onChange={(e) => handleInputChange('surname', e.target.value)}
                                maxLength={50}
                            />
                            <span className="charCount">{formData.surname.length}/50</span>
                        </div>
                    </div>

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
                        <div className="passwordHint">
                            Від 8 до 20 символів, велика і мала літера, цифра, спеціальний символ.
                        </div>
                        <div className="strengthBars">
                            {[1, 2, 3, 4, 5].map((bar) => (
                                <div 
                                    key={bar} 
                                    className={`bar ${getPasswordStrengthBars() >= bar ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="inputGroup">
                        <label>Підтвердження паролю</label>
                        <div className="inputWrapper">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="********"
                            />
                            <span 
                                className="passwordToggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </span>
                        </div>
                    </div>

                    <div className="policyCheckbox">
                        <Checkbox 
                            checked={agreeToPolicy}
                            onChange={(e) => setAgreeToPolicy(e.target.checked)}
                        />
                        <span>
                            Я погоджуюсь з{' '}
                            <Link to={FRONTEND_ROUTES.OTHER_PAGES.PRIVACY_POLICY}>
                                Політикою конфеденсійності
                            </Link>
                        </span>
                    </div>

                    <Button 
                        type="primary" 
                        className="submitButton"
                        onClick={handleSubmit}
                        disabled={!agreeToPolicy || isLoading}
                        loading={isLoading}
                    >
                        Зареєструватись
                    </Button>

                    <div className="switchMode">
                        У мене вже є акаунт.{' '}
                        <span onClick={() => navigate(FRONTEND_ROUTES.OTHER_PAGES.LOGIN)}>Увійти</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default observer(SignupPage);
