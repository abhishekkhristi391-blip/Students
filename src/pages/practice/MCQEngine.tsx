import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Bookmark, Flag, Check, X } from 'lucide-react';
import { QUESTIONS } from '../../data/mockData';
import BlobCharacter from '../../components/BlobCharacter';
import { motion, AnimatePresence } from 'framer-motion';

export default function MCQEngine() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  // Filter questions for the selected topic
  const questions = QUESTIONS.filter(q => q.topicId === topicId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const question = questions[currentIndex];

  if (!question) {
    return (
      <div className="min-h-full bg-gradient-insights flex flex-col items-center justify-center p-6 text-center">
        <BlobCharacter emotion="worried" className="w-32 h-32 mb-4" />
        <h2 className="text-xl font-bold">No questions found</h2>
        <button onClick={() => navigate(-1)} className="mt-6 bg-black text-white px-6 py-3 rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const isCorrect = selectedOption === question.correctIndex;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setBookmarked(false);
    } else {
      // In a real app, go to summary screen. Here we go back.
      navigate(-1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-full bg-gradient-mood pb-24 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-16 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center">
          <ChevronLeft size={24} className="text-black" />
        </button>
        <div className="text-[13px] font-bold bg-white/50 px-4 py-1.5 rounded-full">
          Q {currentIndex + 1} of {questions.length}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBookmarked(!bookmarked)} className={`w-10 h-10 ${bookmarked ? 'bg-[#fed282]' : 'bg-white/50'} backdrop-blur-md rounded-full flex items-center justify-center transition-colors`}>
            <Bookmark size={18} className={bookmarked ? 'text-black fill-black' : 'text-black'} />
          </button>
          <button className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center">
            <Flag size={18} className="text-black" />
          </button>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[24px] p-6 shadow-soft mb-6"
          >
            <p className="text-[18px] font-semibold text-black leading-snug">
              {question.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            let stateClass = "bg-white border-transparent text-black shadow-sm";
            let icon = null;

            if (selectedOption === idx && !isSubmitted) {
              stateClass = "bg-[#0E0E0E] text-white";
            } else if (isSubmitted) {
              if (idx === question.correctIndex) {
                stateClass = "bg-[#d8f5da] border-[#77d6bd] border-2 text-black font-bold";
                icon = <Check size={18} className="text-[#2c695a]" />;
              } else if (idx === selectedOption && idx !== question.correctIndex) {
                stateClass = "bg-[#ffe5e6] border-[#ff8a8e] border-2 text-black";
                icon = <X size={18} className="text-[#802023]" />;
              } else {
                stateClass = "bg-white/60 text-gray-400 border-transparent";
              }
            }

            return (
              <motion.button
                whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-[20px] transition-colors border-2 flex items-center justify-between ${stateClass}`}
              >
                <span className="text-[15px]">{opt}</span>
                {icon}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation Box */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              className={`p-5 rounded-[24px] shadow-sm mb-6 flex gap-4 items-start overflow-hidden origin-top ${isCorrect ? 'bg-[#d8f5da]' : 'bg-[#ffe5e6]'}`}
            >
              <BlobCharacter emotion={isCorrect ? 'happy' : 'negative'} className="w-12 h-12 shrink-0 drop-shadow-sm" />
              <div>
                <h4 className={`text-[15px] font-bold mb-1 ${isCorrect ? 'text-[#2c695a]' : 'text-[#802023]'}`}>
                  {isCorrect ? 'Excellent!' : 'Not quite right.'}
                </h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  {question.explanation}
                </p>
                {isCorrect && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mt-3 inline-block bg-white/80 px-3 py-1 rounded-full text-[12px] font-bold text-[#8c6a23]"
                  >
                    +10 Points earned
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 flex gap-4 pb-8">
          {!isSubmitted ? (
            <>
              <button 
                onClick={handleNext}
                className="flex-1 bg-white text-black py-4 rounded-full font-bold shadow-sm"
              >
                Skip
              </button>
              <button 
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className={`flex-[2] py-4 rounded-full font-bold shadow-md transition-all ${selectedOption !== null ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                Submit
              </button>
            </>
          ) : (
            <button 
              onClick={handleNext}
              className="w-full bg-black text-white py-4 rounded-full font-bold shadow-lg"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
