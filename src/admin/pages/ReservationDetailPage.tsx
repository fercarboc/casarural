import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  Mail, 
  Phone, 
  FileText, 
  Edit, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Download, 
  Send, 
  History,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookingService } from '../../services/booking.service';

export const ReservationDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await bookingService.getReservationById(id);
        setReservation(data);
      } catch (error) {
        console.error('Error fetching reservation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-zinc-900">Reserva no encontrada</h2>
        <p className="text-zinc-500 mt-2">La reserva que buscas no existe o ha sido eliminada.</p>
        <button 
          onClick={() => navigate('/admin/reservas')}
          className="mt-8 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white"
        >
          Volver a reservas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/reservas')}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-zinc-900">Reserva {reservation.id}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                reservation.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                reservation.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-red-50 text-red-700 border-red-100'
              }`}>
                {reservation.status === 'CONFIRMED' ? 'Confirmada' : 
                 reservation.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
              </span>
            </div>
            <p className="text-zinc-500">Creada el {new Date(reservation.createdAt || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
            <Send size={18} />
            Reenviar confirmación
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
            <Edit size={18} />
            Editar reserva
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dates & Guests */}
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard icon={<Calendar size={20} />} label="Entrada" value={new Date(reservation.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <InfoCard icon={<Calendar size={20} />} label="Salida" value={new Date(reservation.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <InfoCard icon={<Users size={20} />} label="Huéspedes" value={`${reservation.guests} personas`} />
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-zinc-50 border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Desglose de Precio</h3>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tarifa {reservation.rateType || 'ESTÁNDAR'}</span>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Alojamiento</span>
                <span className="font-bold text-zinc-900">{(reservation.total - 60).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Limpieza</span>
                <span className="font-bold text-zinc-900">60.00€</span>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-baseline">
                <span className="text-lg font-bold text-zinc-900">Total</span>
                <span className="text-2xl font-bold text-zinc-900">{reservation.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-6">
              <MessageSquare size={18} className="text-zinc-400" /> Notas de la reserva
            </h3>
            <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 text-sm text-zinc-600 italic">
              "{reservation.notes || 'Sin notas adicionales'}"
            </div>
          </div>
        </div>

        {/* Sidebar: Customer & Actions */}
        <div className="space-y-8">
          {/* Customer Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-6 uppercase tracking-wider text-[10px] text-zinc-400">Cliente</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-bold text-zinc-400">
                {reservation.guestName[0]}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{reservation.guestName}</p>
                <p className="text-xs text-zinc-500">Reserva desde {reservation.source || 'WEB'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <a href={`mailto:${reservation.email}`} className="flex items-center gap-3 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                <Mail size={16} className="text-zinc-400" />
                {reservation.email}
              </a>
              <a href={`tel:${reservation.phone}`} className="flex items-center gap-3 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                <Phone size={16} className="text-zinc-400" />
                {reservation.phone}
              </a>
            </div>
            <button className="mt-8 w-full rounded-xl bg-zinc-50 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all">
              Ver historial completo
            </button>
          </div>

          {/* Actions Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider text-[10px] text-zinc-400">Acciones Rápidas</h3>
            <ActionButton icon={<CreditCard size={18} />} label="Registrar pago manual" />
            <ActionButton icon={<FileText size={18} />} label="Generar factura" />
            <ActionButton icon={<Download size={18} />} label="Descargar PDF reserva" />
            <div className="pt-4 border-t border-zinc-100">
              <ActionButton icon={<XCircle size={18} />} label="Cancelar reserva" color="red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
      {icon} {label}
    </div>
    <p className="text-lg font-bold text-zinc-900">{value}</p>
  </div>
);

const ActionButton = ({ icon, label, color = 'zinc' }: { icon: React.ReactNode, label: string, color?: string }) => (
  <button className={`
    flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all
    ${color === 'red' ? 'text-red-600 hover:bg-red-50' : 'text-zinc-600 hover:bg-zinc-50'}
  `}>
    {icon}
    {label}
  </button>
);
