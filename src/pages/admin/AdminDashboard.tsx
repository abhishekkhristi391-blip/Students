import { Users, FileQuestion, Target, Activity } from 'lucide-react';
import SparklineChart from '../../components/charts/SparklineChart';
import MiniBarChart from '../../components/charts/MiniBarChart';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Students', value: '1,248', icon: Users, color: 'text-[#77d6bd]', bg: 'bg-[#d8f5da]' },
    { title: 'Active Tests', value: '42', icon: Target, color: 'text-[#fed282]', bg: 'bg-[#fed282]/20' },
    { title: 'Question Bank', value: '3,850', icon: FileQuestion, color: 'text-[#b587fb]', bg: 'bg-[#e4ddfb]' },
    { title: 'Avg Accuracy', value: '68%', icon: Activity, color: 'text-[#ff8a8e]', bg: 'bg-[#ffe5e6]' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-[24px] font-bold text-black">{stat.value}</p>
              <p className="text-[13px] font-semibold text-gray-500 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Student Activity (Weekly)</h3>
          <MiniBarChart data={[40, 60, 45, 80, 75, 90, 85]} height={120} />
        </div>
        {/* Chart 2 */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm">
          <h3 className="text-[16px] font-bold text-black mb-6">Average Score Trends</h3>
          <div className="mt-8">
             <SparklineChart data={[55, 58, 62, 60, 65, 68, 70]} color="#b587fb" height={80} width={400} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm">
        <h3 className="text-[16px] font-bold text-black mb-4">Recent Reports & Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-[16px]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#ff8a8e]"></span>
              <p className="text-[14px] font-semibold text-black">Question Q-842 reported for wrong answer</p>
            </div>
            <button className="text-[12px] font-bold text-[#b587fb]">Review</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-[16px]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#fed282]"></span>
              <p className="text-[14px] font-semibold text-black">Suspicious points velocity detected for User#492</p>
            </div>
            <button className="text-[12px] font-bold text-[#b587fb]">Investigate</button>
          </div>
        </div>
      </div>
    </div>
  );
}
