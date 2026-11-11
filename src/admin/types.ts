export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseCategory =
  | 'Languages'
  | 'Programming'
  | 'Test Prep'
  | 'Web Development'
  | 'Professional';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  email: string;
  courseIds: string[];
  rating: number;
  students: number;
}

export type CurriculumItemKind = 'lecture' | 'quiz' | 'assignment' | 'test';

export interface Lecture {
  id: string;
  kind: 'lecture';
  title: string;
  durationMin: number;
  videoUrl: string;
  freePreview: boolean;
  notes?: string;
}

export type QuestionType = 'single' | 'multi' | 'truefalse' | 'short';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndexes: number[];
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  kind: 'quiz' | 'test';
  title: string;
  description: string;
  passingScorePct: number;
  durationMin: number | null;
  maxAttempts: number;
  questions: Question[];
}

export interface Assignment {
  id: string;
  kind: 'assignment';
  title: string;
  moduleId?: string;
  estimatedHours: number;
  instructions: string;
  allowedFormats: string[];
  maxFileMb: number;
  dueDate: string;
  referenceFiles: { name: string; size: string }[];
}

export type CurriculumItem = Lecture | Quiz | Assignment;

export interface CurriculumSection {
  id: string;
  title: string;
  items: CurriculumItem[];
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number;
  discountPrice?: number;
  free: boolean;
  thumbnail: string;
  promoVideoUrl?: string;
  instructorId: string;
  published: boolean;
  certificate: boolean;
  assessmentsEnabled: boolean;
  lessonsCount: number;
  tasksCount: number;
  studentsCount: number;
  rating: number;
  revenue: number;
  createdAt: string;
  curriculum: CurriculumSection[];
}

export type SubmissionStatus =
  | 'submitted'
  | 'needs_grading'
  | 'auto_graded'
  | 'graded'
  | 'resubmission_requested';

export interface Submission {
  id: string;
  studentName: string;
  studentAvatar: string;
  courseId: string;
  courseTitle: string;
  taskId: string;
  taskTitle: string;
  taskKind: 'quiz' | 'test' | 'assignment';
  submittedDate: string;
  status: SubmissionStatus;
  score?: number;
  maxScore: number;
  fileName?: string;
  fileSize?: string;
  responseText?: string;
  feedback?: string;
}

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';
export type PaymentMethod = 'MTN Mobile Money' | 'Airtel Money' | 'Card' | 'Bank Transfer';

export interface Order {
  id: string;
  reference: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  method: PaymentMethod;
  status: OrderStatus;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  status: 'Published' | 'Draft';
  publishedAt: string;
  cover: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Workshop' | 'Webinar' | 'Live Class' | 'Exam Session';
  date: string;
  startTime: string;
  endTime: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  color: string;
}
