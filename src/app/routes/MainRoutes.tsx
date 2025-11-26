import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "../pages/Home";
import TemplatePage from "../pages/TemplatePage";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import PageNotFound from "../layouts/PageNotFound";
import TemplateDetail from "../pages/TemplateDetail";
import Profile from "../pages/Profile";
import SellerRegister from "../pages/SellerRegister";
import SellerProfile from "../pages/SellerProfile/SellerProfile";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Blog from "../pages/Blog/Blog";
import Notification from "../pages/Notification/notification";
import Payment from "../pages/Payment/Payment";
import PaymentSuccess from "../pages/Payment/PaymentSuccess";
import OAuth2Redirect from "../pages/auth/OAuth2Redirect";
import ForgotPassword from "../pages/auth/forgot-password";
import ResetPassword from "../pages/auth/reset-password";
import VerifyEmail from "../pages/auth/verify-email";
import AboutUs from "../pages/AboutUs/AboutUs";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService/TermsOfService";
import MyLibrary from '../pages/Profile/MyLibrary';
import FloatingAssistant from "../components/FloatingAssistant";

// Admin Pages
import UserManagement from "../pages/Admin/UserManagement";
import TemplateManagement from "../pages/Admin/TemplateManagement";
import PayoutManagement from "../pages/Admin/PayoutManagement";
import Advertising from "../pages/Admin/Advertising";
import Suggestions from "../pages/Admin/Suggestions";
import Revenue from "../pages/Admin/Revenue";

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Default route - redirect to login */}
        <Route path="/" element={<Login />} />
        
        {/* Auth routes - no protection */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        
        {/* Admin routes with AdminLayout and protection */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<UserManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="templates" element={<TemplateManagement />} />
          <Route path="payouts" element={<PayoutManagement />} />
          <Route path="advertising" element={<Advertising />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="revenue" element={<Revenue />} />
        </Route>
        
        {/* Public routes with header/footer - NO protection */}
        <Route path="/*" element={
          <>
            <Header />
            <FloatingAssistant />
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/templates" element={<TemplatePage />} />
              <Route path="/templates/:id" element={<TemplateDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              
              {/* Protected user routes */}
              <Route path="/payment/:id" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/payment/success" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <Notification />
                </ProtectedRoute>
              } />
              <Route path="/seller" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <SellerRegister />
                </ProtectedRoute>
              } />
              <Route path="/seller-register" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <SellerRegister />
                </ProtectedRoute>
              } />
              <Route path="/seller-profile" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER', 'ROLE_ADMIN']}>
                  <SellerProfile />
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN']}>
                  <MyLibrary />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
