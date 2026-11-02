/**
 * « Compte courant → Livret A » : la flèche est remplacée par un mot à la lecture vocale.
 */
export default function TransferRoute({ from, to }: { from: string; to: string | null }) {
  return (
    <>
      {from} <span aria-hidden="true">→</span>
      <span className="sr-only"> vers </span> {to}
    </>
  )
}
