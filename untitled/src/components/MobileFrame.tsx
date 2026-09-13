import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavBar from './BottomNavBar';
import { useAuth } from '../context/AuthContext';

export default function MobileFrame() {
  const { user } = useAuth();
  const location = useLocation();
  const outlet = useOutlet();
  
  // Hides bottom nav bar when inside a specific chat room (e.g. /chat/f1)
  const isDeepChatRoom = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-start sm:items-center justify-center sm:p-8">
      {/* Container - works as full screen on mobile, constrained on desktop */}
      <div className="relative w-full sm:max-w-[400px] h-[100dvh] sm:h-[850px] sm:max-h-full sm:rounded-[40px] sm:shadow-2xl overflow-hidden flex flex-col bg-white">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative bg-white flex flex-col">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.25, ease: 'easeOut' }}
               className="flex-1 flex flex-col min-h-full"
             >
               {outlet}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {user && !isDeepChatRoom && <BottomNavBar />}
      </div>
    </div>
  );
}
