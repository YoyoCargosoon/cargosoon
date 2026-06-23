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
