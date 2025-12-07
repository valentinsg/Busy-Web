/**
 * @fileoverview Barrel exports para todos los tipos del proyecto
 * @module types
 *
 * Importar tipos desde aquí:
 * ```ts
 * import type { Product, CartItem, Order } from '@/types'
 * ```
 */

// ============================================
// PRODUCTO Y CATÁLOGO
// ============================================
export type {
  BenefitItem,
  FilterOptions, Product,
  SizeMeasurement
} from './product'

// ============================================
// CARRITO
// ============================================
export type { CartItem } from './cart'

// ============================================
// PROMOCIONES Y DESCUENTOS
// ============================================
export type {
  AppliedPromo, BundleConfig, ComboConfig, FixedAmountConfig, NthUnitDiscountConfig, NxMConfig,
  PercentageOffConfig, PromoConfig, PromoType,
  Promotion
} from './promotion'

// ============================================
// CUPONES
// ============================================
export type { Coupon } from './coupon'

// ============================================
// COMERCIO (Órdenes, Clientes, Proveedores)
// ============================================
export type {
  Customer,
  CustomerStats, Expense, Order,
  OrderItem, ProductPopularity, ProductSupplier, ProductView,
  RelatedProduct,
  Supplier, SupplierPurchase,
  SupplierPurchaseItem
} from './commerce'

// ============================================
// AUTORES
// ============================================
export type { Author } from './author'

// ============================================
// SUSCRIPTORES
// ============================================
export type { Subscriber } from './subscriber'

// ============================================
// BLOG
// ============================================
export type { BlogPost } from './blog'

// ============================================
// PLAYLISTS Y ARTISTAS
// ============================================
export type { ArtistSubmission, Playlist } from './playlists'

// ============================================
// ARCHIVE (Galería)
// ============================================
export type {
  AdminArchiveStats, ArchiveEntry,
  ArchiveFilters, ArchiveStats, FilmStripSettings, PaginatedResponse, PlaylistItem, RecommendationOptions, RecommendationScore, ShareCardOptions, TimelineEntry,
  TimelineGroup, UploadResponse, VibesModeSettings
} from './archive'

// ============================================
// BLACKTOP (Torneos)
// ============================================
export type {
  FixturesResponse, Group, Match, MatchFormData, MatchPhase, MatchRound, MatchStatus, MatchWithTeams, Player, PlayerMatchStats, PlayerProfile, PlayerStatsFormData, PlayerWithStats, PlayoffFormat, StandingsRow, Team, TeamLeaderboard, TeamMatchStats, TeamRegistrationFormData, TeamStatus, TeamWithPlayers, Tournament, TournamentFormData, TournamentFormatConfig, TournamentFormatType, TournamentLeaderboard, TournamentMedia, TournamentMediaFormData, TournamentStatus, TournamentWithStats
} from './blacktop'

// ============================================
// SCRIPTS (Guiones)
// ============================================
export type {
  AssetKind, PlatformChecklist, Script, ScriptAsset, ScriptComment, ScriptFrontmatter, ScriptPlatform, ScriptProject, ScriptScene, ScriptSearchFilters,
  ScriptSearchResult, ScriptStatus, ScriptTemplate, ScriptVersion, ShotType, ShotlistRow, ValidationResult
} from './scripts'

// ============================================
// POPOVERS
// ============================================
export type { Popover, PopoverType } from './popover'

// ============================================
// EMAIL
// ============================================
export type {
  ArtistSubmissionEmailData, EmailConfig, EmailLogEntry, EmailSendResult, EmailTemplate, LowStockEmailData, NewOrderEmailData, NewsletterWelcomeEmailData, OrderCancelledEmailData, PendingTransferEmailData, TestEmailData
} from './email'

// ============================================
// NOTIFICACIONES
// ============================================
export type {
  Notification, NotificationChannel, NotificationLog, NotificationPreference, NotificationPriority, NotificationStatus, NotificationType, PushNotificationPayload, PushSubscription
} from './notifications'

// ============================================
// CALCULADORA DE TALLES
// ============================================
export type {
  BodyType, CalculatorResult, FitPreference, ProductMeasurements,
  SizeRecommendation, UserMeasurements
} from './size-calculator'

