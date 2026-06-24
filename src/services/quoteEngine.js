const PRICE_ITEMS = [
  {
    supplierName: 'YTHQ Logistics',
    standardChannelName: 'US West Matson Fast',
    routeType: 'fcl',
    origin: 'Shenzhen',
    destination: 'Los Angeles',
    currency: 'USD',
    basePrice: 3280,
    taxPrice: 0,
    remoteAreaFee: 0,
    otherSurchargeLabel: 'Peak season',
    otherSurchargeAmount: 120,
    transitDays: '18-22 days',
  },
  {
    supplierName: 'RN Freight',
    standardChannelName: 'US West Matson Fast',
    routeType: 'fcl',
    origin: 'Ningbo',
    destination: 'New York',
    currency: 'USD',
    basePrice: 4620,
    taxPrice: 0,
    remoteAreaFee: 0,
    otherSurchargeLabel: 'Port congestion',
    otherSurchargeAmount: 160,
    transitDays: '24-31 days',
  },
  {
    supplierName: 'YTHQ Logistics',
    standardChannelName: 'US DDP Standard Truck',
    routeType: 'ddp',
    origin: 'Guangzhou',
    destination: 'Dallas',
    currency: 'USD',
    basePrice: 6.4,
    taxPrice: 0.8,
    remoteAreaFee: 0.6,
    otherSurchargeLabel: 'Fuel',
    otherSurchargeAmount: 0.3,
    transitDays: '16-22 days',
  },
]

const normalize = (value) => String(value || '').trim().toLowerCase()

const buildFinalPrice = (priceItem) =>
  Number(priceItem.basePrice || 0) +
  Number(priceItem.taxPrice || 0) +
  Number(priceItem.remoteAreaFee || 0) +
  Number(priceItem.otherSurchargeAmount || 0)

const createTimestamp = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export const quoteByUnifiedEngine = (params) => {
  const routeType = normalize(params.serviceType || params.quoteType)
  const origin = normalize(params.origin)
  const destination = normalize(params.destination)

  const matches = PRICE_ITEMS.filter((item) => {
    const sameType = normalize(item.routeType) === routeType
    const sameOrigin = !origin || normalize(item.origin).includes(origin)
    const sameDestination = !destination || normalize(item.destination).includes(destination)
    return sameType && sameOrigin && sameDestination
  })

  const requestId = `quote-request-${Date.now()}`
  const createdAt = createTimestamp()
  const requestRecord = {
    id: requestId,
    userId: params.userId || 'guest-user',
    customerName: params.customerName || 'Guest',
    countryCode: params.countryCode || 'US',
    sourceEntry: params.sourceEntry || 'fcl_page',
    sourceModule: params.sourceModule || 'quote-page',
    quoteType: String(params.quoteType || params.serviceType || '').toUpperCase(),
    origin: params.origin || '',
    destination: params.destination || '',
    cargoType: params.cargoType || '',
    weightVolume: params.weightVolume || '',
    containerType: params.containerType || '',
    warehouseCode: params.warehouseCode || '',
    taxRequirement: params.taxRequirement || 'standard',
    queryText: params.queryText || '',
    createdAt,
  }

  const resultRecords = matches.map((item, index) => ({
    id: `quote-result-${Date.now()}-${index + 1}`,
    quoteRequestId: requestId,
    supplierName: item.supplierName,
    standardChannelName: item.standardChannelName,
    finalPrice: buildFinalPrice(item),
    currency: item.currency,
    transitDays: item.transitDays,
    pricingDetail: `${item.basePrice} + ${item.taxPrice || 0} tax + ${item.remoteAreaFee || 0} remote + ${item.otherSurchargeAmount || 0} ${item.otherSurchargeLabel || 'surcharge'}`,
    matchStatus: 'matched',
    createdAt,
  }))

  return {
    requestRecord,
    resultRecords,
  }
}
