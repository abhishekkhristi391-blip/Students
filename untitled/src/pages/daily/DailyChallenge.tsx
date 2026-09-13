import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Target } from 'lucide-react';
import DateBadgeRow from '../../components/DateBadgeRow';
import BlobCharacter from '../../components/BlobCharacter';

export default function DailyChallenge() {
  const navigate = useNavigate();

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
          <h2 className="text-[26px] font-bold text-black leading-tight">Daily Practice</h2>
          <p className="text-[14px] text-gray-700 font-medium">Keep your streak alive</p>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-6 mt-4">
        {/* Streak Calendar Strip */}
        <div className="bg-white rounded-[24px] p-5 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-black">This Week</h3>
            <div className="flex items-center gap-1 bg-[#fed282]/30 px-2 py-1 rounded-full">
              <Flame size={14} className="text-[#8c6a23] fill-[#8c6a23]" />
              <span className="text-[12px] font-bold text-[#8c6a23]">7 Days</span>
            </div>
          </div>
          <DateBadgeRow />
        </div>

        {/* Daily Target Progress */}
        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-soft flex flex-col items-center text-center">
          <BlobCharacter emotion="happy" className="w-24 h-24 mb-4 drop-shadow-sm" />
          <h3 className="text-[18px] font-bold text-black mb-1">Today's Target</h3>
          <p className="text-[14px] text-gray-500 mb-6">Complete 10 mixed questions</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden relative">
            <div className="bg-[#77d6bd] h-full rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
          </div>
          <div className="w-full flex justify-between text-[12px] font-bold text-gray-400 mb-6">
            <span>4 completed</span>
            <span>10 total</span>
          </div>

          <div className="w-full flex gap-3">
            <div className="flex-1 bg-[#fed282]/20 p-3 rounded-[16px]">
              <Target size={18} className="text-[#8c6a23] mx-auto mb-1" />
              <p className="text-[12px] font-bold text-[#8c6a23]">+100 pts</p>
            </div>
            <div className="flex-1 bg-[#b587fb]/20 p-3 rounded-[16px]">
              <Flame size={18} className="text-[#41246b] mx-auto mb-1" />
              <p className="text-[12px] font-bold text-[#41246b]">Streak +1</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button 
          onClick={() => navigate('/test/active')} // Route to TestEngine for practice
          className="w-full bg-black text-white py-4 rounded-full font-bold shadow-lg mt-auto"
        >
          Resume Practice
        </button>
      </div>
    </div>
  );
}
