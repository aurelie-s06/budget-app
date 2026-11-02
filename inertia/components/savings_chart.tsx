import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import useThemeColors from '~/components/use_theme_colors'
import ChartData from '~/components/chart_data'

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
          role="img"
          aria-label="Barres de l’épargne versée chaque mois. Détail dans les données chiffrées ci-dessous."
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
      <ChartData caption="Épargne par mois">
        <thead>
          <tr>
            <th scope="col">Mois</th>
            <th scope="col" className="b-num">
              Épargne
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">
                <Link href={`/months?month=${m.month}`} className="il">
                  {label(m.month)}
                </Link>
              </th>
              <td className="b-num">{euros(m.savings)}</td>
            </tr>
          ))}
        </tbody>
      </ChartData>
    </>
  )
}
