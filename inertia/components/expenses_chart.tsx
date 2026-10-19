import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

// Chart.js ne charge que les éléments dont on a besoin
ChartJS.register(ArcElement, Tooltip, Legend)

type Item = { name: string; color: string | null; spent: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function ExpensesChart({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p>Aucune dépense catégorisée ce mois-ci.</p>
  }

  return (
    <div style={{ maxWidth: 340 }}>
      <Doughnut
        data={{
          labels: items.map((i) => i.name),
          datasets: [
            {
              data: items.map((i) => i.spent),
              backgroundColor: items.map((i) => i.color ?? '#6b7280'),
            },
          ],
        }}
        options={{
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label} : ${euros(ctx.parsed)}`,
              },
            },
          },
        }}
      />
    </div>
  )
}
