import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Flame, Star, AlertCircle } from 'lucide-react';
import BlobCharacter from '../../components/BlobCharacter';

export default function Notifications() {
  const navigate = useNavigate();

  const notifs = [
    { id: 1, title: 'Streak Protected!', desc: 'You almost lost your 7-day streak.', icon: Flame, color: 'bg-[#fed282]', time: '2h ago' },
    { id: 2, title: 'New Badge Unlocked', desc: 'You earned the "First Test" badge.', icon: Trophy, color: 'bg-[#77d6bd]', time: '5h ago' },
    { id: 3, title: 'Weekly Report Ready', desc: 'Your accuracy went up by 5% this week.', icon: Star, color: 'bg-[#b587fb]', time: '1d ago' },
    { id: 4, title: 'Report Resolved', desc: 'The question issue you reported was fixed.', icon: AlertCircle, color: 'bg-gray-200', time: '2d ago' },
  ];

  return (
    <div className="min-h-full bg-gradient-dashboard pb-32 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div>
          <h2 className="text-[26px] font-bold text-black leading-tight">Notifications</h2>
          <p className="text-[14px] text-gray-700 font-medium">Your latest updates</p>
        </div>
      </div>

      <div className="px-6 mt-4 space-y-3 flex-1">
        {notifs.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="bg-white rounded-[20px] p-4 flex items-start gap-4 shadow-soft">
              <div className={`w-12 h-12 rounded-full ${n.color} flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-black/80" />
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-[14px] font-bold text-black leading-tight">{n.title}</h4>
                <p className="text-[13px] text-gray-500 mt-0.5">{n.desc}</p>
                <span className="text-[11px] font-semibold text-gray-400 mt-2 block">{n.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
