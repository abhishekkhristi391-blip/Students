import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Lock, CircleHelp, Info, Trash2, Moon, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains('dark-theme')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const handleAction = (title: string) => {
    setShowModal(title);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-full bg-[#f8f9fa] pb-24 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm z-10 sticky top-0 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={() => navigate('/profile')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h2 className="text-[20px] font-bold text-black leading-tight">Settings</h2>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* Account Section */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Account</h3>
          <div className="bg-white rounded-[20px] shadow-soft overflow-hidden">
            <button onClick={() => handleAction('Language')} className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Globe size={20} />
                </div>
                <span className="font-semibold text-[15px]">Language</span>
              </div>
              <span className="text-gray-400 text-sm font-medium">English</span>
            </button>
            <button onClick={() => handleAction('Privacy & Security')} className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Lock size={20} />
                </div>
                <span className="font-semibold text-[15px]">Privacy & Security</span>
              </div>
              <ChevronLeft size={20} className="text-gray-300 rotate-180" />
            </button>
            <button onClick={() => handleAction('Notifications')} className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bell size={20} />
                </div>
                <span className="font-semibold text-[15px]">Notifications</span>
              </div>
              <ChevronLeft size={20} className="text-gray-300 rotate-180" />
            </button>
          </div>
        </div>

        {/* App Settings */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Display & Appearance</h3>
          <div className="bg-white rounded-[20px] shadow-soft overflow-hidden">
            <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Moon size={20} />
                </div>
                <span className="font-semibold text-[15px]">Dark Mode</span>
              </div>
              {/* Interactive Toggle */}
              <div className={`w-12 h-7 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#77d6bd]' : 'bg-gray-200'}`}>
                 <motion.div 
                   layout
                   initial={false}
                   animate={{ x: isDarkMode ? 20 : 0 }}
                   className="w-5 h-5 bg-white rounded-full absolute top-1 left-1 shadow-sm"
                 ></motion.div>
              </div>
            </button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Support</h3>
          <div className="bg-white rounded-[20px] shadow-soft overflow-hidden">
            <button onClick={() => handleAction('Help Center')} className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CircleHelp size={20} />
                </div>
                <span className="font-semibold text-[15px]">Help Center</span>
              </div>
              <ChevronLeft size={20} className="text-gray-300 rotate-180" />
            </button>
            <button onClick={() => handleAction('About App')} className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Info size={20} />
                </div>
                <span className="font-semibold text-[15px]">About App</span>
              </div>
              <ChevronLeft size={20} className="text-gray-300 rotate-180" />
            </button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="pt-2 space-y-4">
          <button 
            onClick={logout}
            className="w-full bg-white text-[#802023] py-4 rounded-[20px] font-bold shadow-soft active:scale-95 transition-transform"
          >
            Log Out
          </button>
          <button onClick={() => handleAction('Delete Account')} className="w-full flex items-center justify-center gap-2 text-red-500 font-semibold py-2">
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

      {/* Basic Settings Modal for Interactions */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <h3 className="text-[20px] font-bold mb-2">{showModal}</h3>
              <p className="text-gray-500 text-[14px] mb-6">
                {showModal === 'Delete Account' 
                  ? 'Are you sure you want to permanently delete your account and all data?'
                  : `You can configure your ${showModal} preferences here.`}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(null)}
                  className="flex-1 bg-gray-100 text-black py-3 rounded-full font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowModal(null)}
                  className={`flex-1 text-white py-3 rounded-full font-bold active:scale-95 transition-transform ${showModal === 'Delete Account' ? 'bg-red-500' : 'bg-black'}`}
                >
                  {showModal === 'Delete Account' ? 'Delete' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
