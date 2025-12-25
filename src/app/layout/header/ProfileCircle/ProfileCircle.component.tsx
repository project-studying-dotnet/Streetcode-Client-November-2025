import './ProfileCircle.styles.scss';

import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import FRONTEND_ROUTES from '@constants/frontend-routes.constants';
import useMobx from '@stores/root-store';

const ProfileCircle = () => {
    const navigate = useNavigate();
    const { userLoginStore } = useMobx();

    const handleLogout = async () => {
        await userLoginStore.logout();
        navigate(FRONTEND_ROUTES.BASE);
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Вийти',
            onClick: handleLogout,
        },
    ];

    if (!userLoginStore.isUserLoggedIn) {
        return (
            <button
                type="button"
                className="loginButton"
                onClick={() => navigate(FRONTEND_ROUTES.OTHER_PAGES.LOGIN)}
            >
                Вхід
            </button>
        );
    }

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <div className="profileCircle">
                <UserOutlined className="profileIcon" />
            </div>
        </Dropdown>
    );
};

export default observer(ProfileCircle);
