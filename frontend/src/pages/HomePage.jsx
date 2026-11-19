import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Zap, Shield, MapPin, Camera, TrendingUp, ChevronRight, Star, Package, Wrench } from 'lucide-react'
import { searchParts } from '../api'
import PartCard from '../components/PartCard'
import { LoadingSpinner } from '../components/UI'

const categories = ['Filters', 'Brakes', 'Ignition', 'Suspension', 'Electrical', 'Cooling', 'Fuel System', 'Engine']
const brands = ['Bosch', 'NGK', 'Brembo', 'Monroe', 'Denso', 'Gates', 'Mann-Filter', 'Exide']

const features = [
  { icon: Search, title: 'Smart Search', desc: 'Search by part name, number, brand or vehicle model with instant results.' },
  { icon: Zap, title: 'AI Substitution', desc: 'Find compatible alternative parts that save you money without sacrificing quality.' },
  { icon: Shield, title: 'OEM Verified', desc: 'All parts verified for authenticity with OEM and aftermarket options clearly marked.' },
  { icon: MapPin, title: 'Nearby Shops', desc: 'Real-time stock availability from verified local spare parts shops near you.' },
  { icon: Camera, title: 'Image Recognition', desc: 'Upload a photo of your spare part and our OCR will identify and find it instantly.' },
  { icon: Package, title: 'Easy Reservation', desc: 'Reserve parts without payment. Pick up at your convenience from the shop.' },
]

const steps = [
  { step: '01', title: 'Search or Upload', desc: 'Enter part details or upload a photo of your spare part.' },
  { step: '02', title: 'Compare Options', desc: 'View original parts and AI-suggested compatible alternatives.' },
  { step: '03', title: 'Find Near You', desc: 'See which local shops have it in stock with real-time prices.' },
  { step: '04', title: 'Reserve & Collect', desc: 'Reserve without payment and pick up from the shop when ready.' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredParts, setFeaturedParts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useEffect(() => {
    searchParts({ q: '' })
      .then(res => setFeaturedParts(res.data.results.slice(0, 6)))
      .catch(() => setFeaturedParts([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-electric-700/10 rounded-full blur-3xl" />

        {/* Floating gear icons */}
        <div className="absolute top-20 right-20 opacity-10 animate-float">
          <Wrench className="w-32 h-32 text-electric-400" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-5 animate-float" style={{ animationDelay: '2s' }}>
          <Package className="w-24 h-24 text-electric-300" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-500/10 border border-electric-500/30 mb-8 animate-slide-up">
              <Zap className="w-4 h-4 text-electric-400" />
              <span className="text-electric-300 text-sm font-medium">AI-Powered Spare Parts Platform</span>
              <span className="badge-green text-xs">Technology for Social Good</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
              Find the Right
              <br />
              <span className="gradient-text text-shadow">Spare Part</span>
              <br />
              <span className="text-gray-300">Instantly</span>
            </h1>

            <p className="text-gray-400 text-xl max-w-2xl mb-10 leading-relaxed animate-slide-up">
              AI-powered spare part substitution, real-time shop availability, and intelligent price comparison — all in one platform for India's automobile repair ecosystem.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by part name, number, brand, or vehicle model..."
                  className="w-full pl-14 pr-6 py-5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:bg-white/10 text-lg transition-all"
                />
              </div>
              <button type="submit" className="btn-primary py-5 px-8 text-lg rounded-2xl flex items-center gap-2 whitespace-nowrap">
                <Search className="w-5 h-5" />
                Search Now
              </button>
            </form>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-2 animate-slide-up">
              <span className="text-gray-400 text-sm py-2">Quick Browse:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => navigate(`/search?category=${cat}`)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-electric-500/20 border border-white/10 hover:border-electric-500/30 text-gray-300 hover:text-electric-400 text-sm transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[
              { value: '30+', label: 'Spare Parts' },
              { value: '10+', label: 'Partner Shops' },
              { value: '8', label: 'Categories' },
              { value: 'AI', label: 'Substitution Engine' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <p className="font-display text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="py-24 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-blue mb-4">Why SPARE FINDER</span>
            <h2 className="section-heading mt-3">Everything You Need</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              A complete automobile spare parts ecosystem powered by AI and real-time data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-7 hover:border-electric-500/30 transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center mb-5 group-hover:bg-electric-500/20 transition-colors">
                  <f.icon className="w-7 h-7 text-electric-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-green mb-4">Simple Process</span>
            <h2 className="section-heading mt-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="glass-card p-7 h-full hover:border-electric-500/30 transition-all hover:-translate-y-1">
                  <div className="font-display text-5xl font-black text-electric-500/20 mb-4">{s.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-5 w-8 h-8 text-electric-500/30 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PARTS ────────────────────────── */}
      <section className="py-24 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-blue mb-3">Parts Catalog</span>
              <h2 className="section-heading mt-3">Featured Spare Parts</h2>
            </div>
            <Link to="/search" className="btn-secondary flex items-center gap-2 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured parts..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/search" className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-8">
              <TrendingUp className="w-5 h-5" />
              Browse All Parts
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRANDS ───────────────────────────────── */}
      <section className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm mb-8">TRUSTED BRANDS</p>
          <div className="flex flex-wrap justify-center gap-6">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => navigate(`/search?brand=${brand}`)}
                className="px-6 py-3 glass-card hover:border-electric-500/30 hover:text-electric-400 text-gray-400 font-semibold text-sm transition-all hover:-translate-y-0.5"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-500/10 to-electric-700/5" />
            <div className="relative">
              <Zap className="w-16 h-16 text-electric-400 mx-auto mb-6 animate-pulse-slow" />
              <h2 className="section-heading mb-4">Ready to Find Your Spare Part?</h2>
              <p className="text-gray-400 mb-8 text-lg">
                Use AI-powered substitution to save up to 40% on spare parts without compromising quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/search" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-lg">
                  <Search className="w-5 h-5" /> Start Searching
                </Link>
                <Link to="/upload" className="btn-secondary flex items-center justify-center gap-2 py-4 px-8 text-lg">
                  <Camera className="w-5 h-5" /> Upload Image
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
