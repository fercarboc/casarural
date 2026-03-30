// src/public/pages/blog/BlogIndexPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { MetaTags } from '../../components/MetaTags'
import { SectionContainer } from '../../components/SectionContainer'
import { ArrowRight } from 'lucide-react'

const posts = [
  {
    slug: 'que-ver-valles-pasiegos',
    title: 'Qué ver en los Valles Pasiegos: guía de 2 días',
    description: 'Ruta completa por los Valles Pasiegos en 2 días: pueblos con encanto, gastronomía pasiego y los mejores miradores de Cantabria.',
    image: '/images/pueblo1.jpg',
    category: 'Destinos',
    date: 'Marzo 2026',
  },
  {
    slug: 'rutas-senderismo-cantabria',
    title: 'Mejores rutas de senderismo en Cantabria para grupos',
    description: 'Las rutas de senderismo más espectaculares de Cantabria accesibles desde los Valles Pasiegos: desde paseos familiares hasta ascensiones con vistas al mar.',
    image: '/images/pueblo2.jpg',
    category: 'Actividades',
    date: 'Marzo 2026',
  },
  {
    slug: 'casa-rural-grupos-cantabria-guia',
    title: 'Casa rural para grupos en Cantabria: guía completa',
    description: 'Todo lo que necesitas saber para organizar una escapada rural en grupo en Cantabria: qué buscar, cómo comparar alojamientos y por qué el alquiler íntegro es la mejor opción.',
    image: '/images/porche1.jpg',
    category: 'Guías',
    date: 'Febrero 2026',
  },
  {
    slug: 'que-hacer-cantabria-escapada-rural',
    title: 'Qué hacer en Cantabria en una escapada rural',
    description: 'De los Picos de Europa a las playas del Cantábrico, pasando por los Valles Pasiegos. La guía definitiva de actividades para una escapada rural en Cantabria.',
    image: '/images/porche2.jpg',
    category: 'Actividades',
    date: 'Febrero 2026',
  },
  {
    slug: 'parque-cabaraceno-guia',
    title: 'Parque de Cabárceno: guía completa para tu visita',
    description: 'Todo lo que necesitas saber para visitar el Parque de Cabárceno: horarios, precios, cómo llegar desde los Valles Pasiegos y qué ver.',
    image: '/images/casa2.jpg',
    category: 'Excursiones',
    date: 'Enero 2026',
  },
]

export const BlogIndexPage: React.FC = () => {
  return (
    <div className="bg-white">
      <MetaTags
        title="Blog | Casa Rural La Rasilla — Cantabria y Valles Pasiegos"
        description="Guías de viaje, rutas de senderismo, gastronomía y todo lo que necesitas saber para disfrutar de Cantabria y los Valles Pasiegos al máximo."
        canonical="https://www.casarurallarasilla.com/blog"
      />

      {/* Hero */}
      <section className="bg-stone-50 py-20 border-b border-stone-200">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-6">
            Cantabria y los Valles Pasiegos
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Guías de viaje, rutas, gastronomía y todo lo que necesitas para hacer de tu escapada rural algo memorable.
          </p>
        </div>
      </section>

      <SectionContainer>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/2] overflow-hidden bg-stone-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col flex-1 p-6 gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="text-stone-400">{post.date}</span>
                  </div>
                  <h2 className="font-serif font-bold text-stone-800 text-lg leading-snug group-hover:text-emerald-700 transition-colors">{post.title}</h2>
                  <p className="text-stone-500 text-sm leading-relaxed flex-1">{post.description}</p>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm mt-2 group-hover:gap-2 transition-all">
                    Leer más <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
