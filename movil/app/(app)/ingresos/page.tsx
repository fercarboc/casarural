'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, CreditCard, Calendar, Percent, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchMonthlyStats, fetchAllReservas, formatCurrency } from '@/lib/services'
import type { MonthlyStats, ReservaView } from '@/lib/types'

type Period = 'month' | 'year'

export default function IngresosPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [stats, setStats] = useState<MonthlyStats[]>([])
  const [reservas, setReservas] = useState<ReservaView[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([fetchMonthlyStats(), fetchAllReservas()])
      setStats(s)
      setReservas(r)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const currentMonth = new Date().getMonth()

  const monthStats = stats[currentMonth]
  const lastMonthStats = stats[currentMonth - 1]

  const monthRevenue = monthStats?.revenue ?? 0
  const yearRevenue = stats.reduce((s, m) => s + m.revenue, 0)
  const pendingPayments = reservas
    .filter(r => r.paymentStatus !== 'paid' && (r.status === 'upcoming' || r.status === 'in-house'))
    .reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0)
  const occupancy = monthStats?.occupancy ?? 0

  const growth = lastMonthStats?.revenue
    ? Math.round(((monthRevenue - lastMonthStats.revenue) / lastMonthStats.revenue) * 100)
    : 0

  const avgPerNight = monthRevenue > 0 && (monthStats?.reservations ?? 0) > 0
    ? Math.round(monthRevenue / (monthStats?.reservations ?? 1) / 3)
    : 0

  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1)

  const shownStats = stats.slice(0, currentMonth + 1)

  if (loading) {
    return (
      <div className="p-4 space-y-4 safe-area-top animate-pulse">
        <div className="h-8 bg-secondary rounded-xl w-32" />
        <div className="h-28 bg-secondary rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-secondary rounded-xl" />
          <div className="h-20 bg-secondary rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 safe-area-top">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">Ingresos</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen financiero</p>
        </div>
        <button onClick={load} className="p-2 rounded-full hover:bg-secondary">
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Toggle periodo */}
      <div className="flex gap-2 p-1 bg-secondary rounded-full w-fit">
        {(['month', 'year'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              period === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            {p === 'month' ? 'Este mes' : 'Este año'}
          </button>
        ))}
      </div>

      {/* Stat principal */}
      <Card className="p-4 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">
              {period === 'month' ? 'Ingresos del mes' : 'Ingresos del año'}
            </p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(period === 'month' ? monthRevenue : yearRevenue)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
        {period === 'month' && growth !== 0 && (
          <div className="flex items-center gap-1 mt-3">
            {growth > 0
              ? <TrendingUp className="h-4 w-4 text-emerald-300" />
              : <TrendingDown className="h-4 w-4 text-red-300" />}
            <span className={cn('text-sm font-medium', growth > 0 ? 'text-emerald-300' : 'text-red-300')}>
              {growth > 0 ? '+' : ''}{growth}% vs mes anterior
            </span>
          </div>
        )}
      </Card>

      {/* Grid secundario */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium">Pendiente</span>
          </div>
          <p className={cn('text-xl font-bold', pendingPayments > 0 ? 'text-orange-600' : '')}>
            {formatCurrency(pendingPayments)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Media/noche</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(avgPerNight)}</p>
        </Card>
        <Card className="p-4 col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Ocupación del mes</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold">{occupancy}%</p>
            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfica ingresos */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Ingresos por mes</h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {stats.map((s, i) => {
            const height = (s.revenue / maxRevenue) * 100
            const isCurrent = i === currentMonth
            return (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn('w-full rounded-t transition-all', isCurrent ? 'bg-primary' : 'bg-secondary')}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className={cn('text-[9px]', isCurrent ? 'font-bold text-primary' : 'text-muted-foreground')}>
                  {s.month}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tabla detalle */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Detalle por mes</h3>
        <div className="space-y-3">
          {[...shownStats].reverse().map((s, i) => (
            <div
              key={s.month}
              className={cn('flex items-center justify-between py-2', i !== 0 && 'border-t border-border')}
            >
              <div>
                <p className="font-medium">{s.month}</p>
                <p className="text-xs text-muted-foreground">
                  {s.reservations} reservas · {s.occupancy}% ocupación
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(s.revenue)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
