export default function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'in' | 'out'
}) {
  return (
    <div className="b-stat">
      <div className="b-stat__label">{label}</div>
      <div className={`b-stat__value ${tone ? `b-amount--${tone}` : ''}`}>{value}</div>
    </div>
  )
}
