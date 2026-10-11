import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/loading";

const TodayPage = lazy(() => import("./pages/today/index.jsx"));
const MattersPage = lazy(() => import("./pages/matters/index.jsx"));
const MatterFilePage = lazy(() => import("./pages/matterFile/index.jsx"));
const CalendarPage = lazy(() => import("./pages/calendar/index.jsx"));
const BillingPage = lazy(() => import("./pages/billing/index.jsx"));
const ClientsPage = lazy(() => import("./pages/clients/index.jsx"));
const NotFoundPage = lazy(() => import("./pages/notFound/index.jsx"));

const AppRoutes = (props) => {
    const location = useLocation();

    return (
        <Suspense fallback={<Loading />} key={location.pathname}>
            <Routes location={location}>
                <Route path="/" element={<TodayPage {...props} />} />
                <Route path="/matters" element={<MattersPage {...props} />} />
                <Route path="/matters/:matterId" element={<MatterFilePage {...props} />} />
                <Route path="/calendar" element={<CalendarPage {...props} />} />
                <Route path="/billing" element={<BillingPage {...props} />} />
                <Route path="/clients" element={<ClientsPage {...props} />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
