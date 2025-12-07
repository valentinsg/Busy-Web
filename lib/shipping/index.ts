/**
 * Shipping Module
 * Exports all shipping-related functionality
 */

export { generateAutoLabel, isAutoLabelEnabled } from "./auto-label"
export {
    PROVINCE_RATES, calculateShippingByProvince,
    findProvinceRate,
    getShippingOptionsByProvince,
    normalizeProvince
} from "./rates-by-province"
export {
    DEFAULT_WEIGHTS,
    calculateTotalWeight,
    formatWeight,
    getDefaultWeightByCategory,
    getProductWeight,
    getWeightCategoryLabel
} from "./weights"

