'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Users,
  CreditCard,
  Clock,
  LogIn,
  LogOut,
  Ban,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  fetchReservaById,
  formatDateLong,
  formatCurrency,
  getWhatsAppUrl,
  getSourceColor,
  getStatusColor,
  getPaymentStatusColor,
  getSourceLabel,
  getStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/services'
import { supabase } from '@/lib/supabase'
import type { ReservaView } from '@/lib/types'

export default function ReservaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [reserva, setReserva] = useState<ReservaView | null | undefined>(undefined)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchReservaById(id).then(setReserva)
  }, [id])

  const updateEstado = async (estado: string) => {
    if (!reserva) return
    setUpdating(true)
    await supabase.from('reservas').update({ estado }).eq('id', reserva.id)
    const updated = await fetchReservaById(id)
    setReserva(updated)
    setUpdating(false)
  }

  const updateEstadoPago = async (estado_pago: string) => {
    if (!reserva) return
    setUpdating(true)
    const importe_pagado = estado_pago === 'PAID' ? reserva.totalAmount : reserva.paidAmount
    await supabase.from('reservas').update({ estado_pago, importe_pagado }).eq('id', reserva.id)
    const updated = await fetchReservaById(id)
    setReserva(updated)
    setUpdating(false)
  }

  if (reserva === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="p-4 pt-6 safe-area-top">
        <Button variant="ghost" size="icon" className="rounded-full mb-4" asChild>
          <Link href="/reservas"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <Card className="p-8 text-center">
          <p className="font-medium">Reserva no encontrada</p>
        </Card>
      </div>
    )
  }

  const { guestName, email, phone, checkIn, checkOut, nights, guests, adults, children,
    status, source, totalAmount, paidAmount, paymentStatus, notes, adminNotes, pricePerNight } = reserva
  const initials = guestName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const whatsappUrl = phone ? getWhatsAppUrl(phone, guestName, checkIn, checkOut) : null
  const pendingAmount = totalAmount - paidAmount

  return (
    <div className="pb-36 safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/reservas"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-semibold text-sm">{reserva.codigo}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href={`mailto:${email}`}>
                  <Mail className="h-4 w-4 mr-2" /> Enviar email
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {status !== 'cancelled' && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => updateEstado('CANCELLED')}
                >
                  <Ban className="h-4 w-4 mr-2" /> Cancelar reserva
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Huésped */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-primary/10">
              <AvatarFallback className="text-xl font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{guestName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStatusColor(status))}>
                  {getStatusLabel(status)}
                </span>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getSourceColor(source))}>
                  {getSourceLabel(source)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {phone && (
              <Button variant="outline" className="flex-1 rounded-full" asChild>
                <a href={`tel:${phone}`}><Phone className="h-4 w-4 mr-2" />Llamar</a>
              </Button>
            )}
            {whatsappUrl && (
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-green-50 border-green-200 hover:bg-green-100 text-green-600"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
                </a>
              </Button>
            )}
          </div>
        </Card>

        {/* Contacto */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Contacto</h3>
          {phone && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{phone}</p>
                <p className="text-xs text-muted-foreground">Teléfono</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{email}</p>
              <p className="text-xs text-muted-foreground">Email</p>
            </div>
          </div>
        </Card>

        {/* Estancia */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Estancia</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{formatDateLong(checkIn)}</p>
                <p className="text-xs text-muted-foreground">Check-in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{formatDateLong(checkOut)}</p>
                <p className="text-xs text-muted-foreground">Check-out</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{nights} noches</p>
                <p className="text-xs text-muted-foreground">Duración</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {adults} adultos{children > 0 ? `, ${children} niños` : ''}
                </p>
                <p className="text-xs text-muted-foreground">{guests} huéspedes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Precio */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground">Precio</h3>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getPaymentStatusColor(paymentStatus))}>
              {getPaymentStatusLabel(paymentStatus)}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{formatCurrency(pricePerNight)} × {nights} noches</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Pagado</span>
                <span>{formatCurrency(paidAmount)}</span>
              </div>
            )}
            {pendingAmount > 0 && (
              <div className="flex justify-between text-orange-600 font-medium">
                <span>Pendiente</span>
                <span>{formatCurrency(pendingAmount)}</span>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </Card>

        {/* Notas */}
        {(notes || adminNotes) && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Notas</h3>
            {notes && (
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Del huésped</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
            {adminNotes && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-yellow-700 mb-1">Notas internas</p>
                <p className="text-sm text-yellow-900">{adminNotes}</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Acciones fijas */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
        <div className="flex gap-2 max-w-lg mx-auto">
          {updating ? (
            <div className="flex-1 flex items-center justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {status === 'upcoming' && (
                <Button className="flex-1 rounded-full" size="lg" onClick={() => updateEstado('CONFIRMED')}>
                  <LogIn className="h-4 w-4 mr-2" />Check-in
                </Button>
              )}
              {status === 'in-house' && (
                <Button className="flex-1 rounded-full" size="lg" onClick={() => updateEstado('CONFIRMED')}>
                  <LogOut className="h-4 w-4 mr-2" />Check-out
                </Button>
              )}
              {paymentStatus !== 'paid' && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  size="lg"
                  onClick={() => updateEstadoPago('PAID')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />Marcar pagado
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
