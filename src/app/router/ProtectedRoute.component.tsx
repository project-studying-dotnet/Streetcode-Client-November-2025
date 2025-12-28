import { observer } from 'mobx-react-lite';
import { Navigate, useLocation } from 'react-router-dom';

import FRONTEND_ROUTES from '@/app/common/constants/frontend-routes.constants';
import useMobx from '@/app/stores/root-store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { userLoginStore } = useMobx();
    const location = useLocation();

    if (!userLoginStore.isUserLoggedIn) {
        // Redirect to login page, saving the attempted URL
        return <Navigate to={FRONTEND_ROUTES.OTHER_PAGES.LOGIN} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default observer(ProtectedRoute);
