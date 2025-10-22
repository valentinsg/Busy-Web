// =====================================================
// EXPORTS DE GUIONES (CSV, PDF, MDX)
// =====================================================

import type { Script, ScriptScene, ShotlistRow } from '@/types/scripts';

// =====================================================
// EXPORT CSV (SHOTLIST)
// =====================================================

export function exportShotlistCSV(scenes: ScriptScene[]): string {
  const headers = ['idx', 'heading', 'objective', 'shot_type', 'duration_seconds', 'broll_notes'];
  
  const rows: ShotlistRow[] = scenes.map(scene => ({
    idx: scene.idx,
    heading: scene.heading,
    objective: scene.objective || '',
    shot_type: scene.shot_type || '',
    duration_seconds: scene.duration_seconds || 0,
    broll_notes: scene.broll_notes || '',
  }));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const value = row[header as keyof ShotlistRow];
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================================================
// EXPORT MDX
// =====================================================

export function exportMDX(script: Script): string {
  return script.mdx;
}

export function downloadMDX(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================================================
// EXPORT PDF (HTML to Print)
// =====================================================

export function generatePDFHTML(script: Script, scenes: ScriptScene[]): string {
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${script.title} - Guion</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
    }
    
    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 80vh;
      padding: 2rem;
      border: 2px solid #000;
    }
    
    .cover h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .metadata {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .metadata-item {
      display: flex;
      flex-direction: column;
    }
    
    .metadata-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .metadata-value {
      font-size: 1rem;
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .tag {
      padding: 0.25rem 0.75rem;
      background: #000;
      color: #fff;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .scenes {
      margin-top: 2rem;
    }
    
    .scenes h2 {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #000;
    }
    
    .scene {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .scene-number {
      font-size: 0.875rem;
      font-weight: 600;
      color: #666;
    }
    
    .scene-duration {
      font-size: 0.875rem;
      padding: 0.25rem 0.75rem;
      background: #000;
      color: #fff;
      border-radius: 4px;
    }
    
    .scene-heading {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .scene-objective {
      font-size: 0.95rem;
      color: #666;
      margin-bottom: 1rem;
      font-style: italic;
    }
    
    .scene-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    .scene-detail {
      font-size: 0.875rem;
    }
    
    .scene-detail-label {
      font-weight: 600;
      color: #666;
    }
    
    .dialogue {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9f9f9;
      border-left: 3px solid #000;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 0.875rem;
      color: #666;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${script.title}</h1>
    
    <div class="metadata">
      <div class="metadata-item">
        <span class="metadata-label">Estado</span>
        <span class="metadata-value">${script.status.toUpperCase()}</span>
      </div>
      
      ${script.category ? `
      <div class="metadata-item">
        <span class="metadata-label">Categoría</span>
        <span class="metadata-value">${script.category}</span>
      </div>
      ` : ''}
      
      ${script.platform ? `
      <div class="metadata-item">
        <span class="metadata-label">Plataforma</span>
        <span class="metadata-value">${script.platform.toUpperCase()}</span>
      </div>
      ` : ''}
      
      <div class="metadata-item">
        <span class="metadata-label">Duración</span>
        <span class="metadata-value">${totalDuration}s (objetivo: ${script.est_duration_seconds || 0}s)</span>
      </div>
      
      ${script.mdx_frontmatter?.hook ? `
      <div class="metadata-item" style="grid-column: 1 / -1;">
        <span class="metadata-label">Hook</span>
        <span class="metadata-value">${script.mdx_frontmatter.hook}</span>
      </div>
      ` : ''}
      
      ${script.mdx_frontmatter?.cta ? `
      <div class="metadata-item" style="grid-column: 1 / -1;">
        <span class="metadata-label">CTA</span>
        <span class="metadata-value">${script.mdx_frontmatter.cta}</span>
      </div>
      ` : ''}
      
      ${script.mdx_frontmatter?.tone ? `
      <div class="metadata-item">
        <span class="metadata-label">Tono</span>
        <span class="metadata-value">${script.mdx_frontmatter.tone}</span>
      </div>
      ` : ''}
      
      ${script.tags.length > 0 ? `
      <div class="metadata-item" style="grid-column: 1 / -1;">
        <span class="metadata-label">Tags</span>
        <div class="tags">
          ${script.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="scenes">
    <h2>Storyboard (${scenes.length} escenas)</h2>
    
    ${scenes.map(scene => `
      <div class="scene">
        <div class="scene-header">
          <span class="scene-number">Escena ${scene.idx + 1}</span>
          ${scene.duration_seconds ? `<span class="scene-duration">${scene.duration_seconds}s</span>` : ''}
        </div>
        
        <div class="scene-heading">${scene.heading}</div>
        
        ${scene.objective ? `
          <div class="scene-objective">${scene.objective}</div>
        ` : ''}
        
        ${scene.dialogue_mdx ? `
          <div class="dialogue">${scene.dialogue_mdx}</div>
        ` : ''}
        
        <div class="scene-details">
          ${scene.shot_type ? `
            <div class="scene-detail">
              <span class="scene-detail-label">Plano:</span> ${scene.shot_type}
            </div>
          ` : ''}
          
          ${scene.location ? `
            <div class="scene-detail">
              <span class="scene-detail-label">Locación:</span> ${scene.location}
            </div>
          ` : ''}
          
          ${scene.props ? `
            <div class="scene-detail">
              <span class="scene-detail-label">Props:</span> ${scene.props}
            </div>
          ` : ''}
          
          ${scene.broll_notes ? `
            <div class="scene-detail" style="grid-column: 1 / -1;">
              <span class="scene-detail-label">B-Roll:</span> ${scene.broll_notes}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <p>Generado el ${new Date().toLocaleDateString('es-AR')} • Busy Scripts</p>
  </div>
</body>
</html>
  `;
}

export function printPDF(htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permití ventanas emergentes para exportar el PDF');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Esperar a que cargue y luego imprimir
  printWindow.onload = () => {
    printWindow.print();
  };
}
