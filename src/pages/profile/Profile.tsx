import { useAuth } from '../../context/AuthContext';
import { Settings, LogOut, Medal, Target, Flame, Activity } from 'lucide-react';
import BlobCharacter from '../../components/BlobCharacter';

export default function Profile() {
  const { user, logout } = useAuth();

  const badges = [
    { id: 'b1', name: 'First Test', icon: Target, earned: true, color: 'text-[#ff8a8e]', bg: 'bg-[#ff8a8e]/20' },
    { id: 'b2', name: '7 Day Streak', icon: Flame, earned: true, color: 'text-[#fed282]', bg: 'bg-[#fed282]/20' },
    { id: 'b3', name: 'Top 100', icon: Medal, earned: false, color: 'text-gray-400', bg: 'bg-gray-100' },
    { id: 'b4', name: '100 Questions', icon: Activity, earned: true, color: 'text-[#77d6bd]', bg: 'bg-[#77d6bd]/20' },
  ];

  return (
    <div className="min-h-full bg-[#E8EDEE] pb-32 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-mood px-6 pt-16 pb-8 rounded-b-[40px] shadow-sm relative">
        <div className="absolute top-16 right-6 flex gap-3">
          <button className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-black">
            <Settings size={20} />
          </button>
          <button 
            onClick={logout}
            className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-[#802023]"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mt-4">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md mb-3">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
               {/* Mock Avatar with Blob */}
               <BlobCharacter emotion="happy" className="w-16 h-16 translate-y-2" />
            </div>
          </div>
          <h2 className="text-[22px] font-bold text-black">{user?.name}</h2>
          <p className="text-[14px] text-gray-700 font-medium">{user?.class} • {user?.board}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
           <div className="bg-white/80 backdrop-blur-sm rounded-[16px] py-3 flex flex-col items-center shadow-soft">
             <span className="text-[18px] font-bold text-black">{user?.totalPoints}</span>
             <span className="text-[11px] font-bold text-gray-500">Points</span>
           </div>
           <div className="bg-white/80 backdrop-blur-sm rounded-[16px] py-3 flex flex-col items-center shadow-soft">
             <span className="text-[18px] font-bold text-black">#{user?.rank}</span>
             <span className="text-[11px] font-bold text-gray-500">Rank</span>
           </div>
           <div className="bg-white/80 backdrop-blur-sm rounded-[16px] py-3 flex flex-col items-center shadow-soft">
             <span className="text-[18px] font-bold text-black">{user?.streak}</span>
             <span className="text-[11px] font-bold text-gray-500">Streak</span>
           </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Admin Link for testing */}
        <button 
          onClick={() => window.open('/admin', '_blank')}
          className="w-full bg-[#0E0E0E] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <Settings size={18} /> Open Admin Panel
        </button>

        {/* Achievements Grid */}
        <div>
          <h3 className="text-[16px] font-bold text-black mb-4 px-1">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map(badge => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className={`bg-white rounded-[20px] p-4 flex flex-col items-center text-center shadow-soft ${badge.earned ? '' : 'opacity-60 grayscale'}`}
                >
                  <div className={`w-14 h-14 rounded-full ${badge.bg} flex items-center justify-center mb-3`}>
                     {badge.earned && badge.id === 'b1' ? (
                       <BlobCharacter emotion="balanced" className="w-8 h-8" />
                     ) : (
                       <Icon size={24} className={badge.color} />
                     )}
                  </div>
                  <h4 className="text-[13px] font-bold text-black leading-tight">{badge.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">{badge.earned ? 'Earned' : 'Locked'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
