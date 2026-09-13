import { Search, Filter, MoreVertical } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Student', email: 'alice@example.com', class: '12th', points: 1240, status: 'Active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', class: '11th', points: 890, status: 'Active' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@example.com', class: '12th', points: 3450, status: 'Suspended' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', class: '10th', points: 420, status: 'Active' },
];

export default function AdminStudents() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-6">
      {/* Filters Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[20px] shadow-sm">
        <div className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-full w-96">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="bg-transparent border-none outline-none text-[14px] font-medium w-full"
          />
        </div>
        <button className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded-full font-bold text-[14px] hover:bg-gray-200 transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Class</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Points</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map((student) => (
              <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-[14px] font-bold text-black">{student.name}</td>
                <td className="py-4 px-6 text-[14px] font-medium text-gray-500">{student.email}</td>
                <td className="py-4 px-6 text-[14px] font-bold text-black">{student.class}</td>
                <td className="py-4 px-6 text-[14px] font-bold text-[#fed282]">{student.points}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    student.status === 'Active' 
                      ? 'bg-[#d8f5da] text-[#2c695a]' 
                      : 'bg-[#ffe5e6] text-[#802023]'
                  }`}>
                    {student.status}
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
