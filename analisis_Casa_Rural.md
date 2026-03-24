# Análisis Completo del Proyecto — Casa Rural La Rasilla

> **Fecha del análisis:** Marzo 2026
> **Proyecto:** Plataforma web de reservas y gestión para Casa Rural La Rasilla
> **Ubicación:** Castillo Pedroso, 39699 — Corvera de Toranzo, Cantabria
> **Capacidad:** Hasta 11 personas · Alquiler íntegro

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Parte Pública — Web de Clientes](#4-parte-pública--web-de-clientes)
5. [Panel de Administración](#5-panel-de-administración)
6. [Servicios (Capa de Datos)](#6-servicios-capa-de-datos)
7. [Backend — Edge Functions (Supabase/Deno)](#7-backend--edge-functions-supabasedeno)
8. [Base de Datos — Tablas](#8-base-de-datos--tablas)
9. [Lógica de Precios y Tarifas](#9-lógica-de-precios-y-tarifas)
10. [Autenticación y Modo Mock](#10-autenticación-y-modo-mock)
11. [Rutas y Navegación](#11-rutas-y-navegación)
12. [SEO y Metadatos](#12-seo-y-metadatos)
13. [Integraciones Externas](#13-integraciones-externas)
14. [Pendientes y Próximos Pasos](#14-pendientes-y-próximos-pasos)

---

## 1. Visión General

Casa Rural La Rasilla es una aplicación web full-stack diseñada para gestionar y comercializar el alquiler íntegro de una casa rural en los Valles Pasiegos de Cantabria. El sistema tiene dos partes bien diferenciadas:

- **Web pública**: orientada al huésped, con información de la casa, galería, motor de reservas y pasarela de pago.
- **Panel de administración**: orientado al propietario, con gestión de reservas, calendario, clientes, ingresos, facturas y sincronización con OTAs (Booking.com, Airbnb, etc.).

El proyecto está diseñado para funcionar **sin intermediarios**: los clientes reservan y pagan directamente en la web, garantizando el mejor precio.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.x |
| Lenguaje | TypeScript | 5.8 |
| Build | Vite | 6.x |
| Estilos | Tailwind CSS | 4.x |
| Enrutado | React Router | 7.x |
| Animaciones | Motion (Framer) | 12.x |
| Iconos | Lucide React | 0.546 |
| Fechas | date-fns | 4.x |
| Base de datos | Supabase (PostgreSQL) | — |
| Edge Functions | Deno (TypeScript) | — |
| Pagos | Stripe Checkout | API 2024-06-20 |
| Emails | Resend API | — |
| Hosting web | Vercel | — |
| Repositorio | GitHub (fercarboc/casarural) | — |

---

## 3. Estructura del Proyecto

```
c:\casarural\
├── public/
│   └── images/                  ← 33 fotos reales de la casa
├── src/
│   ├── App.tsx                  ← Router principal (rutas públicas + admin)
│   ├── main.tsx                 ← Punto de entrada React
│   ├── public/
│   │   ├── pages/               ← 8 páginas web públicas
│   │   └── components/          ← 13 componentes reutilizables
│   ├── admin/
│   │   ├── pages/               ← 10 páginas del panel admin
│   │   ├── components/          ← 2 componentes admin
│   │   └── context/             ← AuthContext (autenticación)
│   ├── services/                ← 9 servicios reales + 8 mocks
│   └── shared/                  ← Tipos TypeScript compartidos
├── supabase/
│   └── functions/               ← 9 Edge Functions en Deno
├── .env                         ← Variables de entorno (no versionado)
├── .env.example                 ← Plantilla de variables
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 4. Parte Pública — Web de Clientes

### 4.1 Páginas

#### `HomePage.tsx` — Página de Inicio
La portada del sitio. Muestra:
- **Hero**: foto de la casa a la izquierda, título + subtítulo + CTA a la derecha.
- **Bloque de beneficios**: alquiler íntegro, hasta 11 personas, entorno natural, garantía directa, con fotos del porche y el pueblo.
- **Bloque SEO**: texto optimizado con keywords (Valles Pasiegos, Cantabria, alquiler íntegro, Cuevas del Castillo, Bodegas Seldaiz, El Churrón de Borleña).
- **Estadísticas**: 11 plazas, 5 habitaciones, 100% alquiler íntegro, 8,4/10 en Booking.com.
- **Testimonios reales verificados**: 4 opiniones (Merediz 10/10 y Carmelo 9/10 de Booking.com; Álvaro Villanueva 5/5 y Sicadadia 5/5 de EscapadaRural).

#### `LaCasaPage.tsx` — La Casa
Descripción detallada de la propiedad:
- Texto SEO sobre la arquitectura tradicional pasiega rehabilitada.
- Bloque derecho: 6 fotos en grid 2×3 (2 del porche + 4 habitaciones).
- Lista de características: alquiler íntegro, 5 habitaciones dobles, jardín vallado, parking.
- Fila de 3 fotos: cocina, salón, baño.
- Grid de 4 features: capacidad, alquiler íntegro, jardín, ideal para grupos.
- Bloque oscuro de distribución: dormitorios, baños, salón principal, cocina.

#### `GaleriaPage.tsx` — Galería
Galería con **21 fotos reales** organizadas en secciones:
- Exteriores (casa2.jpg, casa3.jpg, casa4.jpg, cassa.jpg, casanieve2.jpg)
- Porche y jardín (porche.jpg, porche1.jpg, porche2.jpg, entradaporche.jpg)
- Interior (salon1.jpg, salon2.jpg, cocina.jpg, escalera.jpg)
- Habitaciones (habitacion1.jpg – habitacion5.jpg)
- Baños (aseo1.jpg, aseo2.jpg)
- Entorno (pueblo1.jpg, pueblo2.jpg, pueblo3.jpg)

#### `ServiciosPage.tsx` — Servicios
Lista de servicios ofrecidos:
- **Desconexión total**: sin WiFi, sin ruido (enfocado en desconectar de verdad).
- Parking privado gratuito.
- Barbacoa y zona exterior.
- Cocina completamente equipada para 11 personas.
- Smart TV y juegos de mesa.
- Jardín privado vallado (seguro para niños).
- Limpieza profesional, información turística personalizada.
- Estancia mínima, capacidad máxima, normas de uso.

#### `DondeEstamosPage.tsx` — Dónde Estamos
- Descripción de la ubicación: Castillo Pedroso, 39699, Corvera de Toranzo, Valle de Toranzo.
- Mapa Google Maps incrustado con coordenadas exactas: **43.214925, -3.970798**.
- Sección "Qué hacer cerca":
  - 🦣 Cuevas del Castillo — 10 min (Patrimonio de la Humanidad)
  - 🍷 Bodegas Seldaiz — 1 km
  - 💧 El Churrón de Borleña — cascada
  - 🏊 Balneario Puente Viesgo — 10 min
  - 🥾 Rutas de montaña por el Valle de Toranzo
  - 🐄 Gastronomía pasiega (sobaos, quesadas, cocido montañés)
- Cómo llegar: coche (A-67, 40 min Santander), avión (SDR 35 min), tren.

#### `BookingPage.tsx` — Reservar
Motor de reservas completo. Layout en dos columnas:

**Columna izquierda (col-span-7):**
- Trust badges: Mejor precio · Confirmación inmediata · Pago 100% seguro.
- Formulario: fecha entrada (read-only, clic abre calendario), fecha salida, número de huéspedes (1-11).
- Aviso de estancia mínima según temporada.
- Botón "Consultar Disponibilidad".
- Tras consultar y si hay disponibilidad: dos tarjetas de tarifa lado a lado con desglose completo de precio + botón "Confirmar y Pagar X€".

**Columna derecha (col-span-5, sticky):**
- Aviso estancia mínima.
- Calendario interactivo de disponibilidad con días bloqueados en gris.

**Lógica de estancia mínima:**
- Julio/Agosto → 3 noches (Temporada alta)
- Diciembre/Enero → 3 noches (Navidades)
- Resto → 2 noches (Temporada general)

#### `ContactoPage.tsx` — Contacto
- Teléfono/WhatsApp, email (info@casarurallarasilla.com), horario (9:00-21:00).
- Formulario de contacto: nombre, email, asunto, mensaje.
- Badge de reserva directa con mejor precio garantizado.

#### Páginas Legales (`LegalPages.tsx`)
Seis páginas legales:
- Aviso Legal
- Política de Privacidad
- Política de Cookies
- RGPD
- Condiciones de Reserva
- Política de Cancelaciones

---

### 4.2 Componentes Públicos

| Componente | Función |
|-----------|---------|
| `HeroSection` | Banner de cabecera con imagen de fondo, título y subtítulo |
| `SectionContainer` | Contenedor de sección con padding y fondo configurable (white/stone/emerald) |
| `FeatureGrid` | Grid de tarjetas de características con icono, título y descripción |
| `CTASection` | Sección de llamada a la acción con botón de reserva |
| `BookingSearchForm` | Formulario de búsqueda (fechas + huéspedes) con hint "↓ Elige en el calendario" |
| `AvailabilityCalendar` | Calendario interactivo con selección de rango, días ocupados y navegación mensual |
| `Footer` | Pie de página con datos de contacto, Castillo Pedroso 39699, email |
| `MetaTags` | Inyección de title, meta description, canonical y schema JSON-LD (VacationRental) |

---

## 5. Panel de Administración

Acceso protegido por login. Sidebar lateral con navegación completa.

### 5.1 Páginas Admin

#### `LoginPage.tsx`
- Formulario email/contraseña para acceso al panel.
- En modo mock: credenciales `admin@larasilla.com` / `admin123`.

#### `DashboardPage.tsx`
Resumen visual de actividad:
- **4 tarjetas estadísticas**: Reservas del mes, Ingresos estimados, Pendientes de pago, Cancelaciones.
- **Tabla próximos check-ins**: nombre, fecha, huéspedes, estado (Confirmada/Pendiente).
- **Feed de actividad reciente**: nuevas reservas, pagos pendientes, check-outs del día.

#### `CalendarPage.tsx`
- Vista de calendario mensual con reservas como eventos de color.
- Colores por estado: verde (confirmada), amarillo (pendiente), rojo (cancelada).
- Click en día para ver detalle de reserva.

#### `ReservationsPage.tsx`
- Tabla completa de reservas con búsqueda y filtros por estado.
- Filtros: TODAS / CONFIRMADAS / PENDIENTES / CANCELADAS.
- Acciones: ver detalle, editar, cancelar.
- Botón de exportación.

#### `ReservationDetailPage.tsx`
- Vista completa de una reserva: datos del huésped, fechas, huéspedes, tarifa, desglose de precio, estado de pago.
- Historial de auditoría de cambios.
- Botón de cancelación con política de reembolso aplicada automáticamente.

#### `CustomersPage.tsx`
- Base de datos de huéspedes: nombre, email, número de estancias, gasto total, fecha de primera reserva.
- Búsqueda por nombre/email.
- Exportación de datos.

#### `IncomePage.tsx`
- Analítica financiera: ingresos mensuales, proyección anual, desglose entre señales y pagos completos.
- Gráfico mensual de ingresos.
- Filtro por rango de fechas.

#### `InvoicesPage.tsx`
- Gestión de facturas: listado, búsqueda, filtro por estado (PENDIENTE/ENVIADA/PAGADA).
- Acciones: enviar por email, descargar PDF, crear nueva.

#### `ConfigPage.tsx`
Panel de configuración del sistema:
- **Precios**: precio noche base/alta, tarifa limpieza, suplemento huésped extra.
- **Temporadas**: configurar fechas de temporada alta.
- **Política de cancelación**: porcentajes por días de antelación.
- **Email**: configurar remitente y plantillas.

#### `ICalPage.tsx`
- Gestión de feeds iCal externos (Booking.com, Airbnb, Vrbo, EscapadaRural).
- Añadir/eliminar feeds.
- Sincronización manual con timestamp de última sync.
- URL del feed propio de La Rasilla para exportar a OTAs.

---

### 5.2 Componentes Admin

| Componente | Función |
|-----------|---------|
| `AdminLayout` | Wrapper del panel con sidebar, menú móvil, botón logout |
| `ProtectedRoute` | Guard de ruta que redirige a login si no hay sesión activa |

---

## 6. Servicios (Capa de Datos)

Capa intermedia entre el frontend y Supabase/Edge Functions. Cada servicio tiene su versión real (conectada a Supabase) y su versión mock (datos estáticos para desarrollo).

| Servicio | Archivo | Funciones principales |
|---------|---------|----------------------|
| **Booking** | `booking.service.ts` | `getReservations`, `getReservationById`, `createReservation`, `calculatePrice`, `createCheckoutSession`, `updateReservation`, `deleteReservation` |
| **Calendar** | `calendar.service.ts` | `getOccupiedDates` (combina reservas confirmadas + bloqueos), `expandDateRange` |
| **Dashboard** | `dashboard.service.ts` | `getStats` (reservas mes, ingresos, pendientes, cancelaciones, próximos check-ins) |
| **Customer** | `customer.service.ts` | `getCustomers`, `getCustomerDetail`, `updateCustomer`, `exportList` |
| **Invoice** | `invoice.service.ts` | `getInvoices`, `generateInvoice`, `sendInvoice`, `exportPDF` |
| **Income** | `income.service.ts` | `getIncomeData` (totales mensuales, proyección anual, breakdown depósitos vs pagos completos) |
| **iCal** | `ical.service.ts` | `getFeeds`, `syncFeeds`, `addFeed`, `deleteFeed` |
| **Config** | `config.service.ts` | `getConfig`, `saveConfig` (precios, temporadas, email) |

---

## 7. Backend — Edge Functions (Supabase/Deno)

Todas desplegadas en el proyecto Supabase `kbdhzhixjztfvpibnmuf` (región eu-west-1).

URL base: `https://kbdhzhixjztfvpibnmuf.supabase.co/functions/v1/`

---

### `check-availability`
**Método:** POST | **JWT:** No requerido

Dos modos de operación:

**Modo calendario** (`{ start, end }`):
- Consulta `reservas` (estado CONFIRMED o PENDING_PAYMENT) y `bloqueos` del periodo.
- Devuelve array de fechas bloqueadas para pintar el calendario.

**Modo verificación** (`{ checkIn, checkOut }`):
- Comprueba si existe algún conflicto en el rango exacto.
- Devuelve `{ available: boolean, conflicts: string[] }`.

---

### `calculate-price`
**Método:** POST | **JWT:** No requerido
**Input:** `{ checkIn, checkOut, guests, rateType }`

Flujo:
1. Calcula número de noches.
2. Consulta `configuracion` para obtener tarifas y porcentajes.
3. Consulta `temporadas` para detectar si la fecha cae en temporada alta.
4. Calcula: alojamiento + suplemento huéspedes extra + limpieza − descuento no reembolsable.
5. Para tarifa FLEXIBLE: calcula señal (30% del total por defecto).

**Output:**
```json
{
  "nights": 3,
  "season_type": "BASE",
  "rate_type": "FLEXIBLE",
  "precio_noche": 275,
  "importe_alojamiento": 825,
  "importe_extra": 0,
  "limpieza": 50,
  "descuento": 0,
  "total": 875,
  "importe_senal": 262.50
}
```

---

### `create-pre-reservation`
**Método:** POST | **JWT:** No requerido
**Input:** `{ checkIn, checkOut, guests, rateType, guestData: { nombre, apellidos, email, telefono } }`

Flujo:
1. Llama internamente a `check-availability` → si no disponible, devuelve 409.
2. Llama internamente a `calculate-price` → obtiene desglose.
3. Inserta en tabla `reservas` con estado `PENDING_PAYMENT`, `expires_at` = ahora + 30 min.
4. Registra en `audit_log`.

**Output:** `{ reserva_id, codigo, price }`

---

### `create-stripe-checkout`
**Método:** POST | **JWT:** No requerido
**Input:** `{ reservaId }`

Flujo:
1. Recupera la reserva de la DB.
2. Verifica que el estado sea `PENDING_PAYMENT`.
3. Construye `line_items` de Stripe:
   - FLEXIBLE: un único ítem con la señal.
   - NO_REEMBOLSABLE: desglose completo (alojamiento + extra + limpieza).
4. Crea sesión Stripe con success_url/cancel_url y metadata `{ reserva_id, tarifa, es_senal }`.
5. Guarda `stripe_session_id` en la reserva.

**Output:** `{ checkout_url, session_id }`

---

### `stripe-webhook`
**Método:** POST | **JWT:** No requerido (usa firma propia de Stripe)

Valida firma con `STRIPE_WEBHOOK_SECRET`. Maneja dos eventos:

**`checkout.session.completed`:**
- Actualiza reserva a `CONFIRMED`, estado_pago a `PARTIAL` (señal) o `PAID` (completo).
- Registra pago en tabla `pagos`.
- Añade entrada en `audit_log`.
- Llama a `send-email` con template `reservation_confirmed` (fire & forget).

**`checkout.session.expired`:**
- Marca reserva como `EXPIRED` si estaba en `PENDING_PAYMENT`.

---

### `cancel-reservation`
**Método:** POST | **JWT:** No requerido
**Input:** `{ reservaId, cancelledBy: 'guest' | 'admin', reason? }`

Política de reembolso (solo tarifa FLEXIBLE):

| Días hasta llegada | Reembolso |
|-------------------|-----------|
| 60 o más | 100% |
| 45 – 59 | 50% |
| 30 – 44 | 25% |
| Menos de 30 | 0% |

Flujo:
1. Calcula porcentaje de reembolso según días restantes.
2. Actualiza reserva a `CANCELLED`.
3. Si procede reembolso: llama a `stripe.refunds.create`.
4. Registra pago negativo en `pagos`.
5. Envía email de cancelación.
6. Registra en `audit_log`.

---

### `send-email`
**Método:** POST | **JWT:** No requerido
**Input:** `{ template_key, to_email, to_name, reservation_id?, extra_vars? }`

Flujo:
1. Obtiene plantilla de `email_templates` por `key` y `activa = true`.
2. Si hay `reservation_id`, recupera datos de la reserva para variables.
3. Interpola variables `{{nombre_variable}}` en subject y body_html.
4. Obtiene email del remitente de `configuracion`.
5. Envía via Resend API.
6. Sin `RESEND_API_KEY`: omite el envío y devuelve `{ note: 'Email skipped' }`.

**Templates disponibles:**
- `reservation_confirmed` — Confirmación de reserva
- `reservation_cancelled` — Cancelación de reserva
- `booking_reminder` — Recordatorio pre-llegada

---

### `sync-ical-import`
**Método:** POST | **JWT:** No requerido
**Input:** `{ feedId? }` — sin feedId sincroniza todos

Flujo por cada feed activo en `feeds_ical`:
1. Descarga el archivo `.ics` de la URL (timeout 15s).
2. Parsea bloques `VEVENT`: extrae DTSTART, DTEND, SUMMARY.
3. Elimina bloqueos previos del feed (`origen = 'ICAL_IMPORT'`).
4. Inserta nuevos bloqueos en tabla `bloqueos`.
5. Actualiza `ultima_sync` y registra en `logs_ical`.

Compatible con formato iCal de Booking.com, Airbnb, Vrbo y EscapadaRural.

---

### `generate-ical-export`
**Método:** GET | **JWT:** No requerido
**Output:** `text/calendar` — archivo `.ics`

Genera el calendario de ocupación propio de La Rasilla:
- Incluye reservas `CONFIRMED` con fecha de salida futura.
- Incluye bloqueos `ADMIN` con fecha fin futura.
- UIDs únicos: `reserva-{id}@casarurallarasilla.com` / `bloqueo-{id}@...`

Esta URL se proporciona a las OTAs para sincronizar disponibilidad hacia fuera.

---

## 8. Base de Datos — Tablas

### `reservas` — Reservas
Tabla principal del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `codigo` | TEXT | Código legible (ej: RES-0001) |
| `nombre` | TEXT | Nombre del huésped |
| `apellidos` | TEXT | Apellidos |
| `email` | TEXT | Email de contacto |
| `telefono` | TEXT | Teléfono |
| `dni` | TEXT | Documento de identidad |
| `fecha_entrada` | DATE | Check-in |
| `fecha_salida` | DATE | Check-out |
| `num_huespedes` | INT | Número de huéspedes (1-11) |
| `estado` | ENUM | PENDING_PAYMENT / CONFIRMED / CANCELLED / EXPIRED |
| `estado_pago` | ENUM | UNPAID / PARTIAL / PAID / REFUNDED |
| `temporada` | ENUM | ALTA / BASE |
| `tarifa` | ENUM | FLEXIBLE / NO_REEMBOLSABLE |
| `precio_noche` | DECIMAL | Precio por noche aplicado |
| `noches` | INT | Número de noches |
| `importe_alojamiento` | DECIMAL | Precio noche × noches |
| `importe_extra` | DECIMAL | Suplemento huéspedes extra |
| `importe_limpieza` | DECIMAL | Tarifa de limpieza |
| `descuento` | DECIMAL | Descuento no reembolsable |
| `total` | DECIMAL | Total de la reserva |
| `importe_senal` | DECIMAL | Señal (solo tarifa flexible) |
| `importe_pagado` | DECIMAL | Importe efectivamente cobrado |
| `origen` | ENUM | DIRECT_WEB / BOOKING / AIRBNB / VRBO |
| `stripe_session_id` | TEXT | ID sesión Stripe Checkout |
| `stripe_payment_intent` | TEXT | ID Payment Intent de Stripe |
| `expires_at` | TIMESTAMP | Expiración pre-reserva (30 min) |
| `notas_admin` | TEXT | Notas internas del propietario |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última modificación |

---

### `bloqueos` — Bloqueos de Disponibilidad
Fechas no disponibles independientemente de reservas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `fecha_inicio` | DATE | Inicio del bloqueo |
| `fecha_fin` | DATE | Fin del bloqueo |
| `motivo` | TEXT | Motivo (Mantenimiento, etc.) |
| `origen` | ENUM | ADMIN / ICAL_IMPORT |
| `feed_id` | UUID | Referencia al feed iCal de origen |
| `created_at` | TIMESTAMP | Fecha de creación |

---

### `pagos` — Pagos
Registro de todos los movimientos de dinero.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `reserva_id` | UUID | FK → reservas |
| `concepto` | ENUM | SENAL / TOTAL / REEMBOLSO |
| `importe` | DECIMAL | Cantidad (negativa en reembolsos) |
| `estado` | ENUM | COMPLETADO / PENDIENTE / FALLIDO |
| `stripe_payment_intent` | TEXT | Referencia Stripe |
| `fecha_pago` | TIMESTAMP | Fecha del pago |

---

### `configuracion` — Configuración Global
Una única fila con toda la configuración del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `precio_noche_base` | DECIMAL | Precio noche temporada base (275€) |
| `precio_noche_alta` | DECIMAL | Precio noche temporada alta (300€) |
| `extra_huesped_base` | DECIMAL | Suplemento/noche/huésped extra base (27,50€) |
| `extra_huesped_alta` | DECIMAL | Suplemento/noche/huésped extra alta (30€) |
| `limpieza` | DECIMAL | Tarifa fija de limpieza (50€) |
| `capacidad_base` | INT | Huéspedes incluidos sin suplemento (10) |
| `descuento_no_reembolsable` | INT | % descuento tarifa no reembolsable (10%) |
| `porcentaje_senal` | INT | % del total como señal en tarifa flexible (30%) |
| `email` | TEXT | Email del propietario |

---

### `temporadas` — Temporadas de Precio
Define los periodos de temporada alta/media/baja.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `tipo` | ENUM | ALTA / MEDIA / BAJA |
| `fecha_inicio` | DATE | Inicio del periodo |
| `fecha_fin` | DATE | Fin del periodo |
| `activa` | BOOLEAN | Si está activa en el cálculo |

---

### `feeds_ical` — Feeds iCal Externos
Conexiones con plataformas OTA.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `url` | TEXT | URL del feed iCal |
| `plataforma` | TEXT | Booking.com / Airbnb / Vrbo / EscapadaRural |
| `activo` | BOOLEAN | Si se sincroniza |
| `ultima_sync` | TIMESTAMP | Fecha última sincronización |
| `error_ultimo` | TEXT | Último error registrado |

---

### `logs_ical` — Logs de Sincronización iCal

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `feed_id` | UUID | FK → feeds_ical |
| `resultado` | ENUM | OK / ERROR |
| `bloqueos_importados` | INT | Nº bloqueos importados |
| `mensaje` | TEXT | Mensaje de error si aplica |
| `created_at` | TIMESTAMP | Fecha del log |

---

### `email_templates` — Plantillas de Email

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `key` | TEXT | Clave única (reservation_confirmed, etc.) |
| `subject` | TEXT | Asunto con variables `{{variable}}` |
| `body_html` | TEXT | Cuerpo HTML con variables |
| `activa` | BOOLEAN | Si está activa |

**Variables disponibles en plantillas:**
`{{guest_name}}`, `{{check_in}}`, `{{check_out}}`, `{{total_amount}}`, `{{codigo}}`, `{{nights}}`, `{{guests}}`, `{{rate_type}}`, `{{refund_amount}}`

---

### `audit_log` — Auditoría

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `entity_type` | TEXT | Tipo de entidad (reserva, etc.) |
| `entity_id` | UUID | ID de la entidad modificada |
| `action` | TEXT | CREATED / PAYMENT_CONFIRMED / CANCELLED / etc. |
| `old_values` | JSONB | Estado anterior |
| `new_values` | JSONB | Estado nuevo |
| `performed_by` | TEXT | Quién realizó la acción |
| `created_at` | TIMESTAMP | Fecha del evento |

---

## 9. Lógica de Precios y Tarifas

### Fórmula de cálculo

```
Alojamiento = precio_noche × noches
Extra       = MAX(0, huéspedes - 10) × extra_huesped × noches
Limpieza    = 50€ (fijo)
Descuento   = (Alojamiento + Extra) × 10%  [solo NO_REEMBOLSABLE]

Total = Alojamiento + Extra + Limpieza - Descuento
Señal = Total × 30%  [solo FLEXIBLE]
```

### Tarifa FLEXIBLE
- Se paga la señal (30%) al reservar.
- El resto se abona 30 días antes de la llegada.
- Sujeta a política de cancelación con reembolso escalonado.

### Tarifa NO REEMBOLSABLE
- 10% de descuento sobre el total.
- Pago íntegro en el momento de reservar.
- Sin reembolso en caso de cancelación.

### Estancia mínima
- **Temporada alta** (Julio/Agosto): 3 noches
- **Navidades** (Diciembre/Enero): 3 noches
- **Resto del año**: 2 noches

### Política de cancelación (FLEXIBLE únicamente)
| Días antes de llegada | Reembolso |
|----------------------|-----------|
| 60 o más | 100% |
| 45 – 59 | 50% |
| 30 – 44 | 25% |
| Menos de 30 | 0% |

---

## 10. Autenticación y Modo Mock

### Modo Mock (Desarrollo)
Cuando no existe el archivo `.env` con credenciales de Supabase, la app entra en **modo mock**:
- Todos los servicios devuelven datos de prueba estáticos.
- La autenticación acepta `admin@larasilla.com` / `admin123`.
- El motor de reservas muestra flujo completo sin llamadas reales.

### Modo Producción
- **Provider**: Supabase Auth.
- **Admin**: login con email/contraseña en `/admin/login`.
- **Sesión**: almacenada en `AuthContext` (React Context API).
- **Guard**: `ProtectedRoute` verifica sesión activa antes de renderizar rutas admin.
- **Funciones backend**: usan `SUPABASE_SERVICE_ROLE_KEY` para acceso total a la DB.

---

## 11. Rutas y Navegación

### Rutas Públicas
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | HomePage | Página de inicio |
| `/la-casa` | LaCasaPage | Descripción de la casa |
| `/galeria` | GaleriaPage | Galería fotográfica |
| `/servicios` | ServiciosPage | Servicios y equipamiento |
| `/donde-estamos` | DondeEstamosPage | Localización y cómo llegar |
| `/contacto` | ContactoPage | Formulario de contacto |
| `/reservar` | BookingPage | Motor de reservas + pago |
| `/aviso-legal` | LegalPages | Aviso legal |
| `/politica-privacidad` | LegalPages | Política de privacidad |
| `/politica-cookies` | LegalPages | Política de cookies |
| `/rgpd` | LegalPages | RGPD |
| `/condiciones-reserva` | LegalPages | Condiciones de reserva |
| `/politica-cancelaciones` | LegalPages | Política de cancelaciones |

### Rutas Admin (Protegidas)
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin/login` | LoginPage | Acceso al panel |
| `/admin` | DashboardPage | Resumen de actividad |
| `/admin/calendario` | CalendarPage | Vista de calendario |
| `/admin/reservas` | ReservationsPage | Listado de reservas |
| `/admin/reservas/:id` | ReservationDetailPage | Detalle de reserva |
| `/admin/clientes` | CustomersPage | Base de datos de huéspedes |
| `/admin/ingresos` | IncomePage | Analítica financiera |
| `/admin/facturas` | InvoicesPage | Gestión de facturas |
| `/admin/ical` | ICalPage | Sincronización iCal |
| `/admin/configuracion` | ConfigPage | Configuración del sistema |

---

## 12. SEO y Metadatos

Cada página tiene su propio `<MetaTags>` con:
- `<title>` optimizado con keywords.
- `<meta name="description">` con texto descriptivo.
- **Schema JSON-LD** tipo `VacationRental` en la home con:
  - Nombre, descripción, dirección (Castillo Pedroso, Cantabria)
  - Número máximo de huéspedes: 11
  - Amenidades: Parking, Barbacoa, Jardín privado, Smart TV, Desconexión digital
  - Coordenadas GPS: 43.214925, -3.970798

**Keywords principales trabajadas:**
- Casa rural Cantabria alquiler íntegro
- Valles Pasiegos
- Valle de Toranzo
- Casa rural 11 personas Cantabria
- Turismo rural norte España
- Cuevas del Castillo Puente Viesgo
- Bodegas Seldaiz

---

## 13. Integraciones Externas

| Servicio | Propósito | Estado |
|---------|----------|--------|
| **Supabase** | Base de datos PostgreSQL + Edge Functions + Auth | ✅ Activo |
| **Stripe** | Procesamiento de pagos (Checkout + Webhooks) | ⏳ Pendiente clave API |
| **Resend** | Emails transaccionales | ⏳ Pendiente clave API |
| **Google Maps** | Mapa embebido sin API key (iframe embed) | ✅ Activo |
| **Vercel** | Hosting y deploy del frontend | ✅ Desplegado |
| **GitHub** | Control de versiones (fercarboc/casarural) | ✅ Activo |
| **Booking.com** | iCal sync (importar bloqueos) | Listo para configurar |
| **Airbnb** | iCal sync (importar bloqueos) | Listo para configurar |
| **EscapadaRural** | iCal sync (importar bloqueos) | Listo para configurar |

---

## 14. Pendientes y Próximos Pasos

### Crítico para producción
- [ ] **Stripe**: configurar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` en Supabase Edge Functions → Settings.
- [ ] **Stripe**: crear webhook en dashboard de Stripe apuntando a `…/functions/v1/stripe-webhook`.
- [ ] **Resend**: obtener API key y configurar `RESEND_API_KEY` en Supabase.
- [ ] **Teléfono real**: reemplazar `+34 600 000 000` en ContactoPage y Footer.
- [ ] **Dominio**: apuntar `www.casarurallarasilla.com` a Vercel.

### Mejoras pendientes
- [ ] Crear tablas en Supabase (ejecutar migraciones SQL).
- [ ] Configurar las temporadas reales en tabla `temporadas`.
- [ ] Insertar fila inicial en `configuracion` con precios reales.
- [ ] Crear plantillas de email en `email_templates`.
- [ ] Conectar feeds iCal reales de Booking.com y Airbnb desde el panel admin.
- [ ] Hacer el repositorio de GitHub privado.
- [ ] Activar formulario de contacto (actualmente sin backend).
- [ ] Configurar dominio de Resend para envío desde `info@casarurallarasilla.com`.

---

*Documento generado automáticamente · Casa Rural La Rasilla · Castillo Pedroso, Cantabria*
