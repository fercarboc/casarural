import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { icalService } from '../../services/ical.service';

export const ICalPage: React.FC = () => {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const data = await icalService.getFeeds();
        setFeeds(data);
      } catch (error) {
        console.error('Error fetching iCal feeds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await icalService.syncFeeds();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      // Refresh feeds
      const data = await icalService.getFeeds();
      setFeeds(data);
    } catch (error) {
      console.error('Error syncing feeds:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Sincronización iCal</h1>
          <p className="text-zinc-500">Conecta calendarios externos (Booking, Airbnb, Vrbo) con La Rasilla</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
              >
                <CheckCircle2 size={18} />
                Sincronizado
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            Sincronizar ahora
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
            <Plus size={18} />
            Añadir nuevo feed
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Feeds List */}
        <div className="lg:col-span-2 space-y-6">
          {feeds.map((feed) => (
            <div key={feed.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${feed.status === 'OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {feed.status === 'OK' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{feed.name}</h3>
                  <p className="text-xs text-zinc-500 truncate max-w-md">{feed.url}</p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock size={12} /> Última sinc: {new Date(feed.lastSync).toLocaleTimeString('es-ES')}</span>
                    <span className={`flex items-center gap-1 ${feed.status === 'OK' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {feed.status === 'OK' ? 'Sincronizado' : 'Error de conexión'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                  <ExternalLink size={18} />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info & Help */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-6 uppercase tracking-wider text-[10px] text-zinc-400">
              <Info size={18} className="text-zinc-400" /> Cómo funciona
            </h3>
            <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
              <p>
                La sincronización iCal permite que las reservas de plataformas externas bloqueen automáticamente las fechas en tu calendario de La Rasilla.
              </p>
              <p>
                <strong>Importante:</strong> La sincronización no es instantánea. Se realiza automáticamente cada 15 minutos o manualmente pulsando el botón superior.
              </p>
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                <p className="text-xs font-bold text-zinc-900 mb-2">Tu URL de exportación:</p>
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value="https://larasilla.com/api/ical/export" 
                    className="flex-1 bg-transparent text-[10px] font-mono text-zinc-500 focus:outline-none"
                  />
                  <button className="text-[10px] font-bold text-zinc-900 hover:underline">Copiar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
