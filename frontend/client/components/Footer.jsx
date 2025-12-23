import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#4A70A9] text-white border-t border-[#8FABD4]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="BeyondBooks Logo" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-white">BeyondBooks</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Your comprehensive platform for student activities, research opportunities, and campus engagement at Lebanese American University.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/80 text-sm">
                <Mail className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <span>support@beyondbooks.lau.edu</span>
              </li>
              <li className="flex items-start gap-3 text-white/80 text-sm">
                <Phone className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <span>+961 1 374 374</span>
              </li>
              <li className="flex items-start gap-3 text-white/80 text-sm">
                <MapPin className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <span>Lebanese American University<br />Beirut, Lebanon</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm text-center md:text-left">
              © {currentYear} BeyondBooks - Lebanese American University. All rights reserved.
            </p>
            <p className="text-white/70 text-xs text-center md:text-right">
              Building connections, fostering growth, and advancing knowledge together.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
