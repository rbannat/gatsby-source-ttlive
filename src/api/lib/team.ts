import { normalizePlayer, Player } from './player'

export interface Team {
  id: number
  name: string
  leagueId: number
  clubName: string
  clubShortName: string
  shortName: string
  position: number
  gamesPlayed: number
  won: number
  drawn: number
  lost: number
  matchesWon: number
  matchesLost: number
  matchesDiff: number
  setsDiff: number
  pointsWon: number
  pointsLost: number
  pointsDiff: number
  playersFirstHalf: Player[]
  playersSecondHalf: Player[]
}

// teamsData can be either an array of team objects or a single team object
export const normalizeTeams = (
  leagueId: number,
  teamsDataFirstHalf: any[] | Record<string, any> | null,
  teamsDataSecondHalf: any[] | Record<string, any> | null,
): Team[] => {
  if (!teamsDataFirstHalf) return []
  return Array.isArray(teamsDataFirstHalf)
    ? teamsDataFirstHalf.map((teamDataFirstHalf, index) => {
        return normalizeTeam(
          leagueId,
          teamDataFirstHalf,
          (teamsDataSecondHalf as [])?.[index] ?? null,
        )
      })
    : [normalizeTeam(leagueId, teamsDataFirstHalf, teamsDataSecondHalf ?? null)]
}

function normalizeTeam(
  leagueId: number,
  teamDataFirstHalf: Record<string, any>,
  teamDataSecondHalf: Record<string, any> | null,
): Team {
  const {
    TeamID,
    TeamName,
    TeamNameKurz,
    Tabelle: {
      Platz,
      Spiele,
      Siege,
      Unentschieden,
      Niederlagen,
      SaetzeDif,
      SpielePlus,
      SpieleMinus,
      SpieleDif,
      PunktePlus,
      PunkteMinus,
      PunkteDif,
    },
    Bilanz,
  } = teamDataFirstHalf
  const BilanzSecondHalf = teamDataSecondHalf?.Bilanz
  return {
    id: TeamID,
    leagueId,
    clubName: stripRomanNumeral(TeamName),
    clubShortName: stripRomanNumeral(TeamNameKurz),
    name: TeamName,
    shortName: TeamNameKurz,
    position: Platz,
    gamesPlayed: Spiele,
    won: Siege,
    drawn: Unentschieden,
    lost: Niederlagen,
    matchesWon: SpielePlus,
    matchesLost: SpieleMinus,
    matchesDiff: SpieleDif,
    setsDiff: SaetzeDif,
    pointsWon: PunktePlus,
    pointsLost: PunkteMinus,
    pointsDiff: PunkteDif,
    playersFirstHalf:
      Bilanz?.Spieler?.length > 0
        ? Bilanz.Spieler.map((playerData: Record<string, any>) =>
            normalizePlayer(playerData, TeamID),
          )
        : [],
    playersSecondHalf:
      BilanzSecondHalf?.Spieler?.length > 0
        ? BilanzSecondHalf.Spieler.map((playerData: Record<string, any>) =>
            normalizePlayer(playerData, TeamID, true),
          )
        : [],
  }
}

const romanNumeralRegex =
  / M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/

function stripRomanNumeral(string: string): string {
  return string.replace(romanNumeralRegex, '')
}
