export default function StatCard({ icon: Icon, label, value, change, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'from-electric-500/20 to-electric-700/10 border-electric-500/30 text-electric-400',
    green: 'from-green-500/20 to-green-700/10 border-green-500/30 text-green-400',
    orange: 'from-orange-500/20 to-orange-700/10 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-red-700/10 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-700/10 border-purple-500/30 text-purple-400',
  }

  return (
    <div className={`glass-card p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].split(' ').slice(0, 2).join(' ')} opacity-50`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center ${
            color === 'blue' ? 'from-electric-500/30 to-electric-700/20' :
            color === 'green' ? 'from-green-500/30 to-green-700/20' :
            color === 'orange' ? 'from-orange-500/30 to-orange-700/20' :
            color === 'red' ? 'from-red-500/30 to-red-700/20' :
            'from-purple-500/30 to-purple-700/20'
          }`}>
            <Icon className={`w-6 h-6 ${colorMap[color].split(' ').pop()}`} />
          </div>
          {change !== undefined && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-white font-bold text-3xl font-display">{value?.toLocaleString()}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
