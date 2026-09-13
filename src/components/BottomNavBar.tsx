import { Home, FileText, BarChart2, MessageCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'home', icon: Home, path: '/' },
    { id: 'practice', icon: FileText, path: '/practice' },
    { id: 'leaderboard', icon: BarChart2, path: '/leaderboard' },
    { id: 'chat', icon: MessageCircle, path: '/chat' },
    { id: 'profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="absolute bottom-8 inset-x-6 z-40 flex justify-center">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 px-6 py-4 flex items-center justify-between w-full max-w-[320px]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative p-2 rounded-full transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#B5B5B5] hover:text-black'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#0E0E0E] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
