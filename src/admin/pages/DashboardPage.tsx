import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500">Resumen de actividad de La Rasilla para hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Reservas Mes" 
          value={stats.monthlyReservations.toString()} 
          trend="+12%" 
          icon={<Calendar className="text-blue-600" size={20} />} 
          color="blue"
        />
        <StatCard 
          label="Ingresos Est." 
          value={`${stats.monthlyRevenue.toLocaleString('es-ES')}€`} 
          trend="+8%" 
          icon={<TrendingUp className="text-emerald-600" size={20} />} 
          color="emerald"
        />
        <StatCard 
          label="Pendientes Pago" 
          value={stats.pendingPayments.toString()} 
          trend="Atención" 
          icon={<AlertCircle className="text-amber-600" size={20} />} 
          color="amber"
        />
        <StatCard 
          label="Cancelaciones" 
          value={stats.cancellations.toString()} 
          trend="-2%" 
          icon={<XCircle className="text-red-600" size={20} />} 
          color="red"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Next Arrivals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">Próximas Llegadas (Check-in)</h3>
            <Link to="/admin/reservas" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Cliente</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Fecha</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Huéspedes</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {stats.upcomingCheckins.map((res: any) => (
                  <ArrivalRow 
                    key={res.id}
                    name={res.guestName} 
                    date={new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} 
                    guests={res.guests} 
                    status={res.status} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed / Alerts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">Actividad Reciente</h3>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <ActivityItem 
              icon={<CheckCircle2 className="text-emerald-600" size={16} />}
              title="Nueva reserva"
              desc="Marta López - 24/04 al 27/04"
              time="Hace 2 horas"
            />
            <ActivityItem 
              icon={<AlertCircle className="text-amber-600" size={16} />}
              title="Pago pendiente"
              desc="Reserva #RES-8829 - 150€"
              time="Hace 5 horas"
            />
            <ActivityItem 
              icon={<Clock className="text-blue-600" size={16} />}
              title="Check-out hoy"
              desc="Familia Rodríguez - 11:00"
              time="Hace 8 horas"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon, color }: { label: string, value: string, trend: string, icon: React.ReactNode, color: string }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
  >
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
  </motion.div>
);

const ArrivalRow = ({ name, date, guests, status }: { name: string, date: string, guests: number, status: string, key?: string }) => (
  <tr className="hover:bg-zinc-50 transition-colors cursor-pointer">
    <td className="px-6 py-4 font-medium text-zinc-900">{name}</td>
    <td className="px-6 py-4 text-zinc-500">{date}</td>
    <td className="px-6 py-4 text-zinc-500">{guests} personas</td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
        status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}>
        {status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
      </span>
    </td>
  </tr>
);

const ActivityItem = ({ icon, title, desc, time }: { icon: React.ReactNode, title: string, desc: string, time: string }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-bold text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
      <p className="mt-1 text-[10px] text-zinc-400 font-medium">{time}</p>
    </div>
  </div>
);
