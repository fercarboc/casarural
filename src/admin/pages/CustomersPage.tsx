import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService } from '../../services/customer.service';

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cust.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-zinc-900">Clientes</h1>
          <p className="text-zinc-500">Base de datos de huéspedes de La Rasilla</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
            <Plus size={18} />
            Añadir cliente
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-12 pr-4 py-3 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Cliente</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Contacto</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Reservas</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Total Gastado</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Última Estancia</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredCustomers.map((cust) => (
              <tr key={cust.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {cust.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{cust.name}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{cust.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                      <Mail size={12} className="text-zinc-400" /> {cust.email}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                      <Phone size={12} className="text-zinc-400" /> {cust.phone}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-400" />
                    <span className="font-bold text-zinc-900">{cust.totalReservations}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="font-bold text-zinc-900">{cust.totalSpent}€</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-zinc-900 font-medium">{new Date(cust.lastStay).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
