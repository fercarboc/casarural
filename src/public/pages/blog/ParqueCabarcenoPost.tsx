// src/public/pages/blog/ParqueCabarcenoPost.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { CTASection } from '../../components/CTASection'
import { CheckCircle, MapPin } from 'lucide-react'

export const ParqueCabarcenoPost: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Parque de Cabárceno: guía completa para tu visita | La Rasilla"
        description="Todo lo que necesitas saber para visitar el Parque de Cabárceno: precios, horarios, cómo llegar desde los Valles Pasiegos, qué ver y consejos prácticos para grupos."
        canonical="https://www.casarurallarasilla.com/blog/parque-cabaraceno-guia"
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-20 overflow-hidden">
        <img
          src="/images/casa2.jpg"
          alt="Parque de Cabárceno en Cantabria"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/blog" className="text-emerald-400 hover:underline text-sm">Blog</Link>
            <span className="text-stone-500">/</span>
            <span className="text-stone-400 text-sm">Excursiones</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Parque de Cabárceno: guía completa para tu visita
          </h1>
          <p className="text-lg text-stone-300">Enero 2026 · 7 min de lectura</p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-stone-600 leading-relaxed mb-8">
            El <strong>Parque de Cabárceno</strong> es uno de los parques de naturaleza más especiales de Europa. No es un zoo tradicional: los animales viven en semilibertad en un antiguo terreno minero de 750 hectáreas en Cantabria. Una visita que sorprende tanto a niños como a adultos.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">¿Qué es el Parque de Cabárceno?</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Cabárceno ocupa un antiguo yacimiento minero de hierro en la sierra del mismo nombre, en el municipio de Penagos. Las excavaciones mineras del siglo XX dejaron un paisaje lunar de lagunas y escombreras que, paradójicamente, se convirtió en el hábitat perfecto para crear un espacio de conservación de animales en semilibertad.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            Elefantes, rinocerontes, gorilas, osos pardos, leones, tigres, jirafas... más de 100 especies de animales viven en enormes recintos abiertos donde los visitantes pueden observarlos desde vehículos o a pie por los senderos del parque. La experiencia es muy diferente a la de un zoo convencional.
          </p>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">Información práctica</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Ubicación', value: 'Penagos, Cantabria' },
              { label: 'Desde La Rasilla', value: 'Aprox. 40-45 minutos' },
              { label: 'Horario', value: '9:30 - 18:00 (varía por temporada)' },
              { label: 'Precio adulto', value: 'Consultar web oficial' },
              { label: 'Precio niño', value: 'Consultar web oficial' },
              { label: 'Tiempo recomendado', value: 'Al menos 4-5 horas' },
            ].map((item, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">{item.label}</p>
                <p className="text-stone-700 font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">Cómo llegar desde los Valles Pasiegos</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Desde <strong>Castillo Pedroso</strong> (donde se ubica La Rasilla), el Parque de Cabárceno está a unos 40-45 minutos en coche. El trayecto pasa por Puente Viesgo y Villafufre, atravesando paisajes preciosos del interior de Cantabria.
          </p>
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-stone-800 mb-1">Ruta desde La Rasilla</p>
                <p className="text-stone-600 text-sm">Castillo Pedroso → Puente Viesgo → Villafufre → Penagos → Parque de Cabárceno. Carreteras comarcales en buen estado, sin peaje.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">Qué ver en Cabárceno</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            El parque es tan grande que es difícil verlo todo en un solo día. Estos son los animales y zonas que no debes perderte:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              'Los elefantes africanos: el recinto más grande del parque, con una manada completa',
              'Los gorilas: en un recinto con isla artificial, una de las mejores colonias de Europa',
              'Los osos pardos: especialmente activos a primera hora de la mañana',
              'El área de jirafas y cebras: el recinto más espectacular visualmente',
              'Los rinocerontes blancos: uno de los programas de conservación más exitosos del parque',
              'El lago de Cabárceno: el paisaje minero reconvertido en hábitat, único en el mundo',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-stone-600 text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">Consejos para visitar Cabárceno en grupo</h2>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              <strong>Reserva las entradas online.</strong> En temporada alta (verano, Semana Santa, puentes) el parque se llena. Comprar online evita colas y a veces hay descuentos.
            </p>
            <p>
              <strong>Lleva comida.</strong> El parque tiene varios restaurantes y cafeterías, pero para grupos grandes es más práctico y económico llevar bocadillos y comida de casa. Hay zonas de picnic en el interior.
            </p>
            <p>
              <strong>Ve en coche.</strong> El parque se recorre principalmente en vehículo propio por una ruta de unos 30 km. También hay autobús interno, pero con coche tienes más libertad para parar cuando quieras.
            </p>
            <p>
              <strong>Mejor horario: primera hora.</strong> Los animales están más activos por la mañana. Llegar a la apertura es la mejor forma de verlos moverse.
            </p>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mt-8 mb-4">Combina Cabárceno con los Valles Pasiegos</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            La visita a Cabárceno encaja perfectamente con una estancia en los Valles Pasiegos. Desde La Rasilla puedes ir por la mañana, pasar el día en el parque y volver por la tarde para una cena tranquila en la casa.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Si organizas una escapada de varios días, Cabárceno puede ser el plan de uno de los días mientras dedicas el resto a senderismo por los Pasiegos, la costa de Cantabria o una excursión a Santander. Lee nuestra guía de <Link to="/blog/que-hacer-cantabria-escapada-rural" className="text-emerald-700 hover:underline font-semibold">qué hacer en Cantabria en una escapada rural</Link> para planificar mejor tu estancia.
          </p>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CTASection
          title="¿Vas a visitar Cabárceno con tu grupo?"
          subtitle="Alójate en La Rasilla, a solo 40 minutos del Parque de Cabárceno. Alquiler íntegro para hasta 11 personas en los Valles Pasiegos."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
