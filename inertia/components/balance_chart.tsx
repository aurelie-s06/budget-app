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
import ChartData from '~/components/chart_data'

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
          role="img"
          aria-label="Courbe du solde total en fin de mois. Détail dans les données chiffrées ci-dessous."
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
      <ChartData caption="Solde total en fin de mois">
        <thead>
          <tr>
            <th scope="col">Mois</th>
            <th scope="col" className="b-num">
              Solde
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">{label(m.month)}</th>
              <td className="b-num">{euros(m.balance)}</td>
            </tr>
          ))}
        </tbody>
      </ChartData>
    </>
  )
}
