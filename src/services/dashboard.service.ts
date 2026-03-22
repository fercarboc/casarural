import { isMockMode, supabase } from '../integrations/supabase/client';
import { getMockDashboardStats } from './dashboard.mock';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';

export const dashboardService = {
  async getStats() {
    if (isMockMode) {
      return getMockDashboardStats();
    }

    const today = new Date();
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    const next7days = format(addDays(today, 7), 'yyyy-MM-dd');

    // Reservas del mes
    const { data: reservasMes } = await supabase
      .from('reservas')
      .select('id, total, estado, estado_pago, origen, fecha_entrada, fecha_salida, nombre, apellidos, email')
      .gte('fecha_entrada', monthStart)
      .lte('fecha_entrada', monthEnd);

    const reservas = reservasMes ?? [];
    const confirmadas = reservas.filter(r => r.estado === 'CONFIRMED');
    const pendientesPago = reservas.filter(r => r.estado === 'PENDING_PAYMENT');
    const canceladas = reservas.filter(r => r.estado === 'CANCELLED');

    const ingresosMes = confirmadas.reduce((sum, r) => sum + (r.total || 0), 0);

    // Próximas llegadas (7 días)
    const { data: llegadas } = await supabase
      .from('reservas')
      .select('id, nombre, apellidos, email, fecha_entrada, fecha_salida, num_huespedes, total, estado, origen')
      .eq('estado', 'CONFIRMED')
      .gte('fecha_entrada', todayStr)
      .lte('fecha_entrada', next7days)
      .order('fecha_entrada', { ascending: true })
      .limit(5);

    // Resumen por origen
    const origenCount: Record<string, number> = {};
    for (const r of reservas) {
      origenCount[r.origen] = (origenCount[r.origen] || 0) + 1;
    }

    return {
      reservasMes: reservas.length,
      confirmadas: confirmadas.length,
      pendientesPago: pendientesPago.length,
      cancelaciones: canceladas.length,
      ingresosMes,
      proximasLlegadas: (llegadas ?? []).map(r => ({
        id: r.id,
        guestName: `${r.nombre} ${r.apellidos}`,
        checkIn: r.fecha_entrada,
        checkOut: r.fecha_salida,
        guests: r.num_huespedes,
        total: r.total,
        status: r.estado,
        source: r.origen,
      })),
      origenResumen: origenCount,
    };
  }
};
