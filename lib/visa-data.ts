export interface Country {
  name: string
  id: string
  coordinates: [number, number]
  dates?: { arrival: string; departure: string }
  notes?: string
  flag?: string
}

export interface VisaRequirement {
  type: "visa-free" | "visa-on-arrival" | "evisa" | "visa-required" | "unknown"
  duration?: string
  notes?: string
  cost?: string
  processingTime?: string
  validity?: string
}

const russianVisaData: Record<string, VisaRequirement> = {
  // Visa-free countries
  Argentina: { type: "visa-free", duration: "90 days", notes: "Valid for tourism and business", cost: "Free" },
  Brazil: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Chile: { type: "visa-free", duration: "90 days", notes: "Valid for tourism and business", cost: "Free" },
  Serbia: { type: "visa-free", duration: "30 days", notes: "Valid for tourism and business", cost: "Free" },
  Thailand: { type: "visa-free", duration: "30 days", notes: "Can be extended", cost: "Free" },
  Turkey: { type: "visa-free", duration: "60 days", notes: "Valid for tourism", cost: "Free" },
  "South Korea": { type: "visa-free", duration: "60 days", notes: "Valid for tourism", cost: "Free" },
  Israel: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Mongolia: { type: "visa-free", duration: "30 days", notes: "Valid for tourism", cost: "Free" },
  "Bosnia and Herzegovina": { type: "visa-free", duration: "30 days", notes: "Valid for tourism", cost: "Free" },
  Cuba: { type: "visa-free", duration: "90 days", notes: "Tourist card required", cost: "Free" },
  Ecuador: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Peru: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Venezuela: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Uruguay: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Paraguay: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Colombia: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Panama: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  "Costa Rica": { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Nicaragua: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Guatemala: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Honduras: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  "El Salvador": { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  "Dominican Republic": { type: "visa-free", duration: "30 days", notes: "Valid for tourism", cost: "Free" },
  Jamaica: { type: "visa-free", duration: "30 days", notes: "Valid for tourism", cost: "Free" },
  Barbados: { type: "visa-free", duration: "28 days", notes: "Valid for tourism", cost: "Free" },
  Bahamas: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  "Saint Lucia": { type: "visa-free", duration: "42 days", notes: "Valid for tourism", cost: "Free" },
  "Antigua and Barbuda": { type: "visa-free", duration: "180 days", notes: "Valid for tourism", cost: "Free" },
  "Saint Kitts and Nevis": { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Grenada: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  "Saint Vincent and the Grenadines": {
    type: "visa-free",
    duration: "30 days",
    notes: "Valid for tourism",
    cost: "Free",
  },
  "Trinidad and Tobago": { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },
  Dominica: { type: "visa-free", duration: "21 days", notes: "Valid for tourism", cost: "Free" },
  Haiti: { type: "visa-free", duration: "90 days", notes: "Valid for tourism", cost: "Free" },

  // Visa on arrival
  Maldives: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },
  Seychelles: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },
  Mauritius: {
    type: "visa-on-arrival",
    duration: "60 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },
  Nepal: {
    type: "visa-on-arrival",
    duration: "90 days",
    notes: "Fee required",
    cost: "$50",
    processingTime: "On arrival",
  },
  Cambodia: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Fee required",
    cost: "$30",
    processingTime: "On arrival",
  },
  Laos: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Fee required",
    cost: "$35",
    processingTime: "On arrival",
  },
  Indonesia: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Fee required",
    cost: "$35",
    processingTime: "On arrival",
  },
  Jordan: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Fee required",
    cost: "$56",
    processingTime: "On arrival",
  },
  Lebanon: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Fee required",
    cost: "$50",
    processingTime: "On arrival",
  },
  Bahrain: {
    type: "visa-on-arrival",
    duration: "14 days",
    notes: "Fee required",
    cost: "$25",
    processingTime: "On arrival",
  },
  Comoros: {
    type: "visa-on-arrival",
    duration: "45 days",
    notes: "Fee required",
    cost: "$30",
    processingTime: "On arrival",
  },
  Madagascar: {
    type: "visa-on-arrival",
    duration: "90 days",
    notes: "Fee required",
    cost: "$37",
    processingTime: "On arrival",
  },
  Palau: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },
  Samoa: {
    type: "visa-on-arrival",
    duration: "60 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },
  Tuvalu: {
    type: "visa-on-arrival",
    duration: "30 days",
    notes: "Free visa on arrival",
    cost: "Free",
    processingTime: "On arrival",
  },

  // eVisa
  India: {
    type: "evisa",
    duration: "60 days",
    notes: "Apply online before travel",
    cost: "$80",
    processingTime: "4 business days",
    validity: "1 year",
  },
  Vietnam: {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$25",
    processingTime: "3 business days",
    validity: "90 days",
  },
  "Sri Lanka": {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "2 business days",
    validity: "6 months",
  },
  Myanmar: {
    type: "evisa",
    duration: "28 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Egypt: {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$25",
    processingTime: "7 business days",
    validity: "90 days",
  },
  Kenya: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$51",
    processingTime: "2 business days",
    validity: "3 months",
  },
  Ethiopia: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$52",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Rwanda: {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Tanzania: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "10 business days",
    validity: "12 months",
  },
  Uganda: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "3 business days",
    validity: "3 months",
  },
  Zambia: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Zimbabwe: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$60",
    processingTime: "2 business days",
    validity: "90 days",
  },
  Djibouti: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$90",
    processingTime: "7 business days",
    validity: "90 days",
  },
  Gabon: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$100",
    processingTime: "5 business days",
    validity: "90 days",
  },
  Lesotho: {
    type: "evisa",
    duration: "14 days",
    notes: "Apply online before travel",
    cost: "$50",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Malawi: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$75",
    processingTime: "5 business days",
    validity: "90 days",
  },
  Pakistan: {
    type: "evisa",
    duration: "90 days",
    notes: "Apply online before travel",
    cost: "$60",
    processingTime: "4 business days",
    validity: "90 days",
  },
  Azerbaijan: {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$20",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Kyrgyzstan: {
    type: "evisa",
    duration: "60 days",
    notes: "Apply online before travel",
    cost: "$51",
    processingTime: "3 business days",
    validity: "90 days",
  },
  Uzbekistan: {
    type: "evisa",
    duration: "30 days",
    notes: "Apply online before travel",
    cost: "$20",
    processingTime: "2 business days",
    validity: "90 days",
  },

  // Visa required
  "United States": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$160",
    processingTime: "2-4 weeks",
    validity: "10 years",
  },
  "United Kingdom": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$130",
    processingTime: "3 weeks",
    validity: "6 months",
  },
  Canada: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "2-4 weeks",
    validity: "10 years",
  },
  Australia: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$145",
    processingTime: "4 weeks",
    validity: "1 year",
  },
  "New Zealand": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$120",
    processingTime: "3 weeks",
    validity: "9 months",
  },
  Japan: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$30",
    processingTime: "5 business days",
    validity: "3 months",
  },
  China: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$140",
    processingTime: "4 business days",
    validity: "10 years",
  },
  Germany: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  France: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Italy: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Spain: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Netherlands: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Belgium: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Austria: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Switzerland: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Sweden: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Norway: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Denmark: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Finland: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Poland: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  "Czech Republic": {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Portugal: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Greece: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Hungary: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Ireland: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$60",
    processingTime: "8 weeks",
    validity: "90 days",
  },
  Iceland: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Luxembourg: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Malta: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Slovakia: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Slovenia: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Estonia: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Latvia: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Lithuania: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Croatia: {
    type: "visa-required",
    notes: "Schengen visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Romania: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Bulgaria: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Cyprus: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$80",
    processingTime: "15 days",
    validity: "90 days",
  },
  Mexico: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$36",
    processingTime: "2 weeks",
    validity: "10 years",
  },
  "South Africa": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "4 weeks",
    validity: "90 days",
  },
  Nigeria: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$160",
    processingTime: "2 weeks",
    validity: "90 days",
  },
  Ghana: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$150",
    processingTime: "2 weeks",
    validity: "60 days",
  },
  Morocco: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$27",
    processingTime: "1 week",
    validity: "90 days",
  },
  Algeria: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$85",
    processingTime: "2 weeks",
    validity: "90 days",
  },
  Tunisia: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$60",
    processingTime: "1 week",
    validity: "90 days",
  },
  Libya: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "4 weeks",
    validity: "90 days",
  },
  Sudan: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  Somalia: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$60",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  Eritrea: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$70",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  "Saudi Arabia": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$133",
    processingTime: "1 week",
    validity: "1 year",
  },
  "United Arab Emirates": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "3 days",
    validity: "60 days",
  },
  Kuwait: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "90 days",
  },
  Qatar: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "5 days",
    validity: "30 days",
  },
  Oman: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "3 days",
    validity: "30 days",
  },
  Yemen: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$60",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  Iraq: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$80",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  Syria: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "4 weeks",
    validity: "15 days",
  },
  Afghanistan: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "2 weeks",
    validity: "30 days",
  },
  Bangladesh: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$51",
    processingTime: "5 days",
    validity: "90 days",
  },
  Bhutan: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$40",
    processingTime: "1 week",
    validity: "15 days",
  },
  Malaysia: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "5 days",
    validity: "3 months",
  },
  Singapore: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$30",
    processingTime: "3 days",
    validity: "30 days",
  },
  Philippines: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$30",
    processingTime: "5 days",
    validity: "59 days",
  },
  Brunei: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$20",
    processingTime: "3 days",
    validity: "90 days",
  },
  "Timor-Leste": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$30",
    processingTime: "1 week",
    validity: "30 days",
  },
  "Papua New Guinea": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "2 weeks",
    validity: "60 days",
  },
  Fiji: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "1 week",
    validity: "4 months",
  },
  Vanuatu: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$200",
    processingTime: "2 weeks",
    validity: "90 days",
  },
  "Solomon Islands": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$100",
    processingTime: "2 weeks",
    validity: "90 days",
  },
  Kiribati: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "30 days",
  },
  Tonga: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "31 days",
  },
  Micronesia: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "30 days",
  },
  "Marshall Islands": {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "90 days",
  },
  Nauru: {
    type: "visa-required",
    notes: "Embassy visa required",
    cost: "$50",
    processingTime: "1 week",
    validity: "30 days",
  },
}

export function getVisaRequirement(nationality: string, country: string): VisaRequirement {
  if (nationality.toLowerCase().includes("russia") || nationality.toLowerCase().includes("russian")) {
    return russianVisaData[country] || { type: "unknown", notes: "Information not available" }
  }

  return { type: "unknown", notes: "Visa data not available for this nationality" }
}

export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateTotalDistance(route: Country[]): number {
  let total = 0
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i].coordinates, route[i + 1].coordinates)
  }
  return Math.round(total)
}

export function calculateTotalVisaCost(route: Country[], nationality: string): number {
  let total = 0
  route.forEach((country) => {
    const visa = getVisaRequirement(nationality, country.name)
    if (visa.cost && visa.cost !== "Free") {
      const cost = Number.parseInt(visa.cost.replace(/[^0-9]/g, ""))
      if (!isNaN(cost)) total += cost
    }
  })
  return total
}
