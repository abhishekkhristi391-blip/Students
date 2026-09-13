import React from 'react';

interface SegmentedToggleProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
}

export default function SegmentedToggle({ options, activeOption, onChange }: SegmentedToggleProps) {
  return (
    <div className="flex bg-white/50 backdrop-blur-md rounded-full p-1 shadow-inner">
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-[#0E0E0E] text-white shadow-md' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
