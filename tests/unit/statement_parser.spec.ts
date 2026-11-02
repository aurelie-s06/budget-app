import { test } from '@japa/runner'
import { parseStatement, StatementError } from '#services/statement_parser'

// Plus petit PDF contenant du texte : suffit à vérifier que pdf.js le lit
function tinyPdf() {
  const stream = 'BT /F1 12 Tf 72 700 Td (Releve) Tj ET'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = objects.map((body, i) => {
    const offset = pdf.length
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
    return offset
  })
  const start = pdf.length
  pdf += `xref\n0 6\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`
  return new TextEncoder().encode(pdf)
}

test.group('Lecture des relevés PDF', () => {
  test('un PDF valide est ouvert par pdf.js', async ({ assert }) => {
    try {
      const statement = await parseStatement(tinyPdf())
      assert.deepEqual(statement.lines, [])
    } catch (error) {
      // Lu correctement mais refusé car ce n'est pas un relevé BoursoBank
      assert.instanceOf(error, StatementError)
      assert.notEqual((error as Error).message, 'Ce fichier n’est pas un PDF lisible.')
    }
  })

  test('un fichier qui n’est pas un PDF est refusé proprement', async ({ assert }) => {
    await assert.rejects(
      () => parseStatement(new TextEncoder().encode('pas un pdf')),
      'Ce fichier n’est pas un PDF lisible.'
    )
  })
})
