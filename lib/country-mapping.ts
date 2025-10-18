// Mapping between geography numeric IDs and ISO 2-letter country codes
// This maps the numeric IDs used in the world map geography data to ISO codes used by the Passport Visa API

export const GEOGRAPHY_ID_TO_ISO: Record<string, string> = {
  // Based on ISO 3166-1 numeric codes
  '004': 'AF', // Afghanistan
  '008': 'AL', // Albania
  '010': 'AQ', // Antarctica
  '012': 'DZ', // Algeria
  '016': 'AS', // American Samoa
  '020': 'AD', // Andorra
  '024': 'AO', // Angola
  '028': 'AG', // Antigua and Barbuda
  '031': 'AZ', // Azerbaijan
  '032': 'AR', // Argentina
  '036': 'AU', // Australia
  '040': 'AT', // Austria
  '044': 'BS', // Bahamas
  '048': 'BH', // Bahrain
  '050': 'BD', // Bangladesh
  '051': 'AM', // Armenia
  '052': 'BB', // Barbados
  '056': 'BE', // Belgium
  '060': 'BM', // Bermuda
  '064': 'BT', // Bhutan
  '068': 'BO', // Bolivia
  '070': 'BA', // Bosnia and Herzegovina
  '072': 'BW', // Botswana
  '074': 'BV', // Bouvet Island
  '076': 'BR', // Brazil
  '084': 'BZ', // Belize
  '086': 'IO', // British Indian Ocean Territory
  '090': 'SB', // Solomon Islands
  '092': 'VG', // Virgin Islands, British
  '096': 'BN', // Brunei Darussalam
  '100': 'BG', // Bulgaria
  '104': 'MM', // Myanmar
  '108': 'BI', // Burundi
  '112': 'BY', // Belarus
  '116': 'KH', // Cambodia
  '120': 'CM', // Cameroon
  '124': 'CA', // Canada
  '132': 'CV', // Cape Verde
  '136': 'KY', // Cayman Islands
  '140': 'CF', // Central African Republic
  '144': 'LK', // Sri Lanka
  '148': 'TD', // Chad
  '152': 'CL', // Chile
  '156': 'CN', // China
  '158': 'TW', // Taiwan
  '162': 'CX', // Christmas Island
  '166': 'CC', // Cocos Islands
  '170': 'CO', // Colombia
  '174': 'KM', // Comoros
  '175': 'YT', // Mayotte
  '178': 'CG', // Congo
  '180': 'CD', // Congo, Democratic Republic
  '184': 'CK', // Cook Islands
  '188': 'CR', // Costa Rica
  '191': 'HR', // Croatia
  '192': 'CU', // Cuba
  '196': 'CY', // Cyprus
  '203': 'CZ', // Czech Republic
  '204': 'BJ', // Benin
  '208': 'DK', // Denmark
  '212': 'DM', // Dominica
  '214': 'DO', // Dominican Republic
  '218': 'EC', // Ecuador
  '222': 'SV', // El Salvador
  '226': 'GQ', // Equatorial Guinea
  '231': 'ET', // Ethiopia
  '232': 'ER', // Eritrea
  '233': 'EE', // Estonia
  '234': 'FO', // Faroe Islands
  '238': 'FK', // Falkland Islands
  '239': 'GS', // South Georgia and South Sandwich Islands
  '242': 'FJ', // Fiji
  '246': 'FI', // Finland
  '248': 'AX', // Åland Islands
  '250': 'FR', // France
  '254': 'GF', // French Guiana
  '258': 'PF', // French Polynesia
  '260': 'TF', // French Southern Territories
  '262': 'DJ', // Djibouti
  '266': 'GA', // Gabon
  '268': 'GE', // Georgia
  '270': 'GM', // Gambia
  '275': 'PS', // Palestine
  '276': 'DE', // Germany
  '288': 'GH', // Ghana
  '292': 'GI', // Gibraltar
  '296': 'KI', // Kiribati
  '300': 'GR', // Greece
  '304': 'GL', // Greenland
  '308': 'GD', // Grenada
  '312': 'GP', // Guadeloupe
  '316': 'GU', // Guam
  '320': 'GT', // Guatemala
  '324': 'GN', // Guinea
  '328': 'GY', // Guyana
  '332': 'HT', // Haiti
  '334': 'HM', // Heard Island and McDonald Islands
  '336': 'VA', // Vatican City
  '340': 'HN', // Honduras
  '344': 'HK', // Hong Kong
  '348': 'HU', // Hungary
  '352': 'IS', // Iceland
  '356': 'IN', // India
  '360': 'ID', // Indonesia
  '364': 'IR', // Iran
  '368': 'IQ', // Iraq
  '372': 'IE', // Ireland
  '376': 'IL', // Israel
  '380': 'IT', // Italy
  '384': 'CI', // Côte d'Ivoire
  '388': 'JM', // Jamaica
  '392': 'JP', // Japan
  '398': 'KZ', // Kazakhstan
  '400': 'JO', // Jordan
  '404': 'KE', // Kenya
  '408': 'KP', // North Korea
  '410': 'KR', // South Korea
  '414': 'KW', // Kuwait
  '417': 'KG', // Kyrgyzstan
  '418': 'LA', // Laos
  '422': 'LB', // Lebanon
  '426': 'LS', // Lesotho
  '428': 'LV', // Latvia
  '430': 'LR', // Liberia
  '434': 'LY', // Libya
  '438': 'LI', // Liechtenstein
  '440': 'LT', // Lithuania
  '442': 'LU', // Luxembourg
  '446': 'MO', // Macao
  '450': 'MG', // Madagascar
  '454': 'MW', // Malawi
  '458': 'MY', // Malaysia
  '462': 'MV', // Maldives
  '466': 'ML', // Mali
  '470': 'MT', // Malta
  '474': 'MQ', // Martinique
  '478': 'MR', // Mauritania
  '480': 'MU', // Mauritius
  '484': 'MX', // Mexico
  '492': 'MC', // Monaco
  '496': 'MN', // Mongolia
  '498': 'MD', // Moldova
  '499': 'ME', // Montenegro
  '500': 'MS', // Montserrat
  '504': 'MA', // Morocco
  '508': 'MZ', // Mozambique
  '512': 'OM', // Oman
  '516': 'NA', // Namibia
  '520': 'NR', // Nauru
  '524': 'NP', // Nepal
  '528': 'NL', // Netherlands
  '531': 'CW', // Curaçao
  '533': 'AW', // Aruba
  '534': 'SX', // Sint Maarten
  '535': 'BQ', // Bonaire, Sint Eustatius and Saba
  '540': 'NC', // New Caledonia
  '548': 'VU', // Vanuatu
  '554': 'NZ', // New Zealand
  '558': 'NI', // Nicaragua
  '562': 'NE', // Niger
  '566': 'NG', // Nigeria
  '570': 'NU', // Niue
  '574': 'NF', // Norfolk Island
  '578': 'NO', // Norway
  '580': 'MP', // Northern Mariana Islands
  '581': 'UM', // United States Minor Outlying Islands
  '583': 'FM', // Micronesia
  '584': 'MH', // Marshall Islands
  '585': 'PW', // Palau
  '586': 'PK', // Pakistan
  '591': 'PA', // Panama
  '598': 'PG', // Papua New Guinea
  '600': 'PY', // Paraguay
  '604': 'PE', // Peru
  '608': 'PH', // Philippines
  '612': 'PN', // Pitcairn
  '616': 'PL', // Poland
  '620': 'PT', // Portugal
  '624': 'GW', // Guinea-Bissau
  '626': 'TL', // Timor-Leste
  '630': 'PR', // Puerto Rico
  '634': 'QA', // Qatar
  '638': 'RE', // Réunion
  '642': 'RO', // Romania
  '643': 'RU', // Russia
  '646': 'RW', // Rwanda
  '652': 'BL', // Saint Barthélemy
  '654': 'SH', // Saint Helena
  '659': 'KN', // Saint Kitts and Nevis
  '660': 'AI', // Anguilla
  '662': 'LC', // Saint Lucia
  '663': 'MF', // Saint Martin
  '666': 'PM', // Saint Pierre and Miquelon
  '670': 'VC', // Saint Vincent and the Grenadines
  '674': 'SM', // San Marino
  '678': 'ST', // São Tomé and Príncipe
  '682': 'SA', // Saudi Arabia
  '686': 'SN', // Senegal
  '688': 'RS', // Serbia
  '690': 'SC', // Seychelles
  '694': 'SL', // Sierra Leone
  '702': 'SG', // Singapore
  '703': 'SK', // Slovakia
  '704': 'VN', // Vietnam
  '705': 'SI', // Slovenia
  '706': 'SO', // Somalia
  '710': 'ZA', // South Africa
  '716': 'ZW', // Zimbabwe
  '724': 'ES', // Spain
  '728': 'SS', // South Sudan
  '729': 'SD', // Sudan
  '732': 'EH', // Western Sahara
  '740': 'SR', // Suriname
  '744': 'SJ', // Svalbard and Jan Mayen
  '748': 'SZ', // Eswatini
  '752': 'SE', // Sweden
  '756': 'CH', // Switzerland
  '760': 'SY', // Syria
  '762': 'TJ', // Tajikistan
  '764': 'TH', // Thailand
  '768': 'TG', // Togo
  '772': 'TK', // Tokelau
  '776': 'TO', // Tonga
  '780': 'TT', // Trinidad and Tobago
  '784': 'AE', // United Arab Emirates
  '788': 'TN', // Tunisia
  '792': 'TR', // Turkey
  '795': 'TM', // Turkmenistan
  '796': 'TC', // Turks and Caicos Islands
  '798': 'TV', // Tuvalu
  '800': 'UG', // Uganda
  '804': 'UA', // Ukraine
  '807': 'MK', // North Macedonia
  '818': 'EG', // Egypt
  '826': 'GB', // United Kingdom
  '831': 'GG', // Guernsey
  '832': 'JE', // Jersey
  '833': 'IM', // Isle of Man
  '834': 'TZ', // Tanzania
  '840': 'US', // United States
  '850': 'VI', // Virgin Islands, U.S.
  '854': 'BF', // Burkina Faso
  '858': 'UY', // Uruguay
  '860': 'UZ', // Uzbekistan
  '862': 'VE', // Venezuela
  '876': 'WF', // Wallis and Futuna
  '882': 'WS', // Samoa
  '887': 'YE', // Yemen
  '894': 'ZM', // Zambia
  
  // Note: Some entries above already cover these territories:
  // '732': 'EH' - Western Sahara (W. Sahara) - already mapped above
  // '304': 'GL' - Greenland - already mapped above  
  // '540': 'NC' - New Caledonia - already mapped above
  // '260': 'TF' - French Southern Territories (Fr. S. Antarctic Lands) - already mapped above
  // '238': 'FK' - Falkland Islands (Falkland Is.) - already mapped above
  // '010': 'AQ' - Antarctica - already mapped above
}

// Reverse mapping for quick lookups
export const ISO_TO_GEOGRAPHY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(GEOGRAPHY_ID_TO_ISO).map(([id, iso]) => [iso, id])
)

// Helper function to get ISO code from geography ID
// Reverse mapping from ISO codes to country names
const isoToCountryName: Record<string, string> = {
  'RU': 'Russia',
  'US': 'United States',
  'CN': 'China',
  'IN': 'India',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'CA': 'Canada',
  'AU': 'Australia',
  'JP': 'Japan',
  'KR': 'South Korea',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'EC': 'Ecuador',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'GY': 'Guyana',
  'SR': 'Suriname',
  'FK': 'Falkland Islands',
  'GF': 'French Guiana',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'PH': 'Philippines',
  'BD': 'Bangladesh',
  'PK': 'Pakistan',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'MV': 'Maldives',
  'AF': 'Afghanistan',
  'IR': 'Iran',
  'IQ': 'Iraq',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'YE': 'Yemen',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'SY': 'Syria',
  'IL': 'Israel',
  'PS': 'Palestine',
  'TR': 'Turkey',
  'CY': 'Cyprus',
  'GR': 'Greece',
  'BG': 'Bulgaria',
  'RO': 'Romania',
  'MD': 'Moldova',
  'UA': 'Ukraine',
  'BY': 'Belarus',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'FI': 'Finland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'IS': 'Iceland',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'SK': 'Slovakia',
  'HU': 'Hungary',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'VA': 'Vatican City',
  'AD': 'Andorra',
  'LU': 'Luxembourg',
  'BE': 'Belgium',
  'NL': 'Netherlands',
  'MT': 'Malta',
  'AL': 'Albania',
  'ME': 'Montenegro',
  'RS': 'Serbia',
  'BA': 'Bosnia and Herzegovina',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'MK': 'North Macedonia',
  'XK': 'Kosovo',
  'EG': 'Egypt',
  'LY': 'Libya',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'MA': 'Morocco',
  'SD': 'Sudan',
  'SS': 'South Sudan',
  'ET': 'Ethiopia',
  'ER': 'Eritrea',
  'DJ': 'Djibouti',
  'SO': 'Somalia',
  'KE': 'Kenya',
  'UG': 'Uganda',
  'TZ': 'Tanzania',
  'RW': 'Rwanda',
  'BI': 'Burundi',
  'CD': 'Democratic Republic of the Congo',
  'CG': 'Republic of the Congo',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'CM': 'Cameroon',
  'NG': 'Nigeria',
  'NE': 'Niger',
  'ML': 'Mali',
  'BF': 'Burkina Faso',
  'CI': 'Ivory Coast',
  'GH': 'Ghana',
  'TG': 'Togo',
  'BJ': 'Benin',
  'SN': 'Senegal',
  'GM': 'Gambia',
  'GN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'SL': 'Sierra Leone',
  'LR': 'Liberia',
  'MR': 'Mauritania',
  'ZA': 'South Africa',
  'NA': 'Namibia',
  'BW': 'Botswana',
  'ZW': 'Zimbabwe',
  'ZM': 'Zambia',
  'MW': 'Malawi',
  'MZ': 'Mozambique',
  'MG': 'Madagascar',
  'MU': 'Mauritius',
  'SC': 'Seychelles',
  'KM': 'Comoros',
  'YT': 'Mayotte',
  'RE': 'Réunion',
  'SH': 'Saint Helena',
  'CV': 'Cape Verde',
  'ST': 'São Tomé and Príncipe',
  'GA': 'Gabon',
  'GQ': 'Equatorial Guinea',
  'AO': 'Angola',
  'LS': 'Lesotho',
  'SZ': 'Eswatini',
  'MN': 'Mongolia',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'TM': 'Turkmenistan',
  'TJ': 'Tajikistan',
  'KG': 'Kyrgyzstan',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'NZ': 'New Zealand',
  'FJ': 'Fiji',
  'PG': 'Papua New Guinea',
  'SB': 'Solomon Islands',
  'VU': 'Vanuatu',
  'NC': 'New Caledonia',
  'PF': 'French Polynesia',
  'WS': 'Samoa',
  'TO': 'Tonga',
  'KI': 'Kiribati',
  'TV': 'Tuvalu',
  'NR': 'Nauru',
  'PW': 'Palau',
  'FM': 'Micronesia',
  'MH': 'Marshall Islands',
  'CK': 'Cook Islands',
  'NU': 'Niue',
  'TK': 'Tokelau',
  'AS': 'American Samoa',
  'GU': 'Guam',
  'MP': 'Northern Mariana Islands',
  'VI': 'U.S. Virgin Islands',
  'PR': 'Puerto Rico',
  'CU': 'Cuba',
  'JM': 'Jamaica',
  'HT': 'Haiti',
  'DO': 'Dominican Republic',
  'BS': 'Bahamas',
  'BB': 'Barbados',
  'AG': 'Antigua and Barbuda',
  'DM': 'Dominica',
  'GD': 'Grenada',
  'KN': 'Saint Kitts and Nevis',
  'LC': 'Saint Lucia',
  'VC': 'Saint Vincent and the Grenadines',
  'TT': 'Trinidad and Tobago',
  'BZ': 'Belize',
  'GT': 'Guatemala',
  'SV': 'El Salvador',
  'HN': 'Honduras',
  'NI': 'Nicaragua',
  'CR': 'Costa Rica',
  'PA': 'Panama',
}

export function getCountryNameFromCode(countryCode: string): string {
  return isoToCountryName[countryCode] || countryCode
}

export function getISOFromGeographyId(geographyId: string): string | null {
  // Handle undefined or null geography IDs
  if (!geographyId || geographyId === 'undefined') {
    return null
  }
  
  return GEOGRAPHY_ID_TO_ISO[geographyId] || null
}

// Helper function to get geography ID from ISO code
export function getGeographyIdFromISO(isoCode: string): string | null {
  return ISO_TO_GEOGRAPHY_ID[isoCode] || null
}
