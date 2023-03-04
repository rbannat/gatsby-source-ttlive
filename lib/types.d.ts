export type Team = {
  id: string
  leagueId: string
  clubName: string
  clubShortName: string
  name: string
  shortName: string
  position: number
  gamesPlayed: number | null
  won: number | null
  drawn: number | null
  lost: number | null
  matchesWon: number | null
  matchesLost: number | null
  matchesDiff: number | null
  setsDiff: number | null
  pointsWon: number | null
  pointsLost: number | null
  pointsDiff: number | null
  playersFirstHalf: string[] | null
  playersSecondHalf: string[] | null
}

export type Club = {
  name: string
  shortName: string
}
