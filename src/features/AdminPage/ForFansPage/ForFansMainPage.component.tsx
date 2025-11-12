import AdminBar from '../AdminBar.component';
import './ForFansMainPage.style.scss';

import ForFansPageComponent from '@features/AdminPage/ForFansPage/ForFansPage/ForFansPage.component';

const ForFansMainPage = () => (
    <div className="ForFansPageContainer">
        <AdminBar />
        <div className="MainForFansContainer">
            <ForFansPageComponent />
        </div>
    </div>
);

export default ForFansMainPage;
