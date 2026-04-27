// ============================================================
// PRICING CONFIGURATION
// 基本方案：每台含活動天數（未稅）
// 超過 5 天 → 聯繫業務報價
// 設定協助：半天 3000/整天 4500（每人，未稅）
//   1~5 台建議 1 人；6~10 台建議 2 人
// ============================================================

export const RATES = {
  perUnit: {
    single: 15000,  // 單面/兩折機 每台
    triple: 18000,  // 三折雙面機 每台
  },
  setup: {
    halfDay: 3000,  // 每人半天（未稅）
    fullDay: 4500,  // 每人整天（未稅）
  },
  shipping: 0,      // PLACEHOLDER: 單趟運費
  nightSurcharge: 2000, // 夜間撤場加成（17:00-22:00），每台未稅
  maxDays: 5,       // 超過此天數須聯繫業務
} as const

export type ProductType = 'single' | 'triple'
export type SetupOption = 'none' | 'half' | 'full'

export function getSetupPersons(quantity: number): number {
  return quantity <= 5 ? 1 : 2
}

export function getSetupFee(setupOption: SetupOption, quantity: number): number {
  if (setupOption === 'none') return 0
  const persons = getSetupPersons(quantity)
  return persons * (setupOption === 'half' ? RATES.setup.halfDay : RATES.setup.fullDay)
}

export function calculateTotal({
  productType,
  quantity,
  days,
  setupOption = 'none',
  includeShipping = true,
}: {
  productType: ProductType
  quantity: number
  days: number
  setupOption?: SetupOption
  includeShipping?: boolean
}) {
  const unitRate = RATES.perUnit[productType]
  const rentalFee = unitRate * quantity
  const setupFee = getSetupFee(setupOption, quantity)
  const shippingFee = includeShipping ? RATES.shipping * 2 : 0
  const total = rentalFee + setupFee + shippingFee
  const needsQuote = days > RATES.maxDays

  return { rentalFee, setupFee, shippingFee, total, unitRate, needsQuote }
}
