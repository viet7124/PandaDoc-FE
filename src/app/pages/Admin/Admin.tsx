import { type JSX } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import TemplateManagement from './TemplateManagement';
import Revenue from './Revenue';
import Advertising from './Advertising';
import Suggestions from './Suggestions';

const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
  switch (pathname) {
    case '/admin':
      return { title: 'Dashboard', subtitle: 'Tổng quan hoạt động và số liệu chính của website' };
    case '/admin/users':
      return { title: 'Quản lí người dùng', subtitle: 'Xem, chỉnh sửa thông tin người dùng' };
    case '/admin/suggestions':
      return { title: 'Tiếp nhận đề xuất', subtitle: 'Duyệt và phản hồi các đề xuất từ người dùng' };
    case '/admin/templates':
      return { title: 'Quản lí template', subtitle: 'Các template hiện có trên trang web' };
    case '/admin/revenue':
      return { title: 'Doanh thu', subtitle: 'Theo dõi thu nhập và hiệu suất sinh doanh của website' };
    case '/admin/advertising':
      return { title: 'Quản lí quảng cáo', subtitle: 'Thiết lập quảng cáo hiển thị trên website' };
    case '/admin/settings':
      return { title: 'Cài đặt hệ thống', subtitle: 'Tùy chỉnh thiết lập và cấu hình hệ thống' };
    default:
      return { title: 'Admin Panel' };
  }
};

export default function Admin(): JSX.Element {
  const location = useLocation();
  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title={title} subtitle={subtitle} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/templates" element={<TemplateManagement />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/advertising" element={<Advertising />} />
        </Routes>
      </div>
    </div>
  );
}
