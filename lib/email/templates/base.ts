// =====================================================
// BASE EMAIL TEMPLATE
// Layout base para todos los emails de Busy Streetwear
// =====================================================

// Base URL for assets
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://busy.com.ar'

// Logo URL (white logo on transparent background)
export const LOGO_URL = `${BASE_URL}/brand/BUSY_LOGO%20TRANSPARENTE-3.png`

/**
 * Colores de la marca Busy
 */
export const BUSY_COLORS = {
  primary: '#000000', // Negro
  accent: '#FF6B00', // Naranja accent-brand
  background: '#FFFFFF',
  text: '#1a1a1a',
  textMuted: '#666666',
  border: '#e5e5e5',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}

/**
 * Estilos base para emails responsive
 */
export const BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: ${BUSY_COLORS.background};
  }
  .email-header {
    background-color: ${BUSY_COLORS.primary};
    padding: 32px 24px;
    text-align: center;
  }
  .email-logo {
    font-size: 32px;
    font-weight: 900;
    color: ${BUSY_COLORS.background};
    letter-spacing: 2px;
    text-decoration: none;
  }
  .email-body {
    padding: 40px 24px;
  }
  .email-title {
    font-size: 24px;
    font-weight: 700;
    color: ${BUSY_COLORS.text};
    margin: 0 0 16px 0;
  }
  .email-text {
    font-size: 16px;
    line-height: 1.6;
    color: ${BUSY_COLORS.text};
    margin: 0 0 16px 0;
  }
  .email-text-muted {
    font-size: 14px;
    line-height: 1.5;
    color: ${BUSY_COLORS.textMuted};
    margin: 0 0 12px 0;
  }
  .email-button {
    display: inline-block;
    padding: 14px 32px;
    background-color: ${BUSY_COLORS.primary};
    color: ${BUSY_COLORS.background} !important;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 24px 0;
  }
  .email-button-accent {
    background-color: ${BUSY_COLORS.accent};
  }
  .email-divider {
    height: 1px;
    background-color: ${BUSY_COLORS.border};
    margin: 32px 0;
    border: none;
  }
  .email-footer {
    padding: 24px;
    text-align: center;
    background-color: #fafafa;
    border-top: 1px solid ${BUSY_COLORS.border};
  }
  .email-footer-text {
    font-size: 12px;
    color: ${BUSY_COLORS.textMuted};
    margin: 8px 0;
  }
  .info-box {
    background-color: #f9fafb;
    border-left: 4px solid ${BUSY_COLORS.accent};
    padding: 16px;
    margin: 24px 0;
    border-radius: 4px;
  }
  .warning-box {
    background-color: #fef3c7;
    border-left: 4px solid ${BUSY_COLORS.warning};
    padding: 16px;
    margin: 24px 0;
    border-radius: 4px;
  }
  .success-box {
    background-color: #dcfce7;
    border-left: 4px solid ${BUSY_COLORS.success};
    padding: 16px;
    margin: 24px 0;
    border-radius: 4px;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
  }
  .data-table th {
    text-align: left;
    padding: 12px;
    background-color: #f9fafb;
    border-bottom: 2px solid ${BUSY_COLORS.border};
    font-weight: 600;
    font-size: 14px;
    color: ${BUSY_COLORS.text};
  }
  .data-table td {
    padding: 12px;
    border-bottom: 1px solid ${BUSY_COLORS.border};
    font-size: 14px;
    color: ${BUSY_COLORS.text};
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-success {
    background-color: #dcfce7;
    color: #166534;
  }
  .badge-warning {
    background-color: #fef3c7;
    color: #92400e;
  }
  .badge-error {
    background-color: #fee2e2;
    color: #991b1b;
  }
  @media only screen and (max-width: 600px) {
    .email-body {
      padding: 24px 16px;
    }
    .email-title {
      font-size: 20px;
    }
    .email-text {
      font-size: 14px;
    }
  }
`

/**
 * Layout base para emails
 */
export function createEmailLayout(params: {
  title: string
  preheader?: string
  content: string
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${params.title}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  ${params.preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${params.preheader}</div>` : ''}

  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <a href="${BASE_URL}" style="display: inline-block;">
        <img src="${LOGO_URL}" alt="Busy Streetwear" style="max-height: 50px; width: auto;">
      </a>
    </div>

    <!-- Body -->
    <div class="email-body">
      ${params.content}
    </div>

    <!-- Quick Links -->
    <div style="background-color: ${BUSY_COLORS.primary}; padding: 16px 24px; text-align: center;">
      <a href="${BASE_URL}/products" style="color: #ffffff; text-decoration: none; font-size: 12px; margin: 0 10px;">TIENDA</a>
      <a href="${BASE_URL}/blog" style="color: #ffffff; text-decoration: none; font-size: 12px; margin: 0 10px;">BLOG</a>
      <a href="${BASE_URL}/playlists" style="color: #ffffff; text-decoration: none; font-size: 12px; margin: 0 10px;">PLAYLISTS</a>
      <a href="${BASE_URL}/about" style="color: #ffffff; text-decoration: none; font-size: 12px; margin: 0 10px;">NOSOTROS</a>
    </div>

    <!-- Social Links -->
    <div style="padding: 16px 24px; text-align: center; background-color: #fafafa;">
      <a href="https://instagram.com/busy_streetwear" style="display: inline-block; margin: 0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" style="width: 24px; height: 24px;">
      </a>
      <a href="https://tiktok.com/@busy_streetwear" style="display: inline-block; margin: 0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" style="width: 24px; height: 24px;">
      </a>
      <a href="https://youtube.com/@busystreetwear" style="display: inline-block; margin: 0 6px;">
        <img src="https://cdn-icons-png.flaticon.com/512/174/174883.png" alt="YouTube" style="width: 24px; height: 24px;">
      </a>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p class="email-footer-text">
        <strong>Busy Streetwear</strong><br>
        Cultura urbana, moda y comunidad desde Mar del Plata
      </p>
      <p class="email-footer-text">
        📍 María Curie 5457, Mar del Plata, Buenos Aires
      </p>
      <p class="email-footer-text">
        📧 <a href="mailto:hola@busy.com.ar" style="color: ${BUSY_COLORS.textMuted};">hola@busy.com.ar</a> | 🌐 <a href="${BASE_URL}" style="color: ${BUSY_COLORS.accent};">busy.com.ar</a>
      </p>
      <p class="email-footer-text" style="margin-top: 12px;">
        © 2024-${new Date().getFullYear()} Busy Streetwear. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Botón de acción
 */
export function createButton(params: {
  text: string
  url: string
  accent?: boolean
}): string {
  const className = params.accent ? 'email-button email-button-accent' : 'email-button'
  return `<a href="${params.url}" class="${className}">${params.text}</a>`
}

/**
 * Box informativo
 */
export function createInfoBox(content: string, type: 'info' | 'warning' | 'success' = 'info'): string {
  const className = type === 'warning' ? 'warning-box' : type === 'success' ? 'success-box' : 'info-box'
  return `<div class="${className}">${content}</div>`
}

/**
 * Badge de estado
 */
export function createBadge(text: string, type: 'success' | 'warning' | 'error' = 'success'): string {
  const className = `badge badge-${type}`
  return `<span class="${className}">${text}</span>`
}
