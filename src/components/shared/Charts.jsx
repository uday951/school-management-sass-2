import React from 'react'

export function BarChart({ data = [], height = 200 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="w-full flex flex-col justify-end space-y-4">
      <div className="flex items-end justify-between gap-2 w-full" style={{ height: `${height}px` }}>
        {data.map((item, i) => {
          const pct = (item.value / maxVal) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip trigger */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                {item.value}
              </div>
              <div 
                className="w-full bg-primary hover:bg-primary/90 transition-all rounded-t-sm animate-in slide-in-from-bottom-2 duration-300"
                style={{ height: `${pct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-[10px] text-muted-foreground select-none font-medium">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center truncate">{item.label}</div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data = [], height = 200 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const len = data.length
  
  // Compute SVG coordinates: w = 500, h = 200
  const width = 500
  const points = data.map((d, i) => {
    const x = (i / (len - 1 || 1)) * width
    const y = height - (d.value / maxVal) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full flex flex-col justify-end space-y-4">
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="animate-in fade-in duration-300"
          />
          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (len - 1 || 1)) * width
            const y = height - (d.value / maxVal) * height
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                className="fill-card stroke-primary stroke-[2px] cursor-pointer hover:r-7 transition-all"
                title={`${d.label}: ${d.value}`}
              />
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-[10px] text-muted-foreground select-none font-medium">
        {data.map((item, i) => (
          <div key={i} className="text-center truncate">{item.label}</div>
        ))}
      </div>
    </div>
  )
}

export function PieChart({ data = [] }) {
  // Simple circular visual grid segment
  const colors = [
    'hsl(var(--primary))',
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Rose
    '#6366f1'  // Indigo
  ]
  const total = data.reduce((acc, curr) => acc + curr.value, 0)
  
  let accumulatedAngle = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <svg viewBox="0 0 100 100" className="h-40 w-40 overflow-visible">
        {data.map((item, i) => {
          const pct = item.value / (total || 1)
          const angle = pct * 360
          
          const x1 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180)
          const y1 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180)
          
          accumulatedAngle += angle
          
          const x2 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180)
          const y2 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180)
          
          const largeArc = angle > 180 ? 1 : 0
          
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]}
              className="stroke-card stroke-[1px] hover:opacity-90 transition-opacity cursor-pointer"
            />
          )
        })}
      </svg>
      <div className="space-y-2 text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-muted-foreground">{item.label}:</span>
            <span className="font-bold text-foreground">{item.value} ({Math.round((item.value / (total || 1)) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AreaChart({ data = [], height = 200 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const len = data.length
  const width = 500

  const points = data.map((d, i) => {
    const x = (i / (len - 1 || 1)) * width
    const y = height - (d.value / maxVal) * height
    return `${x},${y}`
  }).join(' ')

  const areaPath = points ? `${points} L ${width},${height} L 0,${height} Z` : ''

  return (
    <div className="w-full flex flex-col justify-end space-y-4">
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            className="animate-in fade-in duration-300"
          />
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-[10px] text-muted-foreground select-none font-medium">
        {data.map((item, i) => (
          <div key={i} className="text-center truncate">{item.label}</div>
        ))}
      </div>
    </div>
  )
}
