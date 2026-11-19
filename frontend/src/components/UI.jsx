export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className={`${sizes[size]} border-3 border-electric-500/20 border-t-electric-400 rounded-full animate-spin`}
        style={{ borderWidth: '3px', borderColor: 'rgba(0,163,255,0.2)', borderTopColor: '#00a3ff' }}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="glass-card p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-white font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm py-2 px-5">
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="text-6xl mb-4">{icon || '🔍'}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, icon: Icon, breadcrumb }) {
  return (
    <div className="bg-gradient-to-r from-navy-900 to-navy-800 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {breadcrumb && (
          <p className="text-gray-500 text-sm mb-3">{breadcrumb}</p>
        )}
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
