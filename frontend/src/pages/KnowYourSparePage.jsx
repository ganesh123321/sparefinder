import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BookOpen, Zap, MapPin, ShoppingCart, Wrench, AlertTriangle, CheckCircle, ChevronRight, Search } from 'lucide-react'
import { getSpareDetail, searchParts } from '../api'
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI'

export default function KnowYourSparePage() {
  const { partId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (partId) loadPart(partId)
  }, [partId])

  const loadPart = async (id) => {
    setLoading(true); setError('')
    try {
      const res = await getSpareDetail(id)
      setData(res.data)
    } catch {
      setError('Part not found.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setSearching(true)
    try {
      const res = await searchParts({ q: input })
      setSearchResults(res.data.results)
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  const part = data?.part

  return (
    <div>
      <PageHeader
        title="Know Your Spare"
        subtitle="Complete information, functions, and maintenance tips"
        icon={BookOpen}
        breadcrumb="Home / Know Your Spare"
      />

      <div className="page-container">
        {/* Search */}
        {!part && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Search for a Spare Part</h2>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter part name or number..."
                  className="input-field pl-12"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 px-6">
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="mt-3 border border-white/10 rounded-xl overflow-hidden animate-fade-in">
                {searchResults.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => { navigate(`/spare/${p.id}`); setSearchResults([]) }}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{p.name}</p>
                      <p className="text-gray-400 text-xs">{p.part_number} · {p.brand}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && <LoadingSpinner text="Loading part information..." />}
        {error && !loading && (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
            <p className="text-orange-300">{error}</p>
          </div>
        )}

        {part && !loading && (
          <div className="animate-fade-in">
            {/* Back button */}
            <button onClick={() => { setData(null); navigate('/know-your-spare') }} className="flex items-center gap-2 text-gray-400 hover:text-electric-400 mb-6 transition-colors text-sm">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Search
            </button>

            {/* Part Header */}
            <div className="glass-card p-8 mb-6 border-electric-500/20">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="relative">
                  <img
                    src={part.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'}
                    alt={part.name}
                    className="w-full md:w-64 h-56 object-cover rounded-2xl"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300'}
                  />
                  {part.is_oem ? (
                    <span className="absolute top-3 left-3 badge-green">OEM Verified</span>
                  ) : (
                    <span className="absolute top-3 left-3 badge-blue">Aftermarket</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge-blue">{part.category}</span>
                    <span className="badge text-xs bg-white/5 border border-white/10 text-gray-400">Warranty: {part.warranty || 'N/A'}</span>
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white mb-2">{part.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400 text-sm font-mono">{part.part_number}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400 text-sm">{part.brand}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-5">{part.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Vehicle Make', value: part.vehicle_make },
                      { label: 'Vehicle Model', value: part.vehicle_model },
                      { label: 'Year Range', value: part.year_range },
                      { label: 'Weight', value: part.weight || 'N/A' },
                    ].map(item => (
                      <div key={item.label} className="glass-card p-3">
                        <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                        <p className="text-white text-sm font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs">Price</span>
                      <span className="text-electric-400 font-bold text-2xl">₹{part.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center ml-auto">
                      <Link to={`/substitution/${part.id}`} className="btn-secondary flex items-center gap-2 text-sm py-2.5">
                        <Zap className="w-4 h-4 text-electric-400" /> Find Alternatives
                      </Link>
                      <Link to={`/shops/${part.id}`} className="btn-secondary flex items-center gap-2 text-sm py-2.5">
                        <MapPin className="w-4 h-4" /> Check Shops
                      </Link>
                      <Link to={`/reserve/${part.id}`} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                        <ShoppingCart className="w-4 h-4" /> Reserve Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 glass-card p-1 overflow-x-auto">
              {['overview', 'specifications', 'problems', 'maintenance'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max px-5 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-electric-500/20 text-electric-400 border border-electric-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="glass-card p-6 animate-fade-in">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-electric-400" /> Function & Purpose
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {part.function_desc || part.description || 'This part plays a critical role in your vehicle\'s operation. Consult your vehicle manual for specific details.'}
                  </p>

                  {data.availability?.length > 0 && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-green-400 font-semibold flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4" /> Available at {data.total_shops} shop{data.total_shops !== 1 ? 's' : ''}
                      </p>
                      <p className="text-gray-400 text-sm">
                        From ₹{Math.min(...data.availability.map(a => a.selling_price)).toLocaleString()} to ₹{Math.max(...data.availability.map(a => a.selling_price)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Technical Specifications</h3>
                  {part.specifications && Object.keys(part.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(part.specifications).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                          <span className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-white font-semibold text-sm">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Dimensions', value: part.dimensions || 'N/A' },
                        { label: 'Weight', value: part.weight || 'N/A' },
                        { label: 'Material', value: part.material || 'N/A' },
                        { label: 'Warranty', value: part.warranty || 'N/A' },
                      ].map(item => (
                        <div key={item.label} className="p-4 bg-white/3 rounded-xl border border-white/5">
                          <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                          <p className="text-white font-semibold text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'problems' && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" /> Common Problems & Symptoms
                  </h3>
                  <div className="space-y-3">
                    {(part.common_problems || 'Wear and tear, performance degradation').split(',').map((prob, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <p className="text-gray-300 text-sm">{prob.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-electric-400" /> Maintenance Tips
                  </h3>
                  <div className="space-y-3">
                    {(part.maintenance_tips || 'Follow manufacturer service intervals').split('.').filter(t => t.trim()).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-electric-500/5 border border-electric-500/10 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-electric-400 mt-0.5 shrink-0" />
                        <p className="text-gray-300 text-sm">{tip.trim()}.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!part && !loading && !error && (
          <div className="glass-card p-16 text-center">
            <BookOpen className="w-20 h-20 text-electric-400 mx-auto mb-6 animate-pulse-slow" />
            <h3 className="text-white text-2xl font-bold mb-3">Know Your Spare Part</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              Search for any automobile spare part to learn about its function, specifications, common problems, and maintenance tips.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Oil Filter', 'Brake Pad', 'Spark Plug', 'Shock Absorber', 'Battery'].map(term => (
                <Link
                  key={term}
                  to={`/know-your-spare?search=${encodeURIComponent(term)}`}
                  className="px-5 py-2 glass-card hover:border-electric-500/30 text-gray-300 hover:text-electric-400 text-sm transition-all"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
