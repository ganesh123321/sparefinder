import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Search, Filter, X, Zap, Eye, ShoppingCart, SlidersHorizontal } from 'lucide-react'
import { searchParts } from '../api'
import PartCard from '../components/PartCard'
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI'

const categories = ['All', 'Filters', 'Brakes', 'Ignition', 'Suspension', 'Electrical', 'Cooling', 'Fuel System', 'Engine', 'Wipers', 'Fluids']
const brands = ['All', 'Bosch', 'NGK', 'Brembo', 'Monroe', 'Denso', 'Gates', 'Mann-Filter', 'Exide', 'Amaron', 'K&N', 'Minda', 'Gabriel', 'Valeo', 'Continental']
const makes = ['All', 'Maruti Suzuki', 'Honda', 'Toyota', 'Hyundai', 'Universal']

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [brand, setBrand] = useState(params.get('brand') || '')
  const [vehicleMake, setVehicleMake] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchParts({
        q: query,
        category: category === 'All' ? '' : category,
        brand: brand === 'All' ? '' : brand,
        model: vehicleMake === 'All' ? '' : vehicleMake,
        part_number: partNumber,
      })
      setResults(res.data.results)
    } catch (err) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Auto search when URL params change
  useEffect(() => {
    const q = params.get('q') || ''
    const cat = params.get('category') || ''
    const br = params.get('brand') || ''
    setQuery(q); setCategory(cat); setBrand(br)
    if (q || cat || br) {
      setLoading(true); setSearched(true)
      searchParts({ q, category: cat === 'All' ? '' : cat, brand: br === 'All' ? '' : br })
        .then(res => setResults(res.data.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }
  }, [params])

  const handleSearch = (e) => {
    e.preventDefault()
    doSearch()
  }

  const clearFilters = () => {
    setQuery(''); setCategory(''); setBrand(''); setVehicleMake(''); setPartNumber('')
    setResults([]); setSearched(false)
  }

  return (
    <div>
      <PageHeader
        title="Search Spare Parts"
        subtitle="Find parts by name, number, brand, or vehicle model"
        icon={Search}
        breadcrumb="Home / Search"
      />

      <div className="page-container">
        {/* Search Bar */}
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, description..."
                  className="input-field pl-12"
                />
              </div>
              <div className="relative md:w-48">
                <input
                  type="text"
                  value={partNumber}
                  onChange={e => setPartNumber(e.target.value)}
                  placeholder="Part number..."
                  className="input-field font-mono"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 md:w-36">
                <Search className="w-4 h-4" /> Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center justify-center gap-2 md:w-32 ${showFilters ? 'bg-electric-500/20 border-electric-500/40' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* Filter Row */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 animate-fade-in">
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                  {categories.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                </select>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field">
                  {brands.map(b => <option key={b} value={b === 'All' ? '' : b}>{b}</option>)}
                </select>
                <select value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} className="input-field">
                  {makes.map(m => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
                </select>
              </div>
            )}
          </form>
        </div>

        {/* Category Quick Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.slice(1).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setTimeout(doSearch, 10) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-electric-500/30 text-electric-300 border border-electric-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
          {(query || category || brand || partNumber) && (
            <button onClick={clearFilters} className="px-4 py-2 rounded-full text-sm text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1 transition-all">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Searching spare parts..." />
        ) : searched ? (
          results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">
                  Found <span className="text-electric-400">{results.length}</span> part{results.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(part => <PartCard key={part.id} part={part} />)}
              </div>
            </>
          ) : (
            <EmptyState
              icon="🔧"
              title="No Parts Found"
              description="Try different keywords, part numbers, or browse by category below."
              action={<button onClick={clearFilters} className="btn-primary">Clear Search</button>}
            />
          )
        ) : (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-white text-xl font-semibold mb-3">Search for Spare Parts</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Enter a part name, part number, brand, or vehicle model to find the perfect spare part.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Oil Filter', 'Brake Pads', 'Spark Plug', 'Air Filter', 'Battery'].map(term => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); setTimeout(doSearch, 10) }}
                  className="px-5 py-2 glass-card hover:border-electric-500/30 text-gray-300 hover:text-electric-400 text-sm transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
