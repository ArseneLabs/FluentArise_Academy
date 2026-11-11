import type {
  Course,
  Instructor,
  EventItem,
  BlogPost,
  Testimonial,
  PricingPlan,
} from '@/types';
import { useAdminStore } from '@/admin/store/adminStore';

export const formatRwf = (n: number): string =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' Rwf';

export const instructors: Instructor[] = [];

export const courses: Course[] = [];

export function getLiveCourses(): Course[] {
  try {
    const adminCourses = useAdminStore.getState().courses;
    return adminCourses
      .filter((c) => c.published)
      .map((c) => ({
        id: c.id,
        slug: c.id,
        title: c.title,
        category: (c.category as any) || 'Programming',
        thumbnail:
          c.thumbnail ||
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
        price: c.discountPrice ?? c.price,
        oldPrice: c.discountPrice ? c.price : undefined,
        instructorId: c.instructorId,
        duration: `${Math.max(1, (c.lessonsCount || 1) * 2)} hours`,
        lessons: c.lessonsCount || 0,
        students: c.studentsCount || 0,
        rating: c.rating || 5.0,
        reviewsCount: 0,
        level: (c.level as any) || 'Beginner',
        language: 'English',
        certificate: c.certificate,
        assessment: c.assessmentsEnabled,
        shortDescription: c.shortDescription || c.title,
        overview:
          c.overview || 'Master this program through hands-on practice with FluentaRise Academy.',
        takeaways: [
          'Master essential concepts and modern workflows',
          'Hands-on practical tasks with instructor grading',
          'Verified completion certificate',
        ],
        requirements: ['Basic computer or mobile device with internet connectivity'],
        outcomes: ['Practical mastery in the subject domain', 'Portfolio-ready capabilities'],
        curriculum: (c.curriculum || []).map((sec) => ({
          id: sec.id,
          title: sec.title,
          lectures: (sec.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            duration: 'durationMin' in it ? `${it.durationMin} mins` : 'Task',
            preview: 'freePreview' in it ? Boolean(it.freePreview) : false,
          })),
        })),
        reviewList: [],
        popular: true,
        featured: true,
      }));
  } catch {
    return [];
  }
}

export const getInstructor = (id: string): Instructor | undefined => {
  const local = instructors.find((i) => i.id === id);
  if (local) return local;
  try {
    const adminIns = useAdminStore.getState().instructors.find((i) => i.id === id);
    if (adminIns) {
      return {
        id: adminIns.id,
        name: adminIns.name,
        title: adminIns.title,
        photo: adminIns.avatar,
        bio: adminIns.bio,
        rating: adminIns.rating,
        students: adminIns.students,
        coursesCount: adminIns.courseIds.length,
        expertise: ['FluentaRise Certified Instructor'],
      };
    }
  } catch {
    // fallback
  }
  return undefined;
};

export const getCourseBySlug = (slug: string): Course | undefined => {
  const local = courses.find((c) => c.slug === slug || c.id === slug);
  if (local) return local;
  return getLiveCourses().find((c) => c.slug === slug || c.id === slug);
};

export const events: EventItem[] = [];

export const blogPosts: BlogPost[] = [];

export const testimonials: Testimonial[] = [];

export const partnerLogos: { name: string; logo: string }[] = [];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'startup',
    name: 'Individual Cohort',
    price: 50000,
    tagline: 'Standard cohort enrollment with live classes.',
    features: [
      'Live online classes',
      'Curriculum access',
      'Community mentorship',
      'Course assessments',
      'Completion certificate',
    ],
  },
  {
    id: 'premium',
    name: 'Fast-Track Intensive',
    price: 150000,
    tagline: 'Accelerated exam prep and 1-on-1 coaching.',
    features: [
      'Priority live sessions',
      '1-on-1 mentor guidance',
      'Dedicated mock exam reviews',
      'Verified FluentaRise certificate',
      'Unlimited assessment attempts',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Institutional / Team',
    price: 600000,
    tagline: 'For schools, NGOs, and corporate teams.',
    features: [
      'Custom group cohorts',
      'Dedicated instructor assignment',
      'Team progress reports',
      'On-site or virtual workshops',
      'Full administrative oversight',
    ],
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Are the classes live or pre-recorded?',
    answer: 'Our programs combine live online sessions with structured curriculum modules and interactive assignments.',
  },
  {
    question: 'Do I get a certificate after completing a course?',
    answer: 'Yes. Every course issues a verifiable FluentaRise completion certificate once you finish the modules and pass the assessments.',
  },
  {
    question: 'How do I pay for my enrollment?',
    answer: 'You can pay using MTN Mobile Money (*182#), Airtel Money, or direct Bank of Kigali (BK) transfer during checkout.',
  },
  {
    question: 'What happens after I register an account?',
    answer: 'Your account registration is reviewed and activated by a Super Admin to ensure platform safety and verify cohort admission.',
  },
];
