import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { invoiceService } from '../../services/invoice.service';

export const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-zinc-900">Facturas</h1>
          <p className="text-zinc-500">Gestión de facturación y documentos fiscales</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
            <Plus size={18} />
            Nueva factura manual
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente o número de factura..."
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
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Factura / Reserva</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Cliente</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Fecha</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Importe</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Estado</th>
              <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-zinc-900">{inv.id}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{inv.reservationId}</p>
                </td>
                <td className="px-6 py-4 font-medium text-zinc-900">{inv.customer}</td>
                <td className="px-6 py-4 text-zinc-500 font-medium">{new Date(inv.date).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-4 font-bold text-zinc-900">{inv.amount.toFixed(2)}€</td>
                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                      <Download size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                      <Mail size={18} />
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

const InvoiceStatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ISSUED: 'bg-blue-50 text-blue-700 border-blue-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
  }[status] || 'bg-zinc-50 text-zinc-600';

  const labels = {
    PAID: 'Pagada',
    ISSUED: 'Emitida',
    CANCELLED: 'Anulada',
  }[status] || status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles}`}>
      {labels}
    </span>
  );
};
