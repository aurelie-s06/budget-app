import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { router } from '@inertiajs/react'
import useThemeColors from '~/components/use_theme_colors'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

type Month = { month: string; income: number; expenses: number }

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const label = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

/**
 * Revenus et dépenses par mois, en barres groupées.
 * Un clic sur un mois ouvre sa vue détaillée.
 */
export default function MonthlyChart({ months }: { months: Month[] }) {
  const colors = useThemeColors()
  const bar = { borderRadius: 4, borderSkipped: 'start' as const, maxBarThickness: 28 }

  return (
    <>
      <div className="b-chart-bar">
        <Bar
          data={{
            labels: months.map((m) => label(m.month)),
            datasets: [
              {
                label: 'Revenus',
                data: months.map((m) => m.income),
                backgroundColor: colors.in,
                ...bar,
              },
              {
                label: 'Dépenses',
                data: months.map((m) => m.expenses),
                backgroundColor: colors.out,
                ...bar,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            datasets: { bar: { categoryPercentage: 0.6, barPercentage: 0.9 } },
            interaction: { mode: 'index', intersect: false },
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
                ticks: { color: colors.muted },
                border: { color: colors.line },
              },
              y: {
                beginAtZero: true,
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
              legend: {
                position: 'top',
                align: 'end',
                labels: { color: colors.muted, usePointStyle: true, pointStyle: 'rectRounded' },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label} : ${euros(ctx.parsed.y ?? 0)}`,
                  footer: (items) => {
                    const m = months[items[0].dataIndex]
                    return `Revenus − dépenses : ${euros(m.income - m.expenses)}`
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* Version tableau pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>Revenus et dépenses par mois</caption>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Revenus</th>
            <th>Dépenses</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <td>{label(m.month)}</td>
              <td>{euros(m.income)}</td>
              <td>{euros(m.expenses)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
