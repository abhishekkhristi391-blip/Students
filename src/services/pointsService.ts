// Simulated Cloud Function for Points Calculation
// In a real Firebase environment, this would run securely on the backend (Cloud Functions)
// to prevent client-side point manipulation (anti-farming).

export interface PointsResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  accuracy: number;
  streakMaintained: boolean;
}

export function calculateTestPoints(
  correctCount: number,
  totalCount: number,
  timeTakenSeconds: number,
  isDailyChallenge: boolean = false
): PointsResult {
  // Base configuration (would normally reside in config/points doc in Firestore)
  const POINTS_PER_CORRECT = 10;
  
  // Calculate accuracy
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  
  // 1. Base Points
  const basePoints = correctCount * POINTS_PER_CORRECT;
  
  // 2. Bonus Points Logic
  let bonusPoints = 0;
  
  // High score bonus
  if (accuracy === 100) {
    bonusPoints += 50; // Perfect score bonus
  } else if (accuracy >= 80) {
    bonusPoints += 20; // High accuracy bonus
  }
  
  // Daily Challenge completion bonus
  if (isDailyChallenge) {
    bonusPoints += 100;
  }

  // Speed bonus (if completed under an aggressive average time per question, e.g., < 30s per question)
  if (accuracy >= 70 && timeTakenSeconds < totalCount * 30) {
    bonusPoints += 15;
  }

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    accuracy,
    streakMaintained: true // Simulated streak check
  };
}
