import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Search, Filter, Phone, Mail, Clock, Star } from 'lucide-react'
import { getAvailability, getShops, searchParts } from '../api'
import ShopCard from '../components/ShopCard'
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI'

export default function NearbyShopsPage() {
  const { partId } = useParams()
  const [shops, setShops] = useState([])
  const [availability, setAvailability] = useState([])
  const [part, setPart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterCity, setFilterCity] = useState('')
  const [searchPart, setSearchPart] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState(partId || null)

  useEffect(() => {
    if (selectedPartId) {
      loadAvailability(selectedPartId)
    } else {
      loadAllShops()
    }
  }, [selectedPartId])

  const loadAllShops = async () => {
    setLoading(true)
    try {
      const res = await getShops()
      setShops(res.data.shops)
    } catch { setShops([]) }
    finally { setLoading(false) }
  }

  const loadAvailability = async (id) => {
    setLoading(true)
    try {
      const res = await getAvailability(id)
      setAvailability(res.data.availability)
      setPart(res.data.part)
    } catch { setAvailability([]) }
    finally { setLoading(false) }
  }

  const handlePartSearch = async (e) => {
    e.preventDefault()
    if (!searchPart.trim()) return
    setSearching(true)
    try {
      const res = await searchParts({ q: searchPart })
      setSearchResults(res.data.results)
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  const selectPartForAvailability = (p) => {
    setSelectedPartId(p.id)
    setSearchResults([])
    setSearchPart(p.name)
    setFilterCity('')
  }

  // Cities from availability
  const cities = [...new Set((selectedPartId ? availability : shops).map(s => s.city || s.city))]

  const filteredItems = selectedPartId
    ? availability.filter(a => !filterCity || a.city === filterCity)
    : shops.filter(s => !filterCity || s.city === filterCity)

  return (
    <div>
      <PageHeader
        title="Nearby Shops & Availability"
        subtitle="Find spare parts at shops near you with real-time stock information"
        icon={MapPin}
        breadcrumb="Home / Nearby Shops"
      />

      <div className="page-container">
        {/* Part Search */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Check Availability for a Part</h2>
          <form onSubmit={handlePartSearch} className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchPart}
                onChange={e => setSearchPart(e.target.value)}
                placeholder="Search part name or number..."
                className="input-field pl-12"
              />
            </div>
            <button type="submit" disabled={searching} className="btn-primary flex items-center gap-2 px-6">
              <Search className="w-4 h-4" /> Check
            </button>
            {selectedPartId && (
              <button
                type="button"
                onClick={() => { setSelectedPartId(null); setSearchPart(''); setPart(null); setAvailability([]); loadAllShops() }}
                className="btn-secondary px-4"
              >
                Show All Shops
              </button>
            )}
          </form>

          {searchResults.length > 0 && (
            <div className="border border-white/10 rounded-xl overflow-hidden animate-fade-in">
              {searchResults.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPartForAvailability(p)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.part_number} · {p.brand}</p>
                  </div>
                  <span className="text-electric-400 font-semibold text-sm">₹{p.price?.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Part Banner */}
        {part && (
          <div className="glass-card p-5 mb-6 border-electric-500/20 flex items-center gap-4">
            <img
              src={part.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
              alt={part.name}
              className="w-16 h-16 object-cover rounded-xl"
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100'}
            />
            <div>
              <p className="text-xs text-electric-400 mb-1">Showing availability for</p>
              <h3 className="text-white font-bold">{part.name}</h3>
              <p className="text-gray-400 text-sm">{part.part_number} · {part.brand}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-gray-400 text-xs">MRP</p>
              <p className="text-electric-400 font-bold text-xl">₹{part.price?.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Filter + Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filter by city:</span>
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-electric-500"
            >
              <option value="">All Cities</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <p className="text-gray-400 text-sm">
            {selectedPartId
              ? `${filteredItems.filter(a => a.quantity > 0).length} shops in stock`
              : `${filteredItems.length} shops`
            }
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading shop availability..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No Shops Found"
            description={selectedPartId ? "This part is not currently in stock at any shops." : "No shops match your filter."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ShopCard
                key={selectedPartId ? item.id : item.id}
                shop={selectedPartId ? { ...item, name: item.shop_name, state: item.state } : item}
                stock={selectedPartId ? { quantity: item.quantity, selling_price: item.selling_price } : null}
                partId={selectedPartId}
              />
            ))}
          </div>
        )}

        {/* All Shops Map Legend */}
        {!selectedPartId && !loading && shops.length > 0 && (
          <div className="mt-10 glass-card p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-electric-400" /> Shop Network
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {shops.map(shop => (
                <div key={shop.id} className="p-3 bg-white/3 rounded-lg border border-white/5 text-center">
                  <p className="text-white text-xs font-semibold">{shop.city}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-400 text-xs">{shop.rating?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
