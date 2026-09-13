import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ListActionCard from '../../components/ListActionCard';
import BlobCharacter from '../../components/BlobCharacter';
import { SUBJECTS, CHAPTERS, TOPICS } from '../../data/mockData';

export default function PracticeLists() {
  const navigate = useNavigate();
  const { subjectId, chapterId } = useParams();

  // Determine current view level
  const isChaptersView = !!subjectId && !chapterId;
  const isTopicsView = !!chapterId;
  const isSubjectsView = !subjectId && !chapterId;

  const handleBack = () => navigate(-1);

  let title = 'Practice';
  let subtitle = 'Select a subject to begin';
  let items: any[] = [];
  let bgGradient = 'bg-gradient-insights';

  if (isSubjectsView) {
    title = 'Subjects';
    items = SUBJECTS.map(s => ({
      id: s.id,
      title: s.name,
      subtitle: 'Complete syllabus',
      colorClass: s.color,
      emotion: s.emotion,
      onClick: () => navigate(`/practice/subject/${s.id}`)
    }));
  } else if (isChaptersView) {
    const subject = SUBJECTS.find(s => s.id === subjectId);
    title = subject?.name || 'Chapters';
    subtitle = 'Select a chapter';
    items = CHAPTERS.filter(c => c.subjectId === subjectId).map(c => ({
      id: c.id,
      title: c.name,
      meta: `${c.accuracy}% accuracy`,
      metaType: 'accuracy',
      isWeak: c.accuracy < 50,
      colorClass: subject?.color || 'bg-gray-100',
      emotion: c.accuracy < 50 ? 'dizzy' : 'balanced',
      onClick: () => navigate(`/practice/chapter/${c.id}`)
    }));
  } else if (isTopicsView) {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    const subject = SUBJECTS.find(s => s.id === chapter?.subjectId);
    title = chapter?.name || 'Topics';
    subtitle = 'Select a topic to practice';
    items = TOPICS.filter(t => t.chapterId === chapterId).map(t => ({
      id: t.id,
      title: t.name,
      meta: `${t.qCount} questions`,
      colorClass: subject?.color || 'bg-gray-100',
      emotion: 'happy',
      onClick: () => navigate(`/practice/topic/${t.id}/mcq`)
    }));
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`min-h-full ${bgGradient} pb-32 flex flex-col`}
    >
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center gap-4">
        {!isSubjectsView && (
          <button 
            onClick={handleBack}
            className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shrink-0"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
        )}
        <div>
          <h2 className="text-[26px] font-bold text-black leading-tight">{title}</h2>
          <p className="text-[14px] text-gray-600 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* List */}
      <div className="px-6 flex-1 flex flex-col gap-3 mt-4">
        {items.length > 0 ? (
          items.map(item => (
            <ListActionCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              metaType={item.metaType}
              isWeak={item.isWeak}
              colorClass={item.colorClass}
              emotion={item.emotion}
              onClick={item.onClick}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center -mt-12 text-center">
            <BlobCharacter emotion="worried" className="w-32 h-32 mb-4 opacity-80" />
            <h3 className="text-[18px] font-bold">Nothing here yet</h3>
            <p className="text-gray-500 text-sm mt-1">Check back later for updates.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
