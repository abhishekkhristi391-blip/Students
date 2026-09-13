import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SegmentedToggle from '../../components/SegmentedToggle';
import BlobCharacter from '../../components/BlobCharacter';

// Mock Leaderboard Data
const mockLeaderboard = [
  { rank: 1, name: 'Sarah Jenkins', points: 3450, isCurrentUser: false, avatarColor: 'bg-[#ff8a8e]' },
  { rank: 2, name: 'Michael Chen', points: 3210, isCurrentUser: false, avatarColor: 'bg-[#77d6bd]' },
  { rank: 3, name: 'David Kumar', points: 3100, isCurrentUser: false, avatarColor: 'bg-[#fed282]' },
  { rank: 4, name: 'Emily Davis', points: 2950, isCurrentUser: false, avatarColor: 'bg-[#b587fb]' },
  { rank: 5, name: 'James Wilson', points: 2800, isCurrentUser: false, avatarColor: 'bg-[#ff8a8e]' },
  { rank: 6, name: 'Alice Student', points: 1240, isCurrentUser: true, avatarColor: 'bg-black' },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('Weekly');

  const currentUser = mockLeaderboard.find(u => u.isCurrentUser);

  return (
    <div className="min-h-full bg-gradient-insights pb-28 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-4">
        <h2 className="text-[26px] font-bold text-black leading-tight">Leaderboard</h2>
        <p className="text-[14px] text-gray-700 font-medium mb-4">See how you rank globally</p>
        
        <SegmentedToggle 
          options={['Daily', 'Weekly', 'Monthly', 'Overall']} 
          activeOption={period} 
          onChange={setPeriod} 
        />
      </div>

      {/* Top 3 Podium (Optional extra visual flair for top ranks) */}
      <div className="px-6 py-6 flex justify-center items-end gap-3 h-[180px]">
        {/* Rank 2 */}
        <div className="flex flex-col items-center">
           <div className={`w-12 h-12 rounded-full ${mockLeaderboard[1].avatarColor} flex items-center justify-center border-4 border-white z-10 -mb-3`}>
             <span className="text-white font-bold text-[14px]">M</span>
           </div>
           <div className="bg-white/80 w-20 h-24 rounded-t-[16px] flex flex-col items-center justify-end pb-3 shadow-soft">
             <span className="font-bold text-[18px]">2</span>
           </div>
        </div>
        {/* Rank 1 */}
        <div className="flex flex-col items-center">
           <div className={`w-16 h-16 rounded-full ${mockLeaderboard[0].avatarColor} flex items-center justify-center border-4 border-[#fed282] z-10 -mb-4 shadow-lg`}>
             <BlobCharacter emotion="happy" className="w-10 h-10" />
           </div>
           <div className="bg-white w-24 h-32 rounded-t-[16px] flex flex-col items-center justify-end pb-4 shadow-md">
             <span className="font-bold text-[24px]">1</span>
           </div>
        </div>
        {/* Rank 3 */}
        <div className="flex flex-col items-center">
           <div className={`w-12 h-12 rounded-full ${mockLeaderboard[2].avatarColor} flex items-center justify-center border-4 border-white z-10 -mb-3`}>
             <span className="text-white font-bold text-[14px]">D</span>
           </div>
           <div className="bg-white/60 w-20 h-20 rounded-t-[16px] flex flex-col items-center justify-end pb-3 shadow-soft">
             <span className="font-bold text-[18px]">3</span>
           </div>
        </div>
      </div>

      {/* List */}
      <div className="px-6 flex-1 flex flex-col gap-3 pb-24 relative">
        <div className="bg-white rounded-[24px] p-2 shadow-soft flex flex-col gap-1">
          {mockLeaderboard.map((u) => (
            <div 
              key={u.rank} 
              className={`flex items-center justify-between p-3 rounded-[16px] ${u.isCurrentUser ? 'bg-[#0E0E0E] text-white shadow-md' : 'bg-transparent text-black'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-[14px] ${u.isCurrentUser ? 'text-white' : 'text-gray-400'}`}>
                  {u.rank}
                </span>
                <div className={`w-10 h-10 rounded-full ${u.avatarColor} flex items-center justify-center shrink-0`}>
                  {u.rank === 1 ? (
                    <BlobCharacter emotion="happy" className="w-6 h-6" />
                  ) : (
                    <span className="text-white font-bold text-[12px]">{u.name.charAt(0)}</span>
                  )}
                </div>
                <span className="font-bold text-[14px]">{u.isCurrentUser ? 'You' : u.name}</span>
              </div>
              <span className={`font-bold text-[14px] ${u.isCurrentUser ? 'text-[#fed282]' : 'text-black'}`}>
                {u.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pinned Current User (If outside top visible range - just showing pattern here) */}
      <div className="absolute bottom-24 inset-x-6 z-20">
        <div className="bg-[#0E0E0E] text-white rounded-[20px] p-4 flex items-center justify-between shadow-2xl border border-gray-800">
           <div className="flex items-center gap-3">
             <span className="w-6 text-center font-bold text-[14px] text-white">{currentUser?.rank || user?.rank}</span>
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[12px]">You</span>
             </div>
             <span className="font-bold text-[14px]">You</span>
           </div>
           <span className="font-bold text-[14px] text-[#fed282]">{currentUser?.points || user?.totalPoints}</span>
        </div>
      </div>
    </div>
  );
}
