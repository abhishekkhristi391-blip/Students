import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bookmark } from 'lucide-react';
import BlobCharacter from '../../components/BlobCharacter';

export default function Bookmarks() {
  const navigate = useNavigate();

  // Mock Bookmarks
  const bookmarks = [
    {
      id: 'q2',
      topic: 'Reflection of Light',
      subject: 'Physics',
      text: 'Which of the following mirrors always forms a virtual, erect, and diminished image?'
    }
  ];

  return (
    <div className="min-h-full bg-gradient-dashboard pb-32 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div>
          <h2 className="text-[26px] font-bold text-black leading-tight">Bookmarks</h2>
          <p className="text-[14px] text-gray-700 font-medium">Saved for revision</p>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-4 mt-4">
        {bookmarks.length > 0 ? (
          bookmarks.map(bm => (
            <div key={bm.id} className="bg-white rounded-[24px] p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#fed282]/30 px-3 py-1 rounded-full text-[11px] font-bold text-[#8c6a23]">
                  {bm.subject} • {bm.topic}
                </div>
                <Bookmark size={18} className="fill-black text-black" />
              </div>
              <p className="text-[15px] font-semibold text-black leading-snug">
                {bm.text}
              </p>
              <button 
                onClick={() => navigate(`/practice/topic/t1/mcq`)}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 transition-colors text-black py-2.5 rounded-full text-[13px] font-bold"
              >
                Practice Again
              </button>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center -mt-12 text-center">
            <BlobCharacter emotion="worried" className="w-32 h-32 mb-4 opacity-80" />
            <h3 className="text-[18px] font-bold">No bookmarks</h3>
            <p className="text-gray-600 text-sm mt-1">Tap the bookmark icon during practice to save questions here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
