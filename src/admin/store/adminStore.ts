import { create } from 'zustand';
import type {
  Course,
  CurriculumSection,
  CurriculumItem,
  Quiz,
  Assignment,
  Submission,
  Order,
  Instructor,
  BlogPost,
  CalendarEvent,
} from '../types';

let idc = 0;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();

const instructors: Instructor[] = [
  {
    id: 'ins_prince',
    name: 'Prince Dimpoz',
    title: 'Lead Backend Instructor',
    bio: 'Senior Java engineer turned educator. 8+ years building scalable financial systems across East Africa.',
    avatar: 'https://i.pravatar.cc/120?img=12',
    email: 'prince@fluentarise.rw',
    courseIds: ['c_java', 'c_php'],
    rating: 4.9,
    students: 1240,
  },
  {
    id: 'ins_amina',
    name: 'Amina Uwase',
    title: 'English Language Director',
    bio: 'CELTA-certified instructor specialising in IELTS and academic English preparation.',
    avatar: 'https://i.pravatar.cc/120?img=45',
    email: 'amina@fluentarise.rw',
    courseIds: ['c_english', 'c_ielts'],
    rating: 4.8,
    students: 980,
  },
  {
    id: 'ins_kevin',
    name: 'Kevin Habimana',
    title: 'Full-Stack Instructor',
    bio: 'PHP & JavaScript craftsman. Loves shipping clean, maintainable web apps.',
    avatar: 'https://i.pravatar.cc/120?img=33',
    email: 'kevin@fluentarise.rw',
    courseIds: ['c_php'],
    rating: 4.7,
    students: 540,
  },
  {
    id: 'ins_diane',
    name: 'Diane Mukamana',
    title: 'Test Prep Specialist',
    bio: 'Helps learners master Duolingo, IELTS and TOEFL with data-driven study plans.',
    avatar: 'https://i.pravatar.cc/120?img=47',
    email: 'diane@fluentarise.rw',
    courseIds: ['c_duolingo'],
    rating: 4.6,
    students: 410,
  },
];

const oopQuiz: Quiz = {
  id: 'q_oop',
  kind: 'quiz',
  title: 'OOP Inheritance & Polymorphism Quiz',
  description: 'A short knowledge check on the core pillars of Java OOP.',
  passingScorePct: 70,
  durationMin: 15,
  maxAttempts: 3,
  questions: [
    {
      id: 'qq1',
      type: 'single',
      prompt: 'Which keyword is used to inherit a class in Java?',
      options: ['implements', 'extends', 'inherits', 'super'],
      correctIndexes: [1],
      explanation: '`extends` is used for class inheritance; `implements` is for interfaces.',
      points: 2,
    },
    {
      id: 'qq2',
      type: 'single',
      prompt: 'What is polymorphism?',
      options: [
        'The ability to define multiple constructors',
        'The ability of an object to take many forms',
        'A way to hide internal state',
        'A keyword for abstract classes',
      ],
      correctIndexes: [1],
      explanation: 'Polymorphism lets objects of different types be treated through a common interface.',
      points: 2,
    },
    {
      id: 'qq3',
      type: 'multi',
      prompt: 'Which of the following are principles of OOP? (Select all that apply)',
      options: ['Encapsulation', 'Compilation', 'Inheritance', 'Polymorphism'],
      correctIndexes: [0, 2, 3],
      explanation: 'The four pillars are Encapsulation, Inheritance, Polymorphism and Abstraction.',
      points: 3,
    },
    {
      id: 'qq4',
      type: 'truefalse',
      prompt: 'A final class can be subclassed.',
      options: ['True', 'False'],
      correctIndexes: [1],
      explanation: 'A final class cannot be extended.',
      points: 1,
    },
    {
      id: 'qq5',
      type: 'short',
      prompt: 'In one sentence, describe method overriding.',
      options: [],
      correctIndexes: [],
      explanation: 'Overriding redefines a parent method in a subclass with the same signature.',
      points: 2,
    },
  ],
};

const bankingAssignment: Assignment = {
  id: 'a_banking',
  kind: 'assignment',
  title: 'Java Console Banking Application',
  moduleId: 'sec_java_1',
  estimatedHours: 6,
  instructions: `# Java Console Banking Application

## Learning Objectives
- Apply encapsulation, inheritance and polymorphism in a real program.
- Practise exception handling and basic collections.

## Requirements
1. Create an \`Account\` base class with deposit, withdraw and balance methods.
2. Implement \`SavingsAccount\` and \`CheckingAccount\` subclasses.
3. Support multiple accounts via a \`Bank\` manager class.
4. Read commands from the console in a loop.

## Rubric
- **OOP design (40%)** — clean class hierarchy, encapsulated state.
- **Functionality (35%)** — all commands work, edge cases handled.
- **Code quality (15%)** — naming, comments, formatting.
- **Testing (10%)** — at least 3 manual test scenarios documented.`,
  allowedFormats: ['.java', '.zip', '.pdf'],
  maxFileMb: 25,
  dueDate: daysAhead(7),
  referenceFiles: [
    { name: 'BankingStarterTemplate.zip', size: '1.2 MB' },
    { name: 'RubricChecklist.pdf', size: '320 KB' },
  ],
};

const englishTest: Quiz = {
  id: 't_english',
  kind: 'test',
  title: 'Final English Proficiency Test',
  description: 'Comprehensive proficiency test required for certificate qualification.',
  passingScorePct: 70,
  durationMin: 45,
  maxAttempts: 2,
  questions: Array.from({ length: 20 }).map((_, i) => ({
    id: `teq_${i + 1}`,
    type: (['single', 'truefalse', 'single', 'multi'] as const)[i % 4],
    prompt: `Question ${i + 1}: ${['Choose the correct tense', 'True or False: a gerund functions as a noun', 'Pick the best synonym for "abundant"', 'Which sentences use the passive voice?'][i % 4]}`,
    options:
      i % 4 === 1
        ? ['True', 'False']
        : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndexes: i % 4 === 1 ? [0] : [i % 4 === 2 ? 2 : 1],
    explanation: 'Review the grammar module for the underlying rule.',
    points: 5,
  })),
};

const javaCurriculum: CurriculumSection[] = [
  {
    id: 'sec_java_1',
    title: 'Module 1: Java OOP Fundamentals',
    items: [
      {
        id: 'lec_j1',
        kind: 'lecture',
        title: 'Classes & Objects Explained',
        durationMin: 18,
        videoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
        freePreview: true,
        notes: 'Slides covering class syntax, constructors and object instantiation.',
      },
      {
        id: 'lec_j2',
        kind: 'lecture',
        title: 'Encapsulation with Getters & Setters',
        durationMin: 22,
        videoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
        freePreview: false,
      },
      oopQuiz,
      bankingAssignment,
    ],
  },
  {
    id: 'sec_java_2',
    title: 'Module 2: Advanced OOP',
    items: [
      {
        id: 'lec_j3',
        kind: 'lecture',
        title: 'Abstract Classes & Interfaces',
        durationMin: 26,
        videoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
        freePreview: false,
      },
      {
        id: 'lec_j4',
        kind: 'lecture',
        title: 'Exception Handling Deep Dive',
        durationMin: 30,
        videoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
        freePreview: false,
      },
      {
        id: 'a_j2',
        kind: 'assignment',
        title: 'Library Management Exercise',
        estimatedHours: 4,
        instructions: 'Build a small console app managing books, members and loans using OOP.',
        allowedFormats: ['.java', '.zip'],
        maxFileMb: 20,
        dueDate: daysAhead(14),
        referenceFiles: [{ name: 'LibraryStarter.zip', size: '800 KB' }],
      } as Assignment,
    ],
  },
];

const englishCurriculum: CurriculumSection[] = [
  {
    id: 'sec_en_1',
    title: 'Module 1: Grammar Essentials',
    items: [
      {
        id: 'lec_en1',
        kind: 'lecture',
        title: 'Tenses Overview',
        durationMin: 20,
        videoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
        freePreview: true,
      },
      {
        id: 'q_en1',
        kind: 'quiz',
        title: 'Tenses Quick Check',
        description: '5-question warm-up on verb tenses.',
        passingScorePct: 70,
        durationMin: 10,
        maxAttempts: 3,
        questions: [
          {
            id: 'enq1',
            type: 'single',
            prompt: 'Which sentence uses the present perfect?',
            options: ['I went home.', 'I have gone home.', 'I am going home.', 'I will go home.'],
            correctIndexes: [1],
            points: 1,
          },
        ],
      } as Quiz,
    ],
  },
  {
    id: 'sec_en_2',
    title: 'Module 2: Proficiency Assessment',
    items: [englishTest],
  },
];

const courses: Course[] = [
  {
    id: 'c_java',
    title: 'Java Backend Development',
    category: 'Programming',
    level: 'Intermediate',
    price: 180000,
    discountPrice: 144000,
    free: false,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    promoVideoUrl: 'https://www.youtube.com/embed/8cm4x5xk6Jk',
    instructorId: 'ins_prince',
    published: true,
    certificate: true,
    assessmentsEnabled: true,
    lessonsCount: 42,
    tasksCount: 8,
    studentsCount: 312,
    rating: 4.9,
    revenue: 4_860_000,
    createdAt: daysAgo(120),
    curriculum: javaCurriculum,
  },
  {
    id: 'c_english',
    title: 'General English',
    category: 'Languages',
    level: 'All Levels',
    price: 90000,
    free: false,
    thumbnail: 'https://images.unsplash.com/photo-1503676267431-0d269eb601a6?w=600&q=80',
    instructorId: 'ins_amina',
    published: true,
    certificate: true,
    assessmentsEnabled: true,
    lessonsCount: 36,
    tasksCount: 6,
    studentsCount: 540,
    rating: 4.7,
    revenue: 3_240_000,
    createdAt: daysAgo(90),
    curriculum: englishCurriculum,
  },
  {
    id: 'c_duolingo',
    title: 'Duolingo Advanced Prep',
    category: 'Test Prep',
    level: 'Intermediate',
    price: 60000,
    free: false,
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80',
    instructorId: 'ins_diane',
    published: true,
    certificate: false,
    assessmentsEnabled: true,
    lessonsCount: 24,
    tasksCount: 4,
    studentsCount: 210,
    rating: 4.6,
    revenue: 1_080_000,
    createdAt: daysAgo(60),
    curriculum: [],
  },
  {
    id: 'c_php',
    title: 'PHP Web Development',
    category: 'Web Development',
    level: 'Beginner',
    price: 120000,
    free: false,
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80',
    instructorId: 'ins_kevin',
    published: true,
    certificate: true,
    assessmentsEnabled: false,
    lessonsCount: 30,
    tasksCount: 5,
    studentsCount: 188,
    rating: 4.5,
    revenue: 1_440_000,
    createdAt: daysAgo(45),
    curriculum: [],
  },
  {
    id: 'c_ielts',
    title: 'IELTS Intensive',
    category: 'Test Prep',
    level: 'Advanced',
    price: 250000,
    discountPrice: 200000,
    free: false,
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    instructorId: 'ins_amina',
    published: true,
    certificate: true,
    assessmentsEnabled: true,
    lessonsCount: 50,
    tasksCount: 10,
    studentsCount: 145,
    rating: 4.8,
    revenue: 3_200_000,
    createdAt: daysAgo(30),
    curriculum: [],
  },
  {
    id: 'c_pro',
    title: 'Professional Communication',
    category: 'Professional',
    level: 'All Levels',
    price: 0,
    free: true,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d30bca639855?w=600&q=80',
    instructorId: 'ins_amina',
    published: false,
    certificate: false,
    assessmentsEnabled: false,
    lessonsCount: 12,
    tasksCount: 2,
    studentsCount: 0,
    rating: 0,
    revenue: 0,
    createdAt: daysAgo(5),
    curriculum: [],
  },
];

const submissions: Submission[] = [
  {
    id: 'sub_1',
    studentName: 'Mugisha Eric',
    studentAvatar: 'https://i.pravatar.cc/80?img=14',
    courseId: 'c_java',
    courseTitle: 'Java Backend Development',
    taskId: 'q_oop',
    taskTitle: 'OOP Inheritance & Polymorphism Quiz',
    taskKind: 'quiz',
    submittedDate: daysAgo(1),
    status: 'auto_graded',
    score: 8,
    maxScore: 10,
  },
  {
    id: 'sub_2',
    studentName: 'Iradukunda Grace',
    studentAvatar: 'https://i.pravatar.cc/80?img=49',
    courseId: 'c_java',
    courseTitle: 'Java Backend Development',
    taskId: 'a_banking',
    taskTitle: 'Java Console Banking Application',
    taskKind: 'assignment',
    submittedDate: daysAgo(2),
    status: 'needs_grading',
    maxScore: 100,
    fileName: 'BankingApp-Iradukunda.zip',
    fileSize: '2.4 MB',
    responseText: '',
  },
  {
    id: 'sub_3',
    studentName: 'Habimana Olivier',
    studentAvatar: 'https://i.pravatar.cc/80?img=15',
    courseId: 'c_english',
    courseTitle: 'General English',
    taskId: 't_english',
    taskTitle: 'Final English Proficiency Test',
    taskKind: 'test',
    submittedDate: daysAgo(3),
    status: 'auto_graded',
    score: 75,
    maxScore: 100,
  },
  {
    id: 'sub_4',
    studentName: 'Uwase Divine',
    studentAvatar: 'https://i.pravatar.cc/80?img=44',
    courseId: 'c_java',
    courseTitle: 'Java Backend Development',
    taskId: 'a_banking',
    taskTitle: 'Java Console Banking Application',
    taskKind: 'assignment',
    submittedDate: daysAgo(4),
    status: 'needs_grading',
    maxScore: 100,
    fileName: 'Banking-Uwase.zip',
    fileSize: '1.8 MB',
  },
  {
    id: 'sub_5',
    studentName: 'Nshimiyimana Patrick',
    studentAvatar: 'https://i.pravatar.cc/80?img=51',
    courseId: 'c_ielts',
    courseTitle: 'IELTS Intensive',
    taskId: 't_ielts_speaking',
    taskTitle: 'Speaking Mock Test',
    taskKind: 'test',
    submittedDate: daysAgo(5),
    status: 'resubmission_requested',
    maxScore: 100,
    feedback: 'Please re-record with clearer pronunciation in part 2.',
  },
  {
    id: 'sub_6',
    studentName: 'Ingabire Lydia',
    studentAvatar: 'https://i.pravatar.cc/80?img=32',
    courseId: 'c_english',
    courseTitle: 'General English',
    taskId: 'a_essay',
    taskTitle: 'Argumentative Essay Draft',
    taskKind: 'assignment',
    submittedDate: daysAgo(6),
    status: 'graded',
    maxScore: 100,
    score: 88,
    fileName: 'Essay-Lydia.pdf',
    fileSize: '640 KB',
    feedback: 'Strong argument structure. Work on paragraph transitions.',
  },
];

const orders: Order[] = [
  {
    id: 'o_1',
    reference: 'FR-2026-1042',
    studentName: 'Mugisha Eric',
    studentEmail: 'eric.m@mail.rw',
    courseTitle: 'Java Backend Development',
    amount: 144000,
    method: 'MTN Mobile Money',
    status: 'paid',
    date: daysAgo(1),
  },
  {
    id: 'o_2',
    reference: 'FR-2026-1041',
    studentName: 'Iradukunda Grace',
    studentEmail: 'grace.i@mail.rw',
    courseTitle: 'Java Backend Development',
    amount: 144000,
    method: 'Card',
    status: 'paid',
    date: daysAgo(1),
  },
  {
    id: 'o_3',
    reference: 'FR-2026-1040',
    studentName: 'Tuyisenge Alice',
    studentEmail: 'alice.t@mail.rw',
    courseTitle: 'IELTS Intensive',
    amount: 200000,
    method: 'Airtel Money',
    status: 'paid',
    date: daysAgo(2),
  },
  {
    id: 'o_4',
    reference: 'FR-2026-1039',
    studentName: 'Nshimiyimana Patrick',
    studentEmail: 'patrick.n@mail.rw',
    courseTitle: 'IELTS Intensive',
    amount: 200000,
    method: 'MTN Mobile Money',
    status: 'pending',
    date: daysAgo(2),
  },
  {
    id: 'o_5',
    reference: 'FR-2026-1038',
    studentName: 'Habimana Olivier',
    studentEmail: 'olivier.h@mail.rw',
    courseTitle: 'General English',
    amount: 90000,
    method: 'Bank Transfer',
    status: 'paid',
    date: daysAgo(3),
  },
  {
    id: 'o_6',
    reference: 'FR-2026-1037',
    studentName: 'Uwase Divine',
    studentEmail: 'divine.u@mail.rw',
    courseTitle: 'PHP Web Development',
    amount: 120000,
    method: 'MTN Mobile Money',
    status: 'refunded',
    date: daysAgo(5),
  },
  {
    id: 'o_7',
    reference: 'FR-2026-1036',
    studentName: 'Ingabire Lydia',
    studentEmail: 'lydia.i@mail.rw',
    courseTitle: 'General English',
    amount: 90000,
    method: 'Card',
    status: 'paid',
    date: daysAgo(6),
  },
];

const blogPosts: BlogPost[] = [
  {
    id: 'b_1',
    title: '5 Habits of High-Scoring IELTS Candidates',
    excerpt: 'What separates band 7+ scorers from the rest? We analysed 200 of our top learners.',
    body: 'High scorers share common habits: daily speaking practice, structured vocabulary journals, and timed mock tests...',
    author: 'Amina Uwase',
    tags: ['IELTS', 'Study Tips'],
    status: 'Published',
    publishedAt: daysAgo(8),
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
  },
  {
    id: 'b_2',
    title: 'Why Java Still Powers East Africa\'s Fintech',
    excerpt: 'A look at how local engineers use Java to build mobile money platforms.',
    body: 'From MTN MoMo to Airtel Money, Java remains the backbone of payment systems...',
    author: 'Prince Dimpoz',
    tags: ['Java', 'Fintech'],
    status: 'Published',
    publishedAt: daysAgo(15),
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
  },
  {
    id: 'b_3',
    title: 'Announcing Free Professional Communication',
    excerpt: 'A new free course to help graduates ace interviews and workplace communication.',
    body: 'We are thrilled to launch a free Professional Communication module for all learners...',
    author: 'Diane Mukamana',
    tags: ['Announcement', 'Free Course'],
    status: 'Draft',
    publishedAt: daysAhead(2),
    cover: 'https://images.unsplash.com/photo-1552664730-d30bca639855?w=600&q=80',
  },
];

const events: CalendarEvent[] = [
  {
    id: 'e_1',
    title: 'Java OOP Live Workshop',
    type: 'Workshop',
    date: daysAhead(2),
    startTime: '18:00',
    endTime: '20:00',
    instructor: 'Prince Dimpoz',
    capacity: 100,
    enrolled: 64,
    color: 'coral',
  },
  {
    id: 'e_2',
    title: 'IELTS Speaking Mock Session',
    type: 'Live Class',
    date: daysAhead(4),
    startTime: '17:00',
    endTime: '18:30',
    instructor: 'Amina Uwase',
    capacity: 40,
    enrolled: 38,
    color: 'info',
  },
  {
    id: 'e_3',
    title: 'Final English Proficiency Test',
    type: 'Exam Session',
    date: daysAhead(7),
    startTime: '10:00',
    endTime: '10:45',
    instructor: 'Amina Uwase',
    capacity: 200,
    enrolled: 154,
    color: 'amber',
  },
  {
    id: 'e_4',
    title: 'Webinar: Careers in Backend Engineering',
    type: 'Webinar',
    date: daysAhead(10),
    startTime: '16:00',
    endTime: '17:30',
    instructor: 'Prince Dimpoz',
    capacity: 300,
    enrolled: 120,
    color: 'success',
  },
];

interface AdminState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  courses: Course[];
  instructors: Instructor[];
  submissions: Submission[];
  orders: Order[];
  blogPosts: BlogPost[];
  events: CalendarEvent[];

  // Course CRUD
  addCourse: (c: Course) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  toggleCoursePublished: (id: string) => void;

  // Curriculum CRUD
  addSection: (courseId: string, title: string) => void;
  renameSection: (courseId: string, sectionId: string, title: string) => void;
  deleteSection: (courseId: string, sectionId: string) => void;
  addCurriculumItem: (courseId: string, sectionId: string, item: CurriculumItem) => void;
  updateCurriculumItem: (courseId: string, sectionId: string, item: CurriculumItem) => void;
  deleteCurriculumItem: (courseId: string, sectionId: string, itemId: string) => void;

  // Submissions / grading
  gradeSubmission: (id: string, score: number, feedback: string, status: 'graded' | 'resubmission_requested') => void;

  // Orders
  addOrder: (o: Order) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),

  courses,
  instructors,
  submissions,
  orders,
  blogPosts,
  events,

  addCourse: (c) => set((s) => ({ courses: [c, ...s.courses] })),
  updateCourse: (id, patch) =>
    set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  deleteCourse: (id) => set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),
  toggleCoursePublished: (id) =>
    set((s) => ({
      courses: s.courses.map((c) => (c.id === id ? { ...c, published: !c.published } : c)),
    })),

  addSection: (courseId, title) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? { ...c, curriculum: [...c.curriculum, { id: uid('sec'), title, items: [] }] }
          : c,
      ),
    })),
  renameSection: (courseId, sectionId, title) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              curriculum: c.curriculum.map((sec) => (sec.id === sectionId ? { ...sec, title } : sec)),
            }
          : c,
      ),
    })),
  deleteSection: (courseId, sectionId) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? { ...c, curriculum: c.curriculum.filter((sec) => sec.id !== sectionId) }
          : c,
      ),
    })),
  addCurriculumItem: (courseId, sectionId, item) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              curriculum: c.curriculum.map((sec) =>
                sec.id === sectionId ? { ...sec, items: [...sec.items, item] } : sec,
              ),
            }
          : c,
      ),
    })),
  updateCurriculumItem: (courseId, sectionId, item) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              curriculum: c.curriculum.map((sec) =>
                sec.id === sectionId
                  ? { ...sec, items: sec.items.map((it) => (it.id === item.id ? item : it)) }
                  : sec,
              ),
            }
          : c,
      ),
    })),
  deleteCurriculumItem: (courseId, sectionId, itemId) =>
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              curriculum: c.curriculum.map((sec) =>
                sec.id === sectionId ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) } : sec,
              ),
            }
          : c,
      ),
    })),

  gradeSubmission: (id, score, feedback, status) =>
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === id ? { ...sub, score, feedback, status } : sub,
      ),
    })),

  addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
}));
