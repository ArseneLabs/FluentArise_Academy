import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  HelpCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export default function StudentDashboard() {
  const { user } = useAuth();

  const enrolledCourses = [
    {
      id: 'c_java',
      title: 'Java & Object-Oriented Programming Mastery',
      instructor: 'Prince Dimpoz',
      progress: 68,
      totalLessons: 32,
      completedLessons: 22,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      nextLesson: 'Polymorphism & Abstract Class Hierarchy',
    },
    {
      id: 'c_english',
      title: 'Professional English Fluency & Public Speaking',
      instructor: 'Amina Uwase',
      progress: 45,
      totalLessons: 24,
      completedLessons: 11,
      thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80',
      nextLesson: 'Business Pitch Presentations & Accent Refinement',
    },
    {
      id: 'c_web',
      title: 'Full-Stack Modern Web Engineering',
      instructor: 'David Mugisha',
      progress: 25,
      totalLessons: 40,
      completedLessons: 10,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      nextLesson: 'Building RESTful APIs & Middleware Routing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-brand-950 via-purple-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-300 backdrop-blur border border-white/10">
            <Sparkles size={13} /> Active Learner
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            You are making steady progress! You have completed 43 lessons across your enrolled courses this month.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/student/courses/c_java"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent-600 transition"
            >
              <Play size={15} fill="currentColor" /> Resume: Java & OOP (Lesson 23)
            </Link>
            <Link
              to="/student/tasks"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <HelpCircle size={15} /> Check Pending Quizzes
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enrolled Courses
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {enrolledCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">All lifetime access</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Lessons
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">43</p>
          <p className="mt-1 text-xs text-slate-500">Across 3 courses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quizzes Passed
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <HelpCircle size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">7</p>
          <p className="mt-1 text-xs text-slate-500">Average score: 88%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Certificates Earned
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">1</p>
          <p className="mt-1 text-xs text-slate-500">Verified credential ready</p>
        </div>
      </div>

      {/* Courses in Progress */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">In-Progress Courses</h2>
            <p className="text-xs text-slate-500">Continue learning right where you left off.</p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            All Courses <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">Instructor: {course.instructor}</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">
                      {course.completedLessons} / {course.totalLessons} Lessons
                    </span>
                    <span className="font-bold text-purple-700">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 truncate">Up Next:</p>
                  <p className="truncate text-slate-500">{course.nextLesson}</p>
                </div>

                <div className="mt-auto pt-4">
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
                  >
                    <Play size={14} fill="currentColor" /> Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
