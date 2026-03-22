import {
  FileText,
  Globe,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../services/AuthService.js';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: FileText, label: 'Doctors', path: '/admin/doctors' },
  { icon: Globe, label: 'Payment', path: '/admin/payment' },
  { icon: MessageCircle, label: 'Clinic & Specialty', path: '/admin/clinics' },
  { icon: Handshake, label: 'Appointment', path: '/admin/appointments' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Dù API lỗi vẫn xóa local và redirect
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">

      {/* ── Logo ──────────────────────────────────────── */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-lg">🍊</span>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">
            MEDICAL<span className="text-orange-500">-</span>BOOKING
          </span>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400
                       focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}   // "/" chỉ match chính xác
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User ──────────────────────────────────────── */}
      <div className="border-t border-gray-100 p-3 mt-auto">
        {/* Profile row */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gustavo"
            alt="Gustavo Xavier"
            className="w-9 h-9 rounded-full border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">Gustavo Xavier</p>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>

        {/* Settings */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                           text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Settings size={18} className="text-gray-400" />
          Settings
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;