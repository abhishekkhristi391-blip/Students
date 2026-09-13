import { ArrowUpRight, Clock, Target } from 'lucide-react';
import BlobCharacter from './BlobCharacter';
import { motion } from 'framer-motion';

interface ListActionCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  metaType?: 'time' | 'accuracy' | 'count';
  colorClass: string;
  emotion?: 'happy' | 'balanced' | 'dizzy' | 'negative' | 'worried';
  onClick: () => void;
  isWeak?: boolean;
}

export default function ListActionCard({ 
  title, 
  subtitle, 
  meta, 
  metaType = 'count',
  colorClass, 
  emotion = 'happy',
  onClick,
  isWeak 
}: ListActionCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick} 
      className="bg-white/90 backdrop-blur-md rounded-[20px] p-4 flex items-center gap-4 shadow-soft cursor-pointer relative overflow-hidden"
    >
      {/* Top right diagonal arrow */}
      <div className="absolute top-3 right-3 text-gray-300">
        <ArrowUpRight size={18} strokeWidth={2.5} />
      </div>

      {/* Left Icon Blob */}
      <div className={`w-14 h-14 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
        <BlobCharacter emotion={emotion} className="w-10 h-10 opacity-90" />
      </div>

      {/* Content */}
      <div className="flex-1 pr-6">
        <h4 className="text-[15px] font-bold text-black leading-tight mb-1">{title}</h4>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mb-1.5">{subtitle}</p>
        )}
        
        {/* Metadata Row */}
        <div className="flex items-center gap-3">
          {meta && (
            <div className="flex items-center gap-1.5 text-gray-400">
              {metaType === 'time' && <Clock size={12} />}
              {metaType === 'accuracy' && <Target size={12} />}
              {metaType === 'count' && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
              <span className="text-[11px] font-semibold">{meta}</span>
            </div>
          )}
          
          {isWeak && (
            <span className="bg-[#ff8a8e]/20 text-[#e65c61] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Weak Topic
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
