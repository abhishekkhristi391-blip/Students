import React from 'react';

export default function DateBadgeRow() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = [12, 13, 14, 15, 16, 17, 18];
  // Alternating brand colors as per design spec
  const colors = ['bg-[#ff8a8e]', 'bg-[#fed282]', 'bg-[#77d6bd]', 'bg-[#b587fb]', 'bg-[#ff8a8e]', 'bg-[#fed282]', 'bg-[#77d6bd]'];
  const activeIdx = 4; // Mock today as Friday (index 4)

  return (
    <div className="flex justify-between items-center w-full px-2">
      {days.map((day, idx) => {
        const isActive = idx === activeIdx;
        const isPast = idx <= activeIdx;
        const bgClass = isPast ? colors[idx] : 'bg-white/50 border border-gray-200';
        const textClass = isPast ? 'text-black' : 'text-gray-400';

        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className={`text-[11px] font-bold ${isActive ? 'text-black' : 'text-gray-500'}`}>{day}</span>
            <div 
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[14px] transition-all shadow-sm
                ${bgClass} ${textClass} 
                ${isActive ? 'ring-2 ring-black ring-offset-2 scale-110 shadow-md' : 'opacity-90'}
              `}
            >
              {dates[idx]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
