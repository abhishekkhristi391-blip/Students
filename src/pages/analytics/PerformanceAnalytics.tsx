import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, Activity, CheckCircle2, XCircle } from 'lucide-react';
import SegmentedToggle from '../../components/SegmentedToggle';
import SparklineChart from '../../components/charts/SparklineChart';
import MiniBarChart from '../../components/charts/MiniBarChart';
import BlobCharacter from '../../components/BlobCharacter';

export default function PerformanceAnalytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('Week');

  // Mock Data
  const sparklineData = timeRange === 'Week' ? [40, 60, 45, 80, 75, 90, 85] : [60, 65, 70, 72, 85, 88];
  const activityData = timeRange === 'Week' ? [2, 5, 3, 8, 4, 10, 7] : [15, 20, 18, 30, 25, 40];

  return (
    <div className="min-h-full bg-gradient-insights pb-32 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div>
          <h2 className="text-[26px] font-bold text-black leading-tight">Analytics</h2>
          <p className="text-[14px] text-gray-600 font-medium">Your performance overview</p>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-2">
        {/* Toggle */}
        <SegmentedToggle 
          options={['Day', 'Week', 'Month']} 
          activeOption={timeRange} 
          onChange={setTimeRange} 
        />

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-soft">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[13px] font-bold text-gray-500">Accuracy Trend</span>
              <Target size={16} className="text-[#b587fb]" />
            </div>
            <SparklineChart data={sparklineData} color="#b587fb" />
            <div className="mt-3">
              <span className="text-[20px] font-bold text-black">82%</span>
              <span className="text-[11px] font-bold text-[#2c695a] ml-2 bg-[#d8f5da] px-1.5 py-0.5 rounded">↑ 5%</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-4 shadow-soft">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-bold text-gray-500">Questions Done</span>
              <Activity size={16} className="text-[#77d6bd]" />
            </div>
            <MiniBarChart data={activityData} />
            <div className="mt-2">
              <span className="text-[20px] font-bold text-black">350</span>
              <span className="text-[11px] font-semibold text-gray-400 ml-1">total</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-5 shadow-soft">
          <h3 className="text-[15px] font-bold mb-4 text-black">Overall Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d8f5da] flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-[#2c695a]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">Correct Answers</p>
                  <p className="text-[12px] text-gray-500">Solid foundation</p>
                </div>
              </div>
              <span className="text-[16px] font-bold">290</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffe5e6] flex items-center justify-center">
                  <XCircle size={20} className="text-[#802023]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">Incorrect Answers</p>
                  <p className="text-[12px] text-gray-500">Areas to review</p>
                </div>
              </div>
              <span className="text-[16px] font-bold">60</span>
            </div>
          </div>
        </div>

        {/* Subject wise insights CTA */}
        <div 
          onClick={() => navigate('/practice/weak-topics')}
          className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-soft cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-[#ff8a8e] flex items-center justify-center shrink-0">
            <BlobCharacter emotion="dizzy" className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-bold text-black">Focus on Weak Topics</h4>
            <p className="text-[12px] text-gray-500">2 topics need attention</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-full">
            <ChevronLeft size={16} className="text-black rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
