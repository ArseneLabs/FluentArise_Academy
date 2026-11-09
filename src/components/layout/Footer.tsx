import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Courses', to: '/courses' },
      { label: 'Events', to: '/events' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'English Fluency', to: '/courses' },
      { label: 'Java & OOP', to: '/courses' },
      { label: 'Web Development', to: '/courses' },
      { label: 'Exam Prep', to: '/courses' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'FAQs', to: '/about' },
      { label: 'Become an Instructor', to: '/about' },
      { label: 'Career Fair', to: '/events' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="gradient-brand text-white">
      {/* Instructor CTA */}
      <div className="border-b border-white/10">
        <div className="container-page py-10">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 md:flex-row md:p-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold">Become an Instructor</h3>
              <p className="mt-2 max-w-xl text-white/75">
                Share your expertise with thousands of learners across East Africa. Join FluentaRise as an instructor and build your own course.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-accent px-6 py-3 text-sm font-bold text-white shadow-accent hover:opacity-95 transition"
            >
              Start Teaching Today <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/Gemini_Generated_Image_77j82y77j82y77j8.jpg" alt="FluentaRise logo" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-lg font-extrabold tracking-tight">
                Fluenta<span className="text-accent-400">Rise</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Elevating communication and tech skills across East Africa. Live online English classes, flexible tech courses, and career-ready training.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/75">
              <a href="tel:+250795041000" className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 text-accent-400" /> 0795041000
              </a>
              <a href="mailto:kjmicheline@gmail.com" className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 text-accent-400" /> kjmicheline@gmail.com
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-400" /> Kigali, Rwanda, Opposite MIC Building, KN 2 Ave
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/65 hover:text-accent-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} FluentaRise. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-accent-500 hover:text-white transition-colors"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
