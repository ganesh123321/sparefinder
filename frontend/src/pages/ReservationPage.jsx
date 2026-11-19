import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ShoppingCart, CheckCircle, AlertCircle, Search, ChevronRight, User, Phone, Mail, FileText, MapPin } from 'lucide-react'
import { getSpareDetail, getShops, getAvailability, createReservation, searchParts } from '../api'
import { LoadingSpinner, PageHeader } from '../components/UI'

const initialForm = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  quantity: 1,
  notes: '',
}

export default function ReservationPage() {
  const { partId } = useParams()
  const [urlParams] = useSearchParams()
  const preselectedShop = urlParams.get('shop')

  const [step, setStep] = useState(1)   // 1: select part, 2: select shop, 3: form, 4: success
  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedShop, setSelectedShop] = useState(null)
  const [availability, setAvailability] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reservation, setReservation] = useState(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (partId) loadPart(partId)
  }, [partId])

  const loadPart = async (id) => {
    setLoading(true)
    try {
      const res = await getSpareDetail(id)
      setSelectedPart(res.data.part)
      setAvailability(res.data.availability)
      setStep(2)
      if (preselectedShop) {
        const shop = res.data.availability.find(a => a.shop_id == preselectedShop)
        if (shop) { selectShop(shop); }
      }
    } catch { setError('Failed to load part details.') }
    finally { setLoading(false) }
  }

  const handlePartSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await searchParts({ q: searchQuery })
      setSearchResults(res.data.results)
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  const selectPart = (part) => {
    setSearchResults([])
    loadPart(part.id)
  }

  const selectShop = (shopData) => {
    setSelectedShop(shopData)
    setStep(3)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_phone) {
      setError('Name and phone number are required.')
      return
    }
    if (form.customer_phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const res = await createReservation({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        part_id: selectedPart.id,
        shop_id: selectedShop.shop_id,
        quantity: form.quantity,
        notes: form.notes,
      })
      setReservation(res.data)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Reservation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(1); setSelectedPart(null); setSelectedShop(null)
    setAvailability([]); setForm(initialForm); setReservation(null); setError('')
    setSearchQuery(''); setSearchResults([])
  }

  return (
    <div>
      <PageHeader
        title="Reserve Spare Part"
        subtitle="Reserve without payment – pick up at the shop at your convenience"
        icon={ShoppingCart}
        breadcrumb="Home / Reserve"
      />

      <div className="page-container max-w-3xl">
        {/* Progress Steps */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-8">
            {['Select Part', 'Choose Shop', 'Your Details'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-electric-500 text-white' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${step >= i + 1 ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card p-4 border-red-500/30 bg-red-500/5 flex items-center gap-3 mb-5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner text="Loading part details..." />}

        {/* Step 1: Select Part */}
        {step === 1 && !loading && (
          <div className="glass-card p-8 animate-fade-in">
            <h2 className="text-white font-bold text-xl mb-2">Select Spare Part</h2>
            <p className="text-gray-400 text-sm mb-6">Search for the part you want to reserve.</p>
            <form onSubmit={handlePartSearch} className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search part name or number..."
                  className="input-field pl-12"
                />
              </div>
              <button type="submit" disabled={searching} className="btn-primary px-6 flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                {searchResults.slice(0, 8).map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPart(p)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{p.name}</p>
                      <p className="text-gray-400 text-xs">{p.part_number} · {p.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-electric-400 font-semibold text-sm">₹{p.price?.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Choose Shop */}
        {step === 2 && selectedPart && !loading && (
          <div className="animate-fade-in">
            {/* Selected Part Summary */}
            <div className="glass-card p-5 mb-5 border-electric-500/20 flex items-center gap-4">
              <img
                src={selectedPart.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
                alt={selectedPart.name}
                className="w-16 h-16 object-cover rounded-xl shrink-0"
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100'}
              />
              <div className="flex-1">
                <p className="text-xs text-electric-400 mb-1">Selected Part</p>
                <p className="text-white font-semibold">{selectedPart.name}</p>
                <p className="text-gray-400 text-sm">{selectedPart.part_number} · ₹{selectedPart.price?.toLocaleString()}</p>
              </div>
              <button onClick={() => { setStep(1); setSelectedPart(null); setAvailability([]) }} className="btn-secondary text-xs py-1.5 px-3">
                Change
              </button>
            </div>

            <h2 className="text-white font-bold text-lg mb-4">Select a Shop</h2>
            {availability.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-400">This part is currently out of stock at all shops.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availability.map(item => (
                  <button
                    key={item.id}
                    onClick={() => selectShop(item)}
                    disabled={item.quantity <= 0}
                    className={`w-full text-left glass-card p-5 hover:border-electric-500/30 transition-all ${
                      item.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">{item.shop_name}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {item.address}, {item.city}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            item.quantity > 10 ? 'bg-green-500/20 text-green-400' :
                            item.quantity > 0 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-electric-400 font-bold text-lg">₹{item.selling_price?.toLocaleString()}</p>
                        <ChevronRight className="w-5 h-5 text-gray-500 ml-auto mt-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Form */}
        {step === 3 && selectedPart && selectedShop && (
          <div className="animate-fade-in">
            {/* Summary */}
            <div className="glass-card p-5 mb-6 border-electric-500/20">
              <h3 className="text-white font-semibold mb-3">Reservation Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Part</p><p className="text-white font-medium">{selectedPart.name}</p></div>
                <div><p className="text-gray-500">Part Number</p><p className="text-white font-mono">{selectedPart.part_number}</p></div>
                <div><p className="text-gray-500">Shop</p><p className="text-white font-medium">{selectedShop.shop_name}</p></div>
                <div><p className="text-gray-500">Price per unit</p><p className="text-electric-400 font-semibold">₹{selectedShop.selling_price?.toLocaleString()}</p></div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-white font-bold text-xl mb-6">Your Details</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Full Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="customer_name" value={form.customer_name} onChange={handleFormChange}
                        className="input-field pl-11" placeholder="Your full name" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Phone Number <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="customer_phone" value={form.customer_phone} onChange={handleFormChange}
                        className="input-field pl-11" placeholder="10-digit mobile number" maxLength={10} required />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email (optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="customer_email" value={form.customer_email} onChange={handleFormChange}
                      className="input-field pl-11" placeholder="email@example.com" type="email" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Quantity</label>
                  <input name="quantity" type="number" min={1} max={selectedShop.quantity} value={form.quantity}
                    onChange={handleFormChange} className="input-field w-32" />
                  <p className="text-gray-500 text-xs mt-1">Available: {selectedShop.quantity} units · Total: ₹{(selectedShop.selling_price * form.quantity).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Notes (optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea name="notes" value={form.notes} onChange={handleFormChange}
                      className="input-field pl-11 h-24 resize-none" placeholder="Any special instructions..." />
                  </div>
                </div>

                <div className="p-4 bg-electric-500/5 border border-electric-500/20 rounded-xl text-sm text-gray-300">
                  <p className="font-semibold text-white mb-1">📋 Reservation Policy</p>
                  <p>No payment required now. Your part will be held for 48 hours. Present your Reservation ID at the shop to collect.</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <ShoppingCart className="w-4 h-4" />}
                    {submitting ? 'Processing...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && reservation && (
          <div className="glass-card p-10 text-center border-green-500/30 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Reservation Confirmed!</h2>
            <p className="text-gray-400 mb-6">Your part has been reserved successfully. No payment required.</p>

            {/* Reservation ID */}
            <div className="glass-card p-5 mb-6 border-electric-500/30">
              <p className="text-gray-400 text-sm mb-2">Your Reservation ID</p>
              <p className="font-display text-4xl font-bold gradient-text tracking-widest">
                {reservation.reservation_id}
              </p>
              <p className="text-gray-500 text-xs mt-2">Show this ID at the shop when collecting your part</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              {[
                { label: 'Part', value: reservation.details?.part_name },
                { label: 'Part Number', value: reservation.details?.part_number },
                { label: 'Shop', value: reservation.details?.shop_name },
                { label: 'Address', value: reservation.details?.shop_address },
                { label: 'Shop Phone', value: reservation.details?.shop_phone },
                { label: 'Quantity', value: reservation.details?.quantity },
                { label: 'Total Price', value: `₹${reservation.details?.total_price?.toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="glass-card p-3">
                  <p className="text-gray-500 text-xs">{item.label}</p>
                  <p className="text-white text-sm font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-secondary">Make Another Reservation</button>
              <Link to="/" className="btn-primary">Go to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
