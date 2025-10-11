// =====================================================
// EMAIL SYSTEM - MAIN EXPORTS
// Sistema completo de emails para Busy Streetwear
// =====================================================

// Core functionality
export {
  sendEmail,
  sendAdminEmail,
  sendTestEmail,
  isEmailEnabledForType,
  getEmailStats,
  getAdminEmail,
} from './send'

// Resend client
export { getResendClient, getEmailConfig, isEmailConfigured } from './resend'

// Integration hooks
export {
  handleNotificationEmail,
  sendNewOrderEmail,
  sendPendingTransferEmail,
  sendArtistSubmissionEmail,
  sendLowStockEmail,
  sendOrderCancelledEmail,
} from './hooks'

// Templates (if you need to use them directly)
export { createNewOrderEmail } from './templates/new-order'
export { createPendingTransferEmail } from './templates/pending-transfer'
export { createArtistSubmissionEmail } from './templates/artist-submission'
export { createLowStockEmail } from './templates/low-stock'
export { createOrderCancelledEmail } from './templates/order-cancelled'
export { createNewsletterWelcomeEmail } from './templates/newsletter-welcome'
export { createTestEmail } from './templates/test'

// Base template utilities
export { createEmailLayout, createButton, createInfoBox, createBadge, BUSY_COLORS } from './templates/base'
