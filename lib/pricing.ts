// ============================================================
// PRICING CONFIGURATION
// 基本方案：每台含 3-4 天活動（未稅）
// 超過 4 天 → 聯繫業務報價
// ============================================================

export const RATES = {
  perUnit: {
    single: 15000,  // 單面/兩折機 每台（含3-4天）
    triple: 18000,  // 三折雙面機 每台（含3-4天）
  },
  setup: 0,         // PLACEHOLDER: 設定協助費
  shipping: 0,      // PLACEHOLDER: 單趟運費
  maxDays: 4,       // 超過此天數須聯繫業務
} as const

export type ProductType = 'single' | 'triple'

export function calculateTotal({
  productType,
  quantity,
  days,
  addSetup,
  includeShipping = true,
}: {
  productType: ProductType
  quantity: number
  days: number
  addSetup: boolean
  includeShipping?: boolean
}) {
  const unitRate = RATES.perUnit[productType]
  const rentalFee = unitRate * quantity  // 基本方案不乘天數
  const setupFee = addSetup ? RATES.setup : 0
  const shippingFee = includeShipping ? RATES.shipping * 2 : 0
  const total = rentalFee + setupFee + shippingFee
  const needsQuote = days > RATES.maxDays

  return { rentalFee, setupFee, shippingFee, total, unitRate, needsQuote }
}
