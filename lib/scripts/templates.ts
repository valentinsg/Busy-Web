// =====================================================
// PLANTILLAS DE GUIONES
// =====================================================

import type { ScriptTemplate, ScriptPlatform } from '@/types/scripts';

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'ad-ugc',
    name: 'Ad / UGC',
    description: 'Anuncio corto estilo contenido generado por usuario',
    category: 'Publicidad',
    platform: 'instagram',
    est_duration_seconds: 25,
    frontmatter: {
      hook: 'Gancho impactante en los primeros 2 segundos',
      cta: 'Llamado a la acción claro',
      tone: 'Casual, auténtico',
      target_audience: 'Millennials y Gen Z',
      voiceover: true,
      subtitles: true,
      safe_zones: true,
    },
    mdx: `---
hook: "Gancho impactante en los primeros 2 segundos"
cta: "Llamado a la acción claro"
tone: "Casual, auténtico"
target_audience: "Millennials y Gen Z"
voiceover: true
subtitles: true
safe_zones: true
---

# Ad / UGC - 25 segundos

## Hook (0-3s)
Abre con un problema o pregunta que resuene con tu audiencia.

## Valor (3-12s)
Presenta tu producto/servicio como la solución. Muestra beneficios tangibles.

## Prueba Social (12-18s)
Testimonial rápido, resultado visible o dato impactante.

## CTA (18-25s)
Llamado a la acción claro: "Comprá ahora", "Link en bio", "Deslizá para ver más".
`,
    scenes: [
      {
        idx: 0,
        heading: 'Hook',
        objective: 'Captar atención con problema/pregunta',
        dialogue_mdx: '¿Te pasa que...?',
        duration_seconds: 3,
        shot_type: 'close-up',
      },
      {
        idx: 1,
        heading: 'Valor',
        objective: 'Presentar producto como solución',
        dialogue_mdx: 'Con [producto] podés...',
        duration_seconds: 9,
        shot_type: 'medium',
      },
      {
        idx: 2,
        heading: 'Prueba Social',
        objective: 'Mostrar resultado o testimonial',
        dialogue_mdx: 'Mirá el resultado...',
        duration_seconds: 6,
        shot_type: 'detail',
      },
      {
        idx: 3,
        heading: 'CTA',
        objective: 'Llamado a la acción',
        dialogue_mdx: 'Conseguilo ahora en el link de la bio',
        duration_seconds: 7,
        shot_type: 'medium',
      },
    ],
  },
  {
    id: 'how-to',
    name: 'How-to / Tutorial',
    description: 'Tutorial educativo paso a paso',
    category: 'Educativo',
    platform: 'tiktok',
    est_duration_seconds: 40,
    frontmatter: {
      hook: 'Promesa de aprendizaje rápido',
      cta: 'Seguir para más tips',
      tone: 'Educativo, amigable',
      target_audience: 'Usuarios que buscan aprender',
      voiceover: true,
      subtitles: true,
      safe_zones: true,
    },
    mdx: `---
hook: "Promesa de aprendizaje rápido"
cta: "Seguir para más tips"
tone: "Educativo, amigable"
target_audience: "Usuarios que buscan aprender"
voiceover: true
subtitles: true
safe_zones: true
---

# How-to / Tutorial - 40 segundos

## Intro (0-5s)
"Cómo hacer [X] en [Y] pasos"

## Paso 1 (5-15s)
Primer paso con demostración visual clara.

## Paso 2 (15-25s)
Segundo paso con tips adicionales.

## Paso 3 (25-35s)
Paso final y resultado.

## Cierre (35-40s)
Recap rápido y CTA para seguir.
`,
    scenes: [
      {
        idx: 0,
        heading: 'Intro',
        objective: 'Presentar el tutorial',
        dialogue_mdx: 'Cómo hacer [X] en 3 pasos',
        duration_seconds: 5,
        shot_type: 'medium',
      },
      {
        idx: 1,
        heading: 'Paso 1',
        objective: 'Primera instrucción',
        dialogue_mdx: 'Primero...',
        duration_seconds: 10,
        shot_type: 'detail',
      },
      {
        idx: 2,
        heading: 'Paso 2',
        objective: 'Segunda instrucción',
        dialogue_mdx: 'Después...',
        duration_seconds: 10,
        shot_type: 'detail',
      },
      {
        idx: 3,
        heading: 'Paso 3',
        objective: 'Instrucción final',
        dialogue_mdx: 'Por último...',
        duration_seconds: 10,
        shot_type: 'detail',
      },
      {
        idx: 4,
        heading: 'Cierre',
        objective: 'Recap y CTA',
        dialogue_mdx: 'Y listo! Seguime para más tips',
        duration_seconds: 5,
        shot_type: 'medium',
      },
    ],
  },
  {
    id: 'behind-scenes',
    name: 'Behind the Scenes',
    description: 'Detrás de cámaras del proceso creativo',
    category: 'Storytelling',
    platform: 'instagram',
    est_duration_seconds: 60,
    frontmatter: {
      hook: 'Mostrar proceso oculto',
      cta: 'Seguir para ver más',
      tone: 'Auténtico, transparente',
      target_audience: 'Fans de la marca',
      voiceover: true,
      subtitles: false,
      safe_zones: true,
    },
    mdx: `---
hook: "Mostrar proceso oculto"
cta: "Seguir para ver más"
tone: "Auténtico, transparente"
target_audience: "Fans de la marca"
voiceover: true
subtitles: false
safe_zones: true
---

# Behind the Scenes - 60 segundos

## Hook (0-5s)
"Así hacemos [producto/contenido]"

## Proceso (5-40s)
Mostrar el proceso real, sin filtros. Incluir momentos divertidos o desafíos.

## Resultado (40-55s)
Producto/contenido final.

## Cierre (55-60s)
Agradecimiento y CTA.
`,
    scenes: [
      {
        idx: 0,
        heading: 'Hook',
        objective: 'Presentar el BTS',
        dialogue_mdx: 'Así hacemos [X]',
        duration_seconds: 5,
        shot_type: 'wide',
      },
      {
        idx: 1,
        heading: 'Proceso - Parte 1',
        objective: 'Mostrar inicio del proceso',
        duration_seconds: 15,
        shot_type: 'medium',
      },
      {
        idx: 2,
        heading: 'Proceso - Parte 2',
        objective: 'Mostrar desarrollo',
        duration_seconds: 20,
        shot_type: 'detail',
      },
      {
        idx: 3,
        heading: 'Resultado',
        objective: 'Revelar producto final',
        duration_seconds: 15,
        shot_type: 'wide',
      },
      {
        idx: 4,
        heading: 'Cierre',
        objective: 'Agradecimiento y CTA',
        dialogue_mdx: 'Gracias por acompañarnos!',
        duration_seconds: 5,
        shot_type: 'medium',
      },
    ],
  },
  {
    id: 'launch',
    name: 'Lanzamiento',
    description: 'Anuncio de nuevo producto o colección',
    category: 'Publicidad',
    platform: 'instagram',
    est_duration_seconds: 20,
    frontmatter: {
      hook: 'Anuncio impactante',
      cta: 'Comprar ahora',
      tone: 'Emocionante, urgente',
      target_audience: 'Clientes existentes y nuevos',
      voiceover: true,
      subtitles: true,
      safe_zones: true,
    },
    mdx: `---
hook: "Anuncio impactante"
cta: "Comprar ahora"
tone: "Emocionante, urgente"
target_audience: "Clientes existentes y nuevos"
voiceover: true
subtitles: true
safe_zones: true
---

# Lanzamiento - 20 segundos

## Teaser (0-3s)
Build-up de anticipación.

## Reveal (3-10s)
Mostrar el producto con energía.

## Features (10-15s)
Destacar 2-3 características clave.

## CTA (15-20s)
Disponible ahora + link.
`,
    scenes: [
      {
        idx: 0,
        heading: 'Teaser',
        objective: 'Crear anticipación',
        dialogue_mdx: 'Llega algo nuevo...',
        duration_seconds: 3,
        shot_type: 'detail',
      },
      {
        idx: 1,
        heading: 'Reveal',
        objective: 'Revelar producto',
        dialogue_mdx: 'Presentamos [producto]',
        duration_seconds: 7,
        shot_type: 'wide',
      },
      {
        idx: 2,
        heading: 'Features',
        objective: 'Mostrar características',
        duration_seconds: 5,
        shot_type: 'medium',
      },
      {
        idx: 3,
        heading: 'CTA',
        objective: 'Llamado a comprar',
        dialogue_mdx: 'Disponible ahora en el link',
        duration_seconds: 5,
        shot_type: 'close-up',
      },
    ],
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Cliente compartiendo su experiencia',
    category: 'Social Proof',
    platform: 'instagram',
    est_duration_seconds: 45,
    frontmatter: {
      hook: 'Problema del cliente',
      cta: 'Probalo vos también',
      tone: 'Auténtico, emocional',
      target_audience: 'Prospectos',
      voiceover: true,
      subtitles: true,
      safe_zones: true,
    },
    mdx: `---
hook: "Problema del cliente"
cta: "Probalo vos también"
tone: "Auténtico, emocional"
target_audience: "Prospectos"
voiceover: true
subtitles: true
safe_zones: true
---

# Testimonial - 45 segundos

## Problema (0-10s)
Cliente describe su problema antes del producto.

## Solución (10-25s)
Cómo el producto ayudó.

## Resultado (25-40s)
Transformación o beneficio concreto.

## CTA (40-45s)
Invitación a probar.
`,
    scenes: [
      {
        idx: 0,
        heading: 'Problema',
        objective: 'Cliente describe problema',
        dialogue_mdx: 'Antes tenía [problema]...',
        duration_seconds: 10,
        shot_type: 'close-up',
      },
      {
        idx: 1,
        heading: 'Solución',
        objective: 'Cómo el producto ayudó',
        dialogue_mdx: 'Desde que uso [producto]...',
        duration_seconds: 15,
        shot_type: 'medium',
      },
      {
        idx: 2,
        heading: 'Resultado',
        objective: 'Beneficio concreto',
        dialogue_mdx: 'Ahora puedo [beneficio]',
        duration_seconds: 15,
        shot_type: 'wide',
      },
      {
        idx: 3,
        heading: 'CTA',
        objective: 'Invitación',
        dialogue_mdx: 'Probalo vos también',
        duration_seconds: 5,
        shot_type: 'close-up',
      },
    ],
  },
  {
    id: 'trend-remix',
    name: 'Trend Remix',
    description: 'Adaptación de tendencia viral',
    category: 'Viral',
    platform: 'tiktok',
    est_duration_seconds: 15,
    frontmatter: {
      hook: 'Trend reconocible',
      cta: 'Seguir para más',
      tone: 'Divertido, on-trend',
      target_audience: 'Gen Z',
      voiceover: false,
      subtitles: true,
      safe_zones: true,
    },
    mdx: `---
hook: "Trend reconocible"
cta: "Seguir para más"
tone: "Divertido, on-trend"
target_audience: "Gen Z"
voiceover: false
subtitles: true
safe_zones: true
---

# Trend Remix - 15 segundos

## Setup (0-3s)
Inicio del trend (audio/visual reconocible).

## Twist (3-10s)
Giro relacionado con tu marca/producto.

## Punchline (10-15s)
Remate + branding sutil.
`,
    scenes: [
      {
        idx: 0,
        heading: 'Setup',
        objective: 'Inicio del trend',
        duration_seconds: 3,
        shot_type: 'medium',
      },
      {
        idx: 1,
        heading: 'Twist',
        objective: 'Giro con marca',
        duration_seconds: 7,
        shot_type: 'close-up',
      },
      {
        idx: 2,
        heading: 'Punchline',
        objective: 'Remate',
        duration_seconds: 5,
        shot_type: 'wide',
      },
    ],
  },
];

export function getTemplateById(id: string): ScriptTemplate | undefined {
  return SCRIPT_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByPlatform(platform: ScriptPlatform): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.platform === platform);
}

export function getTemplatesByCategory(category: string): ScriptTemplate[] {
  return SCRIPT_TEMPLATES.filter(t => t.category === category);
}
