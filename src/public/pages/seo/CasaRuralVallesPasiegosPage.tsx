// src/public/pages/seo/CasaRuralVallesPasiegosPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { Trees, MapPin, CheckCircle, Mountain } from 'lucide-react'
import { CTASection } from '../../components/CTASection'
import { SectionContainer } from '../../components/SectionContainer'

export const CasaRuralVallesPasiegosPage: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Casa Rural La Rasilla — Valles Pasiegos",
    "description": "Casa rural en los Valles Pasiegos, Cantabria. Alojamiento rural íntegro para grupos de hasta 11 personas en el corazón de los Pasiegos.",
    "url": "https://www.casarurallarasilla.com/casa-rural-valles-pasiegos",
    "image": "https://www.casarurallarasilla.com/images/pueblo1.jpg",
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
        title="Casa Rural Valles Pasiegos Cantabria | La Rasilla | Alquiler Íntegro"
        description="Casa rural en los Valles Pasiegos (Cantabria) para grupos de hasta 11 personas. Alquiler íntegro en Castillo Pedroso, Valle de Toranzo. Naturaleza, senderismo y gastronomía pasiego."
        canonical="https://www.casarurallarasilla.com/casa-rural-valles-pasiegos"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative bg-stone-900 text-white py-24 overflow-hidden">
        <img
          src="/images/pueblo1.jpg"
          alt="Paisaje de los Valles Pasiegos en Cantabria con casa rural La Rasilla"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Cantabria · Valles Pasiegos</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Casa Rural en los Valles Pasiegos
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10">
            La Rasilla: alojamiento rural íntegro en el corazón de los Pasiegos. Naturaleza, tradición y el silencio del norte de España para tu grupo.
          </p>
          <Link to="/reservar" className="inline-block rounded-full bg-emerald-600 px-10 py-4 text-base font-bold text-white hover:bg-emerald-700 transition-all">
            Consultar disponibilidad
          </Link>
        </div>
      </section>

      {/* Qué son los Valles Pasiegos */}
      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6">¿Qué son los Valles Pasiegos?</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Los <strong>Valles Pasiegos</strong> son una comarca natural del interior de Cantabria formada por varios valles de montaña: el Valle de Toranzo, el Valle del Pas, el Valle de Carriedo y el Valle de Pisueña. Un territorio de prados verdes, nieblas bajas, caserías de piedra y ríos que bajan de los Picos de Europa hacia el mar Cantábrico.
            </p>
            <p>
              La cultura pasiego es única en España. Los pasiegos eran tradicionalmente ganaderos trashumantes que subían y bajaban con sus rebaños según la estación, habitando las famosas <em>cabañas pasiegas</em> dispersas por las laderas. De ese modo de vida surgió una gastronomía excepcional: los sobaos, las quesadas, la mantequilla de Cantabria, los cocidos montañeses.
            </p>
            <p>
              Hoy los Valles Pasiegos son uno de los destinos de turismo rural más auténticos del norte de España, con una red de rutas de senderismo espectacular, pueblos con encanto y una naturaleza que se mantiene prácticamente virgen.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* Ubicación de La Rasilla */}
      <SectionContainer bg="stone">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">La Rasilla: en el corazón del Valle de Toranzo</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-stone-600 text-lg leading-relaxed">
              <p>
                <strong>Casa Rural La Rasilla</strong> está situada en <strong>Castillo Pedroso</strong>, un pequeño pueblo del municipio de Corvera de Toranzo, en pleno <strong>Valle de Toranzo</strong>. Un enclave donde el tiempo parece ir más despacio y donde la naturaleza está a dos pasos de la puerta.
              </p>
              <p>
                La ubicación es estratégica para explorar los Valles Pasiegos: estás en el centro de la comarca, con acceso fácil a los principales puntos de interés de Cantabria y a menos de una hora de la capital.
              </p>
              <ul className="space-y-3">
                {[
                  'A 45 minutos de Santander',
                  'A 45 minutos del Parque de Cabárceno',
                  'A 1 hora de las playas del Cantábrico',
                  'A 1 hora de los Picos de Europa',
                  'Acceso directo a rutas de senderismo',
                  'Pueblo tranquilo, sin tráfico ni ruido',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <MapPin size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="/images/pueblo2.jpg"
              alt="Vistas desde Castillo Pedroso, Valle de Toranzo, Valles Pasiegos Cantabria"
              loading="lazy"
              className="rounded-3xl shadow-xl w-full object-cover"
            />
          </div>
        </div>
      </SectionContainer>

      {/* Qué hacer */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">Qué hacer en los Valles Pasiegos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Mountain size={28} className="text-emerald-600" />,
                title: "Senderismo",
                desc: "Los Valles Pasiegos tienen una red de rutas de senderismo señalizadas para todos los niveles. Desde paseos tranquilos por el valle hasta ascensiones con vistas panorámicas de Cantabria."
              },
              {
                icon: <Trees size={28} className="text-emerald-600" />,
                title: "Naturaleza y paisaje",
                desc: "Los prados verdes, los bosques de castaños y robles, los ríos que bajan cristalinos hacia el mar. El paisaje pasiego es de una belleza tranquila y auténtica, muy diferente al de la costa."
              },
              {
                icon: <MapPin size={28} className="text-emerald-600" />,
                title: "Parque de Cabárceno",
                desc: "A 45 minutos de La Rasilla, el Parque de Cabárceno es uno de los mejores parques de naturaleza de Europa. Imprescindible si viajas con familia o con grupos que quieran una excursión diferente."
              },
              {
                icon: <CheckCircle size={28} className="text-emerald-600" />,
                title: "Gastronomía pasiego",
                desc: "Sobaos pasiegos, quesadas, mantequilla de Cantabria, cocido montañés, rabas en el puerto... La gastronomía cántabra es uno de los grandes atractivos de la región."
              },
              {
                icon: <Mountain size={28} className="text-emerald-600" />,
                title: "Playas del Cantábrico",
                desc: "A menos de una hora tienes algunas de las playas más bonitas del norte de España: El Sardinero, Comillas, Somo, Noja. Perfectas para combinar interior y costa en una misma escapada."
              },
              {
                icon: <Trees size={28} className="text-emerald-600" />,
                title: "Pueblos con encanto",
                desc: "Puente Viesgo, Ontaneda, Alceda, Vega de Pas... pequeños pueblos con mercados locales, casas de piedra y una atmósfera que no se encuentra en ningún otro sitio."
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

      {/* La Rasilla como base */}
      <SectionContainer bg="stone">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6 text-center">La Rasilla: la mejor base para explorar los Pasiegos</h2>
          <div className="space-y-5 text-lg text-stone-600 leading-relaxed">
            <p>
              Si buscas una <strong>casa rural en los Valles Pasiegos</strong> que sea cómoda, amplia y con todo lo necesario para tu grupo, La Rasilla es difícil de superar. La casa tiene <strong>5 habitaciones y capacidad para 11 personas</strong>, se alquila de forma íntegra y está a pocos minutos de los principales puntos de acceso a la comarca.
            </p>
            <p>
              La cocina completamente equipada te permite preparar los productos frescos que encuentras en los mercados locales. El jardín privado y la barbacoa son el escenario ideal para las cenas de grupo después de un día de excursiones. Y la chimenea del salón convierte las noches de lluvia (que en Cantabria son parte de la experiencia) en algo acogedor.
            </p>
            <p>
              No hace falta ir a un hotel cuando tienes una <strong>casa rural en los Valles Pasiegos</strong> que combina la comodidad de un alojamiento moderno con la autenticidad del entorno rural cántabro.
            </p>
            <p>
              Descubre también nuestra <Link to="/casa-rural-cantabria-grupos" className="text-emerald-700 hover:underline font-semibold">casa rural para grupos en Cantabria</Link> o la <Link to="/casa-rural-con-barbacoa-cantabria" className="text-emerald-700 hover:underline font-semibold">zona de barbacoa y jardín privado</Link>.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* CTA */}
      <SectionContainer>
        <CTASection
          title="¿Listo para descubrir los Valles Pasiegos?"
          subtitle="Reserva La Rasilla directamente con los propietarios. El mejor precio garantizado para tu grupo en los Valles Pasiegos."
          buttonText="Ver disponibilidad y reservar"
          to="/reservar"
        />
      </SectionContainer>
    </div>
  )
}
