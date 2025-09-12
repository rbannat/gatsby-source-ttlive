import getResult from '../utils/get-result'

export interface Player {
  id: number
  name: string
  scores: PlayerScore[]
}

export interface PlayerScore {
  playerId: number
  teamId: number
  position: string
  isSecondHalf: boolean
  gamesPlayed: number
  pk1Diff: number[] | null
  pk2Diff: number[] | null
  pk3Diff: number[] | null
  pk4Diff: number[] | null
  won: number
  lost: number
  attributes: string | null
  score: number | null
}

export function normalizePlayer(
  playerData: Record<string, any>,
  teamId: number,
  isSecondHalf: boolean = false,
): Player {
  const {
    ID,
    Position,
    Spielername,
    Teilnahme,
    PK1,
    PK2,
    PK3,
    PK4,
    GesamtPlus,
    GesamtMinus,
    Attribute,
    LivePZ,
  } = playerData
  return {
    id: ID,
    name: Spielername,
    scores: [
      {
        playerId: ID,
        teamId,
        position: typeof Position === 'string' ? Position : Position.toString(),
        isSecondHalf,
        gamesPlayed: Teilnahme ?? 0,
        pk1Diff: PK1 ? getResult(PK1) : null,
        pk2Diff: PK2 ? getResult(PK2) : null,
        pk3Diff: PK3 ? getResult(PK3) : null,
        pk4Diff: PK4 ? getResult(PK4) : null,
        won: GesamtPlus ?? 0,
        lost: GesamtMinus ?? 0,
        attributes: Attribute ?? null,
        score: LivePZ || null, // 899, '', ...
      },
    ],
  }
}
