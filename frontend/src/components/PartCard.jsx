import { Link } from 'react-router-dom'
import { ShoppingCart, Zap, Eye, Star, Shield, Package } from 'lucide-react'

export default function PartCard({ part, showActions = true }) {
  if (!part) return null

  const discount = part.original_price && part.original_price > part.price
    ? Math.round((1 - part.price / part.original_price) * 100)
    : 0

  return (
    <div className="glass-card overflow-hidden hover:border-electric-500/30 transition-all duration-300 hover:-translate-y-1 hover:glow-blue group flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-navy-800 to-navy-900 overflow-hidden">
        <img
          src={part.image_url || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400`}
          alt={part.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {part.is_oem ? (
            <span className="badge-green text-xs">
              <Shield className="w-3 h-3" /> OEM
            </span>
          ) : (
            <span className="badge-blue text-xs">
              <Package className="w-3 h-3" /> Aftermarket
            </span>
          )}
          {discount > 0 && (
            <span className="badge bg-orange-500/90 text-white text-xs">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute bottom-3 left-3">
          <span className="badge-blue text-xs">{part.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-electric-400 text-xs font-mono mb-1">{part.part_number}</p>
          <h3 className="text-white font-semibold text-base leading-snug mb-1 group-hover:text-electric-300 transition-colors line-clamp-2">
            {part.name}
          </h3>
          <p className="text-gray-400 text-sm">{part.brand}</p>
        </div>

        <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-1">
          {part.description || 'High-quality automobile spare part.'}
        </p>

        {/* Vehicle compatibility */}
        <div className="mb-4">
          <p className="text-gray-500 text-xs mb-1">Compatible with:</p>
          <p className="text-gray-300 text-xs font-medium line-clamp-1">
            {part.vehicle_make} – {part.vehicle_model}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-electric-400 font-bold text-xl">₹{part.price?.toLocaleString()}</span>
          {part.original_price && part.original_price > part.price && (
            <span className="text-gray-500 text-sm line-through">₹{part.original_price?.toLocaleString()}</span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="grid grid-cols-3 gap-2">
            <Link
              to={`/spare/${part.id}`}
              className="flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-all"
            >
              <Eye className="w-3 h-3" /> Details
            </Link>
            <Link
              to={`/substitution/${part.id}`}
              className="flex items-center justify-center gap-1 py-2 rounded-lg bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/30 text-electric-400 text-xs font-medium transition-all"
            >
              <Zap className="w-3 h-3" /> AI Sub
            </Link>
            <Link
              to={`/reserve/${part.id}`}
              className="flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium transition-all"
            >
              <ShoppingCart className="w-3 h-3" /> Reserve
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
