import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText,
  Megaphone, 
  MessageSquare, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { clearAuthData } from "../../utils/authUtils";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/templates', icon: FileText, label: 'Template Management' },
    { path: '/admin/payouts', icon: DollarSign, label: 'Payout Management' },
    { path: '/admin/advertising', icon: Megaphone, label: 'Advertising' },
    { path: '/admin/suggestions', icon: MessageSquare, label: 'Suggestions' },
    { path: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 fixed h-screen z-30`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">P</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">PandaDocs</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-500">Welcome to PandaDocs admin panel</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg">
                <User size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

