// =====================================================
// LOW STOCK EMAIL TEMPLATE
// Email para alertar sobre stock bajo
// =====================================================

import { createEmailLayout, createButton, createInfoBox } from './base'
import type { LowStockEmailData } from '@/types/email'

export function createLowStockEmail(data: LowStockEmailData): string {
  const stockPercentage = (data.currentStock / data.threshold) * 100
  const isUrgent = data.currentStock <= 2

  const content = `
    <h1 class="email-title">⚠️ Alerta de Stock Bajo</h1>
    
    <p class="email-text">
      ${isUrgent ? '🚨 <strong>¡URGENTE!</strong> ' : ''}Uno de tus productos está por agotarse.
    </p>

    ${createInfoBox(
      `
      <p style="margin: 0 0 8px 0;"><strong>Producto:</strong> ${data.productName}</p>
      <p style="margin: 0 0 8px 0;"><strong>SKU:</strong> ${data.sku}</p>
      <p style="margin: 0 0 12px 0;">
        <strong>Stock Actual:</strong> 
        <span style="font-size: 24px; font-weight: 700; color: ${isUrgent ? '#ef4444' : '#f59e0b'};">
          ${data.currentStock} ${data.currentStock === 1 ? 'unidad' : 'unidades'}
        </span>
      </p>
      <div style="background-color: #e5e5e5; height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background-color: ${isUrgent ? '#ef4444' : '#f59e0b'}; height: 100%; width: ${Math.min(stockPercentage, 100)}%;"></div>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
        Umbral de alerta: ${data.threshold} unidades
      </p>
    `,
      isUrgent ? 'warning' : 'info'
    )}

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">📋 Acciones recomendadas:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Revisa tu inventario físico</li>
        <li style="margin-bottom: 8px;">Contacta a tu proveedor para reposición</li>
        <li style="margin-bottom: 8px;">Considera pausar la publicidad si el stock es crítico</li>
        <li>Actualiza el stock en el sistema si es necesario</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Ver Producto',
        url: data.actionUrl,
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      💡 <strong>Tip:</strong> Configura alertas de stock personalizadas para cada producto desde el panel de administración.
      ${isUrgent ? ' <strong>Este producto necesita atención inmediata.</strong>' : ''}
    </p>
  `

  return createEmailLayout({
    title: `Stock Bajo: ${data.productName} - Busy Streetwear`,
    preheader: `${data.productName} tiene solo ${data.currentStock} ${data.currentStock === 1 ? 'unidad' : 'unidades'} disponibles`,
    content,
  })
}
