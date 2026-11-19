import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white">SPARE</span>
                <span className="font-display font-bold text-lg text-electric-400">FINDER</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              AI-Powered Spare Parts Substitution & Availability System. Find, compare, and reserve automobile spare parts intelligently.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-electric-500/20 border border-white/10 hover:border-electric-500/30 flex items-center justify-center transition-all group">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-electric-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Search Spare Parts', path: '/search' },
                { label: 'AI Substitution', path: '/substitution' },
                { label: 'Know Your Spare', path: '/know-your-spare' },
                { label: 'Upload Image', path: '/upload' },
                { label: 'Nearby Shops', path: '/shops' },
                { label: 'Reserve Parts', path: '/reserve' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-electric-400 text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Part Categories</h3>
            <ul className="space-y-3">
              {['Filters', 'Brakes', 'Ignition', 'Suspension', 'Electrical', 'Cooling', 'Fuel System', 'Engine Belts'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/search?category=${cat}`}
                    className="text-gray-400 hover:text-electric-400 text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-electric-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">IIT Madras Research Park, Chennai, Tamil Nadu 600036</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-electric-400 shrink-0" />
                <a href="tel:+914428574000" className="text-gray-400 hover:text-electric-400 text-sm transition-colors">+91 44 2857 4000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-electric-400 shrink-0" />
                <a href="mailto:info@sparefinder.in" className="text-gray-400 hover:text-electric-400 text-sm transition-colors">info@sparefinder.in</a>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-electric-500/10 border border-electric-500/20 rounded-xl">
              <p className="text-xs text-electric-300 font-medium mb-1">B.Tech IT Final Year Project</p>
              <p className="text-xs text-gray-400">Technology for Social Good — 2026</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 SPARE FINDER. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Built with React, Flask & SQLite</p>
        </div>
      </div>
    </footer>
  )
}
