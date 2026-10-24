import { Link } from '@adonisjs/inertia/react'

type Day = { date: string; amount: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Intensité de 0 (rien) à 4 (le jour le plus dépensier)
function level(amount: number, max: number) {
  if (amount <= 0 || max <= 0) return 0
  return Math.max(1, Math.ceil((amount / max) * 4))
}

/**
 * Un carré par jour du mois, plus foncé quand on a dépensé davantage.
 * Survol : montant dépensé ce jour-là ; clic : opérations du jour.
 */
export default function SpendingCalendar({ days }: { days: Day[] }) {
  const today = new Date().toISOString().slice(0, 10)
  const max = Math.max(0, ...days.map((d) => d.amount))
  // Lundi = 0 : cases vides avant le 1er du mois
  const offset = (new Date(`${days[0].date}T00:00`).getDay() + 6) % 7

  const past = days.filter((d) => d.date <= today)
  const noSpend = past.filter((d) => d.amount === 0).length
  const top = days.reduce((a, b) => (b.amount > a.amount ? b : a), days[0])
  const dayLabel = (date: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${date}T00:00`).toLocaleDateString('fr-FR', opts)

  return (
    <div className="b-cal">
      <div className="b-cal__grid" role="list">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="b-cal__weekday" aria-hidden="true">
            {w}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`empty-${i}`} aria-hidden="true" />
        ))}
        {days.map((d) => {
          const future = d.date > today
          const label = dayLabel(d.date, { weekday: 'long', day: 'numeric', month: 'long' })
          const amount = future ? 'à venir' : d.amount > 0 ? euros(d.amount) : 'aucune dépense'
          const className = [
            'b-cal__day',
            `b-cal__day--l${level(d.amount, max)}`,
            future && 'b-cal__day--future',
            d.date === today && 'b-cal__day--today',
          ]
            .filter(Boolean)
            .join(' ')
          // Bulle affichée au survol (ou au focus clavier)
          const content = (
            <>
              {Number(d.date.slice(8))}
              <span className="b-cal__tip" role="tooltip">
                <span className="b-capitalize">{label}</span>
                <strong>{amount}</strong>
              </span>
            </>
          )

          // Un jour passé ouvre ses opérations
          return future ? (
            <span key={d.date} role="listitem" className={className} tabIndex={0}>
              {content}
            </span>
          ) : (
            <Link
              key={d.date}
              role="listitem"
              href={`/transactions?day=${d.date}`}
              className={className}
              aria-label={`${label} : ${amount}. Voir les opérations du jour`}
            >
              {content}
            </Link>
          )
        })}
      </div>

      <div className="b-cal__legend" aria-hidden="true">
        Moins
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`b-cal__swatch b-cal__day--l${l}`} />
        ))}
        Plus
      </div>

      <dl className="b-cal__facts">
        <div>
          <dt>Jour le plus dépensier</dt>
          <dd>
            {top.amount > 0
              ? `${dayLabel(top.date, { day: 'numeric', month: 'short' })} · ${euros(top.amount)}`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Jours sans dépense</dt>
          <dd>
            {noSpend} / {past.length}
          </dd>
        </div>
      </dl>
    </div>
  )
}
