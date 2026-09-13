import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { QUESTIONS } from '../../data/mockData';

export default function AdminMCQ() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-[18px] font-bold text-black">Question Bank</h3>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full font-bold text-[14px] shadow-sm hover:shadow-md transition-all text-black border border-gray-200">
            Bulk Upload CSV
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full font-bold text-[14px] shadow-md hover:scale-105 transition-transform">
            <Plus size={18} /> Add Question
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[20px] shadow-sm">
        <div className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-full w-96">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            className="bg-transparent border-none outline-none text-[14px] font-medium w-full"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-full font-bold text-[13px] hover:bg-gray-200 transition-colors">
            Subject: All
          </button>
          <button className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-full font-bold text-[13px] hover:bg-gray-200 transition-colors">
            <Filter size={16} /> More
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-1/2">Question</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Subject / Topic</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <p className="text-[14px] font-semibold text-black line-clamp-2">{q.text}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-[13px] font-bold text-black">Physics</p>
                  <p className="text-[12px] font-medium text-gray-400">Optics</p>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#e4ddfb] text-[#41246b]">
                    Medium
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#d8f5da] text-[#2c695a]">
                    Published
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-black transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
