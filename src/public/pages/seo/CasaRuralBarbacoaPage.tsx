// src/public/pages/seo/CasaRuralBarbacoaPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { Flame, Users, Trees, CheckCircle, Star } from 'lucide-react'
import { CTASection } from '../../components/CTASection'
import { SectionContainer } from '../../components/SectionContainer'

export const CasaRuralBarbacoaPage: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Casa Rural La Rasilla — Barbacoa y Jardín",
    "description": "Casa rural con barbacoa en Cantabria para grupos. Jardín privado totalmente cerrado, zona de barbacoa exterior y alquiler íntegro en los Valles Pasiegos.",
    "url": "https://www.casarurallarasilla.com/casa-rural-con-barbacoa-cantabria",
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
        title="Casa Rural con Barbacoa en Cantabria | Jardín Privado | La Rasilla"
        description="Casa rural con barbacoa en Cantabria para grupos. Jardín privado totalmente cerrado, zona de barbacoa exterior y alquiler íntegro para hasta 11 personas en los Valles Pasiegos."
        canonical="https://www.casarurallarasilla.com/casa-rural-con-barbacoa-cantabria"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-24 overflow-hidden">
        <img
          src="/images/porche1.jpg"
          alt="Jardín y barbacoa de casa rural en Cantabria, Valles Pasiegos"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Cantabria · Valles Pasiegos</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Casa Rural con Barbacoa en Cantabria
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10">
            La Rasilla: jardín privado totalmente cerrado y zona de barbacoa para que tu grupo disfrute al aire libre en los Valles Pasiegos.
          </p>
          <Link to="/reservar" className="inline-block rounded-full bg-emerald-600 px-10 py-4 text-base font-bold text-white hover:bg-emerald-700 transition-all">
            Consultar disponibilidad
          </Link>
        </div>
      </section>

      {/* Intro */}
      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6">El jardín y la barbacoa: el corazón de La Rasilla</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Cuando buscas una <strong>casa rural con barbacoa en Cantabria</strong>, lo que realmente estás buscando es un espacio donde poder disfrutar con tu grupo sin restricciones. No una barbacoa de uso compartido con otros huéspedes, ni un jardín pequeño que apenas da para cuatro sillas. Algo de verdad.
            </p>
            <p>
              En <strong>Casa Rural La Rasilla</strong>, el jardín exterior es amplio, está <strong>totalmente cerrado</strong> y es de uso exclusivo para tu grupo durante toda la estancia. Nadie más entrará, nadie más usará la barbacoa. Es vuestro espacio, vuestras normas, vuestros tiempos.
            </p>
            <p>
              La zona de barbacoa está preparada para reuniones grandes. La Rasilla tiene capacidad para hasta <strong>11 personas</strong>, y el espacio exterior está pensado precisamente para que ese grupo pueda comer juntos, charlar con calma y disfrutar del entorno natural de los <strong>Valles Pasiegos</strong> sin prisas.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* Experiencia */}
      <SectionContainer bg="stone">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">La experiencia de comer al aire libre en Cantabria</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="/images/porche2.jpg"
              alt="Porche y jardín exterior de la casa rural con barbacoa en Cantabria"
              loading="lazy"
              className="rounded-3xl shadow-xl w-full object-cover"
            />
            <div className="space-y-5 text-stone-600 text-lg leading-relaxed">
              <p>
                Hay algo especial en encender la barbacoa sin horarios, sin vecinos mirando y sin tener que reservar turno. En La Rasilla, los ratos en el jardín suelen ser los momentos que la gente más recuerda de su estancia.
              </p>
              <p>
                El porche cubierto exterior conecta la casa con el jardín y funciona como zona de transición perfecta: protege del sol en verano y de la lluvia en los días más frescos del norte, pero sin perderse la vista ni el aire fresco de los Pasiegos.
              </p>
              <ul className="space-y-3">
                {[
                  'Jardín privado totalmente cerrado',
                  'Zona de barbacoa para grupos grandes',
                  'Porche cubierto exterior amplio',
                  'Exclusivo para los huéspedes de la casa',
                  'Sin horarios ni restricciones',
                  'Vistas al entorno natural de los Valles Pasiegos',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Para quién */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">¿Para quién es ideal esta casa rural con jardín?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users size={28} className="text-emerald-600" />,
                title: "Grupos de amigos",
                desc: "La combinación de barbacoa, jardín privado y casa completa es perfecta para escapadas en grupo donde la comida y la sobremesa larga son el plan del día. Hasta 11 personas, sin dividirse."
              },
              {
                icon: <Trees size={28} className="text-emerald-600" />,
                title: "Familias con niños",
                desc: "El jardín totalmente cerrado es un plus enorme cuando hay niños pequeños. Pueden correr y jugar con total seguridad mientras los adultos disfrutan tranquilamente de la barbacoa."
              },
              {
                icon: <Flame size={28} className="text-emerald-600" />,
                title: "Celebraciones especiales",
                desc: "Cumpleaños, aniversarios, reuniones familiares... tener un jardín privado con barbacoa y una casa entera para vuestro grupo convierte cualquier celebración en algo memorable."
              },
              {
                icon: <Star size={28} className="text-emerald-600" />,
                title: "Amantes de la gastronomía",
                desc: "Los Valles Pasiegos tienen una gastronomía auténtica: sobaos, quesadas, cocidos montañeses. Combinad la barbacoa con productos locales del mercado de Ontaneda o de los pueblos cercanos."
              },
              {
                icon: <CheckCircle size={28} className="text-emerald-600" />,
                title: "Escapadas de descanso",
                desc: "No siempre hay que tener un plan lleno de actividades. A veces la mejor escapada es una barbacoa larga, el jardín, el silencio y el paisaje verde de Cantabria. La Rasilla es perfecta para eso."
              },
              {
                icon: <Trees size={28} className="text-emerald-600" />,
                title: "Senderistas y activos",
                desc: "Sal a recorrer las rutas de los Pasiegos por la mañana y vuelve a una barbacoa en el jardín por la tarde. El contraste entre la actividad al aire libre y el descanso en la casa es difícil de superar."
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

      {/* Contexto entorno */}
      <SectionContainer bg="stone">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6 text-center">Barbacoa rodeada de naturaleza en los Valles Pasiegos</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Una <strong>casa rural con barbacoa en Cantabria</strong> es mucho mejor cuando el entorno acompaña. En La Rasilla, el jardín da a un paisaje verde y tranquilo propio de los <strong>Valles Pasiegos</strong>: prados, montañas y el silencio característico de este rincón del norte de España.
            </p>
            <p>
              Castillo Pedroso, el pequeño pueblo donde se ubica la casa, está en el <strong>Valle de Toranzo</strong>, a menos de una hora de Santander y a unos 45 minutos del Parque de Cabárceno. Una posición estratégica que permite combinar el descanso en la casa con excursiones a los principales puntos de interés de Cantabria.
            </p>
            <p>
              La mañana perfecta en La Rasilla: despertar sin prisas, desayunar en el porche con vistas, salir a dar un paseo por los alrededores y volver para encender la barbacoa antes de que caiga el sol. Sin ruido, sin turistas, sin intermediarios.
            </p>
            <p>
              Descubre también nuestra opción ideal para grupos en la <Link to="/casa-rural-cantabria-grupos" className="text-emerald-700 hover:underline font-semibold">página de casa rural para grupos en Cantabria</Link> o infórmate sobre el <Link to="/casa-rural-valles-pasiegos" className="text-emerald-700 hover:underline font-semibold">entorno de los Valles Pasiegos</Link>.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* CTA */}
      <SectionContainer>
        <CTASection
          title="¿Listo para disfrutar del jardín y la barbacoa?"
          subtitle="Alquiler íntegro para tu grupo. Reserva directamente con los propietarios y obtén el mejor precio sin intermediarios."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
