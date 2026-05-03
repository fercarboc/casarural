'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ReservationCard } from '@/components/admin/reservation-card'
import { fetchAllReservas } from '@/lib/services'
import type { ReservaView, ReservaSource } from '@/lib/types'
import { cn } from '@/lib/utils'

type TabType = 'upcoming' | 'in-house' | 'pending' | 'cancelled'

const tabs: { id: TabType; label: string }[] = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'in-house', label: 'Alojados' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'cancelled', label: 'Canceladas' },
]

const sourceFilters: { id: ReservaSource | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'direct', label: 'Directo' },
  { id: 'airbnb', label: 'Airbnb' },
  { id: 'booking', label: 'Booking' },
  { id: 'escapada', label: 'Escapada' },
]

export default function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaView[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<ReservaSource | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setReservas(await fetchAllReservas())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const byTab = useMemo(() => {
    const map: Record<TabType, ReservaView['status'][]> = {
      'upcoming': ['upcoming'],
      'in-house': ['in-house'],
      'pending': ['pending'],
      'cancelled': ['cancelled'],
    }
    return reservas.filter(r => map[activeTab].includes(r.status))
  }, [reservas, activeTab])

  const filtered = useMemo(() => {
    let results = byTab
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      results = results.filter(
        r =>
          r.guestName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.codigo.toLowerCase().includes(q),
      )
    }
    if (sourceFilter !== 'all') results = results.filter(r => r.source === sourceFilter)
    return results
  }, [byTab, searchQuery, sourceFilter])

  const getTabCount = (tab: TabType) => {
    const map: Record<TabType, ReservaView['status'][]> = {
      'upcoming': ['upcoming'],
      'in-house': ['in-house'],
      'pending': ['pending'],
      'cancelled': ['cancelled'],
    }
    return reservas.filter(r => map[tab].includes(r.status)).length
  }

  return (
    <div className="p-4 space-y-4 safe-area-top">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-sm text-muted-foreground mt-1">{reservas.length} en total</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={load}>
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Buscador */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nombre, email o código..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full bg-secondary border-0"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {tabs.map(tab => {
          const count = getTabCount(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              {tab.label}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted-foreground/20',
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filtros por origen */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
          {sourceFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                sourceFilter === f.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground/50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-xl animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map(r => (
            <ReservationCard key={r.id} reservation={r} showStatus={activeTab !== 'cancelled'} />
          ))
        ) : (
          <Card className="p-8 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Sin reservas</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || sourceFilter !== 'all' ? 'Prueba con otros filtros' : `No hay reservas ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
