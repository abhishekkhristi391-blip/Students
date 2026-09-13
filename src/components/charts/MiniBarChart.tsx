import React from 'react';

interface MiniBarChartProps {
  data: number[];
  height?: number;
  colors?: string[];
}

export default function MiniBarChart({ 
  data, 
  height = 60,
  colors = ['#ff8a8e', '#fed282', '#77d6bd', '#b587fb']
}: MiniBarChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  
  return (
    <div style={{ height }} className="w-full flex items-end justify-between gap-1 mt-2">
      {data.map((val, i) => {
        const heightPct = Math.max((val / max) * 100, 10); // min 10% height for visibility
        const color = colors[i % colors.length];
        
        return (
          <div 
            key={i} 
            className="flex-1 rounded-t-full rounded-b-full opacity-90 transition-all duration-500"
            style={{ 
              height: `${heightPct}%`, 
              backgroundColor: color 
            }}
          />
        );
      })}
    </div>
  );
}
