import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import BookingPage from './public/pages/BookingPage';
import { HomePage } from './public/pages/HomePage';
import { LaCasaPage } from './public/pages/LaCasaPage';
import { GaleriaPage } from './public/pages/GaleriaPage';
import { ServiciosPage } from './public/pages/ServiciosPage';
import { ContactoPage } from './public/pages/ContactoPage';
import { SoportePage } from './public/pages/SoportePage';
import { DondeEstamosPage } from './public/pages/DondeEstamosPage';
import { Footer } from './public/components/Footer';
import { 
  AvisoLegal, 
  PoliticaPrivacidad, 
  PoliticaCookies, 
  RGPD, 
  CondicionesReserva, 
  PoliticaCancelaciones 
} from './public/pages/LegalPages';

// Admin Imports
import { AuthProvider } from './admin/context/AuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AdminLayout } from './admin/components/AdminLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { CalendarPage } from './admin/pages/CalendarPage';
import { ReservationsPage } from './admin/pages/ReservationsPage';
import { ReservationDetailPage } from './admin/pages/ReservationDetailPage';
import { CustomersPage } from './admin/pages/CustomersPage';
import { IncomePage } from './admin/pages/IncomePage';
import { InvoicesPage } from './admin/pages/InvoicesPage';
import { ConfigPage } from './admin/pages/ConfigPage';
import { ICalPage } from './admin/pages/ICalPage';

import { ReservationViewPage } from './public/pages/ReservationViewPage';
import ReservaConfirmada from './public/pages/ReservaConfirmada';
import { isMockMode } from './integrations/supabase/client';
import { SupabaseSetup } from './components/SupabaseSetup';

// Layouts
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col">
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-stone-800">La Rasilla</Link>
        <div className="hidden space-x-8 md:flex">
          <Link to="/la-casa" className="text-sm font-medium hover:text-emerald-700 transition-colors">La Casa</Link>
          <Link to="/galeria" className="text-sm font-medium hover:text-emerald-700 transition-colors">Galería</Link>
          <Link to="/servicios" className="text-sm font-medium hover:text-emerald-700 transition-colors">Servicios</Link>
          <Link to="/donde-estamos" className="text-sm font-medium hover:text-emerald-700 transition-colors">Dónde estamos</Link>
          <Link to="/contacto" className="text-sm font-medium hover:text-emerald-700 transition-colors">Contacto</Link>
        </div>
        <Link to="/reservar" className="rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-900 hover:scale-105 active:scale-95">
          Reservar ahora
        </Link>
      </div>
    </nav>
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  // Only show setup if not configured AND NOT in mock mode (but here isMockMode means not configured)
  // Actually, the user wants mock mode to be the default if no variables.
  // So we only show SupabaseSetup if the user explicitly wants to configure it?
  // Let's just remove the SupabaseSetup for now as per "No quiero pantallas vacías / No quiero errores".
  
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/la-casa" element={<PublicLayout><LaCasaPage /></PublicLayout>} />
          <Route path="/galeria" element={<PublicLayout><GaleriaPage /></PublicLayout>} />
          <Route path="/servicios" element={<PublicLayout><ServiciosPage /></PublicLayout>} />
          <Route path="/donde-estamos" element={<PublicLayout><DondeEstamosPage /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><ContactoPage /></PublicLayout>} />
          <Route path="/reservar" element={<PublicLayout><BookingPage /></PublicLayout>} />
          <Route path="/reserva/confirmada" element={<ReservaConfirmada />} />
          <Route path="/reserva/:token" element={<PublicLayout><ReservationViewPage /></PublicLayout>} />
          
          {/* Legal Routes */}
          <Route path="/aviso-legal" element={<PublicLayout><AvisoLegal /></PublicLayout>} />
          <Route path="/politica-privacidad" element={<PublicLayout><PoliticaPrivacidad /></PublicLayout>} />
          <Route path="/politica-cookies" element={<PublicLayout><PoliticaCookies /></PublicLayout>} />
          <Route path="/rgpd" element={<PublicLayout><RGPD /></PublicLayout>} />
          <Route path="/condiciones-reserva" element={<PublicLayout><CondicionesReserva /></PublicLayout>} />
          <Route path="/politica-cancelaciones" element={<PublicLayout><PoliticaCancelaciones /></PublicLayout>} />
          <Route path="/soporte" element={<PublicLayout><SoportePage /></PublicLayout>} />
          
          {/* Admin Auth */}
          <Route path="/admin/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="reservas" element={<ReservationsPage />} />
            <Route path="reservas/:id" element={<ReservationDetailPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="ingresos" element={<IncomePage />} />
            <Route path="facturas" element={<InvoicesPage />} />
            <Route path="configuracion" element={<ConfigPage />} />
            <Route path="ical" element={<ICalPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}
