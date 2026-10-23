import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import useThemeColors from '~/components/use_theme_colors'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

type Month = { month: string; balance: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const label = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

/**
 * Solde total (tous comptes) à la fin de chaque mois.
 */
export default function BalanceChart({ months }: { months: Month[] }) {
  const colors = useThemeColors()

  return (
    <>
      <div className="b-chart-line">
        <Line
          data={{
            labels: months.map((m) => label(m.month)),
            datasets: [
              {
                label: 'Solde',
                data: months.map((m) => m.balance),
                borderColor: colors.ink,
                borderWidth: 2,
                // couleurs du thème en hexadécimal : on ajoute une opacité
                backgroundColor: `${colors.ink}12`,
                fill: true,
                tension: 0.3,
                pointRadius: months.length > 12 ? 0 : 3,
                pointHoverRadius: 5,
                pointBackgroundColor: colors.card,
                pointBorderColor: colors.ink,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: colors.muted, maxTicksLimit: 8 },
                border: { color: colors.line },
              },
              y: {
                grid: { color: colors.line },
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
              tooltip: { callbacks: { label: (ctx) => `Solde : ${euros(ctx.parsed.y ?? 0)}` } },
            },
          }}
        />
      </div>

      <table className="sr-only">
        <caption>Solde total en fin de mois</caption>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Solde</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <td>{label(m.month)}</td>
              <td>{euros(m.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
