import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileQuestion, LogOut, BookOpen, Settings } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'MCQ Bank', path: '/admin/mcq', icon: FileQuestion },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-[#1A1A1A]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-[#fed282] flex items-center justify-center mr-3">
            <span className="font-bold text-[14px]">A</span>
          </div>
          <h1 className="text-[18px] font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-colors ${
                  isActive 
                    ? 'bg-[#0E0E0E] text-white font-bold' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-black font-semibold'
                }`}
              >
                <Icon size={18} />
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-[16px] text-gray-500 hover:bg-gray-100 hover:text-black transition-colors font-semibold"
          >
            <LogOut size={18} />
            <span className="text-[14px]">Exit to App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#E8EDEE]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-[18px] font-bold capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold bg-[#d8f5da] text-[#2c695a] px-3 py-1.5 rounded-full">
              Super Admin
            </span>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
