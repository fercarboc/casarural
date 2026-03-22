import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  UserX 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { Reservation } from '../../services/booking.mock';

export const ReservationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getReservations();
        setReservations(data);
      } catch (err) {
        console.error("Error fetching reservations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || res.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Reservas</h1>
          <p className="text-zinc-500">Listado completo de reservas y estados</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
            <Plus size={18} />
            Nueva reserva
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID de reserva..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-12 pr-4 py-3 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
            <Filter size={16} className="text-zinc-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-zinc-600 focus:outline-none"
            >
              <option value="ALL">Todos los estados</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="PENDING">Pendientes</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="BLOCKED">Bloqueadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-900 border-t-transparent" />
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">ID / Cliente</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Fechas</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Huéspedes</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Estado</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Pago</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Origen</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Total</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{res.guestName}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{res.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-900 font-medium">{new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(res.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">3 noches</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{res.guests} pax</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge status={res.paymentStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-zinc-400">{res.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{res.total}€</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/admin/reservas/${res.id}`}
                          className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all"
                        >
                          <Eye size={18} />
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReservations.length === 0 && (
              <div className="py-24 text-center">
                <Search className="mx-auto text-zinc-200 mb-4" size={48} />
                <p className="text-sm font-medium text-zinc-400">No se han encontrado reservas con esos criterios.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
    NO_SHOW: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  }[status] || 'bg-zinc-50 text-zinc-600';

  const labels = {
    CONFIRMED: 'Confirmada',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No presentado',
  }[status] || status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles}`}>
      {labels}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-700',
    PARTIAL: 'bg-blue-50 text-blue-700',
    PENDING: 'bg-amber-50 text-amber-700',
    REFUNDED: 'bg-zinc-100 text-zinc-600',
  }[status] || 'bg-zinc-50 text-zinc-600';

  const labels = {
    PAID: 'Pagado',
    PARTIAL: 'Parcial',
    PENDING: 'Pendiente',
    REFUNDED: 'Reembolsado',
  }[status] || status;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${styles}`}>
      {labels}
    </span>
  );
};
