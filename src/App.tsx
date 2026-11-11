import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Courses from '@/pages/Courses';
import CourseDetails from '@/pages/CourseDetails';
import About from '@/pages/About';
import Events from '@/pages/Events';
import Blog from '@/pages/Blog';
import Contact from '@/pages/Contact';
import Checkout from '@/pages/Checkout';

// Auth
import { AuthProvider } from './auth/AuthProvider';
import AuthPage from './auth/AuthPage';
import ProtectedRoute from './auth/ProtectedRoute';

// Admin Components & Pages (Super Admin)
import AdminLayout from './admin/components/AdminLayout';
import DashboardOverview from './admin/pages/DashboardOverview';
import UserManagement from './admin/pages/UserManagement';
import CourseManagement from './admin/pages/CourseManagement';
import CurriculumBuilder from './admin/pages/CurriculumBuilder';
import AssessmentsHub from './admin/pages/AssessmentsHub';
import SubmissionsGrading from './admin/pages/SubmissionsGrading';
import EnrollmentsOrders from './admin/pages/EnrollmentsOrders';
import Instructors from './admin/pages/Instructors';
import EventsWorkshops from './admin/pages/EventsWorkshops';
import BlogContent from './admin/pages/BlogContent';
import PlatformSettings from './admin/pages/PlatformSettings';

// Instructor Components & Pages
import InstructorLayout from './instructor/components/InstructorLayout';
import InstructorOverview from './instructor/pages/InstructorOverview';
import InstructorCourses from './instructor/pages/InstructorCourses';
import InstructorAssessments from './instructor/pages/InstructorAssessments';
import InstructorSubmissions from './instructor/pages/InstructorSubmissions';
import InstructorStudents from './instructor/pages/InstructorStudents';
import InstructorSessions from './instructor/pages/InstructorSessions';

// Student Components & Pages
import StudentLayout from './student/components/StudentLayout';
import StudentDashboard from './student/pages/StudentDashboard';
import StudentCourses from './student/pages/StudentCourses';
import StudentClassroom from './student/pages/StudentClassroom';
import StudentTasks from './student/pages/StudentTasks';
import StudentCertificates from './student/pages/StudentCertificates';
import StudentOrders from './student/pages/StudentOrders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          {/* INSTRUCTOR PORTAL (Instructors & Super Admin) */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_admin']}>
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

          {/* STUDENT LEARNING HUB (Students & Super Admin) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'super_admin']}>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
