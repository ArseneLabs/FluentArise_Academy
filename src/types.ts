export type CourseCategory =
  | 'English Fluency'
  | 'Java & OOP'
  | 'Web Development'
  | 'Exam Prep';

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  preview: boolean;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  photo: string;
  bio: string;
  rating: number;
  students: number;
  coursesCount: number;
  expertise: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory;
  thumbnail: string;
  price: number;
  oldPrice?: number;
  instructorId: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviewsCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  certificate: boolean;
  assessment: boolean;
  shortDescription: string;
  overview: string;
  takeaways: string[];
  requirements: string[];
  outcomes: string[];
  curriculum: CurriculumSection[];
  reviewList: Review[];
  featured?: boolean;
  popular?: boolean;
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  venue: string;
  time: string;
  description: string;
  category: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  image: string;
  views: number;
  comments: number;
  readTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}
