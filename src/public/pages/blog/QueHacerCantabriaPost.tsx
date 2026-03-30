// src/public/pages/blog/QueHacerCantabriaPost.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { CTASection } from '../../components/CTASection'
import { MapPin } from 'lucide-react'

const actividades = [
  {
    categoria: 'Naturaleza y senderismo',
    items: [
      { name: 'Picos de Europa', distancia: '~1h 30min', desc: 'El parque nacional más visitado de España. El teleférico de Fuente Dé sube a 1.800m para rutas de alta montaña espectaculares.' },
      { name: 'Valles Pasiegos', distancia: 'En la puerta', desc: 'Rutas de senderismo para todos los niveles entre prados verdes, cabañas de piedra y vistas panorámicas del norte de España.' },
      { name: 'Parque Natural de Oyambre', distancia: '~50min', desc: 'Playas, dunas y marismas en un espacio natural protegido. Una de las costas más salvajes y limpias del Cantábrico.' },
    ]
  },
  {
    categoria: 'Cultura e historia',
    items: [
      { name: 'Cuevas de El Castillo (Puente Viesgo)', distancia: '~15min', desc: 'Pinturas rupestres de hace 40.000 años. Patrimonio de la Humanidad por la UNESCO. Reserva con antelación.' },
      { name: 'Altamira', distancia: '~1h', desc: 'La Capilla Sixtina del Arte Prehistórico. El museo neocueva permite ver réplicas perfectas de las pinturas originales.' },
      { name: 'Santander', distancia: '~45min', desc: 'La capital cántabra tiene mucho que ofrecer: Palacio de la Magdalena, playas urbanas, Mercado de la Esperanza y el barrio pesquero.' },
    ]
  },
  {
    categoria: 'Playa y costa',
    items: [
      { name: 'Playa de El Sardinero', distancia: '~50min', desc: 'La playa urbana más famosa de Santander, con vistas al Palacio de la Magdalena. Ideal para familias.' },
      { name: 'Comillas y Rías Bajas', distancia: '~1h 15min', desc: 'Comillas combina playa, arquitectura modernista (El Capricho de Gaudí) y un ambiente especial que no encontrarás en otro sitio.' },
      { name: 'Playa de Somo', distancia: '~50min', desc: 'Una de las mejores playas de surf del norte de España. Kilómetros de arena, dunas y olas perfectas para principiantes.' },
    ]
  },
]

export const QueHacerCantabriaPost: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Qué hacer en Cantabria en una escapada rural | La Rasilla"
        description="Guía completa de actividades en Cantabria: Picos de Europa, playas del Cantábrico, cultura, gastronomía y los mejores planes para grupos desde los Valles Pasiegos."
        canonical="https://www.casarurallarasilla.com/blog/que-hacer-cantabria-escapada-rural"
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-20 overflow-hidden">
        <img
          src="/images/porche2.jpg"
          alt="Qué hacer en Cantabria en una escapada rural"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/blog" className="text-emerald-400 hover:underline text-sm">Blog</Link>
            <span className="text-stone-500">/</span>
            <span className="text-stone-400 text-sm">Actividades</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Qué hacer en Cantabria en una escapada rural
          </h1>
          <p className="text-lg text-stone-300">Febrero 2026 · 8 min de lectura</p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-stone-600 leading-relaxed mb-8">
            Cantabria es una de las comunidades autónomas más completas para una escapada rural: tiene montaña, costa, historia, gastronomía y una naturaleza que sorprende a quien la visita por primera vez. Esta guía recoge los mejores planes desde los <strong>Valles Pasiegos</strong>.
          </p>

          <p className="text-stone-600 leading-relaxed mb-8">
            La ventaja de alojarse en los Valles Pasiegos es la ubicación central: en menos de una hora llegas a casi todo lo que Cantabria tiene que ofrecer. Es el punto de partida perfecto para explorar la región sin tener que cambiar de base.
          </p>

          {actividades.map((cat, ci) => (
            <div key={ci} className="mb-10">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6">{cat.categoria}</h2>
              <div className="space-y-4">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-stone-800">{item.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
                        <MapPin size={12} />
                        <span>{item.distancia}</span>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Gastronomía: el plan que no puede faltar</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            En Cantabria, la gastronomía es una actividad en sí misma. No te vayas sin probar el <strong>cocido montañés</strong> en algún restaurante del interior, los <strong>sobaos y quesadas</strong> de las pastelerías de Vega de Pas, las <strong>rabas</strong> en cualquier bar del puerto y los <strong>anchoas de Santoña</strong>, consideradas las mejores del mundo.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Si te alojas en una casa rural con cocina equipada, también puedes comprar en los mercados locales y preparar tus propios platos con productos de la zona. Los fines de semana, el mercado de Ontaneda (a 10 minutos de La Rasilla) tiene productores locales con quesos, embutidos y verduras de temporada.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Plan de 3 días desde los Valles Pasiegos</h2>
          <div className="space-y-4 text-stone-600">
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-2">Día 1: Los Pasiegos</h3>
              <p className="text-sm leading-relaxed">Llegada, Cuevas de El Castillo en Puente Viesgo, paseo por Castillo Pedroso, barbacoa en La Rasilla.</p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-2">Día 2: La costa</h3>
              <p className="text-sm leading-relaxed">Santander (Palacio de la Magdalena, mercado, rabas), playa El Sardinero, Comillas con visita a El Capricho de Gaudí.</p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-2">Día 3: Montaña</h3>
              <p className="text-sm leading-relaxed">Parque de Cabárceno por la mañana, ruta de senderismo por los Pasiegos por la tarde, cena de despedida en la casa.</p>
            </div>
          </div>

          <p className="text-stone-600 leading-relaxed mt-8">
            Descubre también <Link to="/blog/que-ver-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">qué ver en los Valles Pasiegos en 2 días</Link> y las <Link to="/blog/rutas-senderismo-cantabria" className="text-emerald-700 hover:underline font-semibold">mejores rutas de senderismo en Cantabria</Link>.
          </p>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CTASection
          title="¿Listo para tu escapada en Cantabria?"
          subtitle="La Rasilla es la base perfecta: alquiler íntegro para grupos de hasta 11 personas en los Valles Pasiegos."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
