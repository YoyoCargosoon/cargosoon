const appBase = import.meta.env?.BASE_URL || '/'
const withBase = (path) => `${appBase.replace(/\/+$/, '')}${path}`

const AI_STORAGE_HINTS = {
  booking: '/order/shippingOrder',
  tracking: withBase('/track'),
  sourcing: 'https://codropshipping.com/',
  warehouse: '/warehouse/SKUManagement',
}

const MOCK_DELAY = 650

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const trimSlash = (value) => value.replace(/\/+$/, '')

const getAiEndpoint = () => {
  const env = import.meta.env || {}
  const aiUrl = env.VITE_AI_API_URL
  if (aiUrl) return aiUrl

  const apiBase = env.VITE_API_BASE_URL
  if (apiBase) return `${trimSlash(apiBase)}/ai/chat`

  return ''
}

const normalizeText = (text = '') => text.trim()

const lowerText = (text = '') => text.toLowerCase()

const hasAny = (text, terms) => terms.some((term) => text.includes(term))

const DESTINATION_RATE_PROFILES = [
  {
    match: /\buk\b|united kingdom|england|london|manchester|birmingham/,
    label: 'UK',
    sea: 'Sea DDP / Amazon FBA delivery: about USD 1.80-3.20/kg for 100kg+ cargo',
    air: 'Air DDP / express-style delivery: about USD 5.80-9.50/kg for small or urgent cargo',
    seaRange: [1.8, 3.2],
    airRange: [5.8, 9.5],
    transit: 'Typical transit: sea 35-45 days, air 7-12 days after departure',
  },
  {
    match: /\busa\b|united states|america|los angeles|new york|dallas|new jersey|california/,
    label: 'USA',
    sea: 'Sea DDP / Amazon FBA delivery: about USD 1.50-2.80/kg for 100kg+ cargo',
    air: 'Air DDP / express-style delivery: about USD 5.50-9.00/kg for small or urgent cargo',
    seaRange: [1.5, 2.8],
    airRange: [5.5, 9],
    transit: 'Typical transit: sea 25-40 days, air 6-12 days after departure',
  },
  {
    match: /germany|france|italy|spain|poland|netherlands|europe|eu\b/,
    label: 'Europe',
    sea: 'Sea / rail DDP delivery: about USD 1.70-3.40/kg for 100kg+ cargo',
    air: 'Air DDP / express-style delivery: about USD 5.80-10.00/kg for small or urgent cargo',
    seaRange: [1.7, 3.4],
    airRange: [5.8, 10],
    transit: 'Typical transit: sea or rail 30-45 days, air 7-12 days after departure',
  },
  {
    match: /canada|toronto|vancouver/,
    label: 'Canada',
    sea: 'Sea DDP delivery: about USD 1.80-3.50/kg for 100kg+ cargo',
    air: 'Air DDP / express-style delivery: about USD 6.00-10.50/kg for small or urgent cargo',
    seaRange: [1.8, 3.5],
    airRange: [6, 10.5],
    transit: 'Typical transit: sea 30-45 days, air 7-12 days after departure',
  },
]

const getDestinationRateProfile = (message) => {
  const text = lowerText(message)
  return DESTINATION_RATE_PROFILES.find((item) => item.match.test(text)) || {
    label: 'the destination',
    sea: 'Sea DDP delivery: usually quoted per kg or per CBM after cargo details are confirmed',
    air: 'Air DDP / express-style delivery: usually quoted per kg after cargo details are confirmed',
    transit: 'Transit time depends on origin, destination, customs, and delivery type',
  }
}

const extractWeightKg = (message) => {
  const match = message.match(/\b(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|lb|lbs|ton|tons)\b/i)
  if (!match) return 0

  const value = Number(match[1])
  const unit = match[2].toLowerCase()
  if (['lb', 'lbs'].includes(unit)) return value * 0.453592
  if (['ton', 'tons'].includes(unit)) return value * 1000
  return value
}

const detectRateMode = (message) => {
  const text = lowerText(message)
  if (/\bair\b|express/.test(text)) return 'air'
  if (/\bsea\b|ocean|ddp|lcl|fcl/.test(text)) return 'sea'
  return ''
}

const formatUsd = (value) => {
  return `USD ${Math.round(value).toLocaleString('en-US')}`
}

const buildEstimatedTotalPrice = (message) => {
  const profile = getDestinationRateProfile(message)
  const weightKg = extractWeightKg(message)
  const mode = detectRateMode(message)

  if (!weightKg || !mode) return null

  const range = mode === 'air' ? profile.airRange : profile.seaRange
  if (!range) return null

  const [minRate, maxRate] = range
  const minTotal = weightKg * minRate
  const maxTotal = weightKg * maxRate
  const modeLabel = mode === 'air' ? 'air' : 'sea'

  return {
    weightKg: Math.round(weightKg),
    mode,
    modeLabel,
    minTotal,
    maxTotal,
    text: `Estimated total price for ${Math.round(weightKg)}kg by ${modeLabel}: ${formatUsd(minTotal)}-${formatUsd(maxTotal)}.`,
  }
}

const extractTransitByMode = (transitText, mode) => {
  if (!transitText || !mode) return ''
  if (mode === 'air') return transitText.match(/air\s+([^,.\n]+)/i)?.[1]?.trim() || ''
  return transitText.match(/sea(?:\s+or\s+rail)?\s+([^,.\n]+)/i)?.[1]?.trim() || ''
}

const buildQuoteGuidance = (message) => {
  const profile = getDestinationRateProfile(message)
  const estimate = buildEstimatedTotalPrice(message)
  const mode = estimate?.mode || detectRateMode(message)

  if (!estimate || !mode) return ''

  const bestOption = mode === 'air' ? 'Air DDP' : 'Sea DDP'
  const bestReason = mode === 'air'
    ? 'faster transit for urgent delivery'
    : 'better landed cost for this shipment size'
  const transitWindow = extractTransitByMode(profile.transit, mode)
  const transitLine = transitWindow ? `Estimated transit time: ${transitWindow} after departure.` : ''

  return [
    'Quote direction:',
    `- Best option: ${bestOption}`,
    `- Estimated total: ${formatUsd(estimate.minTotal)}-${formatUsd(estimate.maxTotal)}`,
    transitLine ? `- ${transitLine}` : '',
    `- Why: ${bestReason}`,
  ].filter(Boolean).join('\n')
}

const buildFinalQuoteChecklist = (message, missingItems) => {
  const isAmazonFba = /\bfba\b|amazon fba/i.test(message)
  const lines = ['Final quote requires:']

  missingItems.forEach((item) => {
    lines.push(`- ${item}`)
  })

  if (isAmazonFba) {
    lines.push('- Amazon FBA warehouse code')
    lines.push('- final delivery postcode if available')
    lines.push('- carton count and carton dimensions / CBM')
  } else {
    lines.push('- final delivery postcode if door delivery is needed')
  }

  return lines.join('\n')
}

const getTrackingNumber = (text) => {
  const upper = text.toUpperCase()
  const container = upper.match(/\b[A-Z]{4}\d{7}\b/)
  if (container) return container[0]

  const awb = upper.match(/\b\d{3}-?\d{8}\b/)
  if (awb) return awb[0]

  const explicit = upper.match(/\b(?:TRACKING|CONTAINER|AWB|B\/L|BL|BILL OF LADING)\s*(?:NO\.?|NUMBER|#|:)?\s*([A-Z0-9-]{8,28})\b/)
  if (explicit) return explicit[1]

  const compact = upper.match(/\b[A-Z0-9]{10,24}\b/)
  return compact?.[0] || ''
}

const shipmentFacts = (text) => {
  const value = lowerText(text)

  return {
    hasOrigin: /\bfrom\b|shenzhen|guangzhou|ningbo|yiwu|xiamen|qingdao|shanghai|china/.test(value),
    hasDestination: /\bto\b|usa|united states|america|los angeles|new york|dallas|canada|uk|germany|france|poland|europe|australia|sydney|japan|uae/.test(value),
    hasCargo: /product|goods|cargo|commodity|clothes|apparel|electronics|furniture|shoes|bags|machine|battery|cosmetic|toy|textile|led|parts|carton|pallet|box|package|amazon fba|fba/.test(value),
    hasMeasure: /\b\d+(?:\.\d+)?\s*(kg|kgs|kilogram|kilograms|lb|lbs|ton|tons|cbm|m3|cubic|carton|cartons|ctns|pallet|pallets|box|boxes)\b|20gp|40gp|40hq|lcl|fcl/.test(value),
    hasMethod: /sea|ocean|air|express|ddp|ddu|door|delivery|fcl|lcl|truck|rail|amazon fba|fba/.test(value),
  }
}

export const detectAiIntent = (message = '') => {
  const text = lowerText(message)
  const compact = normalizeText(message)
  const trackingNumber = getTrackingNumber(message)

  if (!compact) return 'missing_info'

  if (
    trackingNumber &&
    (hasAny(text, ['track', 'tracking', 'container', 'awb', 'bill of lading', 'b/l', 'shipment status']) || compact.split(/\s+/).length <= 3)
  ) {
    return 'tracking'
  }

  if (hasAny(text, ['1688', 'alibaba', 'sourcing', 'supplier', 'purchase', 'buy from china', 'inspection'])) {
    return 'sourcing_1688'
  }

  if (hasAny(text, ['warehouse', 'storage', 'store my goods', 'repack', 'relabel', 'labeling', 'inspection', 'consolidate', 'combine cartons'])) {
    return 'warehouse'
  }

  if (hasAny(text, ['booking', 'book ', 'book a shipment', 'reserve', 'online order', 'start booking', 'ship now'])) {
    return 'booking'
  }

  const quoteTerms = ['quote', 'rate', 'price', 'cost', 'freight', 'ddp', 'ddu', 'fcl', 'lcl', 'sea', 'ocean', 'air freight', 'shipping rate', 'amazon fba', 'fba', 'delivery to', 'door delivery']
  if (hasAny(text, quoteTerms)) {
    const facts = shipmentFacts(message)
    if (hasAny(text, ['i need shipping', 'need shipping', 'ship goods']) && !facts.hasDestination && !facts.hasMeasure) {
      return 'missing_info'
    }
    return 'freight_quote'
  }

  if (hasAny(text, ['shipping', 'customs', 'delivery', 'transit time', 'import', 'export', 'amazon fba', 'door to door'])) {
    const facts = shipmentFacts(message)
    if (!facts.hasDestination && !facts.hasCargo && !facts.hasMeasure) return 'missing_info'
    return 'general_shipping'
  }

  return 'missing_info'
}

const buildMissingInfoList = (message) => {
  const facts = shipmentFacts(message)
  const missing = []

  if (!facts.hasOrigin) missing.push('pickup city or supplier location in China')
  if (!facts.hasDestination) missing.push('destination country/city or Amazon FBA warehouse')
  if (!facts.hasCargo) missing.push('cargo name')
  if (!facts.hasMeasure) missing.push('weight, volume, cartons, pallets, or container size')
  if (!facts.hasMethod) missing.push('preferred shipping method, such as sea, air, express, DDP, or port-to-port')

  return missing
}

const extractLineValue = (message, label) => {
  const regex = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, 'i')
  return message.match(regex)?.[1]?.trim() || ''
}

const extractRoute = (message) => {
  const from = extractLineValue(message, 'from') || message.match(/\bfrom\s+([^,\n]+?)(?:\s+to\s+|,|\s+by\s+|$)/i)?.[1]?.trim() || ''
  const to = extractLineValue(message, 'to') || message.match(/\bto\s+([^,\n]+?)(?:,|\s+by\s+|$)/i)?.[1]?.trim() || ''

  return { from, to }
}

const CARGO_PATTERNS = [
  /amazon fba goods?/i,
  /clothes|apparel|garment|textile/i,
  /electronics?|electronic parts?/i,
  /furniture/i,
  /shoes?/i,
  /bags?/i,
  /fan|fans/i,
  /desk|desks/i,
  /battery|batteries/i,
  /cosmetic|cosmetics/i,
  /toy|toys/i,
  /led(?:\s+lights?)?/i,
  /machine|machines|machinery/i,
]

const extractCargoName = (message) => {
  const labeledCargo = extractLineValue(message, 'product') || extractLineValue(message, 'cargo') || extractLineValue(message, 'goods')
  if (labeledCargo) return labeledCargo

  const productMatch = message.match(/\bproduct\s+is\s+([^,\n]+)/i)
  if (productMatch) return productMatch[1].trim()

  const directCargo = CARGO_PATTERNS.find((pattern) => pattern.test(message))
  if (directCargo) return message.match(directCargo)?.[0] || ''

  if (/\bfba\b|amazon fba/i.test(message)) return 'Amazon FBA goods, product not confirmed'

  return ''
}

const buildQuoteSummary = (message) => {
  const { from, to } = extractRoute(message)
  const weight = extractLineValue(message, 'weight') || message.match(/\b\d+(?:\.\d+)?\s*(?:kg|kgs|kilogram|kilograms|lb|lbs|ton|tons)\b/i)?.[0] || ''
  const volume = extractLineValue(message, 'volume') || message.match(/\b\d+(?:\.\d+)?\s*(?:cbm|m3|cubic meters?)\b/i)?.[0] || ''
  const cartons = message.match(/\b\d+\s*(?:cartons|carton|ctns|pallets|pallet|boxes|box)\b/i)?.[0] || ''
  const container = message.match(/\b(?:20gp|40gp|40hq|lcl|fcl)\b/i)?.[0] || ''
  const methodMatches = message.match(/\b(?:sea|ocean|air|express|ddp|ddu|door to door|port to port|fcl|lcl)\b/gi) || []
  const method = methodMatches.length ? [...new Set(methodMatches.map((item) => item.toUpperCase()))].join(' / ') : ''
  const cargo = extractCargoName(message)

  return [
    ['Origin', from || 'Not confirmed'],
    ['Destination', to || 'Not confirmed'],
    ['Cargo', cargo || 'Not confirmed'],
    ['Weight', weight || 'Not confirmed'],
    ['Volume / package', volume || cartons || container || 'Not confirmed'],
    ['Shipping method', method || 'Not confirmed'],
  ]
}

const formatSummary = (rows) => rows.map(([label, value]) => `- ${label}: ${value}`).join('\n')

const formatReferenceRate = (message) => {
  const profile = getDestinationRateProfile(message)
  const estimatedTotal = buildEstimatedTotalPrice(message)

  return [
    `Reference price direction for ${profile.label}:`,
    `- ${profile.sea}`,
    `- ${profile.air}`,
    `- ${profile.transit}`,
    ...(estimatedTotal ? ['', estimatedTotal.text] : []),
    '',
    'This is a reference range, not a final quote. Final price depends on product name, chargeable weight, volume, cartons or pallets, pickup city in China, delivery postcode or Amazon FBA warehouse, and customs/tax requirements.',
  ].join('\n')
}

const buildMockResponse = (message) => {
  const intent = detectAiIntent(message)
  const missing = buildMissingInfoList(message)
  const trackingNumber = getTrackingNumber(message)
  const summary = buildQuoteSummary(message)
  const isAmazonFba = /\bfba\b|amazon fba/i.test(message)
  const quoteGuidance = buildQuoteGuidance(message)

  if (intent === 'freight_quote') {
    const hasDestination = !missing.includes('destination country/city or Amazon FBA warehouse')
    const missingCore = missing.filter((item) => item !== 'preferred shipping method, such as sea, air, express, DDP, or port-to-port')
    const finalQuoteChecklist = buildFinalQuoteChecklist(message, missingCore)

    if (!hasDestination) {
      return {
        intent,
        content: `I can help prepare a freight quote, but I still need a few key details before giving a useful rate.\n\nPlease send:\n${missing.map((item) => `- ${item}`).join('\n')}\n\nOnce I have those details, I can organize the request for sea, air, express, DDP, or port-to-port options.\n\n${isAmazonFba ? 'For Amazon FBA, please also include the FBA warehouse code, carton count, and carton dimensions / CBM.' : 'For door delivery, please also include the final delivery postcode.'}`,
        suggestions: ['100kg clothes from Shenzhen to Los Angeles by sea DDP', '3 pallets electronics from Ningbo to Dallas', '40HQ furniture from Qingdao to New York port'],
      }
    }

    if (missingCore.length) {
      return {
        intent,
        content: `Reference quote:\n${formatReferenceRate(message)}\n\n${finalQuoteChecklist}`,
        suggestions: ['100kg Amazon FBA goods to UK by sea DDP', '3 cartons electronics to UK FBA by air', 'Send final delivery postcode'],
      }
    }

    return {
      intent,
      content: `Got it. Here is the quote request summary I will use:\n\n${formatSummary(summary)}\n\n${quoteGuidance ? `${quoteGuidance}\n\n` : ''}Reference quote:\n${formatReferenceRate(message)}\n\nFinal quote status:\n- Current stage: reference quote only\n- Final quote can be confirmed after pickup city, detailed cargo info, package details, and delivery address / FBA warehouse are verified\n\nIf a live rate API is connected, this request can return the exact price, transit time, and route options automatically. CargoSoon customer service can also confirm the final rate in this chat.`,
      actions: [
        { label: 'Start Booking', href: AI_STORAGE_HINTS.booking },
      ],
      suggestions: ['Compare air and sea options', 'Add pickup address', 'Ask for DDP door delivery'],
    }
  }

  if (intent === 'tracking') {
    return {
      intent,
      content: `I recognized this as a tracking request${trackingNumber ? ` for ${trackingNumber}` : ''}.\n\nCurrent status: In transit\nLatest update: Export handling has been completed and the shipment is moving to the next transport milestone.\nNext step: I can continue checking location, ETA, port movement, and delivery exceptions once the live tracking API is connected.\n\nIf this is a container, B/L, or AWB number, please also share the carrier or order reference if you have it.`,
      actions: [
        { label: 'Open Tracking', href: AI_STORAGE_HINTS.tracking },
      ],
      suggestions: ['Check ETA', 'Explain this tracking status', 'Notify me if delivery is delayed'],
    }
  }

  if (intent === 'booking') {
    return {
      intent,
      content: 'I can help you start a booking. Please confirm the pickup city, destination, cargo name, weight/volume, package count, preferred shipping method, and delivery type.\n\nAfter that, I can prepare the booking details and hand them over to the order flow.',
      actions: [
        { label: 'Start Booking', href: AI_STORAGE_HINTS.booking },
      ],
      suggestions: ['Book sea DDP to USA', 'Book air freight to Germany', 'Book Amazon FBA delivery'],
    }
  }

  if (intent === 'sourcing_1688') {
    return {
      intent,
      content: 'For 1688 sourcing, please send the 1688 product link, quantity, target country, and any inspection or packaging requirements.\n\nCargoSoon can help with supplier communication, receiving goods, inspection, packing, labeling, consolidation, and final international delivery.',
      actions: [
        { label: 'Open 1688 Sourcing', href: AI_STORAGE_HINTS.sourcing },
      ],
      suggestions: ['I have a 1688 link', 'I need inspection before shipping', 'Consolidate multiple suppliers'],
    }
  }

  if (intent === 'warehouse') {
    return {
      intent,
      content: 'CargoSoon warehouse support can include receiving goods, short-term storage, inspection, repacking, labeling, carton removal, consolidation, and preparing goods for export or Amazon FBA.\n\nPlease share the cargo type, number of cartons/pallets, expected storage time, and whether you need inspection, labels, or repacking.',
      actions: [
        { label: 'Open Warehouse', href: AI_STORAGE_HINTS.warehouse },
      ],
      suggestions: ['Store 20 cartons for 2 weeks', 'Inspect and relabel cartons', 'Combine goods from multiple suppliers'],
    }
  }

  if (intent === 'general_shipping') {
    return {
      intent,
      content: 'I can help with China export shipping, DDP door delivery, port-to-port freight, customs guidance, Amazon FBA replenishment, warehouse handling, and 1688 sourcing logistics.\n\nFor a precise answer, please share your origin, destination, cargo name, weight/volume, and preferred shipping method.',
      suggestions: ['DDP sea shipping to USA', 'Air freight transit time', 'Amazon FBA delivery requirements'],
    }
  }

  return {
    intent,
    content: 'I can help, but I need a little more detail first.\n\nPlease send the destination country/city, cargo name, weight and volume, preferred shipping method, and whether you need door delivery, port delivery, warehouse handling, or 1688 sourcing.',
    suggestions: ['I need a freight quote', 'Track my shipment', 'I need 1688 sourcing help'],
  }
}

const normalizeApiResponse = (data, message) => {
  const payload = data?.data || data
  const content = payload?.reply || payload?.content || payload?.message || payload?.answer

  if (!content) {
    throw new Error('AI response is empty')
  }

  return {
    intent: payload?.intent || detectAiIntent(message),
    content,
    actions: payload?.actions || [],
    suggestions: payload?.suggestions || [],
    source: 'api',
  }
}

export const sendAiMessage = async ({ message, messages = [], conversationId = '' }) => {
  const cleanMessage = normalizeText(message)
  if (!cleanMessage) {
    throw new Error('Message is required')
  }

  const endpoint = getAiEndpoint()

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanMessage,
          messages,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`)
      }

      const data = await response.json()
      return normalizeApiResponse(data, cleanMessage)
    } catch (error) {
      const fallback = buildMockResponse(cleanMessage)
      return {
        ...fallback,
        source: 'mock',
        fallback: true,
        serviceError: error.message || 'AI service unavailable',
      }
    }
  }

  await sleep(MOCK_DELAY)
  return {
    ...buildMockResponse(cleanMessage),
    source: 'mock',
  }
}

export const sendCustomerServiceMessage = async ({ message, messages = [], conversationId = '', attachments = [] }) => {
  const cleanMessage = normalizeText(message)
  if (!cleanMessage) {
    throw new Error('Message is required')
  }

  const env = import.meta.env || {}
  const apiBase = env.VITE_API_BASE_URL
  const endpoint = apiBase ? `${trimSlash(apiBase)}/customer-service/chat` : ''

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanMessage,
          messages,
          conversationId,
          attachments,
        }),
      })

      if (!response.ok) {
        throw new Error(`Customer service request failed with status ${response.status}`)
      }

      const data = await response.json()
      const payload = data?.data || data
      return {
        content: payload?.reply || payload?.content || payload?.message || 'Your message has been sent to CargoSoon Customer Service.',
        actions: payload?.actions || [],
        suggestions: payload?.suggestions || [],
        source: 'api',
      }
    } catch (error) {
      return {
        content: 'Thanks, your message has been sent to CargoSoon Customer Service. A logistics specialist will follow up here as soon as possible. If this is urgent, you can also contact us on WhatsApp.',
        actions: [
          { label: 'WhatsApp Support', href: 'https://api.whatsapp.com/send?phone=+8615323780975&text=Hello%2C%20I%20need%20CargoSoon%20customer%20service%20support.' },
        ],
        suggestions: ['I need a live freight quote', 'Please check my shipment', 'I want to book a shipment'],
        source: 'mock',
        fallback: true,
        serviceError: error.message || 'Customer service API unavailable',
      }
    }
  }

  await sleep(420)
  return {
    content: 'Thanks, your message has been sent to CargoSoon Customer Service. A logistics specialist will follow up here as soon as possible. Please keep this page open for the conversation.',
    actions: [
      { label: 'WhatsApp Support', href: 'https://api.whatsapp.com/send?phone=+8615323780975&text=Hello%2C%20I%20need%20CargoSoon%20customer%20service%20support.' },
    ],
    suggestions: ['I need a live freight quote', 'Please check my shipment', 'I want to book a shipment'],
    source: 'mock',
  }
}
