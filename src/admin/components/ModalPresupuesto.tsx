// src/admin/components/ModalPresupuesto.tsx
// Modal de presupuesto / cotización comercial desde el CRM.
// Comprueba disponibilidad y calcula precio reutilizando las edge functions
// check-availability y calculate-price. Luego envía email vía send-quote.

import React, { useState } from 'react'
import {
  X, Search, CheckCircle2, XCircle, AlertTriangle, Loader2,
  CalendarDays, Users, Euro, Send, ChevronRight, ArrowRight,
} from 'lucide-react'
import { supabase } from '../../integrations/supabase/client'

// ── Tipos internos ────────────────────────────────────────────────────────────

interface Consulta {
  id: string
  nombre: string
  email: string
  telefono?: string
  asunto?: string
}

interface PriceData {
  nights: number
  precio_noche: number
  importe_alojamiento: number
  importe_extra: number
  limpieza: number
  descuento: number
  total: number
  season_type: string
  extra_guests: number
}

type Fase = 'input' | 'resultado' | 'enviando' | 'enviado'
type FormaPago = 'TODOS' | 'TRANSFERENCIA' | 'BIZUM' | 'TARJETA'

interface Props {
  consulta: Consulta
  onClose: () => void
  onSuccess: () => void
}

// ── Componente ─────────────────────────────────────────────────────────────────

export function ModalPresupuesto({ consulta, onClose, onSuccess }: Props) {
  // Fase del modal
  const [fase, setFase] = useState<Fase>('input')

  // Formulario de entrada
  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests,   setGuests]   = useState(2)
  const [rateType, setRateType] = useState<'FLEXIBLE' | 'NON_REFUNDABLE'>('FLEXIBLE')

  // Resultado de la comprobación
  const [checking,      setChecking]      = useState(false)
  const [available,     setAvailable]     = useState<boolean | null>(null)
  const [priceData,     setPriceData]     = useState<PriceData | null>(null)
  const [minStay,       setMinStay]       = useState(1)
  const [minStayWarn,   setMinStayWarn]   = useState(false)
  const [suggestIn,     setSuggestIn]     = useState<string | null>(null)
  const [suggestOut,    setSuggestOut]    = useState<string | null>(null)
  // Fechas ajustadas por estancia mínima (las que se usan para el presupuesto)
  const [adjustedIn,    setAdjustedIn]    = useState<string | null>(null)
  const [adjustedOut,   setAdjustedOut]   = useState<string | null>(null)

  // Opciones del presupuesto
  const [descuento,   setDescuento]   = useState(0)
  const [formaPago,   setFormaPago]   = useState<FormaPago>('TODOS')
  const [notas,       setNotas]       = useState('')

  // Errores
  const [checkError, setCheckError] = useState<string | null>(null)
  const [sendError,  setSendError]  = useState<string | null>(null)

  // ── Helpers de fecha ─────────────────────────────────────────────────────────

  const addDay = (d: string, n: number) => {
    const dt = new Date(d + 'T12:00:00')
    dt.setDate(dt.getDate() + n)
    return dt.toISOString().split('T')[0]
  }

  const nights = (checkIn && checkOut)
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  // ── Comprobar disponibilidad + calcular precio ────────────────────────────────

  const handleCheck = async () => {
    if (!checkIn || !checkOut || nights < 1) {
      setCheckError('Introduce fechas válidas (mínimo 1 noche)')
      return
    }
    if (guests < 1 || guests > 11) {
      setCheckError('El número de huéspedes debe estar entre 1 y 11')
      return
    }
    setCheckError(null)
    setChecking(true)
    setPriceData(null)
    setAvailable(null)
    setMinStayWarn(false)
    setSuggestIn(null)
    setSuggestOut(null)
    setAdjustedIn(null)
    setAdjustedOut(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const authHdr = { Authorization: `Bearer ${session?.access_token}` }

      // 1. Disponibilidad + Config en paralelo (precio se calcula después si hace falta ajuste)
      const [availRes, configRes, tempRes] = await Promise.all([
        supabase.functions.invoke('check-availability', {
          body: { checkIn, checkOut },
          headers: authHdr,
        }),
        supabase.from('configuracion').select('estancia_minima').single(),
        supabase.from('temporadas')
          .select('estancia_minima')
          .eq('activa', true)
          .eq('tipo', 'ALTA')
          .lte('fecha_inicio', checkIn)
          .gte('fecha_fin', checkIn)
          .limit(1),
      ])

      const isAvailable: boolean = availRes.data?.available ?? false
      setAvailable(isAvailable)

      if (isAvailable) {
        // Calcular estancia mínima efectiva (temporada sobreescribe global)
        const globalMin    = configRes.data?.estancia_minima ?? 2
        const seasonalMin  = tempRes.data?.[0]?.estancia_minima ?? null
        const effectiveMin = seasonalMin ?? globalMin
        setMinStay(effectiveMin)

        const diff = effectiveMin - nights
        const needsAdjust = diff > 0

        // Fechas que se usarán para calcular precio y para el email
        // Si hay que ajustar: retrasamos la salida (más natural para el cliente)
        const priceCheckIn  = checkIn
        const priceCheckOut = needsAdjust ? addDay(checkOut, diff) : checkOut

        const priceRes = await supabase.functions.invoke('calculate-price', {
          body: { checkIn: priceCheckIn, checkOut: priceCheckOut, guests, rateType },
          headers: authHdr,
        })

        if (priceRes.data && !priceRes.error) {
          setPriceData(priceRes.data as PriceData)

          if (needsAdjust) {
            setMinStayWarn(true)
            // Guardar las fechas ajustadas que se usarán en el email
            setAdjustedIn(priceCheckIn)
            setAdjustedOut(priceCheckOut)
            // Opciones que el admin puede usar para cambiar las fechas manualmente
            setSuggestIn(addDay(checkIn, -diff))   // adelantar entrada
            setSuggestOut(priceCheckOut)            // retrasar salida (ya calculado)
          }
        } else {
          setCheckError('Error al calcular el precio. Inténtalo de nuevo.')
        }
      }
      setFase('resultado')
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : 'Error al comprobar disponibilidad')
    } finally {
      setChecking(false)
    }
  }

  // Aplicar sugerencia de fecha: actualiza fechas y re-comprueba
  const applySuggest = (tipo: 'adelantar' | 'retrasar') => {
    if (!suggestIn || !suggestOut) return
    if (tipo === 'adelantar') setCheckIn(suggestIn)
    else setCheckOut(suggestOut)
    setFase('input')
    setAvailable(null)
    setPriceData(null)
    setMinStayWarn(false)
    setSuggestIn(null)
    setSuggestOut(null)
    setAdjustedIn(null)
    setAdjustedOut(null)
  }

  // ── Enviar presupuesto ────────────────────────────────────────────────────────

  const handleSendQuote = async () => {
    if (!priceData) return
    setFase('enviando')
    setSendError(null)

    // Si hay ajuste por estancia mínima, el email usa las fechas ajustadas
    const emailCheckIn  = (minStayWarn && adjustedIn)  ? adjustedIn  : checkIn
    const emailCheckOut = (minStayWarn && adjustedOut) ? adjustedOut : checkOut

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const authHdr = { Authorization: `Bearer ${session?.access_token}` }

      const { error: fnErr } = await supabase.functions.invoke('send-quote', {
        body: {
          consulta_id: consulta.id,
          tipo: 'PRESUPUESTO',
          to_email: consulta.email,
          to_nombre: consulta.nombre,
          check_in: emailCheckIn,
          check_out: emailCheckOut,
          guests,
          precio_data: priceData,
          descuento_comercial: descuento,
          forma_pago: formaPago,
          notas_comerciales: notas,
          estancia_minima_advertencia: minStayWarn,
          estancia_minima_noches: minStay,
        },
        headers: authHdr,
      })

      if (fnErr) throw new Error(fnErr.message)
      setFase('enviado')
      setTimeout(() => { onSuccess(); onClose() }, 2000)
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : 'Error al enviar')
      setFase('resultado')
    }
  }

  // ── Enviar email sin disponibilidad ──────────────────────────────────────────

  const handleSendNoDisp = async () => {
    setFase('enviando')
    setSendError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const authHdr = { Authorization: `Bearer ${session?.access_token}` }

      const { error: fnErr } = await supabase.functions.invoke('send-quote', {
        body: {
          consulta_id: consulta.id,
          tipo: 'SIN_DISPONIBILIDAD',
          to_email: consulta.email,
          to_nombre: consulta.nombre,
          check_in: checkIn || undefined,
          check_out: checkOut || undefined,
          guests,
        },
        headers: authHdr,
      })

      if (fnErr) throw new Error(fnErr.message)
      setFase('enviado')
      setTimeout(() => { onSuccess(); onClose() }, 2000)
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : 'Error al enviar')
      setFase('resultado')
    }
  }

  // ── Helpers de precio ─────────────────────────────────────────────────────────

  const totalFinal = priceData ? Math.max(0, priceData.total - descuento) : 0

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Euro size={16} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Enviar presupuesto</h3>
              <p className="text-xs text-zinc-400">{consulta.nombre} · {consulta.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <X size={18} />
          </button>
        </div>

        {/* Scroll content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── ENVIANDO ── */}
          {fase === 'enviando' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Enviando email…</p>
            </div>
          )}

          {/* ── ENVIADO ── */}
          {fase === 'enviado' && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <CheckCircle2 size={44} className="text-emerald-500" />
              <p className="font-bold text-zinc-900">Presupuesto enviado</p>
              <p className="text-sm text-zinc-400 text-center">La consulta ha sido marcada como Respondida</p>
            </div>
          )}

          {/* ── INPUT ── */}
          {(fase === 'input' || (fase === 'resultado' && available === null)) && (
            <div className="p-6 space-y-5">
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                    <CalendarDays size={11} className="inline mr-1" />Entrada
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => { setCheckIn(e.target.value); setFase('input'); setAvailable(null) }}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                    <CalendarDays size={11} className="inline mr-1" />Salida
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={e => { setCheckOut(e.target.value); setFase('input'); setAvailable(null) }}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {nights > 0 && (
                <p className="text-xs text-zinc-400 -mt-3 pl-1">{nights} noche{nights > 1 ? 's' : ''}</p>
              )}

              {/* Huéspedes + Tarifa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                    <Users size={11} className="inline mr-1" />Huéspedes
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={11}
                    value={guests}
                    onChange={e => setGuests(Number(e.target.value))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Tarifa</label>
                  <select
                    value={rateType}
                    onChange={e => setRateType(e.target.value as 'FLEXIBLE' | 'NON_REFUNDABLE')}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  >
                    <option value="FLEXIBLE">Flexible</option>
                    <option value="NON_REFUNDABLE">No reembolsable</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {checkError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600 flex items-start gap-2">
                  <XCircle size={13} className="shrink-0 mt-0.5" />{checkError}
                </div>
              )}
            </div>
          )}

          {/* ── RESULTADO ── */}
          {fase === 'resultado' && available !== null && (
            <div className="p-6 space-y-4">

              {/* Badge disponibilidad */}
              {available ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Disponible</p>
                    <p className="text-xs text-emerald-600">
                      {checkIn} → {checkOut} · {nights} noche{nights !== 1 ? 's' : ''} · {guests} huéspedes
                    </p>
                    {minStayWarn && adjustedOut && (
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">
                        Presupuesto calculado para {minStay} noches (hasta {adjustedOut})
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <XCircle size={16} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Sin disponibilidad</p>
                    <p className="text-xs text-red-600">{checkIn} → {checkOut}</p>
                  </div>
                </div>
              )}

              {/* ── Sin disponibilidad: opción de email ── */}
              {!available && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                  <p className="text-sm text-zinc-700">
                    ¿Deseas informar al cliente de que no hay disponibilidad para esas fechas?
                  </p>
                  {sendError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{sendError}</div>
                  )}
                  <button
                    onClick={handleSendNoDisp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    <Send size={13} /> Enviar email de no disponibilidad
                  </button>
                </div>
              )}

              {/* ── Con disponibilidad ── */}
              {available && priceData && (
                <>
                  {/* Aviso estancia mínima */}
                  {minStayWarn && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">
                            Estancia mínima para este periodo: {minStay} noches
                          </p>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            Has pedido {nights} noche{nights !== 1 ? 's' : ''}, pero el mínimo es {minStay}.
                            {' '}El presupuesto se ha calculado para <strong>{minStay} noches</strong>{' '}
                            (salida ajustada al <strong>{adjustedOut}</strong>).
                            El email informará al cliente de este requisito.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          O usa estas fechas ajustadas directamente:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {suggestIn && suggestIn !== checkIn && (
                            <button
                              onClick={() => applySuggest('adelantar')}
                              className="flex items-center gap-1.5 justify-center py-2 px-3 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                            >
                              <ArrowRight size={11} className="rotate-180" />
                              Entrada: {suggestIn}
                            </button>
                          )}
                          {suggestOut && (
                            <button
                              onClick={() => applySuggest('retrasar')}
                              className="flex items-center gap-1.5 justify-center py-2 px-3 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                            >
                              Salida: {suggestOut}
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desglose de precio */}
                  <div className="rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Desglose de precio</p>
                    </div>
                    <div className="p-4 space-y-2 text-xs font-mono">
                      <PRow label={`${priceData.nights} noches × ${priceData.precio_noche.toFixed(0)}€`} value={`${priceData.importe_alojamiento.toFixed(2)}€`} />
                      {priceData.importe_extra > 0 && (
                        <PRow label="Suplemento huésped adicional" value={`${priceData.importe_extra.toFixed(2)}€`} />
                      )}
                      <PRow label="Gastos de limpieza" value={`${priceData.limpieza.toFixed(2)}€`} />
                      {priceData.descuento > 0 && (
                        <PRow label="Descuento tarifa" value={`−${priceData.descuento.toFixed(2)}€`} className="text-emerald-600" />
                      )}
                      {descuento > 0 && (
                        <PRow label="✨ Descuento comercial" value={`−${descuento.toFixed(2)}€`} className="text-emerald-600" />
                      )}
                      <div className="flex justify-between font-bold text-zinc-900 text-sm pt-2 border-t border-zinc-100 mt-1">
                        <span>Total oferta</span>
                        <span>{totalFinal.toFixed(2)}€</span>
                      </div>
                      <p className="text-zinc-400 font-sans text-[10px] pt-0.5">
                        Temporada {priceData.season_type === 'ALTA' ? 'alta' : 'base'} · {guests} huéspedes
                      </p>
                    </div>
                  </div>

                  {/* Opciones del presupuesto */}
                  <div className="space-y-3">
                    {/* Descuento comercial */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                        Descuento comercial (€)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={priceData.total}
                          value={descuento}
                          onChange={e => setDescuento(Math.max(0, Number(e.target.value)))}
                          className="w-full border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                      </div>
                    </div>

                    {/* Forma de pago */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                        Forma de pago a mostrar en el email
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['TODOS', 'TRANSFERENCIA', 'BIZUM', 'TARJETA'] as FormaPago[]).map(f => (
                          <button
                            key={f}
                            onClick={() => setFormaPago(f)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                              formaPago === f
                                ? 'bg-zinc-900 text-white'
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                          >
                            {f === 'TODOS' ? 'Todas las formas'
                              : f === 'TRANSFERENCIA' ? '🏦 Transferencia'
                              : f === 'BIZUM' ? '📱 Bizum'
                              : '💳 Tarjeta web'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notas comerciales */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                        Comentario comercial (opcional, aparece en el email)
                      </label>
                      <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        rows={2}
                        placeholder="Ej: Le ofrecemos esta propuesta especial por su consulta directa..."
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                      />
                    </div>
                  </div>

                  {/* Error de envío */}
                  {sendError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600">
                      {sendError}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer botones */}
        {fase !== 'enviando' && fase !== 'enviado' && (
          <div className="flex gap-2 px-6 py-4 border-t border-zinc-100 shrink-0">
            {/* Volver a editar fechas si ya se comprobó */}
            {fase === 'resultado' && (
              <button
                onClick={() => { setFase('input'); setAvailable(null); setPriceData(null) }}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cambiar fechas
              </button>
            )}

            {/* Botón principal */}
            {fase === 'input' && (
              <>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCheck}
                  disabled={checking || !checkIn || !checkOut || nights < 1}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
                >
                  {checking ? (
                    <><Loader2 size={14} className="animate-spin" /> Comprobando…</>
                  ) : (
                    <><Search size={14} /> Comprobar disponibilidad</>
                  )}
                </button>
              </>
            )}

            {fase === 'resultado' && available && priceData && (
              <button
                onClick={handleSendQuote}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                <Send size={14} />
                Generar y enviar presupuesto
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helper visual ──────────────────────────────────────────────────────────────

function PRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between text-zinc-500 font-sans ${className}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
