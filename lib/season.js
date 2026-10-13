// The season the public site is promoting. Every page that names the current
// season reads from here, so rolling over to the next one is a one-file edit.
export const CURRENT_SEASON = {
  label: "SZN 5",
  name: "Winter 2026",
  startDate: "November 1, 2026",
  startShort: "Nov 1",
}

// "SZN 5 · Winter 2026"
export const SEASON_TITLE = `${CURRENT_SEASON.label} · ${CURRENT_SEASON.name}`
