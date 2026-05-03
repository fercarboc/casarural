'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Bell,
  Calendar,
  CreditCard,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  fetchAllReservas,
  fetchSolicitudesPendientes,
  generateAlerts,
} from '@/lib/services'
import type { AlertItem } from '@/lib/types'

const getAlertIcon = (type: AlertItem['type']) => {
  switch (type) {
    case 'new-reservation': return Calendar
    case 'pending-payment': return CreditCard
    case 'cancellation': return AlertCircle
    case 'change-request': return AlertCircle
    case 'arrival-reminder': return LogIn
    case 'checkout-reminder': return LogOut
  }
}

const getAlertColor = (type: AlertItem['type']) => {
  switch (type) {
    case 'new-reservation': return 'bg-emerald-100 text-emerald-600'
    case 'pending-payment': return 'bg-orange-100 text-orange-600'
    case 'cancellation': return 'bg-red-100 text-red-600'
    case 'change-request': return 'bg-purple-100 text-purple-600'
    case 'arrival-reminder': return 'bg-blue-100 text-blue-600'
    case 'checkout-reminder': return 'bg-yellow-100 text-yellow-600'
  }
}

const formatTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (min < 60) return `Hace ${min} min`
  if (hrs < 24) return `Hace ${hrs}h`
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

export default function AvisosPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [reservas, solicitudes] = await Promise.all([
        fetchAllReservas(),
        fetchSolicitudesPendientes(),
      ])
      setAlerts(generateAlerts(reservas, solicitudes))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const unreadCount = alerts.filter(a => !a.read).length

  const markAsRead = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))

  const markAllAsRead = () =>
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))

  return (
    <div className="p-4 space-y-4 safe-area-top">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">Avisos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-primary" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />Marcar todas
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-full" onClick={load}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
          ))
        ) : alerts.length > 0 ? (
          alerts.map(alert => {
            const Icon = getAlertIcon(alert.type)
            return (
              <Card
                key={alert.id}
                className={cn(
                  'p-4 transition-colors cursor-pointer hover:bg-accent/50',
                  !alert.read && 'bg-primary/5 border-primary/20',
                )}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0', getAlertColor(alert.type))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('font-medium truncate', !alert.read && 'text-primary')}>
                        {alert.title}
                      </p>
                      {!alert.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.createdAt)}</p>
                  </div>
                  {alert.reservationId && (
                    <Link
                      href={`/reservas/${alert.reservationId}`}
                      className="shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="p-8 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Sin avisos</p>
            <p className="text-sm text-muted-foreground mt-1">No hay alertas pendientes hoy</p>
          </Card>
        )}
      </div>
    </div>
  )
}
