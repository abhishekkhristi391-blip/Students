import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Simple mock mapping to get user details based on ID
const MOCK_USERS: Record<string, any> = {
  f1: { name: 'Rahul Kumar', initial: 'R', color: 'bg-[#fed282]', online: true },
  f2: { name: 'Simran Singh', initial: 'S', color: 'bg-[#77d6bd]', online: true },
  f3: { name: 'Aakash Verma', initial: 'A', color: 'bg-[#ff8a8e]', online: false },
  f4: { name: 'Priya Patel', initial: 'P', color: 'bg-[#b587fb]', online: false },
};

export default function ChatRoom() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = MOCK_USERS[userId || 'f1'] || MOCK_USERS['f1'];

  const [messages, setMessages] = useState([
    { id: '1', text: 'Bhai physics ke optics wale chapter ke notes hain kya?', sender: 'peer', time: '10:00 AM' },
    { id: '2', text: 'Haan, main thodi der me bhejta hu.', sender: 'user', time: '10:02 AM' },
    { id: '3', text: 'Thanks bhai, kal test hai uska.', sender: 'peer', time: '10:03 AM' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Mock peer reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sahi hai! Aur koi doubt ho toh bata dena.",
        sender: 'peer',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-full bg-[#f8f9fa] pb-24 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm z-10 sticky top-0 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={() => navigate('/chat')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center shadow-sm relative`}>
            <span className="font-bold text-lg text-black/80">{user.initial}</span>
            {user.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#77d6bd] border-2 border-white"></span>
            )}
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-black leading-tight">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${user.online ? 'bg-[#77d6bd]' : 'bg-gray-300'}`}></span>
              <p className="text-[12px] text-gray-500 font-medium">{user.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isPeer = msg.sender === 'peer';
          return (
            <div key={msg.id} className={`flex ${isPeer ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-[20px] px-4 py-3 shadow-soft ${
                isPeer ? 'bg-white text-black rounded-tl-sm' : 'bg-[#0E0E0E] text-white rounded-tr-sm'
              }`}>
                <p className="text-[14px] leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] mt-1 block font-medium ${isPeer ? 'text-gray-400' : 'text-gray-400 text-right'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] to-transparent pt-4 pb-3 px-4 z-10">
        <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-md border border-gray-100">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-transparent px-3 py-2 text-[14px] outline-none text-black placeholder:text-gray-400 font-medium"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-[#0E0E0E] rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Send size={18} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
