import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Zap, Settings, ChevronDown } from 'lucide-react'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Search Parts', path: '/search' },
  { label: 'AI Substitution', path: '/substitution' },
  { label: 'Know Your Spare', path: '/know-your-spare' },
  { label: 'Upload Image', path: '/upload' },
  { label: 'Nearby Shops', path: '/shops' },
  { label: 'Reserve', path: '/reserve' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white leading-none">SPARE</span>
              <span className="font-display font-bold text-lg text-electric-400 leading-none">FINDER</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-electric-500/20 text-electric-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search..."
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 w-44 transition-all focus:w-56"
                />
              </div>
            </form>

            <Link
              to="/admin"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/30 text-electric-400 text-sm font-medium transition-all"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-navy-950/95 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts..."
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 w-full"
                />
              </div>
              <button type="submit" className="btn-primary py-2 px-4 text-sm">Go</button>
            </form>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-electric-500/20 text-electric-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-electric-400 hover:bg-electric-500/10 transition-colors"
            >
              <Settings className="w-4 h-4" /> Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
