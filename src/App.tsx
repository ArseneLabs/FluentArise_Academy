import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import PageLoader from '@/components/ui/PageLoader';

// Auth
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';

// Public Academy Routes (Code-split for fast initial page load)
const Home = lazy(() => import('@/pages/Home'));
const Courses = lazy(() => import('@/pages/Courses'));
const CourseDetails = lazy(() => import('@/pages/CourseDetails'));
const About = lazy(() => import('@/pages/About'));
const Events = lazy(() => import('@/pages/Events'));
const Blog = lazy(() => import('@/pages/Blog'));
const Contact = lazy(() => import('@/pages/Contact'));
const Checkout = lazy(() => import('@/pages/Checkout'));

// Authentication Gateway
const AuthPage = lazy(() => import('./auth/AuthPage'));

// Super Admin Workspace
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const DashboardOverview = lazy(() => import('./admin/pages/DashboardOverview'));
const UserManagement = lazy(() => import('./admin/pages/UserManagement'));
const CourseManagement = lazy(() => import('./admin/pages/CourseManagement'));
const CurriculumBuilder = lazy(() => import('./admin/pages/CurriculumBuilder'));
const AssessmentsHub = lazy(() => import('./admin/pages/AssessmentsHub'));
const SubmissionsGrading = lazy(() => import('./admin/pages/SubmissionsGrading'));
const EnrollmentsOrders = lazy(() => import('./admin/pages/EnrollmentsOrders'));
const Instructors = lazy(() => import('./admin/pages/Instructors'));
const EventsWorkshops = lazy(() => import('./admin/pages/EventsWorkshops'));
const BlogContent = lazy(() => import('./admin/pages/BlogContent'));
const PlatformSettings = lazy(() => import('./admin/pages/PlatformSettings'));

// Instructor Portal
const InstructorLayout = lazy(() => import('./instructor/components/InstructorLayout'));
const InstructorOverview = lazy(() => import('./instructor/pages/InstructorOverview'));
const InstructorCourses = lazy(() => import('./instructor/pages/InstructorCourses'));
const InstructorAssessments = lazy(() => import('./instructor/pages/InstructorAssessments'));
const InstructorSubmissions = lazy(() => import('./instructor/pages/InstructorSubmissions'));
const InstructorStudents = lazy(() => import('./instructor/pages/InstructorStudents'));
const InstructorSessions = lazy(() => import('./instructor/pages/InstructorSessions'));

// Student Learning Hub
const StudentLayout = lazy(() => import('./student/components/StudentLayout'));
const StudentDashboard = lazy(() => import('./student/pages/StudentDashboard'));
const StudentCourses = lazy(() => import('./student/pages/StudentCourses'));
const StudentClassroom = lazy(() => import('./student/pages/StudentClassroom'));
const StudentTasks = lazy(() => import('./student/pages/StudentTasks'));
const StudentCertificates = lazy(() => import('./student/pages/StudentCertificates'));
const StudentOrders = lazy(() => import('./student/pages/StudentOrders'));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Academy Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>

              {/* Authentication Gateway */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />

              {/* SUPER ADMIN WORKSPACE (Super Admin Only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="courses/:id/curriculum" element={<CurriculumBuilder />} />
                <Route path="assessments" element={<AssessmentsHub />} />
                <Route path="submissions" element={<SubmissionsGrading />} />
                <Route path="enrollments" element={<EnrollmentsOrders />} />
                <Route path="instructors" element={<Instructors />} />
                <Route path="events" element={<EventsWorkshops />} />
                <Route path="blog" element={<BlogContent />} />
                <Route path="settings" element={<PlatformSettings />} />
              </Route>

              {/* INSTRUCTOR PORTAL (Instructors Only) */}
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<InstructorOverview />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="assessments" element={<InstructorAssessments />} />
                <Route path="submissions" element={<InstructorSubmissions />} />
                <Route path="students" element={<InstructorStudents />} />
                <Route path="sessions" element={<InstructorSessions />} />
              </Route>

              {/* STUDENT LEARNING HUB (Students Only) */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="courses/:id" element={<StudentClassroom />} />
                <Route path="tasks" element={<StudentTasks />} />
                <Route path="certificates" element={<StudentCertificates />} />
                <Route path="orders" element={<StudentOrders />} />
              </Route>

              {/* Fallback to homepage */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
