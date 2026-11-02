import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import useThemeColors from '~/components/use_theme_colors'
import ChartData from '~/components/chart_data'

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
        role="img"
        aria-label={`Répartition des dépenses, ${euros(total)} au total. Détail dans les données chiffrées ci-dessous.`}
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
      <ChartData caption="Répartition des dépenses par catégorie">
        <thead>
          <tr>
            <th scope="col">Catégorie</th>
            <th scope="col" className="b-num">
              Montant
            </th>
            <th scope="col" className="b-num">
              Part
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.name}>
              <th scope="row">{i.name}</th>
              <td className="b-num">{euros(i.spent)}</td>
              <td className="b-num">{Math.round((i.spent / total) * 100)} %</td>
            </tr>
          ))}
        </tbody>
      </ChartData>
    </div>
  )
}
