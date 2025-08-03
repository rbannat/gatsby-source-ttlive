import getResult from '../utils/get-result'

export type Fixture = {
  leagueId: number
  nr: number
  isFirstHalf: boolean | null
  date: string
  homeTeamId: number
  guestTeamId: number
  result: number[] | null
  note: string
  link: string
}

export const normalizeFixtures = (
  leagueId: number,
  fixturesDataFirstHalf: any[] | null,
  fixturesDataSecondHalf: any[] | null,
): Fixture[] => {
  const fixturesFirstHalf = fixturesDataFirstHalf?.map((fixtureData) =>
    normalizeFixture(leagueId, fixtureData, true),
  )
  const fixturesSecondHalf = fixturesDataSecondHalf?.map((fixtureData) =>
    normalizeFixture(leagueId, fixtureData, false),
  )
  return [...(fixturesFirstHalf ?? []), ...(fixturesSecondHalf ?? [])]
}

export function normalizeFixture(
  leagueId: number,
  fixtureData: Record<string, any>,
  isFirstHalf: boolean | null = null,
): Fixture {
  const { Nr, Datum, HeimTeamID, GastTeamID, Ergebnis, Kennzeichnung, Link } =
    fixtureData
  return {
    leagueId,
    nr: Nr,
    isFirstHalf,
    date: Datum,
    homeTeamId: HeimTeamID,
    guestTeamId: GastTeamID,
    result: Ergebnis ? getResult(Ergebnis) : null,
    note: Kennzeichnung,
    link: Link,
  }
}
