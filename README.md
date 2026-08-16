# INVENTIA - Robótica, Programación e IA para Niños

## 🚀 Descripción

INVENTIA es una plataforma educativa de STEM para niños de 4-16 años. Ofrecemos campamentos, cursos virtuales y presenciales de robótica, programación e inteligencia artificial.

**Lema:** Tu hijo no usa tecnología. La inventa.

## 🎯 Stack Tecnológico

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 3
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth + OAuth
- **Conferencing:** Google Meet API
- **Hosting:** Vercel
- **Pagos:** Stripe + PayU

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Google Cloud (para Meet API)
- Cuenta de Vercel (para deployment)

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/inventia.git
cd inventia
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MEET_CLIENT_ID`
- `GOOGLE_MEET_CLIENT_SECRET`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📚 Estructura del Proyecto

```
inventia/
├── app/                    # Next.js app directory
│   ├── app/               # Páginas y layouts
│   ├── components/        # Componentes React
│   ├── lib/              # Utilidades y configuración
│   ├── types/            # Tipos TypeScript
│   └── styles/           # CSS global
├── public/               # Archivos estáticos
├── package.json          # Dependencias
└── tsconfig.json         # Configuración TypeScript
```

## 🚀 Deployment en Vercel

### 1. Pushear a GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar a Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Seleccionar el repositorio de GitHub
4. Vercel detectará que es un proyecto Next.js
5. Agregar variables de entorno

### 3. Configurar variables en Vercel

En Vercel Dashboard → Settings → Environment Variables, agregar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MEET_CLIENT_ID`
- `GOOGLE_MEET_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL=https://inventiagroup.com`

### 4. Deploy

```bash
vercel --prod
```

## 🌐 Dominio Personalizado

1. En Vercel Dashboard → Settings → Domains
2. Agregar dominio `inventiagroup.com`
3. Copiar registros DNS a tu proveedor de dominios
4. Esperar a que se propague (24-48 horas)

## 💾 Supabase Setup

### Crear tablas

```sql
-- Usuarios (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text not null,
  role text default 'student',
  phone text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Cursos
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  image_url text,
  instructor_id uuid references profiles(id),
  start_date timestamp,
  end_date timestamp,
  schedule text,
  max_students integer,
  current_students integer default 0,
  price numeric,
  currency text default 'COP',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Inscripciones
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  course_id uuid references courses(id),
  enrolled_date timestamp default now(),
  completion_date timestamp,
  status text check (status in ('active', 'completed', 'dropped')),
  progress integer default 0
);

-- Clases/Sesiones
create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text not null,
  description text,
  scheduled_at timestamp not null,
  duration_minutes integer,
  google_meet_link text,
  recording_url text,
  created_at timestamp default now()
);
```

## 📱 Funcionalidades

### MVP (Fase 1)
- ✅ Landing page profesional
- ✅ Página de cursos
- ✅ Autenticación (Google OAuth)
- ✅ Integración Google Meet
- ✅ Página de contacto
- ✅ Mobile responsive
- ✅ SEO optimizado

### En Desarrollo (Fase 2)
- Dashboard de estudiantes
- Portal de padres
- Sistema de pagos (Stripe/PayU)
- Evaluaciones y tareas
- Sistema de certificados

## 🔐 Seguridad

- Variables de entorno protegidas en Vercel
- Autenticación vía OAuth
- Datos sensibles en Supabase (RGPD compliant)
- HTTPS automático
- Rate limiting en APIs

## 📊 Analytics

Configurado con Google Analytics para tracking:
- Visitas a página
- Clicks en CTA
- Conversiones

## 🤝 Contribuir

Para contribuir al proyecto:

```bash
git checkout -b feature/tu-feature
git commit -am 'Add your changes'
git push origin feature/tu-feature
```

## 📞 Contacto

- Email: info@inventiagroup.com
- WhatsApp: +57 350 211 4492
- Instagram: @inventia

## 📄 Licencia

Todos los derechos reservados © 2024 INVENTIA

---

**Hecho con ❤️ por el equipo de INVENTIA**
