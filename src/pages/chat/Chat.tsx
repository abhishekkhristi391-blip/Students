import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import BlobCharacter from '../../components/BlobCharacter';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there! I am your AI study buddy. Need help with any topics today?', sender: 'ai', time: '10:00 AM' }
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

    // Mock AI reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "That's a great question! I'm an offline mock tutor right now, but I can pretend to explain it clearly using our Blob analogies.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-full bg-[#f8f9fa] pb-24 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white shadow-sm z-10 sticky top-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fed282] flex items-center justify-center shadow-sm">
            <BlobCharacter emotion="happy" className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-black leading-tight">Blobby Tutor</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#77d6bd]"></span>
              <p className="text-[12px] text-gray-500 font-medium">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-[20px] px-4 py-3 shadow-soft ${
                isAi ? 'bg-white text-black rounded-tl-sm' : 'bg-[#0E0E0E] text-white rounded-tr-sm'
              }`}>
                <p className="text-[14px] leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] mt-1 block font-medium ${isAi ? 'text-gray-400' : 'text-gray-400 text-right'}`}>
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
            placeholder="Ask a question..."
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
