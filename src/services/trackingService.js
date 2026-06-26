import { cargoSoonTrackingRecords, globalTrackingRecords } from './trackingMockData.js'

const GUEST_USAGE_KEY = 'cargosoon_guest_tracking_count'
const GUEST_FREE_LIMIT = 5

export const EMPTY_TRACKING_MESSAGE =
  'We couldn\u2019t find this shipment yet. Please check the number or contact our support team.'

export const TRACKING_LIMIT_MESSAGE =
  'You have used your 5 free guest searches. Log in or create an account to continue tracking.'

export const TRACKING_SOURCE_LABELS = {
  cargosoon_order: 'CargoSoon Order',
  global_express: 'Global Express',
  container: 'Container',
  ocean_bl: 'Ocean B/L',
  air_awb: 'Air AWB',
  partner_order: 'Logistics Order',
}

export const TRACKING_NUMBER_TYPE_LABELS = {
  cargosoon_order: 'CargoSoon order number',
  shipment_number: 'Shipment number',
  customer_reference: 'Customer reference',
  express: 'Express tracking number',
  container: 'Container number',
  ocean_bl: 'Ocean B/L number',
  air_awb: 'Air AWB number',
  partner_order: 'Logistics order ID',
}

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const normalizeTrackingNumber = (value) => value.trim().toUpperCase().replace(/\s+/g, '')

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 520))
const trimSlash = (value = '') => value.replace(/\/+$/, '')
const env = import.meta.env || {}
const TRACKING_API_URL = env.VITE_TRACKING_API_URL || 'https://co-logistics.cn/api/customer/api/tracking/search'

const buildTrackingEvents = (data = {}) => {
  const rawEvents = Array.isArray(data.msg) ? data.msg : Array.isArray(data.track_info) ? data.track_info : []

  return rawEvents
    .map((item, index) => {
      const message = typeof item === 'string' ? item : item?.msg || item?.content || item?.status || ''
      const timestamp = item?.created_data || item?.created_at || item?.time || ''
      if (!message) return null

      return {
        id: `live-track-${timestamp || index}`,
        status: message,
        location: data.city || data.area || data.country || data.end || '',
        timestamp,
        detail: '',
      }
    })
    .filter(Boolean)
}

const mapLiveTrackingResult = (data = {}, trackingNumber = '') => {
  const events = buildTrackingEvents(data)
  const latestStatus = events[0]?.status || 'In transit'
  const destination = [data.country, data.area, data.city].filter(Boolean).join(', ') || data.end || '-'
  const route = [data.start || 'China', destination].filter(Boolean)

  return {
    source: 'cargosoon_order',
    numberType: 'shipment_number',
    displayNumber: data.tracking_no || trackingNumber,
    shipmentNumber: data.tail_no?.[0] || data.tracking_no || trackingNumber,
    customerReference: '',
    origin: data.start || 'China',
    destination,
    route,
    status: latestStatus.toLowerCase().includes('delivered') ? 'delivered' : latestStatus,
    eta: data.eta || '',
    updatedAt: events[0]?.timestamp || data.ata || data.atd || data.put_time || '',
    events,
    orderInfo: {
      trackingNo: data.tracking_no || trackingNumber,
      productName: data.product_name || '-',
      destination,
    },
    cargoInfo: {
      commodity: data.product_name || '-',
      grossWeight: data.weight ? `${data.weight} kg` : '-',
      volume: data.volume ? `${data.volume} CBM` : '-',
      cartons: data.goods_number || '-',
    },
    delivery: {
      address: data.address_one || '-',
      fbaCode: data.fba_code || '-',
      eta: data.eta || '-',
      ata: data.ata || '-',
    },
    customs: {
      etd: data.etd || '-',
      atd: data.atd || '-',
      logisticsCompany: data.logistics_companies || '-',
    },
    documents: [],
  }
}

const readGuestSearchCount = () => {
  if (!isBrowser()) return 0
  const raw = window.localStorage.getItem(GUEST_USAGE_KEY)
  const count = Number(raw)
  return Number.isFinite(count) && count > 0 ? count : 0
}

const writeGuestSearchCount = (count) => {
  if (!isBrowser()) return
  window.localStorage.setItem(GUEST_USAGE_KEY, String(Math.max(0, count)))
}

export const getGuestTrackingUsage = () => {
  const count = readGuestSearchCount()
  return {
    count,
    limit: GUEST_FREE_LIMIT,
    remaining: Math.max(GUEST_FREE_LIMIT - count, 0),
  }
}

export const canGuestSearch = () => getGuestTrackingUsage().remaining > 0

const recordGuestSearch = () => {
  const nextCount = Math.min(readGuestSearchCount() + 1, GUEST_FREE_LIMIT)
  writeGuestSearchCount(nextCount)
  return getGuestTrackingUsage()
}

const matchesRecord = (record, trackingNumber) => {
  const normalized = normalizeTrackingNumber(trackingNumber)
  return record.searchKeys.some((key) => normalizeTrackingNumber(key) === normalized)
}

const cloneResult = (record) => JSON.parse(JSON.stringify(record))

export const searchCargoSoonTracking = async (trackingNumber) => queryCargoSoonInternalApi({ trackingNumber })

export const searchGlobalTracking = async (trackingNumber) => {
  const normalized = normalizeTrackingNumber(trackingNumber)

  if (/^[A-Z]{4}\d{7}$/.test(normalized)) {
    return queryContainerTrackingApi({ trackingNumber })
  }

  if (/^\d{3}-?\d{8}$/.test(normalized)) {
    return queryAirWaybillApi({ trackingNumber })
  }

  const oceanBlRecord = await queryOceanBillOfLadingApi({ trackingNumber })
  if (oceanBlRecord) return oceanBlRecord

  const partnerOrderRecord = await queryPartnerOrderApi({ trackingNumber })
  if (partnerOrderRecord) return partnerOrderRecord

  return queryGlobalExpressApi({ trackingNumber })
}

export const searchTracking = async ({ trackingNumber, isAuthenticated = false }) => {
  const trimmedNumber = trackingNumber.trim()

  if (!trimmedNumber) {
    return {
      status: 'validation_error',
      message: 'Please enter a tracking number.',
      usage: getGuestTrackingUsage(),
    }
  }

  if (!isAuthenticated && !canGuestSearch()) {
    return {
      status: 'limited',
      message: TRACKING_LIMIT_MESSAGE,
      usage: getGuestTrackingUsage(),
    }
  }

  const usage = isAuthenticated ? getGuestTrackingUsage() : recordGuestSearch()

  await mockDelay()

  if (normalizeTrackingNumber(trimmedNumber) === 'ERROR-TRACK-500') {
    return {
      status: 'error',
      message: 'Tracking service is temporarily unavailable. Please try again.',
      usage,
    }
  }

  const cargoSoonResult = await searchCargoSoonTracking(trimmedNumber)
  if (cargoSoonResult) {
    return {
      status: 'found',
      result: cargoSoonResult,
      usage,
    }
  }

  const globalResult = await searchGlobalTracking(trimmedNumber)
  if (globalResult) {
    return {
      status: 'found',
      result: globalResult,
      usage,
    }
  }

  return {
    status: 'empty',
    message: EMPTY_TRACKING_MESSAGE,
    usage,
  }
}

export const queryCargoSoonInternalApi = async ({ trackingNumber }) => {
  const normalized = normalizeTrackingNumber(trackingNumber)

  try {
    const endpoint = `${trimSlash(TRACKING_API_URL)}?tracking_no=${encodeURIComponent(normalized)}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.code === 0 && data?.data?.tracking_no) {
        return mapLiveTrackingResult(data.data, normalized)
      }
    }
  } catch {
    // fall through to local mock records
  }

  const record = cargoSoonTrackingRecords.find((item) => matchesRecord(item, trackingNumber))
  return record ? cloneResult(record) : null
}

export const queryGlobalExpressApi = async ({ trackingNumber }) => {
  const record = globalTrackingRecords.find(
    (item) => item.source === 'global_express' && matchesRecord(item, trackingNumber),
  )
  return record ? cloneResult(record) : null
}

export const queryContainerTrackingApi = async ({ trackingNumber }) => {
  const record = globalTrackingRecords.find(
    (item) => item.source === 'container' && matchesRecord(item, trackingNumber),
  )
  return record ? cloneResult(record) : null
}

export const queryOceanBillOfLadingApi = async ({ trackingNumber }) => {
  const record = globalTrackingRecords.find(
    (item) => item.source === 'ocean_bl' && matchesRecord(item, trackingNumber),
  )
  return record ? cloneResult(record) : null
}

export const queryAirWaybillApi = async ({ trackingNumber }) => {
  const record = globalTrackingRecords.find(
    (item) => item.source === 'air_awb' && matchesRecord(item, trackingNumber),
  )
  return record ? cloneResult(record) : null
}

export const queryPartnerOrderApi = async ({ trackingNumber }) => {
  const record = globalTrackingRecords.find(
    (item) => item.source === 'partner_order' && matchesRecord(item, trackingNumber),
  )
  return record ? cloneResult(record) : null
}
