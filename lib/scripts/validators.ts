// =====================================================
// VALIDACIONES Y CHECKLISTS DE GUIONES
// =====================================================

import type {
  Script,
  ScriptScene,
  ValidationResult,
  PlatformChecklist,
  ScriptPlatform,
} from '@/types/scripts';

// =====================================================
// VALIDACIONES DE CALIDAD
// =====================================================

export function validateScript(script: Script, scenes: ScriptScene[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validar CTA
  if (!script.mdx_frontmatter?.cta || script.mdx_frontmatter.cta.trim() === '') {
    results.push({
      id: 'missing-cta',
      severity: 'warning',
      message: 'Agregá un llamado claro a la acción (CTA)',
      field: 'cta',
    });
  }

  // Validar Hook
  if (!script.mdx_frontmatter?.hook || script.mdx_frontmatter.hook.trim() === '') {
    results.push({
      id: 'missing-hook',
      severity: 'warning',
      message: 'Definí un gancho (hook) impactante',
      field: 'hook',
    });
  }

  // Validar duración del hook (primera escena)
  if (scenes.length > 0 && scenes[0].duration_seconds && scenes[0].duration_seconds > 3) {
    results.push({
      id: 'hook-too-long',
      severity: 'warning',
      message: 'El gancho (primera escena) debería ser ≤3s para máxima retención',
      field: 'scenes',
    });
  }

  // Validar subtítulos
  if (script.mdx_frontmatter?.subtitles === false) {
    results.push({
      id: 'no-subtitles',
      severity: 'info',
      message: 'Considerá activar subtítulos para mejorar retención (80% ve sin sonido)',
      field: 'subtitles',
    });
  }

  // Validar duración total vs objetivo
  const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration_seconds || 0), 0);
  const targetDuration = script.est_duration_seconds || 0;
  
  if (targetDuration > 0 && totalDuration > 0) {
    const deviation = Math.abs(totalDuration - targetDuration) / targetDuration;
    
    if (deviation > 0.1) {
      results.push({
        id: 'duration-mismatch',
        severity: 'warning',
        message: `La duración de las escenas (${totalDuration}s) difiere del objetivo (${targetDuration}s) en más del 10%`,
        field: 'duration',
      });
    }
  }

  // Validar safe zones
  if (script.mdx_frontmatter?.safe_zones === false && script.platform) {
    results.push({
      id: 'no-safe-zones',
      severity: 'info',
      message: 'Recordá respetar las safe zones para UI de la plataforma',
      field: 'safe_zones',
    });
  }

  // Validar que haya escenas
  if (scenes.length === 0) {
    results.push({
      id: 'no-scenes',
      severity: 'error',
      message: 'Agregá al menos una escena al storyboard',
      field: 'scenes',
    });
  }

  // Validar que las escenas tengan objetivos
  const scenesWithoutObjective = scenes.filter(s => !s.objective || s.objective.trim() === '');
  if (scenesWithoutObjective.length > 0) {
    results.push({
      id: 'scenes-without-objective',
      severity: 'info',
      message: `${scenesWithoutObjective.length} escena(s) sin objetivo definido`,
      field: 'scenes',
    });
  }

  return results;
}

// =====================================================
// CHECKLISTS POR PLATAFORMA
// =====================================================

export function getPlatformChecklist(
  platform: ScriptPlatform,
  script: Script,
  scenes: ScriptScene[]
): PlatformChecklist {
  const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration_seconds || 0), 0);
  const hookDuration = scenes[0]?.duration_seconds || 0;

  switch (platform) {
    case 'instagram':
      return {
        platform: 'instagram',
        items: [
          {
            id: 'ratio',
            label: 'Ratio 9:16 (vertical)',
            checked: true, // Asumimos que sí
            required: true,
          },
          {
            id: 'hook-duration',
            label: 'Hook ≤ 3 segundos',
            checked: hookDuration <= 3,
            required: true,
          },
          {
            id: 'duration',
            label: 'Duración ideal: 7-30 segundos',
            checked: totalDuration >= 7 && totalDuration <= 30,
            required: false,
          },
          {
            id: 'subtitles',
            label: 'Subtítulos activados',
            checked: script.mdx_frontmatter?.subtitles === true,
            required: true,
          },
          {
            id: 'safe-zones',
            label: 'Safe zone inferior: 135px',
            checked: script.mdx_frontmatter?.safe_zones === true,
            required: true,
          },
          {
            id: 'text-size',
            label: 'Texto overlay: 4-6 palabras máx',
            checked: true, // Manual
            required: false,
          },
        ],
        recommendations: [
          'Usá música trending para mayor alcance',
          'Incluí CTA en los primeros 3 segundos',
          'Agregá stickers interactivos (encuestas, preguntas)',
        ],
      };

    case 'tiktok':
      return {
        platform: 'tiktok',
        items: [
          {
            id: 'ratio',
            label: 'Ratio 9:16 (vertical)',
            checked: true,
            required: true,
          },
          {
            id: 'hook-duration',
            label: 'Hook ≤ 2 segundos',
            checked: hookDuration <= 2,
            required: true,
          },
          {
            id: 'duration',
            label: 'Duración ideal: 7-20 segundos',
            checked: totalDuration >= 7 && totalDuration <= 20,
            required: false,
          },
          {
            id: 'subtitles',
            label: 'Subtítulos activados',
            checked: script.mdx_frontmatter?.subtitles === true,
            required: true,
          },
          {
            id: 'music',
            label: 'Audio/música trending',
            checked: !!script.mdx_frontmatter?.music_style,
            required: false,
          },
          {
            id: 'native-cta',
            label: 'CTA nativo de TikTok',
            checked: true, // Manual
            required: false,
          },
        ],
        recommendations: [
          'Usá trending sounds para mayor FYP',
          'Primeros 0.5s son críticos para retención',
          'Incluí texto on-screen para contexto rápido',
        ],
      };

    case 'youtube':
      return {
        platform: 'youtube',
        items: [
          {
            id: 'ratio',
            label: 'Ratio 9:16 para Shorts',
            checked: true,
            required: true,
          },
          {
            id: 'hook-duration',
            label: 'Hook ≤ 2-3 segundos',
            checked: hookDuration <= 3,
            required: true,
          },
          {
            id: 'duration',
            label: 'Duración ideal: 15-60 segundos',
            checked: totalDuration >= 15 && totalDuration <= 60,
            required: false,
          },
          {
            id: 'title',
            label: 'Título optimizado (opcional)',
            checked: true, // Manual
            required: false,
          },
          {
            id: 'thumbnail',
            label: 'Thumbnail para long-form (opcional)',
            checked: !!script.cover_asset_url,
            required: false,
          },
        ],
        recommendations: [
          'Considerá reutilizar en formato long-form',
          'Agregá hashtags relevantes en descripción',
          'Loop el video para mayor watch time',
        ],
      };

    default:
      return {
        platform,
        items: [],
        recommendations: [],
      };
  }
}

// =====================================================
// AUTOGENERAR ESCENAS
// =====================================================

export function autogenerateScenes(
  hook: string,
  cta: string,
  estDurationSeconds: number
): Omit<ScriptScene, 'id' | 'script_id' | 'created_at' | 'updated_at'>[] {
  // Distribución de tiempos: Hook 15%, Valor 40%, Prueba 25%, CTA 20%
  const hookDuration = Math.round(estDurationSeconds * 0.15);
  const valueDuration = Math.round(estDurationSeconds * 0.40);
  const proofDuration = Math.round(estDurationSeconds * 0.25);
  const ctaDuration = estDurationSeconds - hookDuration - valueDuration - proofDuration;

  return [
    {
      idx: 0,
      heading: 'Hook',
      objective: 'Captar atención inmediata',
      dialogue_mdx: hook || '¿Te pasa que...?',
      duration_seconds: hookDuration,
      shot_type: 'close-up',
      broll_notes: 'Visual impactante, movimiento rápido',
    },
    {
      idx: 1,
      heading: 'Valor',
      objective: 'Presentar solución y beneficios',
      dialogue_mdx: 'Con [producto/servicio] podés...',
      duration_seconds: valueDuration,
      shot_type: 'medium',
      broll_notes: 'Demostración del producto en uso',
    },
    {
      idx: 2,
      heading: 'Prueba Social',
      objective: 'Validar con resultado o testimonial',
      dialogue_mdx: 'Mirá el resultado...',
      duration_seconds: proofDuration,
      shot_type: 'detail',
      broll_notes: 'Antes/después, testimonial, o dato impactante',
    },
    {
      idx: 3,
      heading: 'CTA',
      objective: 'Llamado a la acción claro',
      dialogue_mdx: cta || 'Conseguilo ahora en el link de la bio',
      duration_seconds: ctaDuration,
      shot_type: 'medium',
      broll_notes: 'Producto + texto overlay con CTA',
    },
  ];
}

// =====================================================
// CALCULAR ESTADÍSTICAS
// =====================================================

export function calculateSceneStats(scenes: ScriptScene[], targetDuration?: number) {
  const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration_seconds || 0), 0);
  const deviation = targetDuration ? Math.abs(totalDuration - targetDuration) / targetDuration : 0;
  
  let status: 'good' | 'warning' | 'error' = 'good';
  if (deviation > 0.1) status = 'warning';
  if (deviation > 0.2) status = 'error';

  return {
    totalDuration,
    targetDuration: targetDuration || 0,
    deviation,
    status,
    sceneCount: scenes.length,
  };
}
