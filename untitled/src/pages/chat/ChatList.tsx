import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock friends data
const FRIENDS = [
  { id: 'f1', name: 'Rahul Kumar', initial: 'R', color: 'bg-[#fed282]', lastMessage: 'Sahi hai! Aur koi doubt ho toh bata dena.', time: '10:03 AM', unread: 2, online: true },
  { id: 'f2', name: 'Simran Singh', initial: 'S', color: 'bg-[#77d6bd]', lastMessage: 'Chemistry ka test kaisa gaya?', time: 'Yesterday', unread: 0, online: true },
  { id: 'f3', name: 'Aakash Verma', initial: 'A', color: 'bg-[#ff8a8e]', lastMessage: 'Bhai maths me problem aa rahi hai', time: 'Yesterday', unread: 0, online: false },
  { id: 'f4', name: 'Priya Patel', initial: 'P', color: 'bg-[#b587fb]', lastMessage: 'Mock test result aa gaya', time: 'Monday', unread: 0, online: false },
];

export default function ChatList() {
  const navigate = useNavigate();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-full bg-[#f8f9fa] pb-24 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-16 pb-4 bg-white shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-bold text-black">Messages</h2>
          <button 
            onClick={() => setShowAddFriend(true)}
            className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <UserPlus size={18} className="text-black" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-3 rounded-[16px]">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-black placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Instagram-style Online Friends */}
        <div className="px-6 py-5 bg-white border-b border-gray-100">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">Active Now</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {FRIENDS.filter(f => f.online).map(friend => (
              <div 
                key={friend.id} 
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                onClick={() => navigate(`/chat/${friend.id}`)}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${friend.color} flex items-center justify-center border-[3px] border-white shadow-md`}>
                    <span className="font-bold text-xl text-black/80">{friend.initial}</span>
                  </div>
                  <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-[#2c695a] border-2 border-white shadow-sm"></span>
                </div>
                <span className="text-[12px] font-semibold text-gray-700">{friend.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats List */}
        <div className="px-4 py-4 space-y-2">
          {FRIENDS.map(friend => (
            <motion.div 
              key={friend.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/chat/${friend.id}`)}
              className="flex items-center gap-4 p-3 bg-white rounded-[20px] shadow-soft cursor-pointer"
            >
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-full ${friend.color} flex items-center justify-center`}>
                  <span className="font-bold text-lg text-black/80">{friend.initial}</span>
                </div>
                {friend.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#77d6bd] border-2 border-white"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[15px] font-bold text-black truncate pr-2">{friend.name}</h4>
                  <span className={`text-[12px] whitespace-nowrap ${friend.unread > 0 ? 'text-[#b587fb] font-bold' : 'text-gray-400 font-medium'}`}>
                    {friend.time}
                  </span>
                </div>
                <p className={`text-[13px] truncate ${friend.unread > 0 ? 'text-black font-semibold' : 'text-gray-500'}`}>
                  {friend.lastMessage}
                </p>
              </div>

              {friend.unread > 0 && (
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#b587fb] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {friend.unread}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-bold">Add Friend</h3>
                <button onClick={() => setShowAddFriend(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-gray-500 block mb-2">Search by Username</label>
                  <div className="flex items-center gap-2 bg-[#f8f9fa] px-4 py-3 rounded-[16px] border border-gray-200">
                    <span className="text-gray-400 font-bold">@</span>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="username"
                      className="bg-transparent border-none outline-none text-[14px] font-medium w-full text-black"
                    />
                  </div>
                </div>
                
                <button className="w-full bg-black text-white py-4 rounded-full font-bold shadow-md active:scale-95 transition-transform">
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
