import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlobCharacter from '../components/BlobCharacter';
import { Bell, Activity, Bookmark, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-full bg-gradient-dashboard pb-28"
    >
      {/* Header */}
      <div className="px-6 pt-16 pb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-bold text-black leading-tight">
            Dear {user?.name.split(' ')[0] || 'Student'},<br />good morning
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/bookmarks')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <Bookmark size={18} className="text-black" />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm relative"
          >
            <Bell size={18} className="text-black" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#ff8a8e] rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Streak & Points Badge */}
        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-5 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <BlobCharacter emotion="balanced" className="w-12 h-12" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Flame size={14} className="text-[#ff8a8e] fill-[#ff8a8e]" />
              </div>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-black">{user?.streak || 0} Day Streak!</p>
              <p className="text-[12px] text-gray-500">You're doing great</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold text-[#fed282]">{user?.totalPoints || 0} pts</p>
            <p className="text-[12px] font-medium text-gray-500">Rank #{user?.rank || '--'}</p>
          </div>
        </div>

        {/* Quick Analytics Card */}
        <div 
          onClick={() => navigate('/analytics')}
          className="bg-[#0E0E0E] rounded-[24px] p-5 shadow-lg flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
        >
          <div>
            <h3 className="text-white text-[15px] font-bold mb-1">Performance Analytics</h3>
            <p className="text-gray-400 text-[12px]">Track your accuracy & progress</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
        </div>

        {/* Action List */}
        <motion.div variants={container} initial="hidden" animate="show">
          <h3 className="text-[16px] font-bold mb-3 px-1">Today's Goals</h3>
          <div className="space-y-3">
            {[
              { title: 'Daily Challenge', sub: '10 Mixed Questions', time: '10 min', color: 'bg-[#fed282]', onClick: () => navigate('/daily') },
              { title: 'Practice Weak Topics', sub: 'Optics & Organic Chem', time: '15 min', color: 'bg-[#ff8a8e]', onClick: () => navigate('/practice/weak-topics') },
              { title: 'Mock Test Mini', sub: 'Full Syllabus', time: '5 min', color: 'bg-[#b587fb]', onClick: () => navigate('/test/active') }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariant}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={item.onClick}
                className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-soft cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                  <BlobCharacter emotion={item.color === 'bg-[#ff8a8e]' ? 'dizzy' : 'happy'} className="w-8 h-8 opacity-90" />
                </div>
                <div className="flex-1 pr-2">
                  <h4 className="text-[14px] font-bold text-black">{item.title}</h4>
                  <p className="text-[12px] text-gray-500">{item.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-gray-400">{item.time}</span>
                  <div className="mt-1 flex justify-end">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                       <path d="m9 18 6-6-6-6"/>
                     </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
