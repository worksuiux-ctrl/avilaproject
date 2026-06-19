import {
  getDenominations,
  getSupportedCurrencies,
} from "currency-denominations";

export interface CurrencyDenominationData {
  notes: number[];
  coins: number[];
}

const currencyNames: Record<string, string> = {
  AED: "United Arab Emirates Dirham",
  AFN: "Afghan Afghani",
  ALL: "Albanian Lek",
  AMD: "Armenian Dram",
  ANG: "Netherlands Antillean Guilder",
  AOA: "Angolan Kwanza",
  ARS: "Argentine Peso",
  AUD: "Australian Dollar",
  AWG: "Aruban Florin",
  AZN: "Azerbaijani Manat",
  BAM: "Bosnia and Herzegovina Convertible Mark",
  BBD: "Barbadian Dollar",
  BDT: "Bangladeshi Taka",
  BGN: "Bulgarian Lev",
  BHD: "Bahraini Dinar",
  BIF: "Burundian Franc",
  BMD: "Bermudian Dollar",
  BND: "Brunei Dollar",
  BOB: "Bolivian Boliviano",
  BOV: "Mvdol",
  BRL: "Brazilian Real",
  BSD: "Bahamian Dollar",
  BTN: "Ngultrum",
  BWP: "Pula",
  BYN: "Belarusian Ruble",
  BZD: "Belize Dollar",
  CAD: "Canadian Dollar",
  CDF: "Congolese Franc",
  CHF: "Swiss Franc",
  CLP: "Chilean Peso",
  CNY: "Yuan Renminbi",
  COP: "Colombian Peso",
  CRC: "Costa Rican Colon",
  CUP: "Cuban Peso",
  CVE: "Cabo Verde Escudo",
  CZK: "Czech Koruna",
  DJF: "Djibouti Franc",
  DKK: "Danish Krone",
  DOP: "Dominican Peso",
  DZD: "Algerian Dinar",
  EGP: "Egyptian Pound",
  ERN: "Nakfa",
  ETB: "Ethiopian Birr",
  EUR: "Euro",
  FJD: "Fiji Dollar",
  FKP: "Falkland Islands Pound",
  GBP: "Pound Sterling",
  GEL: "Lari",
  GHS: "Ghana Cedi",
  GIP: "Gibraltar Pound",
  GMD: "Dalasi",
  GNF: "Guinean Franc",
  GTQ: "Quetzal",
  GYD: "Guyana Dollar",
  HKD: "Hong Kong Dollar",
  HNL: "Lempira",
  HTG: "Gourde",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  INR: "Indian Rupee",
  IQD: "Iraqi Dinar",
  IRR: "Iranian Rial",
  ISK: "Icelandic Króna",
  JMD: "Jamaican Dollar",
  JOD: "Jordanian Dinar",
  JPY: "Japanese Yen",
  KES: "Kenyan Shilling",
  KGS: "Kyrgyzstani Som",
  KHR: "Cambodian Riel",
  KMF: "Comorian Franc",
  KPW: "North Korean Won",
  KRW: "South Korean Won",
  KWD: "Kuwaiti Dinar",
  KYD: "Cayman Islands Dollar",
  KZT: "Kazakhstani Tenge",
  LAK: "Lao Kip",
  LBP: "Lebanese Pound",
  LKR: "Sri Lankan Rupee",
  LRD: "Liberian Dollar",
  LSL: "Loti",
  LYD: "Libyan Dinar",
  MAD: "Moroccan Dirham",
  MDL: "Moldovan Leu",
  MGA: "Malagasy Ariary",
  MKD: "Macedonian Denar",
  MMK: "Myanmar Kyat",
  MNT: "Mongolian Tögrög",
  MOP: "Macanese Pataca",
  MRU: "Mauritanian Ouguiya",
  MUR: "Mauritian Rupee",
  MVR: "Maldivian Rufiyaa",
  MWK: "Malawian Kwacha",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  MZN: "Mozambican Metical",
  NAD: "Namibian Dollar",
  NGN: "Nigerian Naira",
  NIO: "Nicaraguan Córdoba",
  NOK: "Norwegian Krone",
  NPR: "Nepalese Rupee",
  NZD: "New Zealand Dollar",
  OMR: "Omani Rial",
  PAB: "Panamanian Balboa",
  PEN: "Peruvian Sol",
  PGK: "Papua New Guinean Kina",
  PHP: "Philippine Peso",
  PKR: "Pakistani Rupee",
  PLN: "Polish Zloty",
  PYG: "Paraguayan Guaraní",
  QAR: "Qatari Riyal",
  RON: "Romanian Leu",
  RSD: "Serbian Dinar",
  RUB: "Russian Ruble",
  RWF: "Rwandan Franc",
  SAR: "Saudi Riyal",
  SBD: "Solomon Islands Dollar",
  SCR: "Seychellois Rupee",
  SDG: "Sudanese Pound",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  SHP: "Saint Helena Pound",
  SLE: "Sierra Leonean Leone",
  SOS: "Somali Shilling",
  SRD: "Surinamese Dollar",
  STN: "São Tomé and Príncipe Dobra",
  SVC: "Salvadoran Colón",
  SYP: "Syrian Pound",
  SZL: "Swazi Lilangeni",
  THB: "Thai Baht",
  TJS: "Tajikistani Somoni",
  TMT: "Turkmenistani Manat",
  TND: "Tunisian Dinar",
  TOP: "Tongan Paʻanga",
  TRY: "Turkish Lira",
  TTD: "Trinidad and Tobago Dollar",
  TWD: "New Taiwan Dollar",
  TZS: "Tanzanian Shilling",
  UAH: "Ukrainian Hryvnia",
  UGX: "Ugandan Shilling",
  USD: "United States Dollar",
  UYU: "Uruguayan Peso",
  UZS: "Uzbekistani Sum",
  VES: "Venezuelan Bolívar",
  VND: "Vietnamese Đồng",
  VUV: "Vanuatu Vatu",
  WST: "Samoan Tālā",
  XAF: "Central African CFA Franc",
  XCD: "East Caribbean Dollar",
  XOF: "West African CFA Franc",
  XPF: "CFP Franc",
  YER: "Yemeni Rial",
  ZAR: "South African Rand",
  ZMW: "Zambian Kwacha",
  ZWL: "Zimbabwean Dollar",
};

const currencySymbols: Record<string, string> = {
  AED: "د.إ", AFN: "؋", ALL: "L", AMD: "֏", ANG: "ƒ", AOA: "Kz",
  ARS: "$", AUD: "A$", AWG: "ƒ", AZN: "₼", BAM: "KM", BBD: "Bds$",
  BDT: "৳", BGN: "лв", BHD: ".د.ب", BIF: "FBu", BMD: "BD$",
  BND: "B$", BOB: "Bs", BRL: "R$", BSD: "B$", BTN: "Nu.", BWP: "P",
  BYN: "Br", BZD: "BZ$", CAD: "CA$", CDF: "FC", CHF: "Fr",
  CLP: "CLP$", CNY: "¥", COP: "$", CRC: "₡", CUP: "$MN", CVE: "Esc",
  CZK: "Kč", DJF: "Fdj", DKK: "kr", DOP: "RD$", DZD: "د.ج",
  EGP: "£E", ERN: "Nkf", ETB: "Br", EUR: "€", FJD: "FJ$",
  FKP: "FK£", GBP: "£", GEL: "₾", GHS: "GH¢", GIP: "£", GMD: "D",
  GNF: "FG", GTQ: "Q", GYD: "GY$", HKD: "HK$", HNL: "L", HTG: "G",
  HUF: "Ft", IDR: "Rp", ILS: "₪", INR: "₹", IQD: "ع.د", IRR: "﷼",
  ISK: "kr", JMD: "J$", JOD: "د.أ", JPY: "¥", KES: "KSh", KGS: "сом",
  KHR: "៛", KMF: "CF", KPW: "₩", KRW: "₩", KWD: "د.ك", KYD: "CI$",
  KZT: "₸", LAK: "₭", LBP: "ل.ل", LKR: "₨", LRD: "L$", LSL: "L",
  LYD: "ل.د", MAD: "د.م.", MDL: "L", MGA: "Ar", MKD: "ден",
  MMK: "K", MNT: "₮", MOP: "MOP$", MRU: "UM", MUR: "₨", MVR: "Rf.",
  MWK: "K", MXN: "MX$", MYR: "RM", MZN: "MT", NAD: "N$", NGN: "₦",
  NIO: "C$", NOK: "kr", NPR: "रु", NZD: "NZ$", OMR: "ر.ع.",
  PAB: "B/.", PEN: "S/", PGK: "K", PHP: "₱", PKR: "₨", PLN: "zł",
  PYG: "₲", QAR: "ر.ق", RON: "L", RSD: "дин", RUB: "₽", RWF: "FRw",
  SAR: "ر.س", SBD: "SI$", SCR: "₨", SDG: "£SD", SEK: "kr",
  SGD: "S$", SHP: "£", SLE: "Le", SOS: "Sh.So.", SRD: "Sr$",
  STN: "Db", SVC: "$", SYP: "£S", SZL: "L", THB: "฿", TJS: "SM",
  TMT: "m", TND: "د.ت", TOP: "T$", TRY: "₺", TTD: "TT$",
  TWD: "NT$", TZS: "TSh", UAH: "₴", UGX: "USh", USD: "$",
  UYU: "$U", UZS: "сум", VES: "Bs", VND: "₫", VUV: "VT",
  WST: "WS$", XAF: "FCFA", XCD: "EC$", XOF: "CFA", XPF: "F CFP",
  YER: "﷼", ZAR: "R", ZMW: "ZK", ZWL: "Z$",
};

const currencyCountries: Record<string, string> = {
  AED: "United Arab Emirates", AFN: "Afghanistan", ALL: "Albania",
  AMD: "Armenia", ANG: "Netherlands Antilles", AOA: "Angola",
  ARS: "Argentina", AUD: "Australia", AWG: "Aruba", AZN: "Azerbaijan",
  BAM: "Bosnia and Herzegovina", BBD: "Barbados", BDT: "Bangladesh",
  BGN: "Bulgaria", BHD: "Bahrain", BIF: "Burundi", BMD: "Bermuda",
  BND: "Brunei", BOB: "Bolivia", BRL: "Brazil", BSD: "Bahamas",
  BTN: "Bhutan", BWP: "Botswana", BYN: "Belarus", BZD: "Belize",
  CAD: "Canada", CDF: "Democratic Republic of the Congo",
  CHF: "Switzerland", CLP: "Chile", CNY: "China",
  COP: "Colombia", CRC: "Costa Rica", CUP: "Cuba", CVE: "Cabo Verde",
  CZK: "Czech Republic", DJF: "Djibouti", DKK: "Denmark",
  DOP: "Dominican Republic", DZD: "Algeria", EGP: "Egypt",
  ERN: "Eritrea", ETB: "Ethiopia", EUR: "European Union",
  FJD: "Fiji", FKP: "Falkland Islands", GBP: "United Kingdom",
  GEL: "Georgia", GHS: "Ghana", GIP: "Gibraltar", GMD: "Gambia",
  GNF: "Guinea", GTQ: "Guatemala", GYD: "Guyana", HKD: "Hong Kong",
  HNL: "Honduras", HTG: "Haiti", HUF: "Hungary", IDR: "Indonesia",
  ILS: "Israel", INR: "India", IQD: "Iraq", IRR: "Iran",
  ISK: "Iceland", JMD: "Jamaica", JOD: "Jordan", JPY: "Japan",
  KES: "Kenya", KGS: "Kyrgyzstan", KHR: "Cambodia", KMF: "Comoros",
  KPW: "North Korea", KRW: "South Korea", KWD: "Kuwait",
  KYD: "Cayman Islands", KZT: "Kazakhstan", LAK: "Laos",
  LBP: "Lebanon", LKR: "Sri Lanka", LRD: "Liberia", LSL: "Lesotho",
  LYD: "Libya", MAD: "Morocco", MDL: "Moldova", MGA: "Madagascar",
  MKD: "North Macedonia", MMK: "Myanmar", MNT: "Mongolia",
  MOP: "Macau", MRU: "Mauritania", MUR: "Mauritius", MVR: "Maldives",
  MWK: "Malawi", MXN: "Mexico", MYR: "Malaysia", MZN: "Mozambique",
  NAD: "Namibia", NGN: "Nigeria", NIO: "Nicaragua", NOK: "Norway",
  NPR: "Nepal", NZD: "New Zealand", OMR: "Oman", PAB: "Panama",
  PEN: "Peru", PGK: "Papua New Guinea", PHP: "Philippines",
  PKR: "Pakistan", PLN: "Poland", PYG: "Paraguay", QAR: "Qatar",
  RON: "Romania", RSD: "Serbia", RUB: "Russia", RWF: "Rwanda",
  SAR: "Saudi Arabia", SBD: "Solomon Islands", SCR: "Seychelles",
  SDG: "Sudan", SEK: "Sweden", SGD: "Singapore", SHP: "Saint Helena",
  SLE: "Sierra Leone", SOS: "Somalia", SRD: "Suriname",
  STN: "São Tomé and Príncipe", SVC: "El Salvador", SYP: "Syria",
  SZL: "Eswatini", THB: "Thailand", TJS: "Tajikistan", TMT: "Turkmenistan",
  TND: "Tunisia", TOP: "Tonga", TRY: "Turkey", TTD: "Trinidad and Tobago",
  TWD: "Taiwan", TZS: "Tanzania", UAH: "Ukraine", UGX: "Uganda",
  USD: "United States", UYU: "Uruguay", UZS: "Uzbekistan",
  VES: "Venezuela", VND: "Vietnam", VUV: "Vanuatu", WST: "Samoa",
  XAF: "Central African Republic", XCD: "East Caribbean",
  XOF: "West African", XPF: "French Polynesia",
  YER: "Yemen", ZAR: "South Africa", ZMW: "Zambia", ZWL: "Zimbabwe",
};

export interface IntegrationCurrency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  denominations: CurrencyDenominationData;
}

export interface IntegrationCurrencyGroup {
  letter: string;
  currencies: IntegrationCurrency[];
}

const EXCLUDED_CODES = new Set([
  "XAU", "XAG", "XPD", "XPT", "XDR", "XTS", "XXX",
  "BOV", "CLF", "MXV", "COU", "USN", "USS", "UYI",
]);

const NATIVE_ISO = new Set(["VES", "USD", "EUR", "COP"]);

export function getAllIntegrationCurrencies(): IntegrationCurrency[] {
  const codes = getSupportedCurrencies();
  const result: IntegrationCurrency[] = [];

  for (const code of codes) {
    if (EXCLUDED_CODES.has(code)) continue;

    const denoms = getDenominations(code);
    if (!denoms) continue;

    result.push({
      code,
      name: currencyNames[code] || code,
      symbol: currencySymbols[code] || "",
      country: currencyCountries[code] || "",
      denominations: denoms,
    });
  }

  result.sort((a, b) => a.code.localeCompare(b.code));
  return result;
}

export function getGroupedCurrencies(): IntegrationCurrencyGroup[] {
  const all = getAllIntegrationCurrencies();
  const groups: Record<string, IntegrationCurrency[]> = {};

  for (const c of all) {
    const letter = c.code[0];
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, currencies]) => ({ letter, currencies }));
}

export function isNativeCurrency(code: string): boolean {
  return NATIVE_ISO.has(code);
}

export function getIntegrationCurrenciesWithoutNative(): IntegrationCurrency[] {
  return getAllIntegrationCurrencies().filter((c) => !NATIVE_ISO.has(c.code));
}

export function isValidCurrencyCode(code: string): boolean {
  const denoms = getDenominations(code);
  return denoms !== null && !EXCLUDED_CODES.has(code);
}

export function getKnownDenominations(code: string): { notes: number[]; coins: number[] } | null {
  return getDenominations(code);
}

export function isValidDenomination(code: string, value: number, tipo: "Billete" | "Moneda"): boolean {
  const denoms = getDenominations(code);
  if (!denoms) return false;
  if (tipo === "Billete") return denoms.notes.includes(value);
  return denoms.coins.includes(value);
}
