import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import { useAuth } from '../context/AuthContext';

export default function MobileFrame() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#E8EDEE] flex items-center justify-center p-4 sm:p-8">
      {/* iPhone-style frame */}
      <div className="relative w-full max-w-[400px] h-[850px] max-h-full bg-[#fde9c8] rounded-[55px] shadow-2xl overflow-hidden flex flex-col border-[8px] border-black">
        {/* Dynamic Island */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
          <div className="w-[120px] h-7 bg-black rounded-b-3xl"></div>
        </div>

        {/* Status Bar (mock) */}
        <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-8 text-sm font-semibold z-40 pointer-events-none text-black">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Cellular */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M1 11h2V7H1v4zm4 0h2V5H5v6zm4 0h2V3H9v8zm4-10v10h2V1h-2z" />
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3.5 1.5a3.5 3.5 0 017 0h2a5.5 5.5 0 00-11 0h2zm-3.5 0a7.5 7.5 0 0114 0h2a9.5 9.5 0 00-18 0h2z" />
            </svg>
            {/* Battery */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor">
              <rect x="1" y="2" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="3" y="4" width="14" height="4" rx="1" />
              <path d="M20 5h1a1 1 0 011 1v0a1 1 0 01-1 1h-1V5z" />
            </svg>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative pb-24 bg-white">
           <Outlet />
        </div>

        {/* Bottom Navigation */}
        {user && <BottomNavBar />}
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-[130px] h-[5px] bg-black/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
