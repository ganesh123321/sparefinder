import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Zap, ArrowRight, TrendingDown, CheckCircle, AlertCircle, Search, ChevronRight, Shield, Package } from 'lucide-react'
import { getSubstitutes, searchParts } from '../api'
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI'

export default function SubstitutionPage() {
  const { partId } = useParams()
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (partId) loadSubstitutes(partId)
  }, [partId])

  const loadSubstitutes = async (id) => {
    setLoading(true); setError('')
    try {
      const res = await getSubstitutes(id)
      setData(res.data)
    } catch (err) {
      setError('Failed to load substitutes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setSearching(true)
    try {
      const res = await searchParts({ q: input, part_number: input })
      setSearchResults(res.data.results)
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  const selectPart = (part) => {
    navigate(`/substitution/${part.id}`)
    setSearchResults([])
    setInput('')
  }

  const getCompatibilityColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/30'
    if (score >= 75) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
  }

  return (
    <div>
      <PageHeader
        title="AI Spare Substitution"
        subtitle="Find compatible alternative parts and save money intelligently"
        icon={Zap}
        breadcrumb="Home / AI Substitution"
      />

      <div className="page-container">
        {/* Search Bar */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Enter Part Number or Name</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. OIL-FILT-001 or Bosch Oil Filter..."
                className="input-field pl-12"
              />
            </div>
            <button type="submit" disabled={searching} className="btn-primary flex items-center gap-2 px-6">
              {searching ? <div className="spinner w-4 h-4" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search className="w-4 h-4" />}
              Find Part
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-3 border border-white/10 rounded-xl overflow-hidden animate-fade-in">
              <p className="text-gray-400 text-xs px-4 py-2 bg-white/5 border-b border-white/10">
                Select a part to find substitutes:
              </p>
              {searchResults.slice(0, 6).map(part => (
                <button
                  key={part.id}
                  onClick={() => selectPart(part)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{part.name}</p>
                    <p className="text-gray-400 text-xs">{part.part_number} · {part.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-electric-400 font-semibold">₹{part.price?.toLocaleString()}</p>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner text="AI analyzing compatible substitutes..." />}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-6 border-red-500/30 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="animate-fade-in">
            {/* Original Part */}
            <div className="glass-card p-6 mb-6 border-electric-500/30">
              <div className="flex items-start gap-6">
                <img
                  src={data.original.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                  alt={data.original.name}
                  className="w-24 h-24 object-cover rounded-xl"
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200'}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-electric-400 font-mono mb-1">ORIGINAL PART</p>
                      <h2 className="text-white text-xl font-bold mb-1">{data.original.name}</h2>
                      <p className="text-gray-400 text-sm">{data.original.part_number} · {data.original.brand}</p>
                      <p className="text-gray-400 text-sm">{data.original.vehicle_make} – {data.original.vehicle_model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs mb-1">Original Price</p>
                      <p className="text-electric-400 font-bold text-2xl">₹{data.original.price?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Substitutes */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Zap className="w-5 h-5 text-electric-400" />
                <h2 className="text-white font-bold text-lg">
                  {data.total_substitutes} AI-Recommended Substitutes
                </h2>
                <span className="badge-green text-xs">Compatible</span>
              </div>

              {data.substitutes.length === 0 ? (
                <EmptyState
                  icon="🤖"
                  title="No Substitutes Found"
                  description="No compatible substitutes are available for this specific part. Try searching for related parts."
                />
              ) : (
                <div className="space-y-5">
                  {data.substitutes.map((sub, i) => {
                    const savings = data.original.price - sub.price
                    return (
                      <div key={sub.id} className="glass-card p-6 hover:border-electric-500/30 transition-all">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <img
                            src={sub.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                            alt={sub.name}
                            className="w-20 h-20 object-cover rounded-xl shrink-0"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200'}
                          />
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500 font-mono">#{i + 1}</span>
                                  {sub.is_oem ? (
                                    <span className="badge-green text-xs"><Shield className="w-3 h-3" /> OEM</span>
                                  ) : (
                                    <span className="badge-blue text-xs"><Package className="w-3 h-3" /> Aftermarket</span>
                                  )}
                                  <span className={`badge text-xs ${getCompatibilityColor(sub.compatibility_score)}`}>
                                    <CheckCircle className="w-3 h-3" /> {sub.compatibility_score}% Compatible
                                  </span>
                                </div>
                                <h3 className="text-white font-semibold text-lg">{sub.name}</h3>
                                <p className="text-gray-400 text-sm">{sub.part_number} · {sub.brand}</p>
                                <p className="text-gray-400 text-sm mt-1">{sub.vehicle_make} – {sub.vehicle_model}</p>
                              </div>

                              {/* Pricing Comparison */}
                              <div className="glass-card p-4 min-w-56">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Original</p>
                                    <p className="text-gray-300 font-semibold">₹{data.original.price?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Substitute</p>
                                    <p className="text-electric-400 font-bold">₹{sub.price?.toLocaleString()}</p>
                                  </div>
                                </div>
                                {savings > 0 && (
                                  <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                    <div className="flex items-center justify-center gap-1 text-green-400">
                                      <TrendingDown className="w-4 h-4" />
                                      <span className="font-bold">Save ₹{savings.toLocaleString()}</span>
                                    </div>
                                    <p className="text-green-500 text-xs">{sub.savings_percent}% cheaper</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                              {sub.description || `Compatible substitute for ${data.original.name}. Meets OEM specifications.`}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Link to={`/spare/${sub.id}`} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1">
                                View Details
                              </Link>
                              <Link to={`/shops/${sub.id}`} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Find in Shops
                              </Link>
                              <Link to={`/reserve/${sub.id}`} className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                                Reserve Now <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info box */}
        {!data && !loading && (
          <div className="glass-card p-10 text-center">
            <Zap className="w-20 h-20 text-electric-400 mx-auto mb-6 animate-pulse-slow" />
            <h3 className="text-white text-2xl font-bold mb-3">AI-Powered Substitution Engine</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              Enter a part number or name above to find compatible alternative parts. Our AI analyzes vehicle compatibility, physical dimensions, and specifications to suggest safe substitutes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                { icon: CheckCircle, title: 'Cross-Reference Check', desc: 'Matches part numbers across manufacturers' },
                { icon: Shield, title: 'Safety Verified', desc: 'Only recommends truly compatible parts' },
                { icon: TrendingDown, title: 'Price Comparison', desc: 'Shows exact savings vs. original' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-5">
                  <item.icon className="w-6 h-6 text-electric-400 mb-3" />
                  <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// fix missing import
import { MapPin } from 'lucide-react'
