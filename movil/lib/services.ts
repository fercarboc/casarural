import { supabase } from './supabase'
import type {
  Reserva,
  ReservaView,
  SolicitudCambio,
  MonthlyStats,
  AlertItem,
} from './types'

const todayStart = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function mapReservaToView(r: Reserva): ReservaView {
  const today = todayStart()
  const checkIn = new Date(r.fecha_entrada + 'T00:00:00')
  const checkOut = new Date(r.fecha_salida + 'T00:00:00')

  type S = ReservaView['status']
  let status: S
  if (r.estado === 'CANCELLED' || r.estado === 'EXPIRED' || r.estado === 'NO_SHOW') {
    status = 'cancelled'
  } else if (r.estado === 'PENDING_PAYMENT') {
    status = 'pending'
  } else {
    // CONFIRMED
    if (checkIn <= today && checkOut > today) status = 'in-house'
    else if (checkOut <= today) status = 'completed'
    else status = 'upcoming'
  }

  type Src = ReservaView['source']
  const sourceMap: Record<string, Src> = {
    AIRBNB_ICAL: 'airbnb',
    BOOKING_ICAL: 'booking',
    ESCAPADARURAL_ICAL: 'escapada',
    ADMIN: 'admin',
  }
  const source: Src = sourceMap[r.origen] ?? 'direct'

  type Pay = ReservaView['paymentStatus']
  const payMap: Record<string, Pay> = { PAID: 'paid', REFUNDED: 'paid', PARTIAL: 'partial' }
  const paymentStatus: Pay = payMap[r.estado_pago] ?? 'pending'

  return {
    id: r.id,
    codigo: r.codigo,
    guestName: `${r.nombre} ${r.apellidos}`.trim(),
    email: r.email,
    phone: r.telefono,
    checkIn,
    checkOut,
    nights: r.noches,
    guests: r.num_huespedes,
    adults: r.num_huespedes - r.menores,
    children: r.menores,
    status,
    source,
    totalAmount: Number(r.total),
    paidAmount: Number(r.importe_pagado),
    paymentStatus,
    notes: r.notas_cliente,
    adminNotes: r.notas_admin,
    pricePerNight: Number(r.precio_noche),
    raw: r,
  }
}

export async function fetchAllReservas(): Promise<ReservaView[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('fecha_entrada', { ascending: true })
  if (error) throw error
  return (data as Reserva[]).map(mapReservaToView)
}

export async function fetchReservaById(id: string): Promise<ReservaView | null> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return mapReservaToView(data as Reserva)
}

export async function fetchSolicitudesPendientes(): Promise<SolicitudCambio[]> {
  const { data, error } = await supabase
    .from('solicitudes_cambio')
    .select('*')
    .eq('estado', 'PENDIENTE')
    .order('created_at', { ascending: false })
  if (error) return []
  return data as SolicitudCambio[]
}

export function generateAlerts(
  reservas: ReservaView[],
  solicitudes: SolicitudCambio[],
): AlertItem[] {
  const today = todayStart()
  const alerts: AlertItem[] = []

  reservas
    .filter(r => r.status === 'in-house' && r.checkIn.toDateString() === today.toDateString())
    .forEach(r => {
      alerts.push({
        id: `checkin-${r.id}`,
        type: 'arrival-reminder',
        title: 'Llegada hoy',
        message: `${r.guestName} llega hoy · ${r.guests} huéspedes`,
        reservationId: r.id,
        read: false,
        createdAt: new Date(),
      })
    })

  reservas
    .filter(
      r =>
        r.checkOut.toDateString() === today.toDateString() &&
        (r.status === 'in-house' || r.status === 'completed'),
    )
    .forEach(r => {
      alerts.push({
        id: `checkout-${r.id}`,
        type: 'checkout-reminder',
        title: 'Salida hoy',
        message: `${r.guestName} sale hoy antes de las 11:00`,
        reservationId: r.id,
        read: false,
        createdAt: new Date(),
      })
    })

  reservas
    .filter(
      r =>
        r.paymentStatus !== 'paid' &&
        (r.status === 'upcoming' || r.status === 'in-house'),
    )
    .forEach(r => {
      const pending = r.totalAmount - r.paidAmount
      alerts.push({
        id: `payment-${r.id}`,
        type: 'pending-payment',
        title: 'Pago pendiente',
        message: `${r.guestName} tiene ${formatCurrency(pending)} pendiente`,
        reservationId: r.id,
        read: false,
        createdAt: new Date(r.raw.created_at),
      })
    })

  solicitudes.forEach(s => {
    alerts.push({
      id: `cambio-${s.id}`,
      type: s.tipo === 'CANCELACION' ? 'cancellation' : 'change-request',
      title: s.tipo === 'CANCELACION' ? 'Solicitud de cancelación' : 'Solicitud de cambio',
      message: s.mensaje ?? 'El cliente ha enviado una solicitud',
      reservationId: s.reserva_id,
      read: false,
      createdAt: new Date(s.created_at),
    })
  })

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function fetchMonthlyStats(): Promise<MonthlyStats[]> {
  const year = new Date().getFullYear()
  const { data, error } = await supabase
    .from('reservas')
    .select('fecha_entrada, fecha_salida, total, noches')
    .in('estado', ['CONFIRMED', 'PENDING_PAYMENT'])
    .gte('fecha_entrada', `${year}-01-01`)
    .lte('fecha_entrada', `${year}-12-31`)
  if (error) return []

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const acc: { revenue: number; reservations: number; days: number }[] = Array.from(
    { length: 12 },
    () => ({ revenue: 0, reservations: 0, days: 0 }),
  )

  ;(data as { fecha_entrada: string; total: number; noches: number }[]).forEach(r => {
    const m = new Date(r.fecha_entrada + 'T00:00:00').getMonth()
    acc[m].revenue += Number(r.total)
    acc[m].reservations++
    acc[m].days += Number(r.noches)
  })

  return monthNames.map((month, i) => ({
    month,
    monthNum: i,
    revenue: acc[i].revenue,
    reservations: acc[i].reservations,
    occupancy: Math.min(100, Math.round((acc[i].days / daysInMonth(year, i)) * 100)),
  }))
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

// ── Helpers de formato / display ─────────────────────────────────────────────

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(d)

export const formatDateLong = (d: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

export const formatDateRange = (ci: Date, co: Date) => `${formatDate(ci)} - ${formatDate(co)}`

export const getWhatsAppUrl = (phone: string, name: string, ci: Date, co: Date) => {
  const msg = encodeURIComponent(
    `Hola ${name.split(' ')[0]}, te escribimos desde La Rasilla sobre tu reserva del ${formatDate(ci)} al ${formatDate(co)}.`,
  )
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`
}

export const getSourceColor = (source: ReservaView['source']) => {
  const map: Record<string, string> = {
    direct: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-emerald-100 text-emerald-700',
    airbnb: 'bg-pink-100 text-pink-700',
    booking: 'bg-blue-100 text-blue-700',
    escapada: 'bg-orange-100 text-orange-700',
  }
  return map[source]
}

export const getStatusColor = (status: ReservaView['status']) => {
  const map: Record<string, string> = {
    upcoming: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'in-house': 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }
  return map[status]
}

export const getPaymentStatusColor = (status: ReservaView['paymentStatus']) => {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-red-100 text-red-700',
  }
  return map[status]
}

export const getSourceLabel = (source: ReservaView['source']) => {
  const map: Record<string, string> = {
    direct: 'Directo',
    admin: 'Admin',
    airbnb: 'Airbnb',
    booking: 'Booking',
    escapada: 'Escapada Rural',
  }
  return map[source]
}

export const getStatusLabel = (status: ReservaView['status']) => {
  const map: Record<string, string> = {
    upcoming: 'Confirmada',
    pending: 'Pendiente',
    'in-house': 'Alojado',
    cancelled: 'Cancelada',
    completed: 'Completada',
  }
  return map[status]
}

export const getPaymentStatusLabel = (status: ReservaView['paymentStatus']) => {
  const map: Record<string, string> = { paid: 'Pagado', partial: 'Parcial', pending: 'Pendiente' }
  return map[status]
}
