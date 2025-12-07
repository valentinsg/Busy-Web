# Busy Streetwear 🛹

E-commerce y plataforma de contenido de Busy Streetwear - Mar del Plata, Argentina.

## 🚀 Inicio Rápido

### Requisitos
- **Node.js** 18+
- **pnpm** (gestor de paquetes - más rápido que npm)

### Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/valentinsg/Busy-Web.git
cd Busy-Web

# 2. Instalar pnpm (si no lo tenés)
npm install -g pnpm

# 3. Instalar dependencias
pnpm install

# 4. Copiar variables de entorno (pedirle a Valen el .env.local)
# El archivo .env.local tiene las keys de Supabase, Mercado Pago, R2, etc.

# 5. Arrancar el servidor de desarrollo
pnpm dev
```

El sitio corre en **http://localhost:3000**

### Comandos Principales

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Arranca el servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm start` | Corre la versión compilada |
| `pnpm lint` | Revisa errores de código |
| `pnpm lint:fix` | Corrige errores automáticamente |
| `pnpm typecheck` | Verifica tipos de TypeScript |
| `pnpm format` | Formatea el código con Prettier |
| `pnpm clean` | Limpia cache de Next.js |
| Errores de Next Remove-Item -Recurse -Force .next |
---

## 🌿 Flujo de Trabajo con Git

### Ramas

| Rama | Para qué es |
|------|-------------|
| `master` | Producción - lo que está en busy.com.ar |
| `preview` | Testing - para probar antes de subir a prod |
| `benja` | Rama personal de Benja para desarrollar |

### Cómo trabajar

```bash
# 1. Antes de empezar, traer los últimos cambios
git pull origin master

# 2. Crear tu rama o moverte a ella
git checkout benja
# o crear una nueva:
git checkout -b feature/nombre-de-lo-que-haces

# 3. Hacer tus cambios...

# 4. Guardar los cambios
git add .
git commit -m "feat: descripción corta de lo que hiciste"

# 5. Subir tu rama
git push origin benja

# 6. Crear un Pull Request en GitHub para mergear a preview
# 7. Una vez probado en preview, se mergea a master
```

### Convención de Commits

Usamos prefijos para que sea fácil entender qué se hizo:

| Prefijo | Cuándo usarlo |
|---------|---------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Arreglo de bug |
| `style:` | Cambios de estilos/CSS |
| `refactor:` | Mejora de código sin cambiar funcionalidad |
| `docs:` | Documentación |
| `chore:` | Tareas de mantenimiento |

**Ejemplos:**
```bash
git commit -m "feat: agregar filtro por talle en productos"
git commit -m "fix: corregir precio en checkout"
git commit -m "style: mejorar espaciado en navbar mobile"
```

---

## 📁 Estructura del Proyecto

```
Busy-Web/
├── app/                    # Páginas y rutas (Next.js App Router)
│   ├── (public)/          # Páginas públicas (shop, blog, etc.)
│   ├── admin/             # Panel de administración
│   └── api/               # Endpoints de la API
├── components/            # Componentes React reutilizables
├── lib/                   # Lógica de negocio y utilidades
│   └── repo/              # Funciones para hablar con Supabase
├── hooks/                 # Custom hooks de React
├── types/                 # Tipos de TypeScript
├── public/                # Archivos estáticos (imágenes, etc.)
├── locales/               # Traducciones (es.json, en.json)
├── supabase/              # Schemas y migraciones de la DB
└── motion/                # Sistema de animaciones
```

👉 **Para más detalle, ver [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🔧 Configuración

### Variables de Entorno (.env.local)

El archivo `.env.local` tiene todas las keys secretas. **Nunca lo subas a Git.**

Pedirle a Valen que te pase el archivo con:
- Supabase (base de datos)
- Mercado Pago (pagos)
- Cloudflare R2 (imágenes del archive)
- Resend (emails)
- Web Push (notificaciones)

### next.config.mjs

Configuración de Next.js:
- **Imágenes**: Optimización automática, formatos AVIF/WebP
- **MDX**: Soporte para escribir blog posts en Markdown
- **Redirects**: Redirecciones de URLs viejas
- **Headers**: Cache y seguridad

---

## 🎨 Stack Tecnológico

| Tecnología | Para qué |
|------------|----------|
| **Next.js 14** | Framework de React (App Router) |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes UI |
| **Supabase** | Base de datos + Auth |
| **Mercado Pago** | Pagos |
| **Cloudflare R2** | Storage de imágenes |
| **Resend** | Emails transaccionales |
| **Framer Motion + GSAP** | Animaciones |

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura técnica del sistema |
| [docs/DEV_GUIDE.md](./docs/DEV_GUIDE.md) | Guía de desarrollo |
| [docs/FEATURES_GUIDE.md](./docs/FEATURES_GUIDE.md) | Manual por features |
| [docs/GUIA-RAPIDA.md](./docs/GUIA-RAPIDA.md) | Referencia rápida |

---

## 🆘 ¿Problemas?

1. **Error de dependencias**: Borrar `node_modules` y `pnpm-lock.yaml`, luego `pnpm install`
2. **Error de tipos**: Correr `pnpm build` para ver errores de TypeScript
3. **Puerto ocupado**: Matar el proceso en el puerto 3000 o usar `pnpm dev -p 3001`
4. **Error Next**: Remove-Item -Recurse -Force .next
---

**Busy hace para los que hacen** 🔥
