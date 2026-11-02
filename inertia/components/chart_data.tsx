import { type ReactNode } from 'react'

/**
 * Données chiffrées d'un graphique, en tableau : pour tout le monde, et seul accès
 * au clavier ou au lecteur d'écran, le graphique étant dessiné dans un canvas.
 */
export default function ChartData({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <details className="b-chart-data">
      <summary>Voir les données chiffrées</summary>
      <div className="b-table-wrap">
        <table className="b-table">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </details>
  )
}
