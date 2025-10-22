-- =====================================================
-- SEED DATA PARA MÓDULO DE GUIONES
-- =====================================================

-- IMPORTANTE: Reemplazar 'YOUR_USER_ID' con tu UUID real de Supabase Auth

-- =====================================================
-- PROYECTO DE EJEMPLO
-- =====================================================

INSERT INTO public.script_projects (id, team_id, name, description, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'YOUR_USER_ID', -- Reemplazar con tu user ID
  'Busy Caps 2025',
  'Campaña de lanzamiento primavera-verano 2025',
  'YOUR_USER_ID'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- GUION 1: AD/UGC COMPLETO
-- =====================================================

INSERT INTO public.scripts (
  id,
  project_id,
  team_id,
  title,
  slug,
  status,
  category,
  tags,
  platform,
  est_duration_seconds,
  mdx,
  mdx_frontmatter,
  version,
  created_by,
  updated_by
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'YOUR_USER_ID',
  'Ad Remera Negra - IG Reels',
  'ad-remera-negra-ig-reels',
  'draft',
  'Publicidad',
  ARRAY['remera', 'ugc', 'instagram'],
  'instagram',
  25,
  '---
hook: "¿Te cansaste de remeras que se deforman?"
cta: "Conseguila en el link de la bio"
tone: "Casual, auténtico"
target_audience: "Millennials y Gen Z"
voiceover: true
subtitles: true
safe_zones: true
---

# Ad Remera Negra - IG Reels

## Hook (0-3s)
Abre con el problema: remeras que se deforman después de un par de lavadas.

## Valor (3-12s)
Presenta la remera Busy: 100% algodón peinado, doble costura, no se deforma.

## Prueba Social (12-18s)
Mostrar testimonial rápido o antes/después de lavados.

## CTA (18-25s)
"Conseguila ahora en el link de la bio. Envío gratis en CABA."',
  jsonb_build_object(
    'hook', '¿Te cansaste de remeras que se deforman?',
    'cta', 'Conseguila en el link de la bio',
    'tone', 'Casual, auténtico',
    'target_audience', 'Millennials y Gen Z',
    'voiceover', true,
    'subtitles', true,
    'safe_zones', true
  ),
  1,
  'YOUR_USER_ID',
  'YOUR_USER_ID'
) ON CONFLICT (id) DO NOTHING;

-- Escenas para Guion 1
INSERT INTO public.script_scenes (id, script_id, idx, heading, objective, dialogue_mdx, broll_notes, duration_seconds, shot_type, location, props)
VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    0,
    'Hook',
    'Captar atención con problema',
    '¿Te cansaste de remeras que se deforman después de lavarlas?',
    'Remera deformada, cuello estirado',
    3,
    'close-up',
    'Interior - Casa',
    'Remera vieja deformada'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    1,
    'Valor',
    'Presentar producto como solución',
    'Con las remeras Busy, eso no pasa. 100% algodón peinado, doble costura.',
    'Remera Busy negra, detalles de calidad',
    9,
    'medium',
    'Interior - Estudio',
    'Remera Busy negra'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    2,
    'Prueba Social',
    'Mostrar resultado o testimonial',
    'Después de 20 lavadas, sigue como nueva.',
    'Comparación antes/después, close-up de costuras',
    6,
    'detail',
    'Interior - Estudio',
    'Remera lavada 20 veces'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    3,
    'CTA',
    'Llamado a la acción',
    'Conseguila ahora en el link de la bio. Envío gratis en CABA.',
    'Remera + texto overlay con CTA',
    7,
    'medium',
    'Interior - Estudio',
    'Remera Busy negra'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- GUION 2: VACÍO (PARA EMPEZAR DESDE CERO)
-- =====================================================

INSERT INTO public.scripts (
  id,
  project_id,
  team_id,
  title,
  slug,
  status,
  category,
  platform,
  est_duration_seconds,
  mdx,
  mdx_frontmatter,
  version,
  created_by,
  updated_by
)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'YOUR_USER_ID',
  'Nuevo Guion - TikTok',
  'nuevo-guion-tiktok',
  'idea',
  'Viral',
  'tiktok',
  15,
  '---
hook: ""
cta: ""
tone: ""
---

# Nuevo Guion - TikTok

Empezá a escribir tu guion acá...',
  jsonb_build_object(
    'hook', '',
    'cta', '',
    'tone', ''
  ),
  1,
  'YOUR_USER_ID',
  'YOUR_USER_ID'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMENTARIOS DE EJEMPLO
-- =====================================================

INSERT INTO public.script_comments (id, script_id, author_id, body, resolved)
VALUES
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000002',
    'YOUR_USER_ID',
    'Cambiar "conseguila" por "descubrila" para que suene más premium',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000002',
    'YOUR_USER_ID',
    'Agregar música trending de fondo',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- NOTAS
-- =====================================================

-- Para usar este seed:
-- 1. Reemplazar 'YOUR_USER_ID' con tu UUID real
-- 2. Ejecutar en Supabase SQL Editor
-- 3. Verificar que las tablas existan (ejecutar scripts_module.sql primero)
-- 4. Los IDs son UUIDs fijos para facilitar testing

-- Para obtener tu USER_ID:
-- SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com';
