import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Star,
  Users,
  ListTree,
  Calendar,
  FileCheck2,
  Lock,
  Eye,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAdminStore } from '../../admin/store/adminStore';
import { useAuth } from '../../auth/AuthProvider';
import Modal from '../../admin/components/ui/Modal';
import { formatRwf } from '../../admin/lib/format';
import type { Course } from '../../admin/types';

export default function InstructorCourses() {
  const { user } = useAuth();
  const { courses, instructors } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'my_courses' | 'other_courses'>('my_courses');
  const [aboutModalCourse, setAboutModalCourse] = useState<Course | null>(null);

  // 1. Courses assigned to this instructor
  const myCourses = useMemo(() => {
    return courses.filter(
      (c) => c.instructorId === user?.id || c.instructorId === user?.instructorId
    );
  }, [courses, user]);

  // 2. Other courses (not assigned to this instructor)
  const otherCourses = useMemo(() => {
    const myIds = new Set(myCourses.map((c) => c.id));
    return courses.filter((c) => !myIds.has(c.id));
  }, [courses, myCourses]);

  const getInstructorName = (instructorId: string) => {
    const ins = instructors.find((i) => i.id === instructorId);
    return ins?.name || 'Academy Staff';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Course Management</h1>
          <p className="text-sm text-slate-500">
            Manage curriculum, materials, and student evaluations for your assigned courses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my_courses')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 'my_courses'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={16} /> My Assigned Courses ({myCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('other_courses')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 'other_courses'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye size={16} /> Other Academy Courses (Overview Only) ({otherCourses.length})
        </button>
      </div>

      {/* TAB 1: MY ASSIGNED COURSES */}
      {activeTab === 'my_courses' && (
        <div>
          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-display text-base font-bold text-slate-800">
                No courses assigned yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You do not currently have any assigned courses. Super Admins assign lead instructors to courses in the Academy management console.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {c.category}
                    </span>
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        c.published ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {c.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                      {c.title}
                    </h3>

                    {c.shortDescription && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                        {c.shortDescription}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{c.lessonsCount || 0}</p>
                        <p className="text-slate-400 text-[10px]">Lessons</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{c.tasksCount || 0}</p>
                        <p className="text-slate-400 text-[10px]">Tasks</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{c.studentsCount || 0}</p>
                        <p className="text-slate-400 text-[10px]">Students</p>
                      </div>
                    </div>

                    {/* Instructor Actions */}
                    <div className="mt-5 space-y-2">
                      <Link
                        to={`/instructor/courses/${c.id}/curriculum`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                      >
                        <ListTree size={14} /> Manage Content & Curriculum
                      </Link>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          to={`/instructor/students?courseId=${c.id}`}
                          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Users size={13} /> Enrolled Students
                        </Link>
                        <Link
                          to={`/instructor/submissions?courseId=${c.id}`}
                          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <FileCheck2 size={13} /> Tasks & Grading
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OTHER ACADEMY COURSES (READ-ONLY OVERVIEW) */}
      {activeTab === 'other_courses' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-start gap-2.5">
            <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong>Read-Only Course Catalog:</strong> As an instructor, you can review details and syllabus structure for courses taught by your faculty colleagues. Content editing and student grading permissions are reserved exclusively for the assigned instructor and Super Admin.
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherCourses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition opacity-95"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="h-full w-full object-cover grayscale-[20%]"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {c.category}
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur flex items-center gap-1">
                    <Lock size={11} /> Read-Only
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-base font-bold text-slate-900 line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium mt-1">
                    Lead Instructor: {getInstructorName(c.instructorId)}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span>{c.lessonsCount || 0} Lessons</span>
                    <span>Level: {c.level}</span>
                    <span>{c.free ? 'Free' : formatRwf(c.discountPrice || c.price)}</span>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => setAboutModalCourse(c)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye size={14} /> View Course Details & Syllabus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* READ-ONLY ABOUT COURSE MODAL */}
      {aboutModalCourse && (
        <Modal
          open={Boolean(aboutModalCourse)}
          onClose={() => setAboutModalCourse(null)}
          title={`About Course: ${aboutModalCourse.title}`}
          subtitle={`Lead Instructor: ${getInstructorName(aboutModalCourse.instructorId)} · ${aboutModalCourse.category}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Lock size={13} /> Read-only overview for non-assigned instructors
              </span>
              <button className="btn-primary" onClick={() => setAboutModalCourse(null)}>
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Course Summary & Objectives
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {aboutModalCourse.overview ||
                  aboutModalCourse.shortDescription ||
                  'No extended description published for this course.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-800">{aboutModalCourse.lessonsCount || 0}</p>
                <p className="text-slate-400 text-[10px] uppercase">Curriculum Lessons</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-800">{aboutModalCourse.tasksCount || 0}</p>
                <p className="text-slate-400 text-[10px] uppercase">Quizzes & Tasks</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-800">{aboutModalCourse.level}</p>
                <p className="text-slate-400 text-[10px] uppercase">Proficiency Level</p>
              </div>
            </div>

            {/* Syllabus Outline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Syllabus Outline (Modules: {(aboutModalCourse.curriculum || []).length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(aboutModalCourse.curriculum || []).map((sec, i) => (
                  <div key={sec.id} className="rounded-xl border border-slate-200 p-3 text-xs">
                    <p className="font-bold text-slate-800">Section {i + 1}: {sec.title}</p>
                    <ul className="mt-1.5 space-y-1 text-slate-500 pl-4 list-disc text-[11px]">
                      {sec.items.map((item) => (
                        <li key={item.id}>
                          <span className="font-medium text-slate-700">{item.title}</span> ({item.kind})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
