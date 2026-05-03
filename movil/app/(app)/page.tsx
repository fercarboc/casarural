'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  TrendingUp,
  CreditCard,
  Percent,
  LogIn,
  LogOut,
  CalendarPlus,
  Calendar,
  MessageSquare,
  RefreshCw,
  LogOut as SignOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatsCard } from '@/components/admin/stats-card'
import { ReservationCard } from '@/components/admin/reservation-card'
import { supabase } from '@/lib/supabase'
import {
  fetchAllReservas,
  formatCurrency,
} from '@/lib/services'
import type { ReservaView } from '@/lib/types'

export default function Dashboard() {
  const [reservas, setReservas] = useState<ReservaView[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await fetchAllReservas()
      setReservas(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const inHouse = reservas.filter(r => r.status === 'in-house')
  const todayCheckIns = reservas.filter(
    r => r.status === 'in-house' && r.checkIn.toDateString() === today.toDateString(),
  )
  const todayCheckOuts = reservas.filter(
    r => r.checkOut.toDateString() === today.toDateString() &&
      (r.status === 'in-house' || r.status === 'completed'),
  )
  const upcoming = reservas
    .filter(r => r.status === 'upcoming')
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())

  const currentMonth = new Date().getMonth()
  const monthRevenue = reservas
    .filter(r => r.checkIn.getMonth() === currentMonth && r.status !== 'cancelled')
    .reduce((s, r) => s + r.totalAmount, 0)
  const pendingPayments = reservas
    .filter(r => r.paymentStatus !== 'paid' && (r.status === 'upcoming' || r.status === 'in-house'))
    .reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0)
  const monthReservations = reservas.filter(
    r => r.checkIn.getMonth() === currentMonth && r.status !== 'cancelled',
  ).length

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6 safe-area-top animate-pulse">
        <div className="h-10 bg-secondary rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 safe-area-top">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${inHouse.length > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {inHouse.length > 0 ? 'Casa ocupada' : 'Casa libre hoy'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full">
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => supabase.auth.signOut()}
          >
            <SignOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <StatsCard title="Reservas este mes" value={monthReservations} icon={CalendarDays} />
        <StatsCard
          title="Ingresos del mes"
          value={formatCurrency(monthRevenue)}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Pagos pendientes"
          value={formatCurrency(pendingPayments)}
          icon={CreditCard}
          variant={pendingPayments > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="Alojados ahora"
          value={inHouse.length}
          icon={Percent}
          variant="primary"
        />
      </section>

      {/* Hoy */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Hoy</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <LogIn className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCheckIns.length}</p>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCheckOuts.length}</p>
              <p className="text-xs text-muted-foreground">Check-outs</p>
            </div>
          </Card>
        </div>

        {todayCheckIns.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Llegadas de hoy</p>
            {todayCheckIns.map(r => <ReservationCard key={r.id} reservation={r} compact />)}
          </div>
        )}
        {todayCheckOuts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Salidas de hoy</p>
            {todayCheckOuts.map(r => <ReservationCard key={r.id} reservation={r} compact />)}
          </div>
        )}
      </section>

      {/* Próximas reservas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximas reservas</h2>
          <Link href="/reservas" className="text-sm text-primary font-medium">Ver todas</Link>
        </div>
        <div className="space-y-3">
          {upcoming.slice(0, 3).map(r => <ReservationCard key={r.id} reservation={r} />)}
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Sin reservas próximas</p>
          )}
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Acciones rápidas</h2>
        <div className="grid grid-cols-3 gap-2">
          <Link href="/calendario">
            <Card className="p-3 flex flex-col items-center gap-2 hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <CalendarPlus className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-[10px] font-medium text-center">Calendario</span>
            </Card>
          </Link>
          <Link href="/reservas">
            <Card className="p-3 flex flex-col items-center gap-2 hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-[10px] font-medium text-center">Reservas</span>
            </Card>
          </Link>
          <Link href="/avisos">
            <Card className="p-3 flex flex-col items-center gap-2 hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-[10px] font-medium text-center">Avisos</span>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
