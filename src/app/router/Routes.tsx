import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import FRONTEND_ROUTES from '@constants/frontend-routes.constants';
import ForFansMainPage from '@features/AdminPage/ForFansPage/ForFansMainPage.component';
import App from '@layout/app/App.component';
import StreetcodeContent from '@streetcode/Streetcode.component';

import NotFound from '@/features/AdditionalPages/NotFoundPage/NotFound.component';
import PartnersPage from '@/features/AdditionalPages/PartnersPage/Partners.component';
import AdminPage from '@/features/AdminPage/AdminPage.component';
import Partners from '@/features/AdminPage/PartnersPage/Partners.component';
import TeamPage from '@/features/AdminPage/TeamPage/TeamPage.component';
import StreetcodeCatalog from '@/features/StreetcodeCatalogPage/StreetcodeCatalog.component';
import NewsPage from '@/features/AdditionalPages/NewsPage/News.component';
import ContactUs from '@/features/AdditionalPages/ContactUsPage/ContanctUs.component';
import SupportPage from '@/features/AdditionalPages/SupportUsPage/SupportUs.component';



const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<App />}>
        <Route
            path={`${FRONTEND_ROUTES.ADMIN.BASE}`}
            element={<AdminPage />}
        />
        <Route
            path={`${FRONTEND_ROUTES.ADMIN.BASE}/:id`}
            element={<StreetcodeContent />}
        />       
        <Route
            path={FRONTEND_ROUTES.ADMIN.FOR_FANS}
            element={<ForFansMainPage />}
        />
        <Route
            path={FRONTEND_ROUTES.ADMIN.PARTNERS}
            element={<Partners />}
        />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.CATALOG} element={<StreetcodeCatalog />} />
        <Route
            path={FRONTEND_ROUTES.ADMIN.TEAM}
            element={(
                    <TeamPage />
            )}
        />
        <Route path="*" element={<NotFound />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.PARTNERS} element={<PartnersPage />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.CONTACT_US} element={<ContactUs />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.SUPPORT_US} element={<SupportPage />} /> 
        <Route index path="/:id" element={<StreetcodeContent />} />
        <Route index path={`${FRONTEND_ROUTES.OTHER_PAGES.NEWS}/:id`} element={<NewsPage />} />
    </Route>,
));

export default router;
