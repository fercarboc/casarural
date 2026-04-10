// src/admin/components/ModalResponderConsulta.tsx
// Modal de respuesta libre (email libre) desde una consulta del CRM

import React, { useState } from 'react'
import { X, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../integrations/supabase/client'

interface Consulta {
  id: string
  nombre: string
  email: string
  asunto?: string
}

interface Props {
  consulta: Consulta
  onClose: () => void
  onSuccess: () => void
}

export function ModalResponderConsulta({ consulta, onClose, onSuccess }: Props) {
  const [asunto, setAsunto]   = useState(`Re: ${consulta.asunto || 'Su consulta'}`)
  const [cuerpo, setCuerpo]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSend = async () => {
    if (!asunto.trim() || !cuerpo.trim()) return
    setSending(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const authHeader = { Authorization: `Bearer ${session?.access_token}` }

      const { error: fnError } = await supabase.functions.invoke('send-quote', {
        body: {
          consulta_id: consulta.id,
          tipo: 'EMAIL_LIBRE',
          to_email: consulta.email,
          to_nombre: consulta.nombre,
          asunto: asunto.trim(),
          cuerpo: cuerpo.trim(),
        },
        headers: authHeader,
      })

      if (fnError) throw new Error(fnError.message)
      setSent(true)
      setTimeout(() => { onSuccess(); onClose() }, 1800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido al enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100">
              <Mail size={16} className="text-zinc-600" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Responder por email</h3>
              <p className="text-xs text-zinc-400">{consulta.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {sent ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p className="font-bold text-zinc-900">Email enviado</p>
            <p className="text-sm text-zinc-400">La consulta ha sido marcada como Respondida</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Para */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Para</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-700">
                <Mail size={13} className="text-zinc-400" />
                <span>{consulta.nombre} &lt;{consulta.email}&gt;</span>
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Asunto</label>
              <input
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {/* Cuerpo */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Mensaje</label>
              <textarea
                value={cuerpo}
                onChange={e => setCuerpo(e.target.value)}
                rows={7}
                placeholder={`Estimado/a ${consulta.nombre},\n\nGracias por contactar con nosotros...`}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                El mensaje se enviará con la firma y diseño de Casa Rural La Rasilla.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!sent && (
          <div className="flex gap-2 px-6 py-4 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !asunto.trim() || !cuerpo.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
            >
              {sending ? (
                <><Loader2 size={14} className="animate-spin" /> Enviando…</>
              ) : (
                <><Send size={14} /> Enviar email</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
