'use client'

import Link from 'next/link'
import { MessageCircle, Phone, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { ReservaView } from '@/lib/types'
import {
  formatDateRange,
  formatCurrency,
  getWhatsAppUrl,
  getSourceColor,
  getStatusColor,
  getPaymentStatusColor,
  getSourceLabel,
  getStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/services'

interface Props {
  reservation: ReservaView
  compact?: boolean
  showStatus?: boolean
}

export function ReservationCard({ reservation, compact = false, showStatus = true }: Props) {
  const { id, guestName, phone, checkIn, checkOut, nights, guests, status, source, totalAmount, paymentStatus } = reservation
  const initials = guestName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const whatsappUrl = phone ? getWhatsAppUrl(phone, guestName, checkIn, checkOut) : null

  if (compact) {
    return (
      <Link href={`/reservas/${id}`}>
        <Card className="p-3 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10">
              <AvatarFallback className="text-sm font-medium text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{guestName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateRange(checkIn, checkOut)} · {nights} {nights === 1 ? 'noche' : 'noches'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getSourceColor(source))}>
                {getSourceLabel(source)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 bg-primary/10">
          <AvatarFallback className="text-sm font-semibold text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{guestName}</p>
            {showStatus && (
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', getStatusColor(status))}>
                {getStatusLabel(status)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDateRange(checkIn, checkOut)} · {nights} {nights === 1 ? 'noche' : 'noches'}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getSourceColor(source))}>
              {getSourceLabel(source)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> {guests}
            </span>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getPaymentStatusColor(paymentStatus))}>
              {getPaymentStatusLabel(paymentStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="font-semibold text-lg">{formatCurrency(totalAmount)}</p>
        <div className="flex items-center gap-2">
          {phone && (
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
          {whatsappUrl && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full bg-green-50 border-green-200 hover:bg-green-100 text-green-600"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="default" size="sm" className="rounded-full h-9" asChild>
            <Link href={`/reservas/${id}`}>Ver detalle</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
