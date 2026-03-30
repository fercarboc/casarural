// src/public/pages/blog/RutasSenderismoCantabriaPost.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { CTASection } from '../../components/CTASection'
import { Mountain } from 'lucide-react'

const rutas = [
  {
    name: 'Ruta del Asón',
    dificultad: 'Fácil',
    distancia: '8 km',
    desc: 'Recorre el río Asón entre cascadas y bosques de ribera. Perfecta para familias y grupos sin experiencia en senderismo.',
  },
  {
    name: 'Collado de Sejos',
    dificultad: 'Media',
    distancia: '12 km',
    desc: 'Ascensión a uno de los miradores más espectaculares de los Valles Pasiegos con vistas al Mar Cantábrico en días despejados.',
  },
  {
    name: 'Nacimiento del Pas',
    dificultad: 'Media',
    distancia: '10 km',
    desc: 'El nacimiento del río Pas en las cumbres de los Pasiegos, con prados de alta montaña y una tranquilidad difícil de encontrar.',
  },
  {
    name: 'Picos de Europa (Fuente Dé)',
    dificultad: 'Alta',
    distancia: '15+ km',
    desc: 'A 1,5 horas desde los Valles Pasiegos, el teleférico de Fuente Dé sube a 1.800 metros para rutas espectaculares de alta montaña.',
  },
  {
    name: 'Parque Natural de Oyambre',
    dificultad: 'Fácil',
    distancia: '6 km',
    desc: 'Costa y naturaleza en la misma ruta. El Parque Natural de Oyambre combina playas, dunas y marismas en un entorno protegido.',
  },
]

export const RutasSenderismoCantabriaPost: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Mejores rutas de senderismo en Cantabria para grupos | La Rasilla"
        description="Las mejores rutas de senderismo en Cantabria para grupos, desde los Valles Pasiegos hasta los Picos de Europa. Dificultad, distancia y consejos prácticos."
        canonical="https://www.casarurallarasilla.com/blog/rutas-senderismo-cantabria"
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-20 overflow-hidden">
        <img
          src="/images/pueblo2.jpg"
          alt="Rutas de senderismo en Cantabria, Valles Pasiegos"
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
            Mejores rutas de senderismo en Cantabria para grupos
          </h1>
          <p className="text-lg text-stone-300">Marzo 2026 · 7 min de lectura</p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-stone-600 leading-relaxed mb-8">
            Cantabria es uno de los destinos de senderismo más completos del norte de España. Desde rutas costeras hasta ascensiones de alta montaña, pasando por los prados verdes de los <strong>Valles Pasiegos</strong>. Esta guía recopila las mejores opciones para grupos que se alojan en la comarca.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-6">Las 5 mejores rutas desde los Valles Pasiegos</h2>

          <div className="space-y-6">
            {rutas.map((ruta, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-stone-800">{ruta.name}</h3>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      ruta.dificultad === 'Fácil' ? 'bg-emerald-100 text-emerald-700' :
                      ruta.dificultad === 'Media' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{ruta.dificultad}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-stone-200 text-stone-600">{ruta.distancia}</span>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{ruta.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Consejos para hacer senderismo en grupo en Cantabria</h2>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              <strong>El tiempo en Cantabria es imprevisible.</strong> Incluso en verano puede llover de repente. Llevar siempre chubasquero ligero es imprescindible. Las lluvias suelen ser cortas y el paisaje después de la lluvia es especialmente bonito.
            </p>
            <p>
              <strong>Calzado adecuado es fundamental.</strong> Para las rutas de los Valles Pasiegos, unas zapatillas de trekking con buen agarre son suficientes. Para Picos de Europa, se recomienda bota de montaña con caña.
            </p>
            <p>
              <strong>Hydratación y snacks.</strong> En los Pasiegos hay muy pocos bares en las rutas. Lleva suficiente agua y algo para picar. Los sobaos pasiegos son el snack de senderismo más cántabro que existe.
            </p>
            <p>
              <strong>Mejor temporada: mayo-octubre.</strong> Los meses de verano tienen los días más largos y el mejor tiempo. Septiembre y octubre son especialmente bonitos: menos turistas, colores otoñales y temperaturas suaves.
            </p>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">La Rasilla como base de senderismo</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Si tu grupo viene a hacer senderismo en Cantabria, alojarse en una <Link to="/casa-rural-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">casa rural en los Valles Pasiegos</Link> tiene mucho sentido: estás en el centro de la comarca, tienes acceso directo a las rutas de los Pasiegos y en 45-90 minutos llegas a Picos de Europa, la costa o Cabárceno.
          </p>
          <p className="text-stone-600 leading-relaxed mb-4">
            La <Link to="/" className="text-emerald-700 hover:underline font-semibold">Casa Rural La Rasilla</Link> en Castillo Pedroso tiene capacidad para hasta 11 personas. Después de la ruta, el jardín, la barbacoa y el salón con chimenea son el cierre perfecto para el día. Descubre también nuestra <Link to="/casa-rural-cantabria-grupos" className="text-emerald-700 hover:underline font-semibold">opción para grupos grandes</Link>.
          </p>

          <div className="mt-8 flex items-start gap-3 bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <Mountain size={20} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-stone-600 text-sm leading-relaxed">
              <strong className="text-stone-800">Consejo local:</strong> El mirador de Castillo Pedroso, a pocos metros de La Rasilla, tiene una de las mejores vistas del Valle de Toranzo. Perfecta para el atardecer después de un día de ruta.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CTASection
          title="¿Planes de senderismo en Cantabria?"
          subtitle="La Rasilla es la base perfecta para tu grupo. Alquiler íntegro para hasta 11 personas en el corazón de los Valles Pasiegos."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
