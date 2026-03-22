import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfToday, 
  isWithinInterval,
  getDay,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Info, AlertCircle, CheckCircle2, XCircle, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookingService } from '../../services/booking.service';

export const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = startOfToday();

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getReservations();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventForDay = (day: Date) => {
    return reservations.find(res => {
      const start = parseISO(res.checkIn);
      const end = parseISO(res.checkOut);
      return isWithinInterval(day, { start, end }) && res.status !== 'CANCELLED';
    });
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
          <h1 className="text-3xl font-bold text-zinc-900">Calendario</h1>
          <p className="text-zinc-500">Gestión de disponibilidad y reservas</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800">
          <Plus size={18} />
          Bloqueo manual
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="rounded-full p-2 hover:bg-zinc-100 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="rounded-full p-2 hover:bg-zinc-100 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="bg-zinc-50 py-3 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const event = getEventForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[100px] bg-white p-2 text-left transition-all hover:bg-zinc-50
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isSelected ? 'ring-2 ring-inset ring-zinc-900 z-10' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-bold ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white' : 'text-zinc-500'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {event && (
                    <div className={`
                      mt-2 rounded-lg p-1.5 text-[10px] font-bold leading-tight shadow-sm
                      ${event.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''}
                      ${event.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : ''}
                      ${event.status === 'BLOCKED' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                    `}>
                      <p className="truncate">{event.guestName}</p>
                      {event.guests > 0 && <p className="mt-0.5 opacity-70">{event.guests} pax</p>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-6 text-xs font-bold text-zinc-400 border-t border-zinc-50 pt-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-emerald-50 border border-emerald-100" />
              <span>Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-50 border border-amber-100" />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-50 border border-red-100" />
              <span>Bloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-zinc-100" />
              <span>Pasado</span>
            </div>
          </div>
        </div>

        {/* Day Detail Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">
              {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
            </h3>
            
            {selectedDate ? (
              <div className="space-y-4">
                {getEventForDay(selectedDate) ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        <Info size={14} /> Detalle del evento
                      </div>
                      <p className="text-sm font-bold text-zinc-900">{getEventForDay(selectedDate)?.guestName}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {format(parseISO(getEventForDay(selectedDate)!.checkIn), 'dd/MM')} - {format(parseISO(getEventForDay(selectedDate)!.checkOut), 'dd/MM')}
                      </p>
                      <button className="mt-4 w-full rounded-lg bg-white border border-zinc-200 py-2 text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-all">
                        Ver reserva completa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-3 opacity-20" size={48} />
                    <p className="text-sm font-medium text-zinc-400">Día libre</p>
                    <button className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-all">
                      Crear reserva manual
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-12">Haz clic en un día del calendario para ver los detalles o gestionar bloqueos.</p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Resumen de ocupación</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Marzo 2026</span>
                <span className="font-bold text-zinc-900">72%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                La ocupación es un 15% superior a la del mismo mes del año pasado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
