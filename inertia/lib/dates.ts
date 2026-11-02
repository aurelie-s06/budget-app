// Date du jour dans le fuseau de l'utilisateur (toISOString donnerait la date UTC,
// donc la veille entre minuit et 2 h en France)
export function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export const currentMonth = () => today().slice(0, 7)
