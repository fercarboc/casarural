// src/public/pages/blog/QueVerVallesPasiegosPost.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { CTASection } from '../../components/CTASection'
import { MapPin } from 'lucide-react'

export const QueVerVallesPasiegosPost: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Qué ver en los Valles Pasiegos: guía de 2 días | La Rasilla"
        description="Guía completa de los Valles Pasiegos en 2 días: pueblos con encanto, gastronomía pasiego, rutas de senderismo y los mejores miradores de Cantabria."
        canonical="https://www.casarurallarasilla.com/blog/que-ver-valles-pasiegos"
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-20 overflow-hidden">
        <img
          src="/images/pueblo1.jpg"
          alt="Paisaje de los Valles Pasiegos, Cantabria"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/blog" className="text-emerald-400 hover:underline text-sm">Blog</Link>
            <span className="text-stone-500">/</span>
            <span className="text-stone-400 text-sm">Destinos</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Qué ver en los Valles Pasiegos: guía de 2 días
          </h1>
          <p className="text-lg text-stone-300">Marzo 2026 · 8 min de lectura</p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-3xl mx-auto prose prose-stone prose-lg">
          <p className="text-xl text-stone-600 leading-relaxed not-prose mb-8">
            Los <strong>Valles Pasiegos</strong> son uno de los rincones más auténticos y desconocidos de Cantabria. Una comarca de prados verdes interminables, pueblos de piedra y una cultura propia que ha sobrevivido al paso del tiempo. Esta guía te lleva por los mejores lugares en solo 2 días.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Día 1: El Valle de Toranzo</h2>

          <h3 className="text-xl font-bold text-stone-800 mb-3">Mañana: Puente Viesgo y la Cueva de El Castillo</h3>
          <p className="text-stone-600 leading-relaxed mb-4">
            Comienza el día en <strong>Puente Viesgo</strong>, uno de los pueblos más bonitos del Valle de Toranzo. Las <strong>Cuevas de El Castillo</strong> albergan pinturas rupestres de hace más de 40.000 años, declaradas Patrimonio de la Humanidad por la UNESCO. Una visita obligatoria si quieres entender la historia de Cantabria.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Reserva la visita con antelación: solo admiten grupos reducidos y las plazas se llenan rápido en temporada alta.
          </p>

          <h3 className="text-xl font-bold text-stone-800 mb-3">Tarde: Paseo por Corvera de Toranzo</h3>
          <p className="text-stone-600 leading-relaxed mb-4">
            Después de comer en alguno de los restaurantes de Puente Viesgo (no te vayas sin probar el cocido montañés), sube hasta <strong>Castillo Pedroso</strong> para tener una de las mejores vistas del valle. El pueblo, con sus casas de piedra y sus prados, parece sacado de otro siglo.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Si te alojas en <Link to="/" className="text-emerald-700 hover:underline font-semibold">Casa Rural La Rasilla</Link>, precisamente aquí es donde está la casa. Puedes llegar por la tarde, instalarte y salir a dar un paseo tranquilo antes de la cena.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Día 2: Vega de Pas y la gastronomía pasiego</h2>

          <h3 className="text-xl font-bold text-stone-800 mb-3">Mañana: Vega de Pas, la capital de los Pasiegos</h3>
          <p className="text-stone-600 leading-relaxed mb-4">
            <strong>Vega de Pas</strong> es el corazón de la cultura pasiego. Aquí nacieron los sobaos y las quesadas más famosas de Cantabria. Recorre el casco urbano, visita alguna de las pastelerías artesanales y compra para llevar a casa.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Si vas en domingo, no te pierdas el mercado semanal, donde los ganaderos locales venden sus productos directamente.
          </p>

          <h3 className="text-xl font-bold text-stone-800 mb-3">Tarde: Ruta de las Cabañas Pasiegas</h3>
          <p className="text-stone-600 leading-relaxed mb-4">
            Las <strong>cabañas pasiegas</strong> son las construcciones de piedra dispersas por las laderas donde los ganaderos vivían con sus rebaños en verano. Una ruta circular de 2-3 horas desde Vega de Pas te llevará por algunas de las más representativas, con vistas espectaculares del valle.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Es una ruta de dificultad media: cómoda para grupos de senderismo pero con algún desnivel que agradecerás haber desayunado bien.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Gastronomía: lo que no puedes perderte</h2>
          <ul className="space-y-2 text-stone-600 mb-6">
            {[
              'Sobaos pasiegos: el dulce más famoso de Cantabria, originario de Vega de Pas',
              'Quesada pasiego: un postre cremoso a base de requesón y leche pasiego',
              'Cocido montañés: el plato de cuchara más contundente del norte de España',
              'Mantequilla de Cantabria: de las mejores de España, perfecta con pan de pueblo',
              'Rabas: anillos de calamar rebozados, imprescindibles en cualquier bar del litoral',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-600 mt-1 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-10 mb-4">Dónde alojarse en los Valles Pasiegos</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Si viajas en grupo, la mejor opción es alojarte en una <Link to="/casa-rural-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">casa rural en los Valles Pasiegos</Link> de alquiler íntegro. Así tenéis toda la privacidad, podéis cocinar con los productos que compréis en el mercado y no dependéis de horarios de hotel.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            <strong>Casa Rural La Rasilla</strong> está en Castillo Pedroso, en el corazón del Valle de Toranzo, y tiene capacidad para hasta 11 personas. Descubre también nuestra <Link to="/casa-rural-con-barbacoa-cantabria" className="text-emerald-700 hover:underline font-semibold">zona de barbacoa y jardín privado</Link>.
          </p>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CTASection
          title="¿Vas a los Valles Pasiegos?"
          subtitle="Alójate en La Rasilla: casa rural íntegra para grupos de hasta 11 personas en el corazón del Valle de Toranzo."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
