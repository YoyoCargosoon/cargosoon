import { mutateAdminState, readAdminState } from '@/services/adminRepository'

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
  const state = readAdminState()
  const routeType = normalize(params.serviceType || params.quoteType)
  const origin = normalize(params.origin)
  const destination = normalize(params.destination)

  const matches = state.priceItems.filter((item) => {
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

  mutateAdminState((draft) => {
    draft.quoteRequests.unshift(requestRecord)
    if (resultRecords.length) {
      draft.quoteResults.unshift(...resultRecords)
    }
    draft.businessEvents.unshift({
      id: `be-${Date.now()}`,
      eventType: 'quote_requested',
      entityType: 'quote_request',
      entityId: requestId,
      userId: requestRecord.userId,
      source: requestRecord.sourceEntry,
      eventTime: createdAt,
      syncStatus: 'synced',
    })
    draft.userEvents.unshift({
      id: `evt-${Date.now()}`,
      userId: requestRecord.userId,
      customerName: requestRecord.customerName,
      eventName: 'quote_search',
      pagePath: requestRecord.sourceEntry === 'ai' ? '/chat' : '/fcl-ddp-freight',
      durationSeconds: 0,
      countryCode: requestRecord.countryCode,
      createdAt,
    })
    draft.stats.quotesToday += 1
    return draft
  })

  return {
    requestRecord,
    resultRecords,
  }
}
