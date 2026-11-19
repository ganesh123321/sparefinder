import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Star, Package, ShoppingCart } from 'lucide-react'

export default function ShopCard({ shop, stock = null, partId = null }) {
  const stars = Math.round(shop.rating || 4)
  const inStock = stock ? stock.quantity > 0 : true

  return (
    <div className="glass-card p-5 hover:border-electric-500/30 transition-all duration-300 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-base">{shop.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
              />
            ))}
            <span className="text-gray-400 text-xs ml-1">{shop.rating?.toFixed(1)}</span>
          </div>
        </div>
        {stock !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            inStock ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
            {inStock ? `${stock.quantity} in Stock` : 'Out of Stock'}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-electric-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-gray-300 text-sm">{shop.address}</p>
            <p className="text-gray-400 text-xs">{shop.city}, {shop.state}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-electric-400 shrink-0" />
          <a href={`tel:${shop.phone}`} className="text-gray-300 text-sm hover:text-electric-400 transition-colors">
            {shop.phone}
          </a>
        </div>
        {shop.email && (
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-electric-400 shrink-0" />
            <a href={`mailto:${shop.email}`} className="text-gray-300 text-sm hover:text-electric-400 transition-colors truncate">
              {shop.email}
            </a>
          </div>
        )}
        {shop.opening_hours && (
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-electric-400 shrink-0" />
            <p className="text-gray-400 text-sm">{shop.opening_hours}</p>
          </div>
        )}
      </div>

      {/* Price + Action */}
      {stock !== null && (
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Price at this shop</p>
            <p className="text-electric-400 font-bold text-lg">
              ₹{stock.selling_price?.toLocaleString() || 'N/A'}
            </p>
          </div>
          {inStock && partId && (
            <Link
              to={`/reserve/${partId}?shop=${shop.id}`}
              className="flex items-center gap-2 btn-primary py-2 px-4 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Reserve
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
