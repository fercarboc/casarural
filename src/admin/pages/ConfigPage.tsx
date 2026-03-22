import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  DollarSign, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { configService } from '../../services/config.service';

export const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await configService.getConfig();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await configService.saveConfig(config);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Configuración</h1>
          <p className="text-zinc-500">Ajustes globales de precios, estancias y límites</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
              >
                <CheckCircle2 size={18} />
                Cambios guardados
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar cambios
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pricing Config */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <DollarSign size={20} className="text-emerald-600" /> Tarifas y Precios
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigInput 
              label="Precio Base (Noche)" 
              value={config.basePrice} 
              onChange={(v) => setConfig({...config, basePrice: v})} 
              suffix="€" 
            />
            <ConfigInput 
              label="Precio Temp. Alta" 
              value={config.highSeasonPrice} 
              onChange={(v) => setConfig({...config, highSeasonPrice: v})} 
              suffix="€" 
            />
            <ConfigInput 
              label="Huésped Extra" 
              value={config.extraGuestPrice} 
              onChange={(v) => setConfig({...config, extraGuestPrice: v})} 
              suffix="€" 
            />
            <ConfigInput 
              label="Gastos de Limpieza" 
              value={config.cleaningFee} 
              onChange={(v) => setConfig({...config, cleaningFee: v})} 
              suffix="€" 
            />
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 flex gap-3">
            <Info size={18} className="text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Los precios de temporada alta se aplican automáticamente según el calendario de festivos y puentes configurado.
            </p>
          </div>
        </div>

        {/* Stay & Capacity Config */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Users size={20} className="text-blue-600" /> Estancia y Capacidad
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigInput 
              label="Estancia Mínima" 
              value={config.minStay} 
              onChange={(v) => setConfig({...config, minStay: v})} 
              suffix="noches" 
            />
            <ConfigInput 
              label="Máximo Huéspedes" 
              value={config.maxGuests} 
              onChange={(v) => setConfig({...config, maxGuests: v})} 
              suffix="pax" 
            />
          </div>
          
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Políticas de Reserva</h4>
            <div className="space-y-3">
              <PolicyToggle 
                label="Permitir reservas inmediatas" 
                enabled={config.policies.immediateBooking} 
                onChange={(v) => setConfig({...config, policies: {...config.policies, immediateBooking: v}})}
              />
              <PolicyToggle 
                label="Requerir verificación de identidad" 
                enabled={config.policies.identityVerification} 
                onChange={(v) => setConfig({...config, policies: {...config.policies, identityVerification: v}})}
              />
              <PolicyToggle 
                label="Aceptar mascotas (bajo petición)" 
                enabled={config.policies.petsAllowed} 
                onChange={(v) => setConfig({...config, policies: {...config.policies, petsAllowed: v}})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigInput = ({ label, value, onChange, suffix }: { label: string, value: number, onChange: (v: number) => void, suffix: string }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">{suffix}</span>
    </div>
  </div>
);

const PolicyToggle = ({ label, enabled, onChange }: { label: string, enabled: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50">
    <span className="text-sm font-medium text-zinc-700">{label}</span>
    <button 
      onClick={() => onChange(!enabled)}
      className={`
        relative h-6 w-11 rounded-full transition-colors
        ${enabled ? 'bg-emerald-500' : 'bg-zinc-200'}
      `}
    >
      <div className={`
        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
        ${enabled ? 'left-6' : 'left-1'}
      `} />
    </button>
  </div>
);
