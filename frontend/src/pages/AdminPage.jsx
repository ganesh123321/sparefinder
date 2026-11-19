import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  Lock,
  User,
  Package,
  Store,
  CalendarCheck,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Boxes,
  TrendingUp,
  BarChart3,
  X,
  Check,
  ChevronDown,
  Info,
  Car,
  Tag,
  Warehouse,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  adminLogin,
  adminLogout,
  checkAdmin,
  getSales,
  getAllParts,
  getReservations,
  getStock,
  deletePart,
  updatePart,
  updateReservation,
  addPart,
  updateStock,
} from '../api/index.js'

// ─── CUSTOM CHART TOOLTIPS ──────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-navy-900/95 border border-white/20 p-3.5 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-electric-400" />
          <span className="text-white font-bold text-base">
            ${Number(payload[0].value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {data.total_units !== undefined && (
          <p className="text-xs text-gray-400">
            Units Sold: <span className="text-electric-300 font-semibold">{data.total_units}</span>
          </p>
        )}
        {data.transactions !== undefined && (
          <p className="text-xs text-gray-400">
            Transactions: <span className="text-white font-semibold">{data.transactions}</span>
          </p>
        )}
      </div>
    )
  }
  return null
}

function CategoryTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-navy-900/95 border border-white/20 p-3.5 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-white text-sm font-bold mb-1.5">{label}</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-electric-300" />
          <span className="text-white text-sm">
            Units: <span className="font-bold text-electric-300">{payload[0].value}</span>
          </span>
        </div>
        {data.revenue !== undefined && (
          <p className="text-xs text-gray-400">
            Revenue: <span className="text-green-400 font-semibold">${Number(data.revenue).toLocaleString()}</span>
          </p>
        )}
      </div>
    )
  }
  return null
}

// ─── MAIN ADMIN COMPONENT ───────────────────────────────────────────────────
export default function AdminPage() {
  // ─── AUTH STATE ───────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('sf_admin_auth') === 'true'
  })
  const [authChecking, setAuthChecking] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // ─── DASHBOARD DATA STATE ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [salesData, setSalesData] = useState({
    monthly_sales: [],
    category_sales: [],
    top_parts: [],
    summary: {
      total_parts: 0,
      total_shops: 0,
      total_reservations: 0,
      pending_reservations: 0,
      total_stock: 0,
      low_stock_count: 0,
      total_revenue: 0,
    },
  })
  const [parts, setParts] = useState([])
  const [reservations, setReservations] = useState([])
  const [stockList, setStockList] = useState([])
  const [lowStockAlerts, setLowStockAlerts] = useState([])

  // ─── UI CONTROLS & TABS ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('parts') // 'parts' | 'reservations'
  const [partsSearch, setPartsSearch] = useState('')
  const [partsCategoryFilter, setPartsCategoryFilter] = useState('ALL')
  const [reservationSearch, setReservationSearch] = useState('')
  const [reservationStatusFilter, setReservationStatusFilter] = useState('ALL')

  // ─── MODALS & DIALOGS ─────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [partToDelete, setPartToDelete] = useState(null)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockItem, setRestockItem] = useState(null)
  const [newStockQty, setNewStockQty] = useState('')

  // ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // ─── CHECK INITIAL AUTH STATUS ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const verifySession = async () => {
      try {
        const res = await checkAdmin()
        if (isMounted) {
          if (res?.data?.logged_in) {
            setIsAuthenticated(true)
            sessionStorage.setItem('sf_admin_auth', 'true')
          } else if (sessionStorage.getItem('sf_admin_auth') !== 'true') {
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        // Fallback to sessionStorage check if API has cors/session cold start
        if (isMounted && sessionStorage.getItem('sf_admin_auth') !== 'true') {
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) setAuthChecking(false)
      }
    }
    verifySession()
    return () => {
      isMounted = false
    }
  }, [])

  // ─── LOAD DASHBOARD DATA ──────────────────────────────────────────────────
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [salesRes, partsRes, resRes, stockRes] = await Promise.allSettled([
        getSales(),
        getAllParts(),
        getReservations(),
        getStock(),
      ])

      // Process Sales
      if (salesRes.status === 'fulfilled' && salesRes.value?.data) {
        setSalesData(salesRes.value.data)
      }

      // Process Parts
      if (partsRes.status === 'fulfilled' && partsRes.value?.data?.parts) {
        setParts(partsRes.value.data.parts)
      }

      // Process Reservations
      if (resRes.status === 'fulfilled' && resRes.value?.data?.reservations) {
        setReservations(resRes.value.data.reservations)
      }

      // Process Stock & Low Stock Alerts
      if (stockRes.status === 'fulfilled' && stockRes.value?.data) {
        const sData = stockRes.value.data
        setStockList(sData.stock || [])
        setLowStockAlerts(sData.low_stock_alerts || [])
      }

      if (isRefresh) {
        showToast('Dashboard data refreshed successfully')
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      showToast('Error loading some dashboard data', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  // ─── AUTH ACTIONS ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await adminLogin(loginForm)
      if (res?.data?.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('sf_admin_auth', 'true')
        showToast('Welcome back, Admin!')
      } else {
        setLoginError(res?.data?.error || 'Invalid username or password')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.'
      setLoginError(msg)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await adminLogout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsAuthenticated(false)
      sessionStorage.removeItem('sf_admin_auth')
      showToast('Logged out of Admin Portal', 'info')
    }
  }

  // ─── NEW PART FORM STATE ──────────────────────────────────────────────────
  const [newPart, setNewPart] = useState({
    part_number: '',
    name: '',
    brand: '',
    category: 'Filters',
    vehicle_model: '',
    vehicle_make: '',
    year_range: '2015-2024',
    price: '',
    original_price: '',
    description: '',
    function_desc: '',
    warranty: '1 year',
    is_oem: 1,
  })

  const handleAddPartSubmit = async (e) => {
    e.preventDefault()
    if (!newPart.part_number || !newPart.name || !newPart.brand || !newPart.category || !newPart.price) {
      showToast('Please fill all required fields', 'error')
      return
    }

    try {
      const payload = {
        ...newPart,
        price: parseFloat(newPart.price),
        original_price: newPart.original_price ? parseFloat(newPart.original_price) : parseFloat(newPart.price),
        is_oem: newPart.is_oem ? 1 : 0,
      }
      const res = await addPart(payload)
      if (res?.data?.success) {
        showToast(`Part "${newPart.name}" added successfully!`)
        setIsAddModalOpen(false)
        setNewPart({
          part_number: '',
          name: '',
          brand: '',
          category: 'Filters',
          vehicle_model: '',
          vehicle_make: '',
          year_range: '2015-2024',
          price: '',
          original_price: '',
          description: '',
          function_desc: '',
          warranty: '1 year',
          is_oem: 1,
        })
        fetchDashboardData(true)
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add spare part', 'error')
    }
  }

  // ─── EDIT PART FORM STATE ─────────────────────────────────────────────────
  const [editPartForm, setEditPartForm] = useState({
    name: '',
    brand: '',
    price: '',
    original_price: '',
    description: '',
    warranty: '',
  })

  const openEditModal = (part) => {
    setEditingPart(part)
    setEditPartForm({
      name: part.name || '',
      brand: part.brand || '',
      price: part.price || '',
      original_price: part.original_price || part.price || '',
      description: part.description || '',
      warranty: part.warranty || '1 year',
    })
    setIsEditModalOpen(true)
  }

  const handleUpdatePartSubmit = async (e) => {
    e.preventDefault()
    if (!editingPart) return

    try {
      const payload = {
        ...editPartForm,
        price: parseFloat(editPartForm.price),
        original_price: editPartForm.original_price ? parseFloat(editPartForm.original_price) : parseFloat(editPartForm.price),
      }
      const res = await updatePart(editingPart.id, payload)
      if (res?.data?.success) {
        showToast(`Part "${editPartForm.name}" updated successfully!`)
        setIsEditModalOpen(false)
        setEditingPart(null)
        // Optimistic UI update
        setParts((prev) =>
          prev.map((p) => (p.id === editingPart.id ? { ...p, ...payload } : p))
        )
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update part', 'error')
    }
  }

  // ─── DELETE PART ACTION ───────────────────────────────────────────────────
  const confirmDeletePart = (part) => {
    setPartToDelete(part)
    setIsDeleteModalOpen(true)
  }

  const handleDeletePart = async () => {
    if (!partToDelete) return
    try {
      const res = await deletePart(partToDelete.id)
      if (res?.data?.success) {
        showToast(`Part #${partToDelete.part_number} deleted successfully`)
        setIsDeleteModalOpen(false)
        setParts((prev) => prev.filter((p) => p.id !== partToDelete.id))
        setPartToDelete(null)
        // Refresh summary
        setSalesData((prev) => ({
          ...prev,
          summary: {
            ...prev.summary,
            total_parts: Math.max(0, (prev.summary?.total_parts || 1) - 1),
          },
        }))
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete part', 'error')
    }
  }

  // ─── UPDATE RESERVATION STATUS ────────────────────────────────────────────
  const handleStatusChange = async (resId, newStatus) => {
    try {
      const res = await updateReservation(resId, { status: newStatus })
      if (res?.data?.success) {
        showToast(`Reservation #${resId} marked as ${newStatus}`)
        setReservations((prev) =>
          prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
        )
        // If cancelled, stock increases so refresh stock
        if (newStatus === 'cancelled') {
          const stockRes = await getStock()
          if (stockRes?.data) {
            setStockList(stockRes.data.stock || [])
            setLowStockAlerts(stockRes.data.low_stock_alerts || [])
          }
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update reservation status', 'error')
    }
  }

  // ─── RESTOCK QUICK ACTION ─────────────────────────────────────────────────
  const openRestockModal = (stockItem) => {
    setRestockItem(stockItem)
    setNewStockQty(stockItem.quantity + 10)
    setIsRestockModalOpen(true)
  }

  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!restockItem) return
    const qty = parseInt(newStockQty, 10)
    if (isNaN(qty) || qty < 0) {
      showToast('Please enter a valid stock quantity', 'error')
      return
    }

    try {
      const res = await updateStock(restockItem.id, { quantity: qty })
      if (res?.data?.success) {
        showToast(`Stock updated for ${restockItem.part_name || 'part'} (${qty} units)`)
        setIsRestockModalOpen(false)
        setRestockItem(null)
        // Refresh stock & alerts
        const stockRes = await getStock()
        if (stockRes?.data) {
          setStockList(stockRes.data.stock || [])
          setLowStockAlerts(stockRes.data.low_stock_alerts || [])
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update stock', 'error')
    }
  }

  // ─── FILTERED DATA CALCULATIONS ───────────────────────────────────────────
  const categoriesList = useMemo(() => {
    const set = new Set(parts.map((p) => p.category).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [parts])

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const query = partsSearch.toLowerCase()
      const matchesSearch =
        !query ||
        part.name?.toLowerCase().includes(query) ||
        part.part_number?.toLowerCase().includes(query) ||
        part.brand?.toLowerCase().includes(query) ||
        part.vehicle_model?.toLowerCase().includes(query) ||
        part.vehicle_make?.toLowerCase().includes(query)

      const matchesCat =
        partsCategoryFilter === 'ALL' || part.category === partsCategoryFilter

      return matchesSearch && matchesCat
    })
  }, [parts, partsSearch, partsCategoryFilter])

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const query = reservationSearch.toLowerCase()
      const matchesSearch =
        !query ||
        r.reservation_id?.toLowerCase().includes(query) ||
        r.customer_name?.toLowerCase().includes(query) ||
        r.part_name?.toLowerCase().includes(query) ||
        r.part_number?.toLowerCase().includes(query) ||
        r.shop_name?.toLowerCase().includes(query) ||
        r.customer_phone?.toLowerCase().includes(query)

      const matchesStatus =
        reservationStatusFilter === 'ALL' || r.status?.toLowerCase() === reservationStatusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [reservations, reservationSearch, reservationStatusFilter])

  // Chart fallback data if backend is empty
  const chartMonthly = useMemo(() => {
    if (salesData?.monthly_sales && salesData.monthly_sales.length > 0) {
      return salesData.monthly_sales
    }
    return [
      { month: '2024-05', total_revenue: 12400, total_units: 85, transactions: 42 },
      { month: '2024-06', total_revenue: 15800, total_units: 110, transactions: 58 },
      { month: '2024-07', total_revenue: 18200, total_units: 135, transactions: 70 },
      { month: '2024-08', total_revenue: 16900, total_units: 120, transactions: 64 },
      { month: '2024-09', total_revenue: 21500, total_units: 155, transactions: 82 },
      { month: '2024-10', total_revenue: 24800, total_units: 180, transactions: 95 },
    ]
  }, [salesData])

  const chartCategories = useMemo(() => {
    if (salesData?.category_sales && salesData.category_sales.length > 0) {
      return salesData.category_sales
    }
    return [
      { category: 'Brakes', units: 142, revenue: 112000 },
      { category: 'Filters', units: 189, revenue: 64000 },
      { category: 'Suspension', units: 76, revenue: 152000 },
      { category: 'Batteries', units: 58, revenue: 232000 },
      { category: 'Spark Plugs', units: 210, revenue: 42000 },
      { category: 'Lighting', units: 94, revenue: 47000 },
    ]
  }, [salesData])

  // ─── LOGIN GATE VIEW ──────────────────────────────────────────────────────
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Ambient Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-navy-700/20 rounded-full blur-2xl pointer-events-none" />

        <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10 border border-white/15 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-600 to-electric-400 p-0.5 mx-auto mb-4 shadow-lg shadow-electric-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-electric-400" />
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wide">
              SPARE <span className="text-electric-400">FINDER</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Administrator Control Center</p>
          </div>

          {/* Quick Demo Credentials Info Box */}
          <div className="mb-6 p-3.5 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-electric-400 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <p className="font-semibold text-white">Default Admin Credentials:</p>
              <p className="mt-0.5">
                Username: <span className="text-electric-300 font-mono">admin</span> &bull; Password:{' '}
                <span className="text-electric-300 font-mono">admin123</span>
              </p>
              <button
                type="button"
                onClick={() => setLoginForm({ username: 'admin', password: 'admin123' })}
                className="mt-2 text-electric-400 hover:text-electric-300 text-xs font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Auto-fill Demo Credentials
              </button>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm animate-shake">
              <XCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="admin"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold shadow-lg shadow-electric-600/30 hover:shadow-electric-500/50 mt-6"
            >
              {loginLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              Secured portal for inventory managers and system administrators.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── INITIAL AUTH CHECKING LOADER ─────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-electric-500/20 border-t-electric-400 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium">Verifying admin session...</p>
      </div>
    )
  }

  // ─── AUTHENTICATED DASHBOARD VIEW ─────────────────────────────────────────
  const summary = salesData?.summary || {}
  const totalPartsCount = summary.total_parts ?? parts.length
  const totalShopsCount = summary.total_shops ?? 5
  const totalReservationsCount = summary.total_reservations ?? reservations.length
  const totalRevenueAmount = summary.total_revenue ?? 0
  const lowStockCount = summary.low_stock_count ?? lowStockAlerts.length

  return (
    <div className="min-h-screen bg-navy-950 pb-20 text-gray-200">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up border ${
            toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/40'
              : toast.type === 'info'
              ? 'bg-electric-950/90 text-electric-200 border-electric-500/40'
              : 'bg-green-950/90 text-green-200 border-green-500/40'
          }`}
        >
          {toast.type === 'error' ? (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-electric-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── TOP ADMIN NAVBAR / HEADER ─── */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-900 to-navy-850 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center shadow-lg shadow-electric-600/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                    Admin Dashboard
                  </h1>
                  <span className="badge-blue text-[11px] font-semibold py-0.5 px-2">
                    System Control
                  </span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Manage inventory catalog, monitor monthly revenue, and fulfill spare reservations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-2 text-gray-300 hover:text-white"
                title="Refresh all metrics"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-electric-400' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 shadow-md shadow-electric-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Part</span>
              </button>

              <button
                onClick={handleLogout}
                className="btn-danger text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5"
                title="Log out of admin"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ─── 1. TOP STATS ROW ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Total Parts */}
          <div className="glass-card p-5 relative overflow-hidden group hover:border-electric-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-electric-500/5 rounded-full blur-xl group-hover:bg-electric-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Parts</span>
              <div className="w-10 h-10 rounded-xl bg-electric-500/20 text-electric-400 flex items-center justify-center border border-electric-500/30">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {loading ? '-' : totalPartsCount.toLocaleString()}
            </div>
            <p className="text-gray-400 text-xs mt-1">Catalog items listed</p>
          </div>

          {/* Total Shops */}
          <div className="glass-card p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Shops</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {loading ? '-' : totalShopsCount.toLocaleString()}
            </div>
            <p className="text-gray-400 text-xs mt-1">Partner auto stores</p>
          </div>

          {/* Total Reservations */}
          <div className="glass-card p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Reservations</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {loading ? '-' : totalReservationsCount.toLocaleString()}
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {summary.pending_reservations ? (
                <span className="text-orange-400 font-semibold">{summary.pending_reservations} pending</span>
              ) : (
                'Customer bookings'
              )}
            </p>
          </div>

          {/* Total Revenue */}
          <div className="glass-card p-5 relative overflow-hidden group hover:border-green-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white tracking-tight">
              {loading ? '-' : `$${Number(totalRevenueAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </div>
            <p className="text-gray-400 text-xs mt-1">Gross sales generated</p>
          </div>

          {/* Low Stock Alerts */}
          <div
            className={`glass-card p-5 relative overflow-hidden group transition-all duration-300 ${
              lowStockCount > 0
                ? 'border-red-500/50 bg-red-950/20 hover:border-red-400'
                : 'hover:border-electric-500/40'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Low Stock Alerts</span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  lowStockCount > 0
                    ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-3xl font-display font-bold tracking-tight ${
                  lowStockCount > 0 ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {loading ? '-' : lowStockCount}
              </div>
              {lowStockCount > 0 && (
                <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Urgent</span>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {lowStockCount > 0 ? 'Items below 5 units' : 'All items well-stocked'}
            </p>
          </div>
        </div>

        {/* ─── 2. STOCK MANAGEMENT: PROMINENT LOW STOCK ALERTS SECTION ─── */}
        {lowStockAlerts.length > 0 && (
          <div className="glass-card p-6 border-red-500/30 bg-gradient-to-r from-red-950/30 via-navy-900/60 to-red-950/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Critical Stock Alerts ({lowStockAlerts.length} Parts Need Restock)
                    </h3>
                    <span className="badge-red text-[11px] uppercase tracking-wider">Action Needed</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    These items are currently running below minimum safety threshold (quantity &lt; 5).
                  </p>
                </div>
              </div>
            </div>

            {/* Low stock item cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
              {lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-electric-300">
                        {item.part_number || 'N/A'}
                      </span>
                      <span className="badge-red text-[10px] py-0 px-1.5 font-bold">
                        {item.quantity} left
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">
                      {item.part_name || 'Automobile Part'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {item.shop_name} &bull; {item.city}
                    </p>
                  </div>
                  <button
                    onClick={() => openRestockModal(item)}
                    className="btn-secondary text-xs py-1.5 px-3 shrink-0 border-white/20 hover:border-electric-400 hover:text-electric-300"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 3. CHARTS ROW (AreaChart & BarChart) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Sales AreaChart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-electric-400" />
                  <h3 className="text-lg font-bold text-white">Monthly Sales Revenue</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Month vs Total Revenue ($ USD)</p>
              </div>
              <span className="badge-blue text-xs">AreaChart</span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartMonthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminSalesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#00a3ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => (val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`)}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 10 }}
                    formatter={() => 'Monthly Revenue'}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#00a3ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#adminSalesGradient)"
                    activeDot={{ r: 6, fill: '#00a3ff', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Sales BarChart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-electric-300" />
                  <h3 className="text-lg font-bold text-white">Sales by Category</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Category vs Units Sold</p>
              </div>
              <span className="badge-blue text-xs">BarChart</span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCategories} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="category"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CategoryTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 10 }}
                    formatter={() => 'Units Sold'}
                  />
                  <Bar
                    dataKey="units"
                    name="Units"
                    fill="#38b6ff"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── 4. TWO TABS: 'Spare Parts' and 'Reservations' ─── */}
        <div className="glass-card p-6 border-white/10">
          {/* Tab Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-navy-900 border border-white/10 max-w-fit">
              <button
                onClick={() => setActiveTab('parts')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'parts'
                    ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-lg shadow-electric-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Spare Parts</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'parts' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {parts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reservations')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'reservations'
                    ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-lg shadow-electric-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Reservations</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'reservations' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {reservations.length}
                </span>
              </button>
            </div>

            {/* Quick Actions depending on active tab */}
            {activeTab === 'parts' ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary text-sm py-2.5 px-4 flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Part</span>
              </button>
            ) : (
              <div className="text-xs text-gray-400 self-center">
                Total bookings: <span className="text-white font-semibold">{reservations.length}</span>
              </div>
            )}
          </div>

          {/* ─── TAB 1: SPARE PARTS TAB ─── */}
          {activeTab === 'parts' && (
            <div className="pt-6 space-y-4">
              {/* Search and Category Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={partsSearch}
                    onChange={(e) => setPartsSearch(e.target.value)}
                    placeholder="Search by part#, name, brand, model..."
                    className="input-field pl-10 py-2.5 text-sm"
                  />
                  {partsSearch && (
                    <button
                      onClick={() => setPartsSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={partsCategoryFilter}
                    onChange={(e) => setPartsCategoryFilter(e.target.value)}
                    className="input-field py-2.5 text-sm bg-navy-900 border-white/20 text-white w-full sm:w-48"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat} className="bg-navy-900 text-white">
                        {cat === 'ALL' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-36">Part #</th>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-gray-400">
                          <Package className="w-10 h-10 mx-auto mb-2 text-gray-500 stroke-1" />
                          <p className="text-white font-medium">No spare parts found</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {partsSearch || partsCategoryFilter !== 'ALL'
                              ? 'Try adjusting your search query or filters'
                              : 'Click "Add New Part" to populate your catalog'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredParts.map((part) => (
                        <tr key={part.id} className="transition-colors hover:bg-white/5">
                          <td>
                            <span className="font-mono font-bold text-xs text-electric-300 bg-electric-500/10 px-2.5 py-1 rounded-md border border-electric-500/20">
                              {part.part_number}
                            </span>
                          </td>
                          <td>
                            <div>
                              <p className="font-semibold text-white text-sm">{part.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {part.vehicle_make && `${part.vehicle_make} `}
                                {part.vehicle_model && `(${part.vehicle_model})`}
                                {part.year_range && ` &bull; ${part.year_range}`}
                              </p>
                            </div>
                          </td>
                          <td>
                            <span className="text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                              {part.brand}
                            </span>
                          </td>
                          <td>
                            <span className="badge-blue text-xs font-medium">{part.category}</span>
                          </td>
                          <td>
                            <div>
                              <span className="font-bold text-white text-sm">
                                ${Number(part.price).toFixed(2)}
                              </span>
                              {part.original_price && part.original_price > part.price && (
                                <span className="text-xs text-gray-500 line-through ml-2">
                                  ${Number(part.original_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(part)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-electric-500/20 text-gray-300 hover:text-electric-300 border border-white/10 hover:border-electric-500/30 transition-all"
                                title="Edit part"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmDeletePart(part)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all"
                                title="Delete part"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer info */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
                <span>
                  Showing {filteredParts.length} of {parts.length} parts
                </span>
                {partsCategoryFilter !== 'ALL' && (
                  <span className="text-electric-400">
                    Filtered by category: <b>{partsCategoryFilter}</b>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 2: RESERVATIONS TAB ─── */}
          {activeTab === 'reservations' && (
            <div className="pt-6 space-y-4">
              {/* Search and Status Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    placeholder="Search by customer, res ID, part, shop..."
                    className="input-field pl-10 py-2.5 text-sm"
                  />
                  {reservationSearch && (
                    <button
                      onClick={() => setReservationSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={reservationStatusFilter}
                    onChange={(e) => setReservationStatusFilter(e.target.value)}
                    className="input-field py-2.5 text-sm bg-navy-900 border-white/20 text-white w-full sm:w-44"
                  >
                    <option value="ALL" className="bg-navy-900 text-white">All Statuses</option>
                    <option value="pending" className="bg-navy-900 text-white">Pending</option>
                    <option value="confirmed" className="bg-navy-900 text-white">Confirmed</option>
                    <option value="completed" className="bg-navy-900 text-white">Completed</option>
                    <option value="cancelled" className="bg-navy-900 text-white">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Reservations Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reservation ID</th>
                      <th>Customer</th>
                      <th>Part</th>
                      <th>Shop</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-gray-400">
                          <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-gray-500 stroke-1" />
                          <p className="text-white font-medium">No reservations found</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {reservationSearch || reservationStatusFilter !== 'ALL'
                              ? 'No records match current filter criteria'
                              : 'Customer reservations will appear here once booked'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => {
                        const statusLower = (res.status || 'pending').toLowerCase()
                        return (
                          <tr key={res.id} className="transition-colors hover:bg-white/5">
                            <td>
                              <span className="font-mono font-bold text-xs text-electric-300 bg-electric-500/10 px-2.5 py-1 rounded-md border border-electric-500/20">
                                {res.reservation_id || `RES-${res.id}`}
                              </span>
                              <p className="text-[11px] text-gray-500 mt-1">
                                {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Recent'}
                              </p>
                            </td>
                            <td>
                              <div>
                                <p className="font-semibold text-white text-sm">{res.customer_name}</p>
                                <p className="text-xs text-gray-400">{res.customer_phone}</p>
                                {res.customer_email && (
                                  <p className="text-xs text-gray-500">{res.customer_email}</p>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <p className="font-medium text-white text-sm">{res.part_name || 'Part'}</p>
                                <p className="text-xs font-mono text-gray-400">{res.part_number}</p>
                              </div>
                            </td>
                            <td>
                              <div>
                                <p className="font-medium text-white text-sm">{res.shop_name || 'Partner Store'}</p>
                                <p className="text-xs text-gray-400">{res.city || 'Local'}</p>
                              </div>
                            </td>
                            <td>
                              <span className="font-bold text-sm bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white">
                                {res.quantity}
                              </span>
                            </td>
                            <td>
                              {statusLower === 'completed' && (
                                <span className="badge-green text-xs">Completed</span>
                              )}
                              {statusLower === 'confirmed' && (
                                <span className="badge-blue text-xs">Confirmed</span>
                              )}
                              {statusLower === 'pending' && (
                                <span className="badge-orange text-xs">Pending</span>
                              )}
                              {statusLower === 'cancelled' && (
                                <span className="badge-red text-xs">Cancelled</span>
                              )}
                            </td>
                            <td className="text-right">
                              <select
                                value={res.status || 'pending'}
                                onChange={(e) => handleStatusChange(res.id, e.target.value)}
                                className="text-xs py-1.5 px-2.5 rounded-lg bg-navy-900 border border-white/20 text-gray-200 focus:outline-none focus:border-electric-400"
                              >
                                <option value="pending" className="bg-navy-900 text-white">Pending</option>
                                <option value="confirmed" className="bg-navy-900 text-white">Confirmed</option>
                                <option value="completed" className="bg-navy-900 text-white">Completed</option>
                                <option value="cancelled" className="bg-navy-900 text-white">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer info */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
                <span>
                  Showing {filteredReservations.length} of {reservations.length} reservations
                </span>
                {reservationStatusFilter !== 'ALL' && (
                  <span className="text-electric-400">
                    Status filter: <b className="capitalize">{reservationStatusFilter}</b>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ADD PART MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-6 sm:p-8 border border-white/20 shadow-2xl my-8 relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/20 text-electric-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Spare Part</h3>
                  <p className="text-xs text-gray-400">Register new component into SPARE FINDER catalog</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Part Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.part_number}
                    onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                    placeholder="e.g. BRAKE-PAD-009"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Part Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    placeholder="e.g. Front Ceramic Brake Pads"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Brand <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.brand}
                    onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                    placeholder="e.g. Bosch, Brembo, Denso"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newPart.category}
                    onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                    className="input-field text-sm bg-navy-900 border-white/20 text-white"
                  >
                    <option value="Brakes">Brakes</option>
                    <option value="Filters">Filters</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Spark Plugs">Spark Plugs</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Engine">Engine</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Exhaust">Exhaust</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Vehicle Make <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.vehicle_make}
                    onChange={(e) => setNewPart({ ...newPart, vehicle_make: e.target.value })}
                    placeholder="e.g. Honda, Toyota, Maruti"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Vehicle Model <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.vehicle_model}
                    onChange={(e) => setNewPart({ ...newPart, vehicle_model: e.target.value })}
                    placeholder="e.g. City, Amaze, Civic"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Year Range <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.year_range}
                    onChange={(e) => setNewPart({ ...newPart, year_range: e.target.value })}
                    placeholder="e.g. 2016-2024"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                    placeholder="e.g. 89.99"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Original Price ($) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPart.original_price}
                    onChange={(e) => setNewPart({ ...newPart, original_price: e.target.value })}
                    placeholder="e.g. 110.00"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={newPart.warranty}
                    onChange={(e) => setNewPart({ ...newPart, warranty: e.target.value })}
                    placeholder="e.g. 1 year, 2 years"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  placeholder="Key functional features and overview..."
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_oem_check"
                  checked={newPart.is_oem === 1}
                  onChange={(e) => setNewPart({ ...newPart, is_oem: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-electric-500 bg-white/10 border-white/20 focus:ring-electric-400"
                />
                <label htmlFor="is_oem_check" className="text-sm text-gray-300 cursor-pointer">
                  Original Equipment Manufacturer (OEM) certified component
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-6 shadow-md shadow-electric-600/30"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT PART MODAL ─── */}
      {isEditModalOpen && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 border border-white/20 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/20 text-electric-400 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Part #{editingPart.part_number}</h3>
                  <p className="text-xs text-gray-400">Update part information and pricing</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editPartForm.name}
                  onChange={(e) => setEditPartForm({ ...editPartForm, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={editPartForm.brand}
                    onChange={(e) => setEditPartForm({ ...editPartForm, brand: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={editPartForm.warranty}
                    onChange={(e) => setEditPartForm({ ...editPartForm, warranty: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPartForm.price}
                    onChange={(e) => setEditPartForm({ ...editPartForm, price: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPartForm.original_price}
                    onChange={(e) => setEditPartForm({ ...editPartForm, original_price: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editPartForm.description}
                  onChange={(e) => setEditPartForm({ ...editPartForm, description: e.target.value })}
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-6"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE PART CONFIRMATION MODAL ─── */}
      {isDeleteModalOpen && partToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 border-red-500/30 shadow-2xl relative animate-slide-up">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Spare Part?</h3>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
              Are you sure you want to permanently delete part{' '}
              <span className="font-bold text-white">{partToDelete.name}</span> (
              <span className="font-mono text-electric-300">{partToDelete.part_number}</span>)? Associated
              shop inventory records will also be removed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setPartToDelete(null)
                }}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePart}
                className="btn-danger text-sm py-2 px-5 bg-red-600 hover:bg-red-500 text-white"
              >
                Delete Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK RESTOCK MODAL ─── */}
      {isRestockModalOpen && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 border-white/20 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/20 text-electric-400 flex items-center justify-center">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Restock Inventory</h3>
                  <p className="text-xs text-gray-400">{restockItem.part_name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <p className="text-gray-400">
                  Shop: <span className="text-white font-medium">{restockItem.shop_name} ({restockItem.city})</span>
                </p>
                <p className="text-gray-400">
                  Part #: <span className="text-electric-300 font-mono font-bold">{restockItem.part_number}</span>
                </p>
                <p className="text-gray-400">
                  Current Units:{' '}
                  <span className="text-red-400 font-bold">{restockItem.quantity} units</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  New Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="input-field text-base font-bold text-white"
                  placeholder="Enter updated stock count"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
