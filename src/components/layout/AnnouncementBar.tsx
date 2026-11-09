import { Link } from 'react-router-dom';
import { Phone, Mail, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="gradient-brand text-white text-sm">
      <div className="container-page flex h-10 items-center justify-between gap-4">
        <div className="hidden items-center gap-5 sm:flex">
          <a href="tel:+0002356222" className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span>+000-2356-222</span>
          </a>
          <a href="mailto:contact@fluentarise.com" className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span>contact@fluentarise.com</span>
          </a>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 ml-auto sm:ml-0">
          <Link to="/contact" className="hidden items-center gap-1.5 text-white/85 hover:text-white transition-colors sm:flex">
            <LogIn className="h-3.5 w-3.5" />
            <span>Login</span>
          </Link>
          <Link to="/contact" className="hidden items-center gap-1.5 text-white/85 hover:text-white transition-colors sm:flex">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </Link>
          <Link
            to="/courses"
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-1.5 font-semibold text-white hover:bg-accent-600 transition-colors"
          >
            Apply Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
