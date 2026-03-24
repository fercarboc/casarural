import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Users, Mail, Phone, FileText,
  AlertCircle, Loader2, Copy, Check, Send, Edit2, Ban,
  CreditCard, ClipboardList, UserCheck, MessageSquare, RefreshCw
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../integrations/supabase/client'

// ─── Tipo ──────────────────────────────────────────────────────────────────────
interface Reserva {
  id: string; codigo: string
  nombre: string; apellidos: string; email: string; telefono: string | null; dni: string | null
  fecha_entrada: string; fecha_salida: string; num_huespedes: number; menores: number; noches: number
  temporada: string; tarifa: string; precio_noche: number
  importe_alojamiento: number; importe_extra: number; importe_limpieza: number
  descuento: number; total: number; importe_senal: number | null; importe_pagado: number | null
  estado: string; estado_pago: string; origen: string
  stripe_session_id: string | null; stripe_payment_intent: string | null
  notas_admin: string | null; solicitud_cambio: string | null; token_cliente: string | null
  created_at: string; updated_at: string | null
}

interface Huesped {
  id: string; nombre: string; apellidos: string
  tipo_documento: string; numero_documento: string
  fecha_nacimiento: string; sexo: string; nacionalidad: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_STYLE: Record<string, string> = {
  CONFIRMED:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED:       'bg-red-50 text-red-700 border-red-200',
  EXPIRED:         'bg-zinc-100 text-zinc-500 border-zinc-200',
}
const ESTADO_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING_PAYMENT: 'Pdte. de pago',
  CANCELLED: 'Cancelada', EXPIRED: 'Expirada', NO_SHOW: 'No presentado',
}
const PAGO_LABEL: Record<string, string> = {
  UNPAID: 'Sin pagar', PARTIAL: 'Señal pagada', PAID: 'Pagado completo', REFUNDED: 'Devuelto',
}
const PAGO_STYLE: Record<string, string> = {
  UNPAID: 'bg-zinc-100 text-zinc-500', PARTIAL: 'bg-blue-50 text-blue-700',
  PAID: 'bg-emerald-50 text-emerald-700', REFUNDED: 'bg-violet-50 text-violet-700',
}
const ORIGEN_LABEL: Record<string, string> = {
  DIRECT_WEB: 'Web directa', BOOKING_ICAL: 'Booking.com',
  AIRBNB_ICAL: 'Airbnb', ESCAPADARURAL_ICAL: 'Escapada Rural', ADMIN: 'Admin',
}

function fmtDate(d: string) {
  return format(parseISO(d), "d 'de' MMMM yyyy", { locale: es })
}
function fmtShort(d: string) {
  return format(parseISO(d), 'd MMM yyyy', { locale: es })
}

// ─── Componente principal ─────────────────────────────────────────────────────
export const ReservationDetailPage: React.FC = () => {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const [r, setR]    = useState<Reserva | null>(null)
  const [huespedes, setHuespedes]   = useState<Huesped[]>([])
  const [loading, setLoading]       = useState(true)
  const [notasEdit, setNotasEdit]   = useState('')
  const [savingNotas, setSavingNotas] = useState(false)
  const [notasSaved, setNotasSaved] = useState(false)
  const [copied, setCopied]         = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [{ data: res }, { data: hues }] = await Promise.all([
      supabase.from('reservas').select('*').eq('id', id).single(),
      supabase.from('huespedes').select('*').eq('reserva_id', id),
    ])
    if (res) { setR(res); setNotasEdit(res.notas_admin ?? '') }
    setHuespedes(hues ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function saveNotas() {
    if (!r) return
    setSavingNotas(true)
    await supabase.from('reservas').update({ notas_admin: notasEdit || null }).eq('id', r.id)
    setSavingNotas(false)
    setNotasSaved(true)
    setTimeout(() => setNotasSaved(false), 2000)
    setR(prev => prev ? { ...prev, notas_admin: notasEdit || null } : prev)
  }

  async function cancelar() {
    if (!r || !window.confirm('¿Confirmas la cancelación de esta reserva?')) return
    setCancelling(true)
    await supabase.from('reservas').update({
      estado: 'CANCELLED',
      updated_at: new Date().toISOString(),
    }).eq('id', r.id)
    setCancelling(false)
    setR(prev => prev ? { ...prev, estado: 'CANCELLED' } : prev)
  }

  function copyLink() {
    if (!r?.token_cliente) return
    navigator.clipboard.writeText(`${window.location.origin}/reserva/${r.token_cliente}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!r) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="mx-auto text-red-400" size={48} />
        <h2 className="text-2xl font-bold text-zinc-900">Reserva no encontrada</h2>
        <p className="text-zinc-500">El ID no existe o no tienes acceso.</p>
        <button onClick={() => navigate('/admin/reservas')}
          className="mt-4 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white">
          Volver a reservas
        </button>
      </div>
    )
  }

  const isFlexible = r.tarifa === 'FLEXIBLE'
  const restoPendiente = isFlexible && r.importe_senal ? r.total - r.importe_senal : 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/reservas')}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-900">{r.nombre} {r.apellidos}</h1>
              <span className="font-mono text-sm text-zinc-400">{r.codigo}</span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${ESTADO_STYLE[r.estado] ?? 'bg-zinc-50 text-zinc-500'}`}>
                {ESTADO_LABEL[r.estado] ?? r.estado}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">
              Creada el {fmtShort(r.created_at)} · Origen: {ORIGEN_LABEL[r.origen] ?? r.origen}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-400 transition-all">
            <RefreshCw size={16} />
          </button>
          {r.token_cliente && r.estado === 'CONFIRMED' && (
            <button onClick={copyLink}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}>
              {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Enlace check-in</>}
            </button>
          )}
          {r.estado !== 'CANCELLED' && r.estado !== 'EXPIRED' && (
            <button onClick={cancelar} disabled={cancelling}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all">
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
              Cancelar
            </button>
          )}
          <Link to={`/admin/reservas`}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all">
            <Edit2 size={15} /> Editar desde lista
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Fechas */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center gap-2">
              <Calendar size={15} className="text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-700">Estancia</h3>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Check-in</p>
                <p className="font-bold text-zinc-900">{fmtDate(r.fecha_entrada)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">A partir de las 16:00 h</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-600">
                  {r.noches} noches
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Check-out</p>
                <p className="font-bold text-zinc-900">{fmtDate(r.fecha_salida)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Antes de las 12:00 h</p>
              </div>
            </div>
            <div className="border-t border-zinc-100 px-6 py-3 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Users size={14} className="text-zinc-400" />
                <span><strong>{r.num_huespedes}</strong> huéspedes</span>
                {r.menores > 0 && <span className="text-zinc-400">({r.menores} menor{r.menores > 1 ? 'es' : ''})</span>}
              </div>
              <div className="text-zinc-400">·</div>
              <span className="text-zinc-600">Temporada <strong>{r.temporada === 'ALTA' ? 'Alta' : 'Base'}</strong></span>
              <div className="text-zinc-400">·</div>
              <span className={`font-semibold ${isFlexible ? 'text-emerald-600' : 'text-amber-700'}`}>
                {isFlexible ? 'Tarifa flexible' : 'No reembolsable'}
              </span>
            </div>
          </div>

          {/* Desglose de precios */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-700">Desglose económico</h3>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${PAGO_STYLE[r.estado_pago] ?? 'bg-zinc-100 text-zinc-500'}`}>
                {PAGO_LABEL[r.estado_pago] ?? r.estado_pago}
              </span>
            </div>
            <div className="p-6 space-y-3">
              <PriceRow label={`Alojamiento (${r.noches} noches × ${r.precio_noche.toLocaleString('es-ES')} €)`} value={r.importe_alojamiento} />
              {r.importe_extra > 0 && <PriceRow label="Suplemento huésped extra" value={r.importe_extra} />}
              <PriceRow label="Tarifa de limpieza" value={r.importe_limpieza} />
              {r.descuento > 0 && <PriceRow label="Descuento no reembolsable (−10%)" value={-r.descuento} negative />}
              <div className="border-t border-zinc-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-zinc-900">Total reserva</span>
                <span className="text-2xl font-bold text-zinc-900">{r.total.toLocaleString('es-ES')} €</span>
              </div>

              {/* Estado de pago */}
              <div className="border-t border-zinc-100 pt-3 space-y-2">
                {isFlexible && r.importe_senal ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-zinc-600">Señal pagada</span>
                      </div>
                      <span className="font-bold text-emerald-700">{r.importe_senal.toLocaleString('es-ES')} €</span>
                    </div>
                    {restoPendiente > 0 && (
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-zinc-600">Resto pendiente</span>
                        </div>
                        <span className="font-bold text-amber-700">{restoPendiente.toLocaleString('es-ES')} €</span>
                      </div>
                    )}
                  </>
                ) : (r.importe_pagado ?? 0) > 0 ? (
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-zinc-600">Importe cobrado</span>
                    </div>
                    <span className="font-bold text-emerald-700">{r.importe_pagado!.toLocaleString('es-ES')} €</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Huéspedes registrados */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-700">Huéspedes registrados (RD 933/2021)</h3>
              </div>
              <span className="text-xs text-zinc-400">{huespedes.length} / {r.num_huespedes}</span>
            </div>
            {huespedes.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <ClipboardList className="mx-auto text-zinc-200 mb-3" size={32} />
                <p className="text-sm text-zinc-400">Aún no se han registrado los huéspedes.</p>
                {r.token_cliente && r.estado === 'CONFIRMED' && (
                  <button onClick={copyLink}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all">
                    <Send size={12} /> Enviar enlace al cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {huespedes.map((h, i) => (
                  <div key={h.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{h.nombre} {h.apellidos}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {h.tipo_documento} {h.numero_documento} ·{' '}
                        {h.fecha_nacimiento ? format(parseISO(h.fecha_nacimiento), 'd MMM yyyy', { locale: es }) : '—'} ·{' '}
                        {h.sexo} · {h.nacionalidad}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0">#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solicitud de cambio */}
          {r.solicitud_cambio && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                <MessageSquare size={15} className="text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">Solicitud de cambio del cliente</h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-amber-900 leading-relaxed">{r.solicitud_cambio}</p>
              </div>
            </div>
          )}

          {/* Notas internas */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center gap-2">
              <FileText size={15} className="text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-700">Notas internas</h3>
            </div>
            <div className="p-6 space-y-3">
              <textarea
                value={notasEdit}
                onChange={e => setNotasEdit(e.target.value)}
                rows={3}
                placeholder="Añade notas privadas sobre esta reserva…"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none resize-none"
              />
              <button onClick={saveNotas} disabled={savingNotas}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  notasSaved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                } disabled:opacity-50`}>
                {savingNotas ? <Loader2 size={12} className="animate-spin" /> : notasSaved ? <Check size={12} /> : null}
                {notasSaved ? 'Guardado' : savingNotas ? 'Guardando…' : 'Guardar notas'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Datos del titular */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4 flex items-center gap-2">
              <Users size={14} className="text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Titular</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-base font-bold text-zinc-500 shrink-0">
                  {r.nombre[0]}{r.apellidos[0]}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{r.nombre} {r.apellidos}</p>
                  {r.dni && <p className="text-xs text-zinc-400">{r.dni}</p>}
                </div>
              </div>
              <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                <Mail size={14} className="text-zinc-400 shrink-0" />
                <span className="truncate">{r.email}</span>
              </a>
              {r.telefono && (
                <a href={`tel:${r.telefono}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  <Phone size={14} className="text-zinc-400 shrink-0" />{r.telefono}
                </a>
              )}
            </div>
          </div>

          {/* Pago e identificadores */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4 flex items-center gap-2">
              <CreditCard size={14} className="text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pago</h3>
            </div>
            <div className="p-5 space-y-2 text-xs">
              <SideRow label="Estado" value={PAGO_LABEL[r.estado_pago] ?? r.estado_pago} />
              {(r.importe_pagado ?? 0) > 0 && <SideRow label="Cobrado" value={`${r.importe_pagado!.toLocaleString('es-ES')} €`} bold />}
              {isFlexible && r.importe_senal && <SideRow label="Señal" value={`${r.importe_senal.toLocaleString('es-ES')} €`} />}
              {r.stripe_payment_intent && (
                <div className="pt-2 border-t border-zinc-100">
                  <p className="text-zinc-400 mb-1">Payment Intent</p>
                  <p className="font-mono text-[10px] text-zinc-600 break-all">{r.stripe_payment_intent}</p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Acciones</h3>
            </div>
            <div className="p-3 space-y-1">
              {r.token_cliente && (
                <button onClick={copyLink}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-zinc-400" />}
                  Copiar enlace del cliente
                </button>
              )}
              <Link to="/admin/reservas"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all">
                <Edit2 size={16} className="text-zinc-400" /> Editar reserva
              </Link>
              {r.estado !== 'CANCELLED' && r.estado !== 'EXPIRED' && (
                <button onClick={cancelar} disabled={cancelling}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all">
                  <Ban size={16} /> Cancelar reserva
                </button>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2 text-xs">
            <SideRow label="Creada" value={fmtShort(r.created_at)} />
            {r.updated_at && <SideRow label="Modificada" value={fmtShort(r.updated_at)} />}
            <SideRow label="Código" value={r.codigo} mono />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Primitivas ────────────────────────────────────────────────────────────────
function PriceRow({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-medium shrink-0 ${negative ? 'text-emerald-600' : 'text-zinc-800'}`}>
        {negative ? '−' : ''}{Math.abs(value).toLocaleString('es-ES')} €
      </span>
    </div>
  )
}

function SideRow({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-400">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-zinc-900' : 'text-zinc-600'} ${mono ? 'font-mono text-[10px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
