export interface User {
  uid: string;
  name: string;
  mobile?: string;
  email: string;
  class: string;
  board: string;
  subjects: string[];
  profilePic?: string;
  totalPoints: number;
  rank: number;
  questionsAttempted: number;
  testsCompleted: number;
  correctAnswers: number;
  accuracy: number;
  badges: string[];
  streak: number;
  status: 'active' | 'suspended' | 'blocked';
}

export interface Subject {
  id: string;
  name: string;
  order: number;
  enabled: boolean;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  enabled: boolean;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  order: number;
  enabled: boolean;
}
