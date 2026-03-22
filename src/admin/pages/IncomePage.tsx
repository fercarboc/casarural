import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { incomeService } from '../../services/income.service';

export const IncomePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const incomeData = await incomeService.getIncomeData();
        setData(incomeData);
      } catch (error) {
        console.error('Error fetching income data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Ingresos</h1>
          <p className="text-zinc-500">Análisis financiero y facturación de La Rasilla</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
            <Download size={18} />
            Descargar Informe
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.summary.map((stat: any, i: number) => (
          <IncomeStatCard 
            key={i}
            label={stat.label} 
            value={stat.value} 
            trend={stat.trend} 
            icon={
              stat.color === 'emerald' ? <DollarSign className="text-emerald-600" size={20} /> :
              stat.color === 'amber' ? <Clock className="text-amber-600" size={20} /> :
              <TrendingUp className="text-blue-600" size={20} />
            } 
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Monthly Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Desglose Mensual</h3>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Mes</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Ingresos</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Reservas</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Crecimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.monthlyBreakdown.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">{item.month}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{item.income}€</td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{item.reservations}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${item.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.growth.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {item.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Métodos de Pago</h3>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            {data.paymentMethods.map((method: any, i: number) => (
              <PaymentMethodItem 
                key={i}
                label={method.label} 
                percentage={method.percentage} 
                amount={method.amount} 
                color={method.color} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const IncomeStatCard = ({ label, value, trend, icon, color }: any) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-${color}-50`}>
        {icon}
      </div>
      <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
        {trend}
      </span>
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</p>
    <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
  </div>
);

const PaymentMethodItem = ({ label, percentage, amount, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900">{amount} ({percentage}%)</span>
    </div>
    <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
      <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);
