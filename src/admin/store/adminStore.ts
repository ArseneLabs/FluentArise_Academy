import { create } from 'zustand';
import type {
  Course,
  CurriculumSection,
  CurriculumItem,
  Submission,
  Order,
  OrderStatus,
  Instructor,
  BlogPost,
  CalendarEvent,
  PlatformSettingsData,
} from '../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

let idc = 0;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const STORAGE_KEY = 'fluentarise_admin_data_v3';

const defaultSettings: PlatformSettingsData = {
  currency: 'Rwandan Franc (Rwf)',
  language: 'English',
  timezone: 'Africa/Kigali',
  emailNotifications: true,
  submissionAlerts: true,
  enrollmentAlerts: true,
  paymentMethods: {
    momo: true,
    airtel: true,
    card: true,
    bank: true,
  },
};

interface StoredData {
  courses: Course[];
  instructors: Instructor[];
  submissions: Submission[];
  orders: Order[];
  blogPosts: BlogPost[];
  events: CalendarEvent[];
  platformSettings: PlatformSettingsData;
}

function loadInitialData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        courses: parsed.courses || [],
        instructors: parsed.instructors || [],
        submissions: parsed.submissions || [],
        orders: parsed.orders || [],
        blogPosts: parsed.blogPosts || [],
        events: parsed.events || [],
        platformSettings: parsed.platformSettings || defaultSettings,
      };
    }
  } catch (err) {
    console.error('Failed to load admin data from storage', err);
  }
  return {
    courses: [],
    instructors: [],
    submissions: [],
    orders: [],
    blogPosts: [],
    events: [],
    platformSettings: defaultSettings,
  };
}

function persistData(state: StoredData) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        courses: state.courses,
        instructors: state.instructors,
        submissions: state.submissions,
        orders: state.orders,
        blogPosts: state.blogPosts,
        events: state.events,
        platformSettings: state.platformSettings,
      })
    );
  } catch (err) {
    console.error('Failed to persist admin data', err);
  }
}

const initial = loadInitialData();

interface AdminState extends StoredData {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  syncFromSupabase: () => Promise<void>;

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
  addSubmission: (s: Submission) => void;
  gradeSubmission: (
    id: string,
    score: number,
    feedback: string,
    status: 'graded' | 'resubmission_requested',
    improvementTips?: string
  ) => void;

  // Orders
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Instructors
  addInstructor: (i: Instructor) => void;
  deleteInstructor: (id: string) => void;

  // Events & Live Sessions
  addEvent: (e: CalendarEvent) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Blog
  addBlogPost: (b: BlogPost) => void;
  deleteBlogPost: (id: string) => void;

  // Platform Settings
  updatePlatformSettings: (patch: Partial<PlatformSettingsData>) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  theme: 'light',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),

  courses: initial.courses,
  instructors: initial.instructors,
  submissions: initial.submissions,
  orders: initial.orders,
  blogPosts: initial.blogPosts,
  events: initial.events,
  platformSettings: initial.platformSettings,

  syncFromSupabase: async () => {
    if (!isSupabaseConfigured) return;
    try {
      // 1. Fetch courses
      const { data: dbCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      // 2. Fetch instructors
      const { data: dbInstructors } = await supabase.from('instructors').select('*');
      // 3. Fetch submissions
      const { data: dbSubmissions } = await supabase.from('submissions').select('*').order('submitted_date', { ascending: false });
      // 4. Fetch orders
      const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      // 5. Fetch blog posts
      const { data: dbBlogs } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      // 6. Fetch events
      const { data: dbEvents } = await supabase.from('calendar_events').select('*');
      // 7. Fetch platform settings
      const { data: dbSettings } = await supabase.from('platform_settings').select('*').eq('id', 'global').maybeSingle();

      set((s) => {
        const courses: Course[] = dbCourses
          ? dbCourses.map((c) => ({
              id: c.id,
              title: c.title,
              category: c.category,
              level: c.level,
              price: c.price,
              discountPrice: c.discount_price,
              free: c.free,
              thumbnail: c.thumbnail,
              promoVideoUrl: c.promo_video_url,
              instructorId: c.instructor_id,
              published: c.published,
              certificate: c.certificate,
              assessmentsEnabled: c.assessments_enabled,
              lessonsCount: c.lessons_count || 0,
              tasksCount: c.tasks_count || 0,
              studentsCount: c.students_count || 0,
              rating: Number(c.rating || 0),
              revenue: c.revenue || 0,
              createdAt: c.created_at,
              curriculum: c.curriculum || [],
            }))
          : s.courses;

        const instructors: Instructor[] = dbInstructors
          ? dbInstructors.map((i) => ({
              id: i.id,
              name: i.name,
              title: i.title,
              bio: i.bio || '',
              avatar: i.avatar || '',
              email: i.email,
              courseIds: i.course_ids || [],
              rating: Number(i.rating || 0),
              students: i.students || 0,
            }))
          : s.instructors;

        const submissions: Submission[] = dbSubmissions
          ? dbSubmissions.map((sub) => ({
              id: sub.id,
              studentId: sub.student_id,
              studentEmail: sub.student_email,
              studentName: sub.student_name,
              studentAvatar: sub.student_avatar || '',
              courseId: sub.course_id,
              courseTitle: sub.course_title,
              taskId: sub.task_id,
              taskTitle: sub.task_title,
              taskKind: sub.task_kind,
              submittedDate: sub.submitted_date,
              status: sub.status,
              score: sub.score,
              maxScore: sub.max_score || 100,
              fileName: sub.file_name,
              fileSize: sub.file_size,
              responseText: sub.response_text,
              feedback: sub.feedback,
              improvementTips: sub.improvement_tips,
            }))
          : s.submissions;

        const orders: Order[] = dbOrders
          ? dbOrders.map((o) => ({
              id: o.id,
              reference: o.order_number || o.id,
              studentName: o.customer_name,
              studentEmail: o.customer_email,
              customerPhone: o.customer_phone,
              paymentReference: o.payment_reference,
              courseTitle: Array.isArray(o.items) && o.items.length > 0 ? o.items.map((i: any) => i.title).join(', ') : 'Course Enrollment',
              courseIds: Array.isArray(o.items) ? o.items.map((i: any) => i.id) : [],
              amount: o.total_amount,
              method: o.payment_method === 'momo' ? 'MTN Mobile Money' : 'Bank Transfer',
              status: o.status === 'confirmed' ? 'paid' : o.status === 'cancelled' ? 'failed' : 'pending',
              date: o.created_at,
            }))
          : s.orders;

        const blogPosts: BlogPost[] = dbBlogs
          ? dbBlogs.map((b) => ({
              id: b.id,
              title: b.title,
              excerpt: b.excerpt || '',
              body: b.body || '',
              author: b.author,
              tags: b.tags || [],
              status: b.status,
              publishedAt: b.published_at || b.created_at,
              cover: b.cover || '',
            }))
          : s.blogPosts;

        const events: CalendarEvent[] = dbEvents
          ? dbEvents.map((e) => ({
              id: e.id,
              title: e.title,
              type: e.type,
              date: e.date,
              startTime: e.start_time,
              endTime: e.end_time,
              instructor: e.instructor,
              instructorId: e.instructor_id,
              courseId: e.course_id,
              courseTitle: e.course_title,
              meetingUrl: e.meeting_url,
              description: e.description,
              capacity: e.capacity || 50,
              enrolled: e.enrolled || 0,
              color: e.color || '#0284c7',
              status: e.status || 'upcoming',
            }))
          : s.events;

        const platformSettings: PlatformSettingsData = dbSettings?.settings
          ? { ...defaultSettings, ...dbSettings.settings }
          : s.platformSettings;

        const updated = { ...s, courses, instructors, submissions, orders, blogPosts, events, platformSettings };
        persistData(updated);
        return updated;
      });
    } catch (err) {
      console.warn('Could not sync admin data from Supabase:', err);
    }
  },

  addCourse: (c) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('courses').upsert({
            id: c.id,
            title: c.title,
            category: c.category,
            level: c.level,
            price: c.price,
            discount_price: c.discountPrice,
            free: c.free,
            thumbnail: c.thumbnail,
            promo_video_url: c.promoVideoUrl,
            instructor_id: c.instructorId,
            published: c.published,
            certificate: c.certificate,
            assessments_enabled: c.assessmentsEnabled,
            lessons_count: c.lessonsCount,
            tasks_count: c.tasksCount,
            students_count: c.studentsCount,
            rating: c.rating,
            revenue: c.revenue,
            curriculum: c.curriculum,
            created_at: c.createdAt,
          });
        } catch (err) {
          console.warn(err);
        }
      })();
    }

    set((s) => {
      const exists = s.courses.some((x) => x.id === c.id);
      const courses = exists ? s.courses.map((x) => (x.id === c.id ? c : x)) : [c, ...s.courses];
      persistData({ ...s, courses });
      return { courses };
    });
  },

  updateCourse: (id, patch) => {
    set((s) => {
      const courses = s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c));
      persistData({ ...s, courses });

      if (isSupabaseConfigured) {
        const target = courses.find((c) => c.id === id);
        if (target) {
          (async () => {
            try {
              await supabase
                .from('courses')
                .update({
                  title: target.title,
                  category: target.category,
                  level: target.level,
                  price: target.price,
                  discount_price: target.discountPrice,
                  free: target.free,
                  thumbnail: target.thumbnail,
                  promo_video_url: target.promoVideoUrl,
                  instructor_id: target.instructorId,
                  published: target.published,
                  certificate: target.certificate,
                  assessments_enabled: target.assessmentsEnabled,
                  lessons_count: target.lessonsCount,
                  tasks_count: target.tasksCount,
                  students_count: target.studentsCount,
                  rating: target.rating,
                  revenue: target.revenue,
                  curriculum: target.curriculum,
                })
                .eq('id', id);
            } catch (err) {
              console.warn(err);
            }
          })();
        }
      }

      return { courses };
    });
  },

  deleteCourse: (id) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('courses').delete().eq('id', id);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const courses = s.courses.filter((c) => c.id !== id);
      persistData({ ...s, courses });
      return { courses };
    });
  },

  toggleCoursePublished: (id) => {
    set((s) => {
      const courses = s.courses.map((c) => (c.id === id ? { ...c, published: !c.published } : c));
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === id);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase.from('courses').update({ published: target.published }).eq('id', id);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    });
  },

  addSection: (courseId, title) =>
    set((s) => {
      const courses = s.courses.map((c) =>
        c.id === courseId
          ? { ...c, curriculum: [...c.curriculum, { id: uid('sec'), title, items: [] }] }
          : c
      );
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase.from('courses').update({ curriculum: target.curriculum }).eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  renameSection: (courseId, sectionId, title) =>
    set((s) => {
      const courses = s.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              curriculum: c.curriculum.map((sec) => (sec.id === sectionId ? { ...sec, title } : sec)),
            }
          : c
      );
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase.from('courses').update({ curriculum: target.curriculum }).eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  deleteSection: (courseId, sectionId) =>
    set((s) => {
      const courses = s.courses.map((c) =>
        c.id === courseId
          ? { ...c, curriculum: c.curriculum.filter((sec) => sec.id !== sectionId) }
          : c
      );
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase.from('courses').update({ curriculum: target.curriculum }).eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  addCurriculumItem: (courseId, sectionId, item) =>
    set((s) => {
      const courses = s.courses.map((c) => {
        if (c.id !== courseId) return c;
        const updatedCurriculum = c.curriculum.map((sec) =>
          sec.id === sectionId ? { ...sec, items: [...sec.items, item] } : sec
        );
        const allItems = updatedCurriculum.flatMap((sec) => sec.items);
        const lessonsCount = allItems.filter((it) => it.kind === 'lecture').length;
        const tasksCount = allItems.filter((it) => it.kind !== 'lecture').length;
        return {
          ...c,
          curriculum: updatedCurriculum,
          lessonsCount,
          tasksCount,
        };
      });
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase
              .from('courses')
              .update({
                curriculum: target.curriculum,
                lessons_count: target.lessonsCount,
                tasks_count: target.tasksCount,
              })
              .eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  updateCurriculumItem: (courseId, sectionId, item) =>
    set((s) => {
      const courses = s.courses.map((c) => {
        if (c.id !== courseId) return c;
        const updatedCurriculum = c.curriculum.map((sec) =>
          sec.id === sectionId
            ? { ...sec, items: sec.items.map((it) => (it.id === item.id ? item : it)) }
            : sec
        );
        const allItems = updatedCurriculum.flatMap((sec) => sec.items);
        const lessonsCount = allItems.filter((it) => it.kind === 'lecture').length;
        const tasksCount = allItems.filter((it) => it.kind !== 'lecture').length;
        return {
          ...c,
          curriculum: updatedCurriculum,
          lessonsCount,
          tasksCount,
        };
      });
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase
              .from('courses')
              .update({
                curriculum: target.curriculum,
                lessons_count: target.lessonsCount,
                tasks_count: target.tasksCount,
              })
              .eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  deleteCurriculumItem: (courseId, sectionId, itemId) =>
    set((s) => {
      const courses = s.courses.map((c) => {
        if (c.id !== courseId) return c;
        const updatedCurriculum = c.curriculum.map((sec) =>
          sec.id === sectionId ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) } : sec
        );
        const allItems = updatedCurriculum.flatMap((sec) => sec.items);
        const lessonsCount = allItems.filter((it) => it.kind === 'lecture').length;
        const tasksCount = allItems.filter((it) => it.kind !== 'lecture').length;
        return {
          ...c,
          curriculum: updatedCurriculum,
          lessonsCount,
          tasksCount,
        };
      });
      persistData({ ...s, courses });
      const target = courses.find((c) => c.id === courseId);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase
              .from('courses')
              .update({
                curriculum: target.curriculum,
                lessons_count: target.lessonsCount,
                tasks_count: target.tasksCount,
              })
              .eq('id', courseId);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { courses };
    }),

  addSubmission: (sub) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('submissions').upsert({
            id: sub.id,
            student_id: sub.studentId,
            student_email: sub.studentEmail,
            student_name: sub.studentName,
            student_avatar: sub.studentAvatar,
            course_id: sub.courseId,
            course_title: sub.courseTitle,
            task_id: sub.taskId,
            task_title: sub.taskTitle,
            task_kind: sub.taskKind,
            submitted_date: sub.submittedDate,
            status: sub.status,
            score: sub.score,
            max_score: sub.maxScore,
            file_name: sub.fileName,
            file_size: sub.fileSize,
            response_text: sub.responseText,
            feedback: sub.feedback,
            improvement_tips: sub.improvementTips,
          });
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const exists = s.submissions.some((x) => x.id === sub.id);
      const submissions = exists
        ? s.submissions.map((x) => (x.id === sub.id ? sub : x))
        : [sub, ...s.submissions];
      persistData({ ...s, submissions });
      return { submissions };
    });
  },

  gradeSubmission: (id, score, feedback, status, improvementTips) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase
            .from('submissions')
            .update({ score, feedback, status, improvement_tips: improvementTips })
            .eq('id', id);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const targetSub = s.submissions.find((sub) => sub.id === id);
      const submissions = s.submissions.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              score,
              feedback,
              status,
              ...(improvementTips !== undefined && { improvementTips }),
            }
          : sub
      );
      persistData({ ...s, submissions });

      // Notify student via email about the grade
      if (targetSub) {
        import('../../lib/emailService')
          .then(({ notifyAssignmentGraded }) => {
            try {
              const rawUsers = localStorage.getItem('fluentarise_auth_users_v2');
              const users = rawUsers ? JSON.parse(rawUsers) : [];
              const matched = users.find(
                (u: any) =>
                  (targetSub.studentEmail && u.email?.toLowerCase() === targetSub.studentEmail.toLowerCase()) ||
                  u.name?.toLowerCase() === targetSub.studentName?.toLowerCase()
              );
              if (matched?.email || targetSub.studentEmail) {
                notifyAssignmentGraded({
                  studentName: targetSub.studentName,
                  studentEmail: targetSub.studentEmail || matched.email,
                  taskTitle: targetSub.taskTitle,
                  courseTitle: targetSub.courseTitle,
                  score,
                  maxScore: targetSub.maxScore,
                  feedback,
                  improvementTips,
                }).catch(console.warn);
              }
            } catch (err) {
              console.warn('Grade email dispatch note:', err);
            }
          })
          .catch(console.warn);
      }

      return { submissions };
    });
  },

  addOrder: (o) =>
    set((s) => {
      const orders = [o, ...s.orders];
      persistData({ ...s, orders });
      return { orders };
    }),

  updateOrderStatus: (id, status) => {
    if (isSupabaseConfigured) {
      const dbStatus = status === 'paid' ? 'confirmed' : status === 'failed' ? 'cancelled' : 'pending';
      (async () => {
        try {
          await supabase
            .from('orders')
            .update({ status: dbStatus })
            .or(`id.eq.${id},order_number.eq.${id}`);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const orders = s.orders.map((o) => (o.id === id || o.reference === id ? { ...o, status } : o));
      persistData({ ...s, orders });
      return { orders };
    });
  },

  addInstructor: (i) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('instructors').upsert({
            id: i.id,
            name: i.name,
            title: i.title,
            bio: i.bio,
            avatar: i.avatar,
            email: i.email,
            course_ids: i.courseIds,
            rating: i.rating,
            students: i.students,
          });
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const exists = s.instructors.some((x) => x.id === i.id);
      const instructors = exists ? s.instructors.map((x) => (x.id === i.id ? i : x)) : [i, ...s.instructors];
      persistData({ ...s, instructors });
      return { instructors };
    });
  },

  deleteInstructor: (id) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('instructors').delete().eq('id', id);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const instructors = s.instructors.filter((i) => i.id !== id);
      persistData({ ...s, instructors });
      return { instructors };
    });
  },

  addEvent: (e) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('calendar_events').upsert({
            id: e.id,
            title: e.title,
            type: e.type,
            date: e.date,
            start_time: e.startTime,
            end_time: e.endTime,
            instructor: e.instructor,
            instructor_id: e.instructorId,
            course_id: e.courseId,
            course_title: e.courseTitle,
            meeting_url: e.meetingUrl,
            description: e.description,
            capacity: e.capacity,
            enrolled: e.enrolled,
            color: e.color,
            status: e.status || 'upcoming',
          });
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const exists = s.events.some((x) => x.id === e.id);
      const events = exists ? s.events.map((x) => (x.id === e.id ? e : x)) : [e, ...s.events];
      persistData({ ...s, events });
      return { events };
    });
  },

  updateEvent: (id, patch) => {
    set((s) => {
      const events = s.events.map((e) => (e.id === id ? { ...e, ...patch } : e));
      persistData({ ...s, events });
      const target = events.find((e) => e.id === id);
      if (isSupabaseConfigured && target) {
        (async () => {
          try {
            await supabase
              .from('calendar_events')
              .update({
                title: target.title,
                type: target.type,
                date: target.date,
                start_time: target.startTime,
                end_time: target.endTime,
                instructor: target.instructor,
                instructor_id: target.instructorId,
                course_id: target.courseId,
                course_title: target.courseTitle,
                meeting_url: target.meetingUrl,
                description: target.description,
                capacity: target.capacity,
                enrolled: target.enrolled,
                color: target.color,
                status: target.status,
              })
              .eq('id', id);
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { events };
    });
  },

  deleteEvent: (id) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('calendar_events').delete().eq('id', id);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const events = s.events.filter((e) => e.id !== id);
      persistData({ ...s, events });
      return { events };
    });
  },

  addBlogPost: (b) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('blog_posts').upsert({
            id: b.id,
            title: b.title,
            excerpt: b.excerpt,
            body: b.body,
            author: b.author,
            tags: b.tags,
            status: b.status,
            published_at: b.publishedAt,
            cover: b.cover,
          });
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const blogPosts = [b, ...s.blogPosts];
      persistData({ ...s, blogPosts });
      return { blogPosts };
    });
  },

  deleteBlogPost: (id) => {
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('blog_posts').delete().eq('id', id);
        } catch (err) {
          console.warn(err);
        }
      })();
    }
    set((s) => {
      const blogPosts = s.blogPosts.filter((b) => b.id !== id);
      persistData({ ...s, blogPosts });
      return { blogPosts };
    });
  },

  updatePlatformSettings: (patch) => {
    set((s) => {
      const platformSettings = { ...s.platformSettings, ...patch };
      persistData({ ...s, platformSettings });
      if (isSupabaseConfigured) {
        (async () => {
          try {
            await supabase.from('platform_settings').upsert({
              id: 'global',
              settings: platformSettings,
              updated_at: new Date().toISOString(),
            });
          } catch (err) {
            console.warn(err);
          }
        })();
      }
      return { platformSettings };
    });
  },
}));

// Auto-trigger sync on module load if Supabase configured
if (isSupabaseConfigured) {
  useAdminStore.getState().syncFromSupabase();
}
