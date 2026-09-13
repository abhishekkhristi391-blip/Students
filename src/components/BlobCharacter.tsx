import { motion } from 'framer-motion';

type Emotion = 'happy' | 'balanced' | 'dizzy' | 'negative' | 'worried';

interface BlobProps {
  emotion: Emotion;
  className?: string;
}

export default function BlobCharacter({ emotion, className = '' }: BlobProps) {
  let color = '';
  let face = null;

  switch (emotion) {
    case 'happy':
      color = 'fill-[#fed282]'; // sunflowerYellow
      face = (
        <g stroke="#8c6a23" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 35 45 Q 45 35 55 45" />
          <path d="M 75 45 Q 85 35 95 45" />
          <path d="M 45 65 Q 65 85 85 65 Z" fill="#8c6a23" />
        </g>
      );
      break;
    case 'balanced':
      color = 'fill-[#77d6bd]'; // mintTeal
      face = (
        <g fill="#2c695a">
          <ellipse cx="45" cy="45" rx="4" ry="6" />
          <ellipse cx="85" cy="45" rx="4" ry="6" />
          <path d="M 55 65 Q 65 75 75 65" stroke="#2c695a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      );
      break;
    case 'dizzy':
      color = 'fill-[#ff8a8e]'; // coralPink
      face = (
        <g stroke="#802023" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 40 45 Q 45 35 50 45 T 60 45" />
          <path d="M 70 45 Q 75 35 80 45 T 90 45" />
          <line x1="55" y1="70" x2="75" y2="70" />
        </g>
      );
      break;
    case 'negative':
      color = 'fill-[#b587fb]'; // lavenderPurple
      face = (
        <g stroke="#41246b" strokeWidth="4" strokeLinecap="round" fill="none">
          <line x1="40" y1="45" x2="55" y2="45" />
          <line x1="75" y1="45" x2="90" y2="45" />
          <line x1="55" y1="65" x2="75" y2="65" />
        </g>
      );
      break;
    case 'worried':
      color = 'fill-[#fed282]'; // sunflowerYellow variant
      face = (
        <g stroke="#8c6a23" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 40 40 Q 48 35 55 45" />
          <path d="M 75 45 Q 82 35 90 40" />
          <path d="M 55 70 Q 60 65 65 70 T 75 70" />
          <ellipse cx="48" cy="50" rx="3" ry="5" fill="#8c6a23" stroke="none" />
          <ellipse cx="82" cy="50" rx="3" ry="5" fill="#8c6a23" stroke="none" />
        </g>
      );
      break;
  }

  return (
    <motion.svg 
      viewBox="0 0 130 130" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <defs>
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.1" />
        </filter>
      </defs>
      
      {/* Base blob shape */}
      <path 
        className={color}
        filter="url(#soft-shadow)"
        d="M 65 10 C 95 10 120 35 120 65 C 120 100 95 115 65 115 C 30 115 10 95 10 65 C 10 35 35 10 65 10 Z" 
      />
      
      {/* Blush marks */}
      <ellipse cx="30" cy="55" rx="8" ry="4" fill="#ffffff" opacity="0.4" />
      <ellipse cx="100" cy="55" rx="8" ry="4" fill="#ffffff" opacity="0.4" />

      {face}
    </motion.svg>
  );
}
