import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white">FindIt AI</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lost Something? Let&apos;s Find It. The smart algorithmic lost &amp; found matching platform
              protecting student belongings across campus.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Campus Security Integrated</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-cyan-400 transition">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-cyan-400 transition">
                  Potential Matches
                </Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-cyan-400 transition">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="hover:text-cyan-400 transition">
                  Report a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Hubs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Campus Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Central Library Desk</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Student Union Info Center</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Campus Police &amp; Security HQ</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Athletics &amp; Gym Reception</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Support &amp; Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>lostandfound@campus.edu</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>+1 (555) 019-LOST (5678)</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                End-to-End Privacy: Private verification details are never published publicly.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} FindIt AI – Smart Lost &amp; Found Matcher. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privacy Shield Protected</span>
            <span>&bull;</span>
            <span>Campus Community First</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
