export type ReservationSource = 'direct' | 'airbnb' | 'booking' | 'escapada'
export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'in-house' | 'completed'
export type PaymentStatus = 'paid' | 'partial' | 'pending'

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface Reservation {
  id: string
  guest: Guest
  checkIn: Date
  checkOut: Date
  guests: number
  adults: number
  children: number
  status: ReservationStatus
  source: ReservationSource
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  notes?: string
  adminNotes?: string
  createdAt: Date
}

export interface Alert {
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
  revenue: number
  occupancy: number
  reservations: number
}

// Mock Guests
const guests: Guest[] = [
  { id: '1', name: 'Carlos García', email: 'carlos@email.com', phone: '+34690288707' },
  { id: '2', name: 'María López', email: 'maria@email.com', phone: '+34612345678' },
  { id: '3', name: 'Jean Dupont', email: 'jean@email.fr', phone: '+33612345678' },
  { id: '4', name: 'Ana Martínez', email: 'ana@email.com', phone: '+34698765432' },
  { id: '5', name: 'Peter Smith', email: 'peter@email.com', phone: '+44789012345' },
  { id: '6', name: 'Laura Sánchez', email: 'laura@email.com', phone: '+34611223344' },
  { id: '7', name: 'Marco Rossi', email: 'marco@email.it', phone: '+39321654987' },
  { id: '8', name: 'Sophie Bernard', email: 'sophie@email.fr', phone: '+33698765432' },
]

// Helper to create dates
const today = new Date()
const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Mock Reservations
export const reservations: Reservation[] = [
  {
    id: 'R001',
    guest: guests[0],
    checkIn: today,
    checkOut: addDays(today, 3),
    guests: 4,
    adults: 2,
    children: 2,
    status: 'in-house',
    source: 'direct',
    totalAmount: 450,
    paidAmount: 450,
    paymentStatus: 'paid',
    notes: 'Llegada prevista a las 16:00',
    adminNotes: 'Cliente repetidor, muy amable',
    createdAt: addDays(today, -15),
  },
  {
    id: 'R002',
    guest: guests[1],
    checkIn: addDays(today, 3),
    checkOut: addDays(today, 7),
    guests: 2,
    adults: 2,
    children: 0,
    status: 'confirmed',
    source: 'airbnb',
    totalAmount: 620,
    paidAmount: 620,
    paymentStatus: 'paid',
    createdAt: addDays(today, -10),
  },
  {
    id: 'R003',
    guest: guests[2],
    checkIn: addDays(today, 7),
    checkOut: addDays(today, 10),
    guests: 6,
    adults: 4,
    children: 2,
    status: 'pending',
    source: 'booking',
    totalAmount: 480,
    paidAmount: 150,
    paymentStatus: 'partial',
    notes: 'Necesitan cuna',
    createdAt: addDays(today, -5),
  },
  {
    id: 'R004',
    guest: guests[3],
    checkIn: addDays(today, 14),
    checkOut: addDays(today, 17),
    guests: 3,
    adults: 2,
    children: 1,
    status: 'confirmed',
    source: 'escapada',
    totalAmount: 420,
    paidAmount: 420,
    paymentStatus: 'paid',
    createdAt: addDays(today, -3),
  },
  {
    id: 'R005',
    guest: guests[4],
    checkIn: addDays(today, 21),
    checkOut: addDays(today, 28),
    guests: 4,
    adults: 2,
    children: 2,
    status: 'confirmed',
    source: 'direct',
    totalAmount: 980,
    paidAmount: 0,
    paymentStatus: 'pending',
    notes: 'English speakers',
    createdAt: addDays(today, -2),
  },
  {
    id: 'R006',
    guest: guests[5],
    checkIn: addDays(today, -5),
    checkOut: today,
    guests: 2,
    adults: 2,
    children: 0,
    status: 'completed',
    source: 'airbnb',
    totalAmount: 750,
    paidAmount: 750,
    paymentStatus: 'paid',
    createdAt: addDays(today, -20),
  },
  {
    id: 'R007',
    guest: guests[6],
    checkIn: addDays(today, 30),
    checkOut: addDays(today, 35),
    guests: 5,
    adults: 3,
    children: 2,
    status: 'pending',
    source: 'booking',
    totalAmount: 750,
    paidAmount: 250,
    paymentStatus: 'partial',
    createdAt: addDays(today, -1),
  },
  {
    id: 'R008',
    guest: guests[7],
    checkIn: addDays(today, 10),
    checkOut: addDays(today, 12),
    guests: 2,
    adults: 2,
    children: 0,
    status: 'cancelled',
    source: 'direct',
    totalAmount: 300,
    paidAmount: 300,
    paymentStatus: 'paid',
    adminNotes: 'Reembolso procesado',
    createdAt: addDays(today, -8),
  },
]

// Mock Alerts
export const alerts: Alert[] = [
  {
    id: 'A001',
    type: 'arrival-reminder',
    title: 'Llegada hoy',
    message: 'Carlos García llega hoy entre las 16:00 y 18:00',
    reservationId: 'R001',
    read: false,
    createdAt: today,
  },
  {
    id: 'A002',
    type: 'pending-payment',
    title: 'Pago pendiente',
    message: 'Jean Dupont tiene un pago pendiente de 330€',
    reservationId: 'R003',
    read: false,
    createdAt: addDays(today, -1),
  },
  {
    id: 'A003',
    type: 'new-reservation',
    title: 'Nueva reserva',
    message: 'Marco Rossi ha realizado una nueva reserva para julio',
    reservationId: 'R007',
    read: false,
    createdAt: addDays(today, -1),
  },
  {
    id: 'A004',
    type: 'checkout-reminder',
    title: 'Salida hoy',
    message: 'Laura Sánchez sale hoy antes de las 11:00',
    reservationId: 'R006',
    read: true,
    createdAt: today,
  },
  {
    id: 'A005',
    type: 'change-request',
    title: 'Solicitud de cambio',
    message: 'Peter Smith solicita cambiar fechas de su reserva',
    reservationId: 'R005',
    read: false,
    createdAt: addDays(today, -2),
  },
]

// Mock Monthly Stats
export const monthlyStats: MonthlyStats[] = [
  { month: 'Ene', revenue: 1200, occupancy: 35, reservations: 4 },
  { month: 'Feb', revenue: 1800, occupancy: 45, reservations: 5 },
  { month: 'Mar', revenue: 2400, occupancy: 55, reservations: 7 },
  { month: 'Abr', revenue: 3200, occupancy: 70, reservations: 9 },
  { month: 'May', revenue: 4100, occupancy: 82, reservations: 11 },
  { month: 'Jun', revenue: 4800, occupancy: 90, reservations: 12 },
  { month: 'Jul', revenue: 5500, occupancy: 95, reservations: 14 },
  { month: 'Ago', revenue: 5800, occupancy: 98, reservations: 15 },
  { month: 'Sep', revenue: 3800, occupancy: 75, reservations: 10 },
  { month: 'Oct', revenue: 2600, occupancy: 55, reservations: 7 },
  { month: 'Nov', revenue: 1400, occupancy: 38, reservations: 5 },
  { month: 'Dic', revenue: 2200, occupancy: 50, reservations: 6 },
]

// Helper functions
export const getUpcomingReservations = () => 
  reservations.filter(r => r.status === 'confirmed' && r.checkIn > today)
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())

export const getInHouseReservations = () => 
  reservations.filter(r => r.status === 'in-house')

export const getPendingReservations = () => 
  reservations.filter(r => r.status === 'pending')

export const getCancelledReservations = () => 
  reservations.filter(r => r.status === 'cancelled')

export const getTodayCheckIns = () => 
  reservations.filter(r => {
    const checkInDate = new Date(r.checkIn)
    return checkInDate.toDateString() === today.toDateString() && r.status !== 'cancelled'
  })

export const getTodayCheckOuts = () => 
  reservations.filter(r => {
    const checkOutDate = new Date(r.checkOut)
    return checkOutDate.toDateString() === today.toDateString()
  })

export const getUnreadAlerts = () => 
  alerts.filter(a => !a.read)

export const getMonthlyRevenue = () => {
  const currentMonth = today.getMonth()
  return monthlyStats[currentMonth]?.revenue || 0
}

export const getYearlyRevenue = () => 
  monthlyStats.reduce((acc, m) => acc + m.revenue, 0)

export const getPendingPayments = () => 
  reservations
    .filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled')
    .reduce((acc, r) => acc + (r.totalAmount - r.paidAmount), 0)

export const getMonthlyOccupancy = () => {
  const currentMonth = today.getMonth()
  return monthlyStats[currentMonth]?.occupancy || 0
}

export const getMonthlyReservationsCount = () => {
  const currentMonth = today.getMonth()
  return monthlyStats[currentMonth]?.reservations || 0
}

export const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

export const formatDate = (date: Date) => 
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date)

export const formatDateLong = (date: Date) => 
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)

export const formatDateRange = (checkIn: Date, checkOut: Date) => 
  `${formatDate(checkIn)} - ${formatDate(checkOut)}`

export const getNights = (checkIn: Date, checkOut: Date) => 
  Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

export const getWhatsAppUrl = (phone: string, guestName: string, checkIn: Date, checkOut: Date) => {
  const message = encodeURIComponent(
    `Hola ${guestName.split(' ')[0]}, te escribimos desde La Rasilla sobre tu reserva del ${formatDate(checkIn)} al ${formatDate(checkOut)}.`
  )
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`
}

export const getSourceColor = (source: ReservationSource) => {
  switch (source) {
    case 'direct': return 'bg-emerald-100 text-emerald-700'
    case 'airbnb': return 'bg-pink-100 text-pink-700'
    case 'booking': return 'bg-blue-100 text-blue-700'
    case 'escapada': return 'bg-orange-100 text-orange-700'
  }
}

export const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed': return 'bg-emerald-100 text-emerald-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'in-house': return 'bg-blue-100 text-blue-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    case 'completed': return 'bg-gray-100 text-gray-700'
  }
}

export const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case 'paid': return 'bg-emerald-100 text-emerald-700'
    case 'partial': return 'bg-yellow-100 text-yellow-700'
    case 'pending': return 'bg-red-100 text-red-700'
  }
}

export const getSourceLabel = (source: ReservationSource) => {
  switch (source) {
    case 'direct': return 'Directo'
    case 'airbnb': return 'Airbnb'
    case 'booking': return 'Booking'
    case 'escapada': return 'Escapada Rural'
  }
}

export const getStatusLabel = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed': return 'Confirmada'
    case 'pending': return 'Pendiente'
    case 'in-house': return 'Alojado'
    case 'cancelled': return 'Cancelada'
    case 'completed': return 'Completada'
  }
}

export const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case 'paid': return 'Pagado'
    case 'partial': return 'Parcial'
    case 'pending': return 'Pendiente'
  }
}
