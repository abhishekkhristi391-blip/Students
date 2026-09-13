import { Subject, Chapter, Topic } from '../types/models';

export interface MockQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicId: string;
}

export const SUBJECTS: (Subject & { color: string; emotion: any })[] = [
  { id: 's1', name: 'Physics', order: 1, enabled: true, color: 'bg-[#fed282]', emotion: 'happy' },
  { id: 's2', name: 'Chemistry', order: 2, enabled: true, color: 'bg-[#77d6bd]', emotion: 'balanced' },
  { id: 's3', name: 'Mathematics', order: 3, enabled: true, color: 'bg-[#b587fb]', emotion: 'worried' },
];

export const CHAPTERS: (Chapter & { qCount: number; accuracy: number })[] = [
  { id: 'c1', subjectId: 's1', name: 'Kinematics', order: 1, enabled: true, qCount: 150, accuracy: 85 },
  { id: 'c2', subjectId: 's1', name: 'Optics', order: 2, enabled: true, qCount: 120, accuracy: 42 }, // Weak topic
  { id: 'c3', subjectId: 's1', name: 'Thermodynamics', order: 3, enabled: true, qCount: 95, accuracy: 68 },
];

export const TOPICS: (Topic & { qCount: number })[] = [
  { id: 't1', chapterId: 'c2', name: 'Reflection of Light', order: 1, enabled: true, qCount: 40 },
  { id: 't2', chapterId: 'c2', name: 'Refraction & Lenses', order: 2, enabled: true, qCount: 50 },
  { id: 't3', chapterId: 'c2', name: 'Wave Optics', order: 3, enabled: true, qCount: 30 },
];

export const QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    topicId: 't1',
    text: 'A light ray falls on a plane mirror with an angle of incidence of 30°. What is the angle of reflection?',
    options: ['15°', '30°', '60°', '90°'],
    correctIndex: 1,
    explanation: 'According to the law of reflection, the angle of incidence is always equal to the angle of reflection (∠i = ∠r).'
  },
  {
    id: 'q2',
    topicId: 't1',
    text: 'Which of the following mirrors always forms a virtual, erect, and diminished image?',
    options: ['Plane mirror', 'Concave mirror', 'Convex mirror', 'Parabolic mirror'],
    correctIndex: 2,
    explanation: 'A convex mirror always forms a virtual, erect, and diminished image regardless of the position of the object.'
  },
  {
    id: 'q3',
    topicId: 't1',
    text: 'The focal length of a plane mirror is:',
    options: ['Zero', 'Negative', 'Positive', 'Infinity'],
    correctIndex: 3,
    explanation: 'A plane mirror is a part of a spherical mirror with an infinite radius of curvature, hence its focal length is infinity.'
  },
  {
    id: 'q4',
    topicId: 't1',
    text: 'If an object is placed 10 cm in front of a plane mirror, what is the distance between the object and its image?',
    options: ['5 cm', '10 cm', '20 cm', 'Infinity'],
    correctIndex: 2,
    explanation: 'The image is formed exactly the same distance behind the mirror. So object distance (10) + image distance (10) = 20 cm.'
  },
  {
    id: 'q5',
    topicId: 't1',
    text: 'What kind of image is formed by a concave mirror when the object is placed between the pole and the focus?',
    options: ['Real and inverted', 'Virtual and erect', 'Real and magnified', 'Virtual and diminished'],
    correctIndex: 1,
    explanation: 'When the object is placed between the pole and principal focus of a concave mirror, the image formed is virtual, erect, and magnified.'
  }
];
