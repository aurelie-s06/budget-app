/**
 * Libellés des relevés BoursoBank : nom lisible, clé de comparaison et
 * catégorie probable d'après l'enseigne.
 */

// Préfixes des libellés BoursoBank
const CARD = /^(CARTE|AVOIR) \d{2}\/\d{2}\/\d{2}\s+/
const TRANSFER = /^VIR(?: INST| SEPA)?\s+/
const DEBIT = /^PRLV(?: SEPA)?\s+/
// « 4 CB*1969 », « CB*1969 » en fin de libellé
const CARD_SUFFIX = /(\s+\d)?\s+CB\*\d+$/

/**
 * Clé de comparaison d'un libellé, sans ce qui change d'une fois à l'autre
 * (date, numéro de magasin, carte) : « CARTE 12/02/26 MCDONALDS 319 2 CB*1969 » → « MCDONALDS ».
 */
export function bankKey(label: string) {
  const isTransfer = TRANSFER.test(label)
  const core = label
    .toUpperCase()
    .replace(CARD, '')
    .replace(TRANSFER, '')
    .replace(DEBIT, '')
    .replace(CARD_SUFFIX, '')
    .replace(/[^A-Z&]+/g, ' ')
    .replace(/\b[A-Z]\b/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
  return isTransfer ? `VIR ${core}` : core
}

const SMALL_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'ou', 'en', 'au'])

// « MCDONALDS » → « Mcdonalds », « SNCF » reste « SNCF » (pas de voyelle : un sigle)
function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (!/[aeiouy]/.test(word)) return word.toUpperCase()
      if (i > 0 && SMALL_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Nom lisible tiré du libellé : « CARTE 30/01/26 NEW YORKER France CB*1969 » → « New Yorker France ».
 */
export function readableName(line: { label: string }) {
  const { label } = line
  if (CARD.test(label)) {
    const name = label
      .replace(CARD, '')
      .replace(CARD_SUFFIX, '')
      // Numéro de magasin : « MCDONALDS 319 2 », « UNDIZ-2666 », « DECATHLON CROISS2 »
      .replace(/[\s-]+\d+(\s+\d)?$/, '')
      .replace(/(\D)\d+$/, '$1')
      .replace(/^(SumUp|MP|SC|WL|HP|EPC|UBR)\s*\*\s*/i, '')
      .replace(/\*/g, ' ')
      .trim()
      // Dernier mot coupé par la banque : « BDE STAPS U » (mais « SUPER U » reste entier)
      .replace(/^(\S+\s+\S+.*)\s+\S$/, '$1')
    const pretty = titleCase(name)
    return label.startsWith('AVOIR') ? `Remboursement ${pretty}` : pretty
  }
  if (TRANSFER.test(label)) {
    const who = label.replace(TRANSFER, '').trim()
    // « VIR Corner - Carrefour » : paiement via un intermédiaire, pas un virement à quelqu'un
    if (who.includes(' - ')) return who
    return `Virement ${titleCase(who.replace(/\b(MR|MME|MLE|M)\s+/g, ''))}`
  }
  if (DEBIT.test(label)) return `Prélèvement ${titleCase(label.replace(DEBIT, ''))}`
  return titleCase(label)
}

export type Rule = { match: RegExp; name?: string; category: string }

/**
 * Enseignes courantes. Les choix déjà faits par l'utilisateur passent avant ces règles.
 */
const RULES: Rule[] = [
  { match: /PAIE|SALAIRE/, category: 'Salaire' },
  { match: /MCDONALD|MC DONALD/, name: 'McDo', category: 'Restaurants' },
  { match: /\bKFC\b/, name: 'KFC', category: 'Restaurants' },
  { match: /BURGER KING/, name: 'Burger King', category: 'Restaurants' },
  { match: /CHAMPIONS BURGE/, name: 'Champions Burger', category: 'Restaurants' },
  { match: /STARBUCKS/, name: 'Starbucks', category: 'Restaurants' },
  {
    match: /CHATIME|BRIOCHE DOREE|KAYSER|BOULANGERIE|PAUL\b|SUBWAY|DOMINO|O TACOS|FIVE GUYS/,
    category: 'Restaurants',
  },
  {
    match: /(CARREFOUR|INTERMARCHE|LECLERC|AUCHAN) DAC|\bTOTAL\b|ESSO|\bBP\b|SHELL|AVIA/,
    name: 'Essence',
    category: 'Transports',
  },
  {
    match:
      /CARREFOUR|AUCHAN|LECLERC|INTERMARCHE|INTER HERMES|MONOPRIX|SUPER U|U EXPRESS|\bSPAR\b|LIDL|ALDI|FRANPRIX|PICARD|CASINO|FRESH/,
    category: 'Alimentation',
  },
  {
    match:
      /SNCF|NAVIGO|IMAGINE R|RATP|UBER|BOLT|KEOLIS|TRANSDEV|BLABLACAR|LIGNES D AZUR|RLA TICKETS/,
    category: 'Transports',
  },
  { match: /PLANITY/, name: 'Planity : coiffeur', category: 'Santé' },
  { match: /DOCTOLIB|PHARMACIE|\bDR\b|MEDECIN|DENTISTE|LABO/, category: 'Santé' },
  {
    match:
      /NETFLIX|SPOTIFY|DEEZER|APPLE\.COM|GITHUB|DISNEY PLUS|DISNEYPLUS|CANAL|AMAZON PRIME|FREE MOBILE|SFR|BOUYGUES|ORANGE/,
    category: 'Abonnements',
  },
  {
    match:
      /ZARA|BERSHKA|STRADIVARIUS|PRIMARK|UNDIZ|UNIQLO|H&M|KIABI|DECATHLON|NOCIBE|SEPHORA|NEW YORKER|PULL & BEAR|PULL&BEAR|PROMOD|YVES ROCHER|CASA|APPLE STORE|ACTION/,
    category: 'Shopping',
  },
  {
    match:
      /FNAC|STEAM|INSTANT GAMING|FORTNITE|TICKETMASTER|SHOTGUN|EURO DISNEY|DISNEY|LEGO|CINEMA|UGC|PATHE|MUSEE|LIBRAIRIE|GRANDE RECRE/,
    category: 'Loisirs',
  },
]

// Première règle qui correspond au libellé (en majuscules)
export function ruleFor(label: string) {
  return RULES.find((r) => r.match.test(label.toUpperCase()))
}
