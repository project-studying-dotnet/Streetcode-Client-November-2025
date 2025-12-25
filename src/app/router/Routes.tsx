import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import FRONTEND_ROUTES from '@constants/frontend-routes.constants';
import ForFansMainPage from '@features/AdminPage/ForFansPage/ForFansMainPage.component';
import App from '@layout/app/App.component';
import StreetcodeContent from '@streetcode/Streetcode.component';

import NotFound from '@/features/AdditionalPages/NotFoundPage/NotFound.component';
import PartnersPage from '@/features/AdditionalPages/PartnersPage/Partners.component';
import LoginPage from '@/features/AdditionalPages/LoginPage/LoginPage.component';
import SignupPage from '@/features/AdditionalPages/SignupPage/SignupPage.component';
import AdminPage from '@/features/AdminPage/AdminPage.component';
import Partners from '@/features/AdminPage/PartnersPage/Partners.component';
import TeamPage from '@/features/AdminPage/TeamPage/TeamPage.component';
import StreetcodeCatalog from '@/features/StreetcodeCatalogPage/StreetcodeCatalog.component';
import NewsPage from '@/features/AdditionalPages/NewsPage/News.component';
import ContactUs from '@/features/AdditionalPages/ContactUsPage/ContanctUs.component';
import SupportPage from '@/features/AdditionalPages/SupportUsPage/SupportUs.component';
import ProtectedRoute from './ProtectedRoute.component';



const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<App />}>
        <Route
            path={`${FRONTEND_ROUTES.ADMIN.BASE}`}
            element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
        />
        <Route
            path={`${FRONTEND_ROUTES.ADMIN.BASE}/:id`}
            element={<ProtectedRoute><StreetcodeContent /></ProtectedRoute>}
        />       
        <Route
            path={FRONTEND_ROUTES.ADMIN.FOR_FANS}
            element={<ProtectedRoute><ForFansMainPage /></ProtectedRoute>}
        />
        <Route
            path={FRONTEND_ROUTES.ADMIN.PARTNERS}
            element={<ProtectedRoute><Partners /></ProtectedRoute>}
        />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.CATALOG} element={<StreetcodeCatalog />} />
        <Route
            path={FRONTEND_ROUTES.ADMIN.TEAM}
            element={(
                    <ProtectedRoute><TeamPage /></ProtectedRoute>
            )}
        />
        <Route path="*" element={<NotFound />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.PARTNERS} element={<PartnersPage />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.CONTACT_US} element={<ContactUs />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.SUPPORT_US} element={<SupportPage />} /> 
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.LOGIN} element={<LoginPage />} />
        <Route path={FRONTEND_ROUTES.OTHER_PAGES.SIGNUP} element={<SignupPage />} /> 
        <Route index path="/:id" element={<StreetcodeContent />} />
        <Route index path={`${FRONTEND_ROUTES.OTHER_PAGES.NEWS}/:id`} element={<NewsPage />} />
    </Route>,
));

export default router;
