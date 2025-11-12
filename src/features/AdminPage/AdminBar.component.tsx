import FRONTEND_ROUTES from '@/app/common/constants/frontend-routes.constants';
import './AdminBar.styles.scss';
import { Link } from 'react-router-dom';

const AdminBar = () => (
    <div className="adminBar">
        <Link className="Link" to={FRONTEND_ROUTES.ADMIN.FOR_FANS}>Для фанів</Link>
        <Link className="Link" to={FRONTEND_ROUTES.ADMIN.PARTNERS}>Партнери</Link>
        <Link className="Link" to={FRONTEND_ROUTES.ADMIN.TEAM}>Команда</Link>
    </div>   
);

export default AdminBar;
