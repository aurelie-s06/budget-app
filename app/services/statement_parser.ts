import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

/**
 * Lecture des relevés de compte BoursoBank (PDF).
 *
 * Le PDF ne contient que des morceaux de texte positionnés : on regroupe ceux
 * qui sont à la même hauteur pour reconstituer les lignes du tableau. Une ligne
 * d'opération commence par une date dans la colonne « Date opération » ; le
 * montant est un débit ou un crédit selon la colonne où il se trouve.
 */

export type StatementLine = {
  // Date de débit / crédit sur le compte (AAAA-MM-JJ)
  date: string
  // Libellé complet, ex. « CARTE 12/02/26 MCDONALDS 319 2 CB*1969 »
  label: string
  // Lignes de détail sous le libellé (« THE CORNER », « 70,00 BRL / 1 euro = … »)
  details: string[]
  amount: number
  direction: 'debit' | 'credit'
}

export type Statement = {
  bank: 'BoursoBank'
  // Période couverte (AAAA-MM-JJ)
  from: string | null
  to: string | null
  openingBalance: number | null
  closingBalance: number | null
  lines: StatementLine[]
}

export type TextItem = { x: number; y: number; text: string }

export class StatementError extends Error {}

const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/
const AMOUNT = /^-?\d{1,3}(\.\d{3})*,\d{2}$/

// « 01/02/2026 » → « 2026-02-01 »
export function isoDate(text: string) {
  const m = DATE.exec(text.trim())
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

// « 1.212,00 » → 1212
export function parseAmount(text: string) {
  const clean = text.trim()
  if (!AMOUNT.test(clean)) return null
  return Number(clean.replace(/\./g, '').replace(',', '.'))
}

// Regroupe les morceaux de texte en lignes, de haut en bas puis de gauche à droite
function rows(items: TextItem[]) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const result: TextItem[][] = []
  for (const item of sorted) {
    const row = result.at(-1)
    // Même ligne si la hauteur diffère de moins de 3 points
    if (row && Math.abs(row[0].y - item.y) < 3) row.push(item)
    else result.push([item])
  }
  return result.map((row) => row.sort((a, b) => a.x - b.x))
}

/**
 * Analyse le texte positionné de chaque page (séparé pour pouvoir le tester sans PDF).
 */
export function parseItems(pages: TextItem[][]): Statement {
  const statement: Statement = {
    bank: 'BoursoBank',
    from: null,
    to: null,
    openingBalance: null,
    closingBalance: null,
    lines: [],
  }

  for (const items of pages) {
    // Colonnes du tableau, repérées par leurs en-têtes
    const valueHeader = items.find((i) => i.text.trim() === 'Valeur')
    const creditHeader = items.find((i) => i.text.trim() === 'Crédit')
    const labelHeader = items.find((i) => i.text.trim() === 'Libellé')
    if (!valueHeader || !creditHeader || !labelHeader) continue
    const tableTop = labelHeader.y
    // Un montant aligné à droite dans la colonne Crédit commence après son en-tête
    const isCredit = (item: TextItem) => item.x >= creditHeader.x - 5
    // La date de valeur déborde un peu à gauche de son en-tête
    const labelEnd = valueHeader.x - 15

    for (const row of rows(items)) {
      const text = row.map((i) => i.text).join(' ')

      const period = /du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4})/.exec(text)
      if (period && !statement.from) {
        statement.from = isoDate(period[1])
        statement.to = isoDate(period[2])
      }

      // Seul le tableau des mouvements nous intéresse
      if (row[0].y >= tableTop) continue

      const amountItem = row.findLast((i) => parseAmount(i.text) !== null)
      const signed = (item: TextItem) => (isCredit(item) ? 1 : -1) * parseAmount(item.text)!

      if (text.includes('SOLDE AU')) {
        if (amountItem) statement.openingBalance = signed(amountItem)
        continue
      }
      if (text.includes('Nouveau solde')) {
        // Le montant du nouveau solde peut être un peu plus haut que son libellé
        const near = items.filter(
          (i) => Math.abs(i.y - row[0].y) < 6 && i.x > valueHeader.x && parseAmount(i.text) !== null
        )
        const balance = near.find((i) => parseAmount(i.text) !== 0) ?? near[0]
        if (balance) statement.closingBalance = signed(balance)
        continue
      }

      const date = isoDate(row[0].text)
      if (date && row[0].x < labelHeader.x && amountItem && amountItem.x > valueHeader.x) {
        // Libellé : tout ce qui est entre la colonne Libellé et la colonne Valeur
        const label = row
          .filter((i) => i.x >= labelHeader.x - 5 && i.x < labelEnd)
          .map((i) => i.text.trim())
          .join(' ')
          .replace(/\s+/g, ' ')
        statement.lines.push({
          date,
          label,
          details: [],
          amount: parseAmount(amountItem.text)!,
          direction: isCredit(amountItem) ? 'credit' : 'debit',
        })
        continue
      }

      // Ligne de détail, rattachée à l'opération du dessus
      const last = statement.lines.at(-1)
      const detail = row
        .filter((i) => i.x >= labelHeader.x && i.x < labelEnd)
        .map((i) => i.text.trim())
        .join(' ')
      if (last && detail && !date) last.details.push(detail)
    }
  }

  if (statement.lines.length === 0) {
    throw new StatementError(
      'Aucune opération trouvée. Ce lecteur ne connaît que les relevés de compte BoursoBank.'
    )
  }
  return statement
}

/**
 * Lit un relevé PDF.
 */
export async function parseStatement(data: Uint8Array): Promise<Statement> {
  let doc
  try {
    doc = await getDocument({ data }).promise
  } catch {
    throw new StatementError('Ce fichier n’est pas un PDF lisible.')
  }

  const pages: TextItem[][] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    pages.push(
      content.items
        .filter((i) => 'str' in i && i.str.trim() !== '')
        .map((i) => {
          const item = i as { str: string; transform: number[] }
          return { x: item.transform[4], y: item.transform[5], text: item.str }
        })
    )
  }
  await doc.destroy()
  return parseItems(pages)
}

/**
 * Vérifie que les opérations lues expliquent l'écart entre les deux soldes :
 * si c'est le cas, aucune ligne n'a été oubliée.
 */
export function isComplete(statement: Statement) {
  if (statement.openingBalance === null || statement.closingBalance === null) return null
  const total = statement.lines.reduce(
    (sum, l) => sum + (l.direction === 'credit' ? l.amount : -l.amount),
    statement.openingBalance
  )
  return Math.abs(total - statement.closingBalance) < 0.005
}
