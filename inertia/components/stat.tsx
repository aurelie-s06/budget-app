export default function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: string
  tone?: 'in' | 'out'
  hint?: string
}) {
  return (
    <div className="b-stat">
      <div className="b-stat__label">{label}</div>
      <div className={`b-stat__value ${tone ? `b-amount--${tone}` : ''}`}>{value}</div>
      {hint && <div className="b-stat__hint">{hint}</div>}
    </div>
  )
}
