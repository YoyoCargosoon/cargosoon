import ddpRateCatalog from '@/data/ddpRateCatalog.generated.json'
import fclRateCatalog from '@/data/fclRateCatalog.generated.json'
import fclLocalChargeCatalog from '@/data/fclLocalChargeCatalog.generated.json'

const PRICE_ITEMS = [
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

const EUROPE_MARKETS = new Set([
  'germany',
  'france',
  'italy',
  'spain',
  'netherlands',
  'belgium',
  'poland',
  'portugal',
  'greece',
])

const US_FBA_PREFIX_ZONE = {
  ONT: 'US West (ZIP 8-9)',
  LAX: 'US West (ZIP 8-9)',
  SBD: 'US West (ZIP 8-9)',
  SMF: 'US West (ZIP 8-9)',
  OAK: 'US West (ZIP 8-9)',
  SEA: 'US West (ZIP 8-9)',
  LAS: 'US West (ZIP 8-9)',
  PHX: 'US West (ZIP 8-9)',
  DFW: 'US Central (ZIP 4-7)',
  FTW: 'US Central (ZIP 4-7)',
  HOU: 'US Central (ZIP 4-7)',
  AUS: 'US Central (ZIP 4-7)',
  ORD: 'US Central (ZIP 4-7)',
  STL: 'US Central (ZIP 4-7)',
  MEM: 'US Central (ZIP 4-7)',
  CLT: 'US East (ZIP 0-3)',
  ATL: 'US East (ZIP 0-3)',
  JFK: 'US East (ZIP 0-3)',
  EWR: 'US East (ZIP 0-3)',
  PHL: 'US East (ZIP 0-3)',
  BWI: 'US East (ZIP 0-3)',
  TPA: 'US East (ZIP 0-3)',
  MIA: 'US East (ZIP 0-3)',
}

const CA_POSTAL_ZONE_RULES = [
  { pattern: /^[ABT]/, zone: 'Western Canada' },
  { pattern: /^[V]/, zone: 'Vancouver / BC' },
  { pattern: /^[RS]/, zone: 'Prairie Canada' },
  { pattern: /^[P]/, zone: 'Atlantic Canada' },
  { pattern: /^[KLMN]/, zone: 'Ontario / Quebec' },
  { pattern: /^[XY]/, zone: 'North Canada' },
]

const UK_POSTCODE_ZONE_RULES = [
  { pattern: /^(BT)/, zone: 'Northern Ireland' },
  { pattern: /^(AB|DD|DG|EH|FK|G|HS|IV|KA|KW|KY|ML|PA|PH|TD|ZE)/, zone: 'Scotland' },
  { pattern: /^(CF|LD|LL|NP|SA|SY)/, zone: 'Wales' },
  { pattern: /^(B|CV|DE|DY|HR|LE|NG|NN|PE|ST|TF|WS)/, zone: 'England Midlands' },
  { pattern: /^(E|EC|EN|HA|IG|N|NW|RM|SE|SM|SW|TW|UB|W|WC|WD)/, zone: 'London / South East' },
]

const EUROPE_POSTCODE_ZONE_RULES = [
  { country: 'germany', pattern: /^\d{5}$/, zone: 'Germany Postal Zone' },
  { country: 'france', pattern: /^\d{5}$/, zone: 'France Postal Zone' },
  { country: 'italy', pattern: /^\d{5}$/, zone: 'Italy Postal Zone' },
  { country: 'spain', pattern: /^\d{5}$/, zone: 'Spain Postal Zone' },
  { country: 'netherlands', pattern: /^\d{4}\s?[a-z]{2}$/i, zone: 'Netherlands Postal Zone' },
  { country: 'belgium', pattern: /^\d{4}$/, zone: 'Belgium Postal Zone' },
  { country: 'poland', pattern: /^\d{2}-\d{3}$/, zone: 'Poland Postal Zone' },
  { country: 'portugal', pattern: /^\d{4}-\d{3}$/, zone: 'Portugal Postal Zone' },
  { country: 'greece', pattern: /^\d{3}\s?\d{2}$/, zone: 'Greece Postal Zone' },
]

const normalize = (value) => String(value || '').trim().toLowerCase()

const normalizePortLabel = (value) =>
  normalize(value)
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')

const buildFinalPrice = (priceItem) =>
  Number(priceItem.basePrice || 0) +
  Number(priceItem.taxPrice || 0) +
  Number(priceItem.remoteAreaFee || 0) +
  Number(priceItem.otherSurchargeAmount || 0)

const extractWeightKg = (value) => {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

const createTimestamp = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const extractUsZipPrefix = (text) => {
  const match = String(text || '').match(/\b(\d{5})\b/)
  if (!match) return ''
  const first = match[1][0]
  if ('0123'.includes(first)) return 'US East (ZIP 0-3)'
  if ('4567'.includes(first)) return 'US Central (ZIP 4-7)'
  if ('89'.includes(first)) return 'US West (ZIP 8-9)'
  return ''
}

const extractCanadaPostalZone = (text) => {
  const match = String(text || '').toUpperCase().match(/\b([A-Z])\d[A-Z]\s?\d[A-Z]\d\b/)
  if (!match) return ''
  return CA_POSTAL_ZONE_RULES.find((item) => item.pattern.test(match[1]))?.zone || ''
}

const extractWarehouseZone = (warehouseCode) => {
  const normalized = String(warehouseCode || '').trim().toUpperCase()
  const prefix = normalized.slice(0, 3)
  return US_FBA_PREFIX_ZONE[prefix] || normalized || ''
}

const extractUkPostalZone = (text) => {
  const cleaned = String(text || '').trim().toUpperCase()
  const match = cleaned.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/)
  if (!match) return ''
  return UK_POSTCODE_ZONE_RULES.find((item) => item.pattern.test(match[1]))?.zone || 'United Kingdom Postal Zone'
}

const extractEuropePostalZone = (text, marketCandidates) => {
  const cleaned = String(text || '').trim()
  for (const rule of EUROPE_POSTCODE_ZONE_RULES) {
    if (!marketCandidates.includes(rule.country)) continue
    const zipMatch = cleaned.match(/\b([A-Z0-9- ]{4,10})\b/i)
    if (zipMatch && rule.pattern.test(zipMatch[1].trim())) return rule.zone
  }
  return ''
}

const extractZipCode = (text) => {
  const cleaned = String(text || '').trim()
  const patterns = [
    /\b\d{5}(?:-\d{4})?\b/,
    /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i,
    /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i,
    /\b\d{2}-\d{3}\b/,
    /\b\d{4}\s?[A-Z]{2}\b/i,
    /\b\d{4}-\d{3}\b/,
    /\b\d{3}\s?\d{2}\b/,
    /\b\d{4,6}\b/,
  ]
  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) return match[0].toUpperCase()
  }
  return ''
}

const resolveMarketCandidates = ({ destination, warehouseCode, marketHint }) => {
  const text = normalize([destination, warehouseCode, marketHint].filter(Boolean).join(' '))
  const markets = new Set()

  if (text.includes('united states') || text.includes(' usa') || text.includes(' us') || /\b\d{5}\b/.test(text)) {
    markets.add('united states')
  }
  if (text.includes('canada') || /\b[a-z]\d[a-z]\s?\d[a-z]\d\b/i.test(text)) {
    markets.add('canada')
  }
  if (text.includes('united kingdom') || text.includes(' uk')) {
    markets.add('united kingdom')
  }
  if (text.includes('united arab emirates') || text.includes('uae') || text.includes('dubai') || text.includes('abu dhabi')) {
    markets.add('united arab emirates')
  }
  if (text.includes('australia')) {
    markets.add('australia')
  }
  if (text.includes('saudi')) {
    markets.add('saudi arabia')
  }
  if (text.includes('oman')) {
    markets.add('oman')
  }
  if (text.includes('bahrain')) {
    markets.add('bahrain')
  }

  for (const market of EUROPE_MARKETS) {
    if (text.includes(market)) {
      markets.add(market)
      markets.add('europe')
    }
  }

  if (!markets.size && marketHint) {
    markets.add(normalize(marketHint))
  }

  return Array.from(markets)
}

const isWeightMatched = (item, weightKg) => {
  if (weightKg == null) return true
  const min = item.min_weight_kg
  const max = item.max_weight_kg
  if (min != null && weightKg < min) return false
  if (max != null && weightKg > max) return false
  return true
}

const getWeightFitScore = (item, weightKg) => {
  if (weightKg == null) return 0
  if (!isWeightMatched(item, weightKg)) return -100
  const min = item.min_weight_kg ?? weightKg
  const max = item.max_weight_kg ?? weightKg
  const span = Math.max(1, max - min)
  return 20 - Math.min(18, Math.abs(weightKg - min) + span / 10)
}

const getZoneSignals = ({ destination, warehouseCode }) => {
  const text = String(destination || '')
  const marketCandidates = resolveMarketCandidates({
    destination,
    warehouseCode,
    marketHint: '',
  })
  return [
    extractUsZipPrefix(text),
    extractCanadaPostalZone(text),
    extractUkPostalZone(text),
    extractEuropePostalZone(text, marketCandidates),
    extractWarehouseZone(warehouseCode),
    extractZipCode(text),
    String(warehouseCode || '').trim().toUpperCase(),
  ].filter(Boolean)
}

const findFclLocalChargeRecord = (item) => {
  const itemOriginPort = normalizePortLabel(item.origin_port)
  const itemOriginLabel = normalizePortLabel(item.origin_label)

  return (
    fclLocalChargeCatalog.records.find((record) => {
      const recordOriginPort = normalizePortLabel(record.origin_port)
      const recordOriginLabel = normalizePortLabel(record.origin_label)
      return recordOriginPort === itemOriginPort || recordOriginLabel === itemOriginLabel
    }) || null
  )
}

const getFclLocalChargeAmount = (record, containerType) => {
  if (!record || !containerType) return 0
  return Number(record.container_fees?.[containerType] || 0)
}

const buildFclPricingDetail = ({ item, localChargeRecord, localChargeAmount }) => {
  const freightPart = `Ocean freight ${item.currency} ${item.base_price} / ${item.container_type}`
  if (!localChargeRecord || !localChargeAmount) {
    return `${item.origin_label} -> ${item.destination_label} | ${freightPart} | Local charges pending verification`
  }

  return `${item.origin_label} -> ${item.destination_label} | ${freightPart} + local charges ${item.currency} ${localChargeAmount} / ${item.container_type} | Source: ${localChargeRecord.source_name}`
}

const scoreDdpMatch = (item, context) => {
  const itemMarket = normalize(item.market)
  const itemZone = normalize(item.zone)
  const itemChannel = normalize(item.channel_name)
  const destinationText = normalize(context.destination)
  const zoneSignals = context.zoneSignals.map(normalize)

  let score = 0

  if (context.serviceModeKey && normalize(item.service_mode) === context.serviceModeKey) score += 45
  if (context.marketCandidates.includes(itemMarket)) score += 35
  if (zoneSignals.includes(itemZone)) score += 45
  if (context.zipCode && itemZone && normalize(itemZone).includes(normalize(context.zipCode))) score += 35
  if (destinationText && itemZone && destinationText.includes(itemZone)) score += 25
  if (destinationText && itemZone && itemZone.includes(destinationText)) score += 25
  if (context.warehouseCode && itemChannel && itemChannel.includes(normalize(context.warehouseCode).slice(0, 3))) score += 15
  score += getWeightFitScore(item, context.weightKg)

  return score
}

export const quoteByUnifiedEngine = (params) => {
  const routeType = normalize(params.serviceType || params.quoteType)
  const origin = normalize(params.origin)
  const destination = normalize(params.destination)
  const weightKg = extractWeightKg(params.weightVolume)
  const serviceModeKey = normalize(params.serviceModeKey)
  const marketCandidates = resolveMarketCandidates({
    destination: params.destination,
    warehouseCode: params.warehouseCode,
    marketHint: params.market,
  })
  const zoneSignals = getZoneSignals({
    destination: params.destination,
    warehouseCode: params.warehouseCode,
  })

  const matches = PRICE_ITEMS.filter((item) => {
    const sameType = normalize(item.routeType) === routeType
    const sameOrigin = !origin || normalize(item.origin).includes(origin)
    const sameDestination = !destination || normalize(item.destination).includes(destination)
    return sameType && sameOrigin && sameDestination
  })

  const fclMatches =
    routeType === 'fcl'
      ? fclRateCatalog.rates.filter((item) => {
          const sameOrigin =
            !origin ||
            normalize(item.origin_label).includes(origin) ||
            normalize(item.origin_port).includes(origin)
          const sameDestination =
            !destination ||
            normalize(item.destination_label).includes(destination) ||
            normalize(item.destination_port).includes(destination)
          const sameContainer =
            !params.containerType ||
            normalize(item.container_type) === normalize(params.containerType)
          return sameOrigin && sameDestination && sameContainer
        })
      : []

  const ddpContext = {
    destination,
    serviceModeKey,
    marketCandidates,
    weightKg,
    warehouseCode: params.warehouseCode,
    zoneSignals,
    zipCode: params.zipCode || '',
  }

  const ddpMatches =
    routeType === 'ddp'
      ? ddpRateCatalog.records
          .filter((item) => {
            const itemMarket = normalize(item.market)
            const itemZone = normalize(item.zone)
            const sameMode = !serviceModeKey || normalize(item.service_mode) === serviceModeKey
            const sameMarket = !marketCandidates.length || marketCandidates.includes(itemMarket)
            const sameZone = !zoneSignals.length || zoneSignals.some((zone) => normalize(zone) === itemZone)
            const sameDestination =
              !destination ||
              destination.includes(itemMarket) ||
              destination.includes(itemZone) ||
              itemZone.includes(destination)
            const zipBoostMatch = params.zipCode && itemZone && normalize(itemZone).includes(normalize(params.zipCode))
            return sameMode && sameMarket && (sameZone || sameDestination || zipBoostMatch) && isWeightMatched(item, weightKg)
          })
          .sort((left, right) => scoreDdpMatch(right, ddpContext) - scoreDdpMatch(left, ddpContext))
      : []

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

  const standardResults = matches.map((item, index) => ({
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

  const fclResults = fclMatches.map((item, index) => {
    const localChargeRecord = findFclLocalChargeRecord(item)
    const localChargeAmount = getFclLocalChargeAmount(localChargeRecord, item.container_type)
    const finalPrice = Number(item.base_price || 0) + localChargeAmount

    return {
      id: `quote-fcl-result-${Date.now()}-${index + 1}`,
      quoteRequestId: requestId,
      supplierName: item.source_file.replace('.xlsx', ''),
      standardChannelName: `${item.carrier} / ${item.container_type}`,
      finalPrice,
      currency: item.currency,
      transitDays: 'Based on carrier schedule',
      pricingDetail: buildFclPricingDetail({ item, localChargeRecord, localChargeAmount }),
      matchStatus: 'matched',
      createdAt,
      originLabel: item.origin_label,
      destinationLabel: item.destination_label,
      carrier: item.carrier,
      containerType: item.container_type,
      priceUnit: item.container_type,
      localChargeAmount,
      localChargeCurrency: localChargeRecord?.currency || item.currency,
      localChargeSource: localChargeRecord?.source_name || '',
      localChargeStatus: localChargeRecord?.source_status || 'not_found',
    }
  })

  const ddpResults = ddpMatches.map((item, index) => ({
    id: `quote-ddp-result-${Date.now()}-${index + 1}`,
    quoteRequestId: requestId,
    supplierName: item.source_file.replace('.xlsx', ''),
    standardChannelName: `${item.channel_name || item.service_mode} / ${item.band_label}`,
    finalPrice: item.price,
    currency: item.currency,
    transitDays: item.transit || 'Based on selected channel',
    pricingDetail: `${item.market} / ${item.zone} / ${item.service_mode} / ${item.band_label}`,
    matchStatus: 'matched',
    createdAt,
    originLabel: params.origin || 'China',
    destinationLabel: params.destination || item.market,
    market: item.market,
    zone: item.zone,
    bandLabel: item.band_label,
    channelName: item.channel_name || item.service_mode,
  }))

  return {
    requestRecord,
    resultRecords: [...fclResults, ...ddpResults, ...standardResults],
  }
}
