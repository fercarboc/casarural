'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Phone, MessageCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchAllReservas, getWhatsAppUrl, getSourceColor, getSourceLabel, formatCurrency } from '@/lib/services'
import type { ReservaView } from '@/lib/types'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const sourceCalendarColor: Record<string, string> = {
  direct: 'bg-emerald-500',
  admin: 'bg-emerald-500',
  airbnb: 'bg-pink-500',
  booking: 'bg-blue-500',
  escapada: 'bg-orange-500',
}

export default function CalendarioPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [reservas, setReservas] = useState<ReservaView[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReserva, setSelectedReserva] = useState<ReservaView | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setReservas(await fetchAllReservas()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  // Ajuste: lunes = 0
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = useMemo(() => {
    const arr: (Date | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d))
    return arr
  }, [year, month, daysInMonth, startOffset])

  const activeReservas = useMemo(() =>
    reservas.filter(r => r.status !== 'cancelled' && r.checkIn <= new Date(year, month + 1, 0) && r.checkOut > new Date(year, month, 1)),
    [reservas, year, month],
  )

  const getReservasForDay = (date: Date) =>
    activeReservas.filter(r => {
      const d = date.getTime()
      return r.checkIn.getTime() <= d && r.checkOut.getTime() > d
    })

  const monthOccupancy = useMemo(() => {
    const occupied = new Set<string>()
    activeReservas.forEach(r => {
      let d = new Date(r.checkIn)
      while (d < r.checkOut) {
        if (d.getFullYear() === year && d.getMonth() === month) {
          occupied.add(d.toDateString())
        }
        d = new Date(d.getTime() + 86400000)
      }
    })
    return Math.round((occupied.size / daysInMonth) * 100)
  }, [activeReservas, year, month, daysInMonth])

  const monthIngresos = activeReservas
    .filter(r => r.checkIn.getMonth() === month && r.checkIn.getFullYear() === year)
    .reduce((s, r) => s + r.totalAmount, 0)

  return (
    <div className="p-4 space-y-4 safe-area-top">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={load}>
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Mes + stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">{MONTHS[month]} {year}</h2>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Ocupación </span>
            <span className="font-semibold">{monthOccupancy}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ingresos </span>
            <span className="font-semibold">{formatCurrency(monthIngresos)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Reservas </span>
            <span className="font-semibold">
              {activeReservas.filter(r => r.checkIn.getMonth() === month && r.checkIn.getFullYear() === year).length}
            </span>
          </div>
        </div>
      </Card>

      {/* Calendário grid */}
      <Card className="p-3">
        {/* Cabecera días */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />
            const dayReservas = getReservasForDay(date)
            const isToday = date.toDateString() === today.toDateString()
            const isPast = date < today
            return (
              <div
                key={date.toDateString()}
                className={cn(
                  'relative flex flex-col items-center py-1 rounded-lg cursor-pointer transition-colors',
                  dayReservas.length > 0 ? 'hover:bg-accent/30' : 'hover:bg-accent/20',
                  isPast && dayReservas.length === 0 && 'opacity-40',
                )}
                onClick={() => dayReservas.length > 0 && setSelectedReserva(dayReservas[0])}
              >
                <span className={cn(
                  'text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full',
                  isToday && 'bg-primary text-primary-foreground',
                )}>
                  {date.getDate()}
                </span>
                {dayReservas.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayReservas.slice(0, 2).map((r, idx) => (
                      <span
                        key={idx}
                        className={cn('h-1.5 w-1.5 rounded-full', sourceCalendarColor[r.source])}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries({ 'Directo': 'bg-emerald-500', 'Airbnb': 'bg-pink-500', 'Booking': 'bg-blue-500', 'Escapada': 'bg-orange-500' }).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Reservas del mes */}
      <section className="space-y-3">
        <h3 className="font-semibold">Reservas del mes</h3>
        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)
        ) : activeReservas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin reservas este mes</p>
        ) : (
          activeReservas.map(r => (
            <Card key={r.id} className="p-4" onClick={() => setSelectedReserva(r)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{r.guestName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.checkIn.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} —{' '}
                    {r.checkOut.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {r.nights} noches
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getSourceColor(r.source))}>
                    {getSourceLabel(r.source)}
                  </span>
                  <span className="text-sm font-semibold">{formatCurrency(r.totalAmount)}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* Modal reserva seleccionada */}
      {selectedReserva && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setSelectedReserva(null)}
        >
          <div
            className="w-full bg-card rounded-t-2xl p-6 space-y-4 safe-area-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
            <div>
              <h3 className="font-bold text-lg">{selectedReserva.guestName}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedReserva.checkIn.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} —{' '}
                {selectedReserva.checkOut.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                {' '}· {selectedReserva.nights} noches · {selectedReserva.guests} huéspedes
              </p>
              <p className="font-semibold mt-1">{formatCurrency(selectedReserva.totalAmount)}</p>
            </div>
            <div className="flex gap-3">
              {selectedReserva.phone && (
                <Button variant="outline" className="flex-1 rounded-full" asChild>
                  <a href={`tel:${selectedReserva.phone}`}><Phone className="h-4 w-4 mr-2" />Llamar</a>
                </Button>
              )}
              {selectedReserva.phone && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full bg-green-50 border-green-200 text-green-600"
                  asChild
                >
                  <a href={getWhatsAppUrl(selectedReserva.phone, selectedReserva.guestName, selectedReserva.checkIn, selectedReserva.checkOut)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
