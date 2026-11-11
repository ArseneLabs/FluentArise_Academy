import { useState } from 'react';
import { Users, Search, GraduationCap, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  avatar: string;
  lastActive: string;
}

const mockStudents: EnrolledStudent[] = [
  {
    id: 's1',
    name: 'Jean Eric Mugabo',
    email: 'student@fluentarise.com',
    course: 'Java & OOP Foundations',
    progress: 72,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    lastActive: 'Today, 10:45 AM',
  },
  {
    id: 's2',
    name: 'Marie Claire Uwera',
    email: 'm.claire@example.com',
    course: 'Professional English Fluency',
    progress: 88,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    lastActive: 'Yesterday',
  },
  {
    id: 's3',
    name: 'Kevin Ndoli',
    email: 'k.ndoli@example.com',
    course: 'Java & OOP Foundations',
    progress: 45,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    lastActive: '3 days ago',
  },
  {
    id: 's4',
    name: 'Diane Gasana',
    email: 'diane.g@example.com',
    course: 'Full Stack Web Development',
    progress: 60,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    lastActive: '2 days ago',
  },
];

export default function InstructorStudents() {
  const [search, setSearch] = useState('');

  const filtered = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">My Students</h1>
          <p className="text-sm text-slate-500">
            Learners actively enrolled in your courses.
          </p>
        </div>

        <div className="relative min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search learner name or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 transition shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrolled Course</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.course}</td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{s.progress}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500">{s.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
