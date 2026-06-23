interface RevenueChartProps {
  data: { month: string; revenue: number; count: number }[]
}

function formatEur(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos de ingresos en los últimos 6 meses
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const maxBarHeight = 160

  return (
    <div className="flex items-end justify-around gap-2 h-52 pt-4 px-2">
      {data.map((d, i) => {
        const barHeight = Math.max(Math.round((d.revenue / maxRevenue) * maxBarHeight), d.revenue > 0 ? 4 : 0)
        const isLast = i === data.length - 1
        return (
          <div key={d.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            {/* Importe encima */}
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              {d.revenue > 0 ? formatEur(d.revenue) : '—'}
            </span>
            {/* Barra */}
            <div
              className="w-full max-w-[48px] rounded-t-sm transition-all"
              style={{
                height: `${barHeight}px`,
                backgroundColor: isLast ? 'oklch(0.28 0.09 165)' : 'oklch(0.28 0.09 165 / 0.4)',
              }}
            />
            {/* Mes */}
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {d.month}
            </span>
            {/* Matrículas */}
            <span className="text-[9px] text-muted-foreground/60">
              {d.count} {d.count === 1 ? 'matrícula' : 'matrículas'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
