import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { router } from '@inertiajs/react'
import useThemeColors from '~/components/use_theme_colors'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

type Month = { month: string; savings: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const label = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

/**
 * Épargne versée chaque mois sur les comptes épargne : vert si positive, rouge sinon.
 * Un clic sur un mois ouvre sa vue détaillée.
 */
export default function SavingsChart({ months }: { months: Month[] }) {
  const colors = useThemeColors()

  return (
    <>
      <div className="b-chart-line">
        <Bar
          data={{
            labels: months.map((m) => label(m.month)),
            datasets: [
              {
                label: 'Épargne',
                data: months.map((m) => m.savings),
                backgroundColor: months.map((m) => (m.savings < 0 ? colors.out : colors.in)),
                borderRadius: 4,
                borderSkipped: false,
                maxBarThickness: 22,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            onClick: (_, elements) => {
              if (elements[0]) router.visit(`/months?month=${months[elements[0].index].month}`)
            },
            onHover: (event, elements) => {
              const target = event.native?.target as HTMLElement | undefined
              if (target) target.style.cursor = elements.length ? 'pointer' : 'default'
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: colors.muted, maxTicksLimit: 8 },
                border: { color: colors.line },
              },
              y: {
                grid: { color: (ctx) => (ctx.tick.value === 0 ? colors.muted : colors.line) },
                border: { display: false },
                ticks: {
                  color: colors.muted,
                  maxTicksLimit: 5,
                  callback: (v) => `${Number(v).toLocaleString('fr-FR')} €`,
                },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `Épargne : ${euros(ctx.parsed.y ?? 0)}` } },
            },
          }}
        />
      </div>

      <table className="sr-only">
        <caption>Épargne par mois</caption>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Épargne</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <td>{label(m.month)}</td>
              <td>{euros(m.savings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
