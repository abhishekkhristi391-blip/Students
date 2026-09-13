import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ListActionCard from '../../components/ListActionCard';
import BlobCharacter from '../../components/BlobCharacter';

export default function WeakTopics() {
  const navigate = useNavigate();

  // Mocking weak topics based on accuracy < 50%
  const weakTopics = [
    { id: 'c2', title: 'Optics', subject: 'Physics', accuracy: 42, color: 'bg-[#ff8a8e]', emotion: 'dizzy' as const },
    { id: 'c5', title: 'Organic Chemistry', subject: 'Chemistry', accuracy: 38, color: 'bg-[#ff8a8e]', emotion: 'negative' as const }
  ];

  return (
    <div className="min-h-full bg-gradient-mood pb-32 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div>
          <h2 className="text-[26px] font-bold text-black leading-tight">Weak Topics</h2>
          <p className="text-[14px] text-gray-800 font-medium">Needs improvement</p>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-3 mt-4">
        {weakTopics.length > 0 ? (
          weakTopics.map(topic => (
            <ListActionCard
              key={topic.id}
              title={topic.title}
              subtitle={topic.subject}
              meta={`${topic.accuracy}% accuracy`}
              metaType="accuracy"
              colorClass={topic.color}
              emotion={topic.emotion}
              isWeak={true}
              onClick={() => navigate(`/practice/chapter/${topic.id}`)}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center -mt-12 text-center">
            <BlobCharacter emotion="happy" className="w-32 h-32 mb-4" />
            <h3 className="text-[18px] font-bold">You're doing great!</h3>
            <p className="text-gray-700 text-sm mt-1">No weak topics right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
