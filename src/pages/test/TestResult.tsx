import { useLocation, useNavigate } from 'react-router-dom';
import BlobCharacter from '../../components/BlobCharacter';
import { Target, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string;
}

function StatCard({ title, value, icon, colorClass = "text-black" }: StatCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-4 shadow-soft flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-gray-500">{title}</span>
        <div className={colorClass}>{icon}</div>
      </div>
      <span className="text-[20px] font-bold text-black">{value}</span>
    </div>
  );
}

export default function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  if (!state) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-center">
        <p>Result not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-black text-white px-6 py-2 rounded-full">Go Home</button>
      </div>
    );
  }

  const {
    score, total, correctCount, incorrectCount, skippedCount,
    timeTaken, totalPoints, accuracy, bonusPoints, basePoints
  } = state;

  // Formatting Time
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeString = `${mins}m ${secs}s`;

  // Determine Emotion based on score
  let emotion: any = 'happy';
  let title = 'Great Job!';
  let gradient = 'bg-gradient-dashboard'; // Green-ish

  if (accuracy < 50) {
    emotion = 'worried';
    title = 'Keep Practicing';
    gradient = 'bg-gradient-mood'; // Warm/Orange
  } else if (accuracy === 100) {
    emotion = 'happy';
    title = 'Perfect Score!';
  } else if (accuracy >= 70) {
    emotion = 'balanced';
    title = 'Well Done!';
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`min-h-full ${gradient} flex flex-col overflow-y-auto pb-24`}
    >
      {/* Header Result */}
      <div className="pt-16 pb-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
        >
          <BlobCharacter emotion={emotion} className="w-32 h-32 drop-shadow-md mb-4" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[28px] font-bold text-black"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-700 font-medium mt-1"
        >
          You earned <span className="font-bold text-[#8c6a23]">+{totalPoints} points</span>
        </motion.p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="px-6 flex-1 flex flex-col gap-6">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item}>
            <StatCard title="Score" value={`${score} / ${total}`} icon={<Target size={16} />} />
          </motion.div>
          <motion.div variants={item}>
            <StatCard title="Accuracy" value={`${accuracy}%`} icon={<AlertCircle size={16} />} />
          </motion.div>
          <motion.div variants={item}>
            <StatCard title="Time Taken" value={timeString} icon={<Clock size={16} />} />
          </motion.div>
          <motion.div variants={item}>
            <StatCard title="Points Breakdown" value={`+${basePoints} / +${bonusPoints}`} icon={<div className="w-4 h-4 rounded-full bg-[#fed282]" />} />
          </motion.div>
        </div>

        {/* Detailed Breakdown */}
        <motion.div variants={item} className="bg-white rounded-[24px] p-5 shadow-soft">
          <h3 className="text-[16px] font-bold mb-4">Performance Breakdown</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3 bg-[#d8f5da] rounded-[16px]">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#2c695a]" />
                <span className="font-bold text-[#2c695a]">Correct</span>
              </div>
              <span className="font-bold text-[#2c695a]">{correctCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#ffe5e6] rounded-[16px]">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-[#802023]" />
                <span className="font-bold text-[#802023]">Incorrect</span>
              </div>
              <span className="font-bold text-[#802023]">{incorrectCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-[16px]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-dashed flex items-center justify-center" />
                <span className="font-bold text-gray-500">Skipped</span>
              </div>
              <span className="font-bold text-gray-500">{skippedCount}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={item} className="flex flex-col gap-3 mt-2">
          <button 
            className="w-full bg-black text-white rounded-full py-4 font-bold shadow-lg"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <button 
            className="w-full bg-white text-black rounded-full py-4 font-bold shadow-sm"
          >
            Review Answers
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
