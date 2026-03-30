// src/public/pages/seo/CasaRuralGruposPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { Users, Home, CheckCircle, ArrowRight, Utensils, Trees, Bath } from 'lucide-react'
import { CTASection } from '../../components/CTASection'
import { SectionContainer } from '../../components/SectionContainer'

export const CasaRuralGruposPage: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Casa Rural La Rasilla — Grupos",
    "description": "Casa rural en Cantabria para grupos de hasta 11 personas. Alquiler íntegro en los Valles Pasiegos con jardín privado y barbacoa.",
    "url": "https://www.casarurallarasilla.com/casa-rural-cantabria-grupos",
    "image": "https://www.casarurallarasilla.com/images/casa2.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Corvera de Toranzo",
      "addressRegion": "Cantabria",
      "postalCode": "39699",
      "addressCountry": "ES"
    }
  }

  return (
    <div className="bg-white">
      <MetaTags
        title="Casa Rural Cantabria para grupos hasta 11 personas | La Rasilla"
        description="Casa rural grande en Cantabria para grupos de 10 u 11 personas. Alquiler íntegro en los Valles Pasiegos, jardín privado y barbacoa. Reserva directa sin intermediarios."
        canonical="https://www.casarurallarasilla.com/casa-rural-cantabria-grupos"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-24 overflow-hidden">
        <img
          src="/images/casa2.jpg"
          alt="Casa rural para grupos en Cantabria, Valles Pasiegos"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Cantabria · Valles Pasiegos</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Casa Rural en Cantabria para Grupos
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10">
            La Rasilla: alquiler íntegro para hasta 11 personas en los Valles Pasiegos. El espacio que necesita tu grupo para desconectar de verdad.
          </p>
          <Link to="/reservar" className="inline-block rounded-full bg-emerald-600 px-10 py-4 text-base font-bold text-white hover:bg-emerald-700 transition-all">
            Consultar disponibilidad
          </Link>
        </div>
      </section>

      {/* Intro */}
      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6">La mejor casa rural grande en Cantabria</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Encontrar una <strong>casa rural en Cantabria para grupos grandes</strong> que realmente cumpla con todo no es fácil. La mayoría de los alojamientos rurales tienen capacidad para 6 u 8 personas como mucho, lo que obliga a los grupos a dividirse o a buscar opciones poco prácticas.
            </p>
            <p>
              En <strong>Casa Rural La Rasilla</strong> hemos resuelto ese problema. La casa tiene capacidad oficial para <strong>10 personas más una supletoria</strong>, lo que la convierte en una de las mejores opciones de <strong>casa rural de 10 personas en Cantabria</strong> o incluso para grupos de 11.
            </p>
            <p>
              El alquiler es siempre íntegro: cuando reservas La Rasilla, la casa entera es para vosotros. Sin otros huéspedes, sin habitaciones compartidas con extraños, sin horarios impuestos. Solo vuestro grupo disfrutando de un espacio que se siente como un hogar.
            </p>
            <p>
              Situada en <strong>Castillo Pedroso</strong>, un pequeño pueblo de los Valles Pasiegos en Corvera de Toranzo, la casa está a menos de una hora de Santander y a pocos kilómetros de las principales atracciones de Cantabria. Una ubicación que combina la tranquilidad del entorno rural con la comodidad de tenerlo todo cerca.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* Capacidad */}
      <SectionContainer bg="stone">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">¿Cuántas personas caben en La Rasilla?</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-stone-600 text-lg leading-relaxed">
              <p>
                La casa tiene <strong>5 habitaciones</strong> distribuidas en dos plantas, con capacidad para <strong>10 personas en camas fijas más una cama supletoria</strong>. Esto la convierte en una <strong>casa rural grande en Cantabria</strong> perfecta para grupos de amigos, familias numerosas o celebraciones especiales.
              </p>
              <p>
                Los espacios comunes son amplios: salón-comedor con chimenea, cocina completamente equipada y un porche exterior cubierto que se convierte en el centro de reunión del grupo. Todo está pensado para que 11 personas convivan cómodamente sin pisarse.
              </p>
              <ul className="space-y-3">
                {[
                  '5 habitaciones en dos plantas',
                  'Hasta 10 personas en camas fijas + 1 supletoria',
                  'Salón-comedor amplio con chimenea',
                  'Cocina completa para 11 comensales',
                  'Porche cubierto exterior',
                  'Jardín privado totalmente cerrado',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="/images/porche1.jpg"
              alt="Porche de casa rural para grupos en Cantabria"
              loading="lazy"
              className="rounded-3xl shadow-xl w-full object-cover"
            />
          </div>
        </div>
      </SectionContainer>

      {/* Ventajas frente a hotel */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">¿Por qué elegir una casa rural y no un hotel?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Home size={28} className="text-emerald-600" />,
                title: "Privacidad total",
                desc: "En un hotel compartís planta con desconocidos. En La Rasilla, la casa entera es vuestra. El jardín, la cocina, el salón... todo es de uso exclusivo para vuestro grupo."
              },
              {
                icon: <Utensils size={28} className="text-emerald-600" />,
                title: "Cocina propia",
                desc: "Con una cocina completamente equipada podéis preparar vuestros propios platos, desayunar cuando queráis y hacer barbacoas en el jardín sin depender de horarios de restaurante."
              },
              {
                icon: <Users size={28} className="text-emerald-600" />,
                title: "Precio por grupo, no por persona",
                desc: "El precio de La Rasilla es por la casa completa. Cuantos más seáis, más económico sale por persona. Para grupos de 8 a 11 personas, la relación calidad-precio es difícil de superar."
              },
              {
                icon: <Trees size={28} className="text-emerald-600" />,
                title: "Entorno incomparable",
                desc: "Los Valles Pasiegos ofrecen paisajes de postal, rutas de senderismo y una gastronomía auténtica. Un hotel en ciudad no puede competir con esto."
              },
              {
                icon: <Bath size={28} className="text-emerald-600" />,
                title: "Todo incluido",
                desc: "Ropa de cama, toallas, utensilios de cocina y limpieza incluidos. Solo tenéis que llegar y empezar a disfrutar, sin pensar en nada más."
              },
              {
                icon: <CheckCircle size={28} className="text-emerald-600" />,
                title: "Trato directo",
                desc: "Reservar directamente con los propietarios significa mejor precio, comunicación fluida y atención personalizada antes y durante vuestra estancia."
              },
            ].map((item, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-stone-800 text-lg mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Uso para grupos */}
      <SectionContainer bg="stone">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6 text-center">¿Para qué tipo de grupos es ideal La Rasilla?</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              La casa está pensada para grupos que quieren compartir una experiencia de verdad. No habitaciones individuales en un pasillo, sino una casa completa donde vivir juntos durante unos días.
            </p>
            <p>
              <strong>Grupos de amigos</strong>: escapadas de fin de semana, cumpleaños, despedidas de soltero tranquilas, reencuentros... La Rasilla da para noches largas de charla junto a la chimenea y mañanas tranquilas desayunando en el porche.
            </p>
            <p>
              <strong>Familias numerosas o varias familias</strong>: cuando los niños necesitan espacio para moverse y los adultos quieren tranquilidad, el jardín privado cerrado de La Rasilla es un regalo. Los más pequeños pueden jugar con total seguridad mientras los mayores disfrutan.
            </p>
            <p>
              <strong>Celebraciones y eventos pequeños</strong>: aniversarios, reuniones familiares, fines de semana de trabajo... La casa tiene capacidad y comodidades suficientes para que cualquier celebración sea un éxito.
            </p>
            <p>
              Descubre también nuestra <Link to="/casa-rural-con-barbacoa-cantabria" className="text-emerald-700 hover:underline font-semibold">zona de barbacoa y jardín</Link> o infórmate sobre el <Link to="/casa-rural-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">entorno de los Valles Pasiegos</Link>.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* CTA */}
      <SectionContainer>
        <CTASection
          title="¿Listos para reservar vuestra escapada en grupo?"
          subtitle="Reserva directamente y obtén el mejor precio. Sin intermediarios, con atención personalizada desde el primer momento."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
