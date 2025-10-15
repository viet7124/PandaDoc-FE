import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import TemplatePage from "../pages/TemplatePage";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import PageNotFound from "../layouts/PageNotFound";
import TemplateDetail from "../pages/TemplateDetail";
import Profile from "../pages/Profile";
import SellerRegister from "../pages/SellerRegister";
import SearchPage from "../pages/SearchPage";
import Admin from "../pages/Admin";
export default function MainRoutes() {
   
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes without header/footer */}
        <Route path="/admin/*" element={<Admin />} />
        
        {/* Regular routes with header/footer */}
        <Route path="/*" element={
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/templates" element={<TemplatePage />} />
              <Route path="/templates/:id" element={<TemplateDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/seller" element={<SellerRegister />} />
              <Route path="/seller-register" element={<SellerRegister />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}
