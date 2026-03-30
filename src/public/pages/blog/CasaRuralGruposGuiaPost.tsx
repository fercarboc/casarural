// src/public/pages/blog/CasaRuralGruposGuiaPost.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { CTASection } from '../../components/CTASection'
import { CheckCircle } from 'lucide-react'

export const CasaRuralGruposGuiaPost: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Casa rural para grupos en Cantabria: guía completa | La Rasilla"
        description="Todo lo que necesitas saber para organizar una escapada rural en grupo en Cantabria: qué buscar, cómo comparar alojamientos y por qué el alquiler íntegro es la mejor opción."
        canonical="https://www.casarurallarasilla.com/blog/casa-rural-grupos-cantabria-guia"
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-20 overflow-hidden">
        <img
          src="/images/porche1.jpg"
          alt="Casa rural para grupos en Cantabria"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/blog" className="text-emerald-400 hover:underline text-sm">Blog</Link>
            <span className="text-stone-500">/</span>
            <span className="text-stone-400 text-sm">Guías</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Casa rural para grupos en Cantabria: guía completa
          </h1>
          <p className="text-lg text-stone-300">Febrero 2026 · 9 min de lectura</p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-stone-600 leading-relaxed mb-8">
            Organizar una escapada rural en grupo en Cantabria puede ser más complicado de lo que parece. Esta guía te ayuda a encontrar el alojamiento adecuado, a evitar los errores más comunes y a sacar el máximo partido a vuestra estancia en el norte de España.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">¿Cuántos sois? El primer criterio</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            El tamaño del grupo determina casi todo: el tipo de alojamiento, el precio por persona y las opciones disponibles. En Cantabria, la mayoría de casas rurales tienen capacidad para 6-8 personas. Si sois más, las opciones se reducen considerablemente.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Para <strong>grupos de 8 a 11 personas</strong>, lo más cómodo es buscar una casa rural de alquiler íntegro con capacidad real para ese número. No solo en camas, sino en espacios comunes: salón, cocina, jardín. Una casa pensada para 8 pero con 11 personas resulta agobiante.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Alquiler íntegro vs habitaciones sueltas</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Cuando un grupo grande viaja, la diferencia entre alquilar una casa entera y reservar habitaciones sueltas en un hotel o casa rural compartida es enorme.
          </p>
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <h3 className="font-bold text-stone-800 mb-3">Alquiler íntegro</h3>
              <ul className="space-y-2 text-sm text-stone-600">
                {[
                  'La casa entera es para vuestro grupo',
                  'Sin otros huéspedes ni horarios impuestos',
                  'Cocina y jardín de uso exclusivo',
                  'Precio por grupo, no por persona',
                  'Más económico para grupos grandes',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-3">Habitaciones sueltas</h3>
              <ul className="space-y-2 text-sm text-stone-500">
                {[
                  'Espacios comunes con otros huéspedes',
                  'Horarios de comidas y actividades fijos',
                  'Sin privacidad real para el grupo',
                  'Precio por persona, más caro para grupos',
                  'Menos sensación de "estar en casa"',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-stone-400 mt-0.5 shrink-0">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Qué mirar al comparar casas rurales en Cantabria</h2>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              <strong>Capacidad real vs capacidad oficial.</strong> Algunos alojamientos inflan su capacidad contando camas supletorias incómodas o sofás cama de baja calidad. Comprueba el número de camas fijas y el tamaño real de las habitaciones.
            </p>
            <p>
              <strong>Espacios comunes.</strong> Para un grupo de 10-11 personas, el salón comedor tiene que ser grande de verdad. Comprueba que caben todos sentados a la mesa y que hay sofás para estar juntos.
            </p>
            <p>
              <strong>Cocina equipada.</strong> Si queréis cocinar (y en grupos grandes suele ser más práctico y económico), aseguraos de que la cocina tiene menaje suficiente para el número de personas.
            </p>
            <p>
              <strong>Jardín y exteriores.</strong> Un jardín privado cerrado es muy diferente a una terraza compartida. Si viajas con niños, el jardín cerrado es especialmente valioso.
            </p>
            <p>
              <strong>Ubicación.</strong> ¿Está cerca de lo que queréis hacer? En Cantabria, los Valles Pasiegos son una ubicación central que da acceso a costa, montaña y pueblos con encanto en menos de una hora.
            </p>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Cuándo reservar y cómo conseguir el mejor precio</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Para grupos grandes, reservar con antelación es fundamental. Las casas rurales con capacidad para 10-11 personas son escasas y se llenan antes, especialmente en Semana Santa, verano y puentes.
          </p>
          <p className="text-stone-600 leading-relaxed mb-4">
            <strong>Reserva directa con los propietarios</strong> es siempre la mejor opción. Sin intermediarios, obtienes mejor precio y comunicación más fluida. Las plataformas como Booking.com o Airbnb añaden comisiones que en alquileres de varios días pueden ser significativas.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">La Rasilla: una de las mejores opciones en Cantabria</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Si buscas una <Link to="/casa-rural-cantabria-grupos" className="text-emerald-700 hover:underline font-semibold">casa rural para grupos en Cantabria</Link> con capacidad para 10-11 personas, La Rasilla cumple todos los criterios: alquiler íntegro, jardín privado con barbacoa, cocina completamente equipada y una ubicación en los <Link to="/casa-rural-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">Valles Pasiegos</Link> que lo pone todo a menos de una hora.
          </p>
          <p className="text-stone-600 leading-relaxed">
            La reserva es directa con los propietarios, sin intermediarios, y el precio es por la casa completa. Cuantos más seáis, más económico sale por persona.
          </p>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CTASection
          title="¿Organizando una escapada en grupo?"
          subtitle="La Rasilla tiene todo lo que busca un grupo: alquiler íntegro, jardín privado, barbacoa y hasta 11 plazas en los Valles Pasiegos."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
