import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { isAfter, isBefore, isSameDay, addDays, startOfToday, differenceInDays, parseISO } from 'date-fns';
import { ShieldCheck, Info, AlertCircle, CheckCircle2, Calendar, Zap, CreditCard, MessageSquare } from 'lucide-react';

import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { BookingSearchForm } from '../components/BookingSearchForm';
import { RateCard } from '../components/RateCard';
import { BookingSummaryCard } from '../components/BookingSummaryCard';
import { bookingService } from '../../services/booking.service';
import { calendarService } from '../../services/calendar.service';
import { RateType } from '../../shared/types';
import { PriceBreakdown } from '../../shared/types/booking';
import { MetaTags } from '../components/MetaTags';

export default function BookingPage() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(10);
  const [rateType, setRateType] = useState<RateType>('FLEXIBLE');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([]);

  const today = startOfToday();

  const getMinStay = (date: Date | null): { nights: number; label: string } => {
    if (!date) return { nights: 2, label: 'Temporada general' };
    const m = date.getMonth() + 1;
    if (m === 7 || m === 8) return { nights: 3, label: 'Temporada alta (julio y agosto)' };
    if (m === 12 || m === 1) return { nights: 3, label: 'Navidades y Año Nuevo' };
    return { nights: 2, label: 'Temporada media/baja' };
  };
  const minStay = getMinStay(checkIn);

  useEffect(() => {
    const fetchOccupiedDates = async () => {
      try {
        const dates = await calendarService.getOccupiedDates();
        setOccupiedDates(dates.map(d => parseISO(d)));
      } catch (error) {
        console.error('Error fetching occupied dates:', error);
      }
    };
    fetchOccupiedDates();
  }, []);

  // Handle date selection logic
  const handleSelectDate = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      setHasSearched(false);
    } else if (checkIn && !checkOut) {
      if (isBefore(date, checkIn)) {
        setCheckIn(date);
      } else if (isSameDay(date, checkIn)) {
        setCheckIn(null);
      } else {
        setCheckOut(date);
      }
    }
  };

  const isValidSearch = checkIn !== null && checkOut !== null && guests >= 1 && guests <= 11;

  const handleSearch = async () => {
    if (!isValidSearch) return;
    setIsSearching(true);
    
    try {
      // Simulate availability check
      const availability = await bookingService.getAvailability(checkIn!, checkOut!);
      const allAvailable = availability.every(d => d.isAvailable);
      
      setIsAvailable(allAvailable);
      if (allAvailable) {
        const breakdown = bookingService.calculatePrice(checkIn!, checkOut!, guests, rateType);
        setPriceBreakdown(breakdown);
      }
    } catch (error) {
      console.error('Error checking availability', error);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  // Recalculate price when rate or guests change
  useEffect(() => {
    if (checkIn && checkOut && hasSearched && isAvailable) {
      const breakdown = bookingService.calculatePrice(checkIn, checkOut, guests, rateType);
      setPriceBreakdown(breakdown);
    }
  }, [rateType, guests, checkIn, checkOut, hasSearched, isAvailable]);

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    try {
      await bookingService.createReservation({
        checkIn: checkIn!.toISOString(),
        checkOut: checkOut!.toISOString(),
        guests,
        rateType,
        customerName: 'Cliente Mock',
        customerEmail: 'mock@example.com',
        customerPhone: '600000000',
        total: priceBreakdown?.total || 0
      });
      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking error', error);
    } finally {
      setIsBooking(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <MetaTags 
          title="¡Reserva confirmada! | La Rasilla"
          description="Tu reserva en La Rasilla ha sido procesada correctamente. ¡Te esperamos!"
        />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-800">¡Reserva iniciada!</h2>
          <p className="mt-4 text-stone-600">
            Hemos bloqueado las fechas para ti. En unos segundos serás redirigido a Stripe para completar el pago.
          </p>
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-8 text-left">
            <h4 className="font-bold text-stone-800">Detalles de la pre-reserva</h4>
            <div className="mt-4 space-y-2 text-sm text-stone-600">
              <p><strong>Entrada:</strong> {checkIn && checkIn.toLocaleDateString()}</p>
              <p><strong>Salida:</strong> {checkOut && checkOut.toLocaleDateString()}</p>
              <p><strong>Huéspedes:</strong> {guests}</p>
              <p><strong>Total:</strong> {priceBreakdown?.total.toFixed(2)}€</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-8 text-sm font-bold text-emerald-700 hover:underline"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <MetaTags
        title="Reservar | Mejor precio garantizado casa rural Cantabria | La Rasilla"
        description="Reserva tu estancia en La Rasilla directamente desde nuestra web. Sin comisiones, mejor precio garantizado y confirmación inmediata."
      />

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-800 md:text-5xl">Reserva tu estancia en La Rasilla</h1>
        <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
          <strong>Casa rural de alquiler íntegro</strong> · Hasta 11 personas · Reserva directa sin intermediarios
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">

        {/* ── LEFT: Formulario + Resultados ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
              <span className="text-xs font-medium text-emerald-900">Mejor precio</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <Zap className="text-emerald-600 shrink-0" size={18} />
              <span className="text-xs font-medium text-emerald-900">Confirmación inmediata</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <CreditCard className="text-emerald-600 shrink-0" size={18} />
              <span className="text-xs font-medium text-emerald-900">Pago 100% seguro</span>
            </div>
          </div>

          {/* Formulario de selección */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {/* Entrada */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                  <Calendar size={12} /> Entrada
                </label>
                <div className={`rounded-xl border px-3 py-3 text-sm font-medium ${checkIn ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-400'}`}>
                  {checkIn ? checkIn.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '↓ Calendario'}
                </div>
              </div>
              {/* Salida */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                  <Calendar size={12} /> Salida
                </label>
                <div className={`rounded-xl border px-3 py-3 text-sm font-medium ${checkOut ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-400'}`}>
                  {checkOut ? checkOut.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '↓ Calendario'}
                </div>
              </div>
              {/* Huéspedes */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={e => setGuests(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-medium text-stone-700 focus:border-emerald-500 focus:outline-none"
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aviso estancia mínima */}
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm border ${checkIn ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
              <Info size={15} className="shrink-0" />
              <span>
                <strong>Estancia mínima: {minStay.nights} noches</strong>
                {' '}· {minStay.label}
              </span>
            </div>

            <button
              disabled={!isValidSearch}
              onClick={handleSearch}
              className="w-full rounded-xl bg-emerald-700 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-800 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Consultar Disponibilidad
            </button>
          </div>

          {/* No disponible */}
          {hasSearched && isAvailable === false && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-red-800 border border-red-100">
              <AlertCircle size={22} />
              <div>
                <p className="font-bold">Fechas no disponibles</p>
                <p className="text-sm">Algunas fechas ya están ocupadas. Prueba con otro rango en el calendario.</p>
              </div>
            </motion.div>
          )}

          {/* Disponible: tarifas con desglose */}
          {hasSearched && isAvailable === true && priceBreakdown && checkIn && checkOut && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={20} />
                <p className="font-medium text-sm">¡La casa está disponible para tus fechas! Selecciona una tarifa.</p>
              </div>

              {/* Cards de tarifa con desglose completo */}
              <div className="grid grid-cols-2 gap-5">
                {/* Flexible */}
                <button
                  onClick={() => setRateType('FLEXIBLE')}
                  className={`rounded-2xl border-2 p-5 text-left transition-all space-y-4 ${rateType === 'FLEXIBLE' ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-600/10' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Tarifa Flexible</p>
                      <p className="text-2xl font-serif font-bold text-stone-900 mt-1">{priceBreakdown.total.toFixed(2)}€</p>
                    </div>
                    {rateType === 'FLEXIBLE' && <CheckCircle2 size={20} className="text-emerald-600" />}
                  </div>
                  <div className="space-y-1 text-xs text-stone-500 border-t border-stone-200 pt-3">
                    <div className="flex justify-between"><span>{priceBreakdown.nights} noches × {priceBreakdown.nightlyPrice.toFixed(0)}€</span><span>{priceBreakdown.accommodationTotal.toFixed(2)}€</span></div>
                    <div className="flex justify-between"><span>Gastos de limpieza</span><span>{priceBreakdown.cleaningFee.toFixed(2)}€</span></div>
                    {priceBreakdown.extraGuestsTotal > 0 && <div className="flex justify-between"><span>Suplemento huéspedes</span><span>{priceBreakdown.extraGuestsTotal.toFixed(2)}€</span></div>}
                    <div className="flex justify-between font-bold text-stone-800 text-sm pt-1 border-t border-stone-200"><span>Total</span><span>{priceBreakdown.total.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-emerald-700 font-medium"><span>Señal ahora (30%)</span><span>{priceBreakdown.depositRequired.toFixed(2)}€</span></div>
                  </div>
                  <p className="text-[10px] text-stone-400">Cancela gratis hasta 60 días antes de la entrada.</p>
                </button>

                {/* No Reembolsable */}
                <button
                  onClick={() => setRateType('NON_REFUNDABLE')}
                  className={`rounded-2xl border-2 p-5 text-left transition-all space-y-4 ${rateType === 'NON_REFUNDABLE' ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-600/10' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">No Reembolsable</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">−10%</span>
                      </div>
                      <p className="text-2xl font-serif font-bold text-stone-900 mt-1">{priceBreakdown.total.toFixed(2)}€</p>
                    </div>
                    {rateType === 'NON_REFUNDABLE' && <CheckCircle2 size={20} className="text-emerald-600" />}
                  </div>
                  <div className="space-y-1 text-xs text-stone-500 border-t border-stone-200 pt-3">
                    <div className="flex justify-between"><span>{priceBreakdown.nights} noches × {priceBreakdown.nightlyPrice.toFixed(0)}€</span><span>{priceBreakdown.accommodationTotal.toFixed(2)}€</span></div>
                    <div className="flex justify-between"><span>Gastos de limpieza</span><span>{priceBreakdown.cleaningFee.toFixed(2)}€</span></div>
                    {priceBreakdown.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Descuento 10%</span><span>−{priceBreakdown.discount.toFixed(2)}€</span></div>}
                    <div className="flex justify-between font-bold text-stone-800 text-sm pt-1 border-t border-stone-200"><span>Total</span><span>{priceBreakdown.total.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-stone-600 font-medium"><span>Pago completo al reservar</span><span>{priceBreakdown.total.toFixed(2)}€</span></div>
                  </div>
                  <p className="text-[10px] text-stone-400">Sin posibilidad de cancelación ni cambios.</p>
                </button>
              </div>

              {/* Botón de pago */}
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full rounded-xl bg-stone-900 py-5 text-base font-bold text-white shadow-xl transition-all hover:bg-stone-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center gap-2"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Procesando...</span>
                ) : (
                  `Confirmar y Pagar ${priceBreakdown.total.toFixed(2)}€`
                )}
              </button>

              {/* Política de cancelación */}
              <div id="condiciones-cancelacion" className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="flex items-center gap-2 text-base font-bold text-stone-800 mb-4">
                  <Info size={16} className="text-emerald-700" /> Política de cancelación
                </h3>
                <div className="grid gap-6 md:grid-cols-2 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Tarifa Flexible</p>
                    <div className="flex justify-between"><span className="text-stone-600">60 días o más</span><span className="font-bold text-emerald-700">100% Reembolso</span></div>
                    <div className="flex justify-between"><span className="text-stone-600">45 a 59 días</span><span className="font-bold text-stone-700">50% Reembolso</span></div>
                    <div className="flex justify-between"><span className="text-stone-600">30 a 44 días</span><span className="font-bold text-stone-700">25% Reembolso</span></div>
                    <div className="flex justify-between"><span className="text-stone-600">Menos de 30 días</span><span className="font-bold text-red-600">Sin reembolso</span></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">No Reembolsable</p>
                    <p className="text-stone-600 leading-relaxed">No admite devoluciones ni cambios bajo ninguna circunstancia. El 100% del importe se cobra al reservar.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Calendario (sticky) ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            {/* Aviso mínimo en el calendario */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <Info size={15} className="shrink-0" />
              <span>Selecciona las fechas de llegada y salida · Mínimo <strong>{minStay.nights} noches</strong></span>
            </div>
            <AvailabilityCalendar
              selectedRange={{ start: checkIn, end: checkOut }}
              onSelectDate={handleSelectDate}
              occupiedDates={occupiedDates}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

