import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import useThemeColors from '~/components/use_theme_colors'

// Chart.js ne charge que les éléments dont on a besoin
ChartJS.register(ArcElement, Tooltip, Legend)

type Item = { name: string; color: string | null; spent: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function ExpensesChart({ items }: { items: Item[] }) {
  const colors = useThemeColors()

  if (items.length === 0) {
    return <p className="b-empty">Aucune dépense ce mois-ci.</p>
  }

  const total = items.reduce((sum, i) => sum + i.spent, 0)

  return (
    <div className="b-chart">
      <p className="b-chart__total">
        Total <strong className="b-amount">{euros(total)}</strong>
      </p>
      <Doughnut
        data={{
          labels: items.map((i) => i.name),
          datasets: [
            {
              data: items.map((i) => i.spent),
              backgroundColor: items.map((i) => i.color ?? colors.muted),
              // fin liseré de la couleur du fond entre les parts
              borderColor: colors.card,
              borderWidth: 2,
              hoverOffset: 4,
            },
          ],
        }}
        options={{
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: colors.muted,
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 14,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.label} : ${euros(ctx.parsed)} (${Math.round((ctx.parsed / total) * 100)} %)`,
              },
            },
          },
        }}
      />
    </div>
  )
}
