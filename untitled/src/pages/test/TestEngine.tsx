import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Bookmark, Flag, Target } from 'lucide-react';
import { QUESTIONS } from '../../data/mockData';
import { calculateTestPoints } from '../../services/pointsService';

export default function TestEngine() {
  const navigate = useNavigate();
  // Using generic questions for the test session
  const testQuestions = QUESTIONS.slice(0, 5); // 5 Question test
  const timeLimitSeconds = 5 * 60; // 5 minutes

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = testQuestions[currentIndex];

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    processResults();
  };

  const manualSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < testQuestions.length) {
      if (!window.confirm(`You have ${testQuestions.length - answeredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }
    setIsSubmitting(true);
    processResults();
  };

  const processResults = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    
    testQuestions.forEach((q) => {
      const selected = answers[q.id];
      if (selected !== undefined) {
        if (selected === q.correctIndex) correctCount++;
        else incorrectCount++;
      }
    });

    const skippedCount = testQuestions.length - (correctCount + incorrectCount);
    const timeTaken = timeLimitSeconds - timeLeft;
    
    // Simulate Cloud Function points calculation
    const pointsData = calculateTestPoints(correctCount, testQuestions.length, timeTaken);

    // Navigate to results
    navigate('/test/result', {
      replace: true,
      state: {
        score: correctCount,
        total: testQuestions.length,
        correctCount,
        incorrectCount,
        skippedCount,
        timeTaken,
        ...pointsData
      }
    });
  };

  const toggleReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(question.id)) newSet.delete(question.id);
      else newSet.add(question.id);
      return newSet;
    });
  };

  const selectOption = (idx: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: idx }));
  };

  // Formatting Time
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-full bg-[#E8EDEE] flex flex-col pb-6">
      {/* Test Header */}
      <div className="bg-white px-4 pt-14 pb-4 rounded-b-[30px] shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#ff8a8e] font-bold">
            <Clock size={18} />
            <span className="text-[16px]">{timeString}</span>
          </div>
          <button 
            onClick={manualSubmit}
            className="bg-black text-white px-5 py-2 rounded-full text-[13px] font-bold"
          >
            Submit Test
          </button>
        </div>

        {/* Question Navigator (Horizontal Scroll) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {testQuestions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isMarked = markedForReview.has(q.id);
            const isCurrent = idx === currentIndex;
            
            let badgeClass = "bg-gray-100 text-gray-500 border border-gray-200";
            if (isCurrent) badgeClass = "bg-white border-2 border-black text-black font-bold";
            else if (isMarked) badgeClass = "bg-[#fed282] text-black border-transparent";
            else if (isAnswered) badgeClass = "bg-[#0E0E0E] text-white border-transparent";

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`min-w-[40px] h-[40px] rounded-full flex items-center justify-center text-[14px] shrink-0 transition-all ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className="px-6 flex-1 flex flex-col pt-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-[13px] font-bold bg-white px-4 py-1.5 rounded-full shadow-sm">
            Q {currentIndex + 1} / {testQuestions.length}
          </div>
          <button 
            onClick={toggleReview}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all ${markedForReview.has(question.id) ? 'bg-[#fed282] text-black' : 'bg-white text-gray-500'}`}
          >
            <Bookmark size={14} className={markedForReview.has(question.id) ? 'fill-black' : ''} />
            Review
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-soft mb-6">
          <p className="text-[18px] font-semibold text-black leading-snug">
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => {
            const isSelected = answers[question.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={`w-full text-left p-4 rounded-[20px] transition-all border-2 flex items-center justify-between shadow-sm ${isSelected ? 'bg-[#0E0E0E] text-white border-transparent' : 'bg-white text-black border-transparent'}`}
              >
                <span className="text-[15px]">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 mt-auto flex gap-4">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex-1 bg-white text-black py-4 rounded-full font-bold shadow-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentIndex(prev => Math.min(testQuestions.length - 1, prev + 1))}
          disabled={currentIndex === testQuestions.length - 1}
          className="flex-1 bg-white text-black py-4 rounded-full font-bold shadow-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
