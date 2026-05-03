// Tipos que mapean la BD de Supabase exactamente
export type ReservaEstado = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW'
export type ReservaEstadoPago = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'
export type ReservaOrigen = 'DIRECT_WEB' | 'BOOKING_ICAL' | 'AIRBNB_ICAL' | 'ESCAPADARURAL_ICAL' | 'ADMIN'

export interface Reserva {
  id: string
  codigo: string
  nombre: string
  apellidos: string
  email: string
  telefono: string | null
  fecha_entrada: string
  fecha_salida: string
  num_huespedes: number
  menores: number
  estado: ReservaEstado
  estado_pago: ReservaEstadoPago
  importe_pagado: number
  total: number
  noches: number
  precio_noche: number
  origen: ReservaOrigen
  notas_admin: string | null
  notas_cliente: string | null
  solicitud_cambio: string | null
  tarifa: 'FLEXIBLE' | 'NO_REEMBOLSABLE'
  created_at: string
}

export interface SolicitudCambio {
  id: string
  reserva_id: string
  tipo: 'CAMBIO_FECHAS' | 'CANCELACION' | 'OTRO'
  estado: 'PENDIENTE' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | 'RESUELTA'
  mensaje: string | null
  nueva_entrada: string | null
  nueva_salida: string | null
  created_at: string
}

// Vista computada para la app móvil
export type ReservaStatus = 'upcoming' | 'in-house' | 'pending' | 'cancelled' | 'completed'
export type ReservaSource = 'direct' | 'airbnb' | 'booking' | 'escapada' | 'admin'
export type PaymentStatus = 'paid' | 'partial' | 'pending'

export interface ReservaView {
  id: string
  codigo: string
  guestName: string
  email: string
  phone: string | null
  checkIn: Date
  checkOut: Date
  nights: number
  guests: number
  adults: number
  children: number
  status: ReservaStatus
  source: ReservaSource
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  notes: string | null
  adminNotes: string | null
  pricePerNight: number
  raw: Reserva
}

export interface AlertItem {
  id: string
  type: 'new-reservation' | 'pending-payment' | 'cancellation' | 'change-request' | 'arrival-reminder' | 'checkout-reminder'
  title: string
  message: string
  reservationId?: string
  read: boolean
  createdAt: Date
}

export interface MonthlyStats {
  month: string
  monthNum: number
  revenue: number
  occupancy: number
  reservations: number
}
