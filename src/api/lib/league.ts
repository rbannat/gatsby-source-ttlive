import { firstHalfCompleted } from '@/constants'
import fetchAndParseXML from '../utils/fetch-and-parse-xml'
import { Fixture, normalizeFixtures } from './fixture'
import { normalizeTeams, Team } from './team'

export interface League {
  id: number
  associationId: number
  name: string
  shortName: string
  teams: Team[]
  fixtures: Fixture[]
}

export async function getLeague(leagueId: number): Promise<League | null> {
  const isSecondHalf = firstHalfCompleted
  const {
    leagueData,
    teamsData: teamsDataFirstHalf,
    fixturesData: fixturesDataFirstHalf,
  } = await getLeagueData(leagueId)
  const leagueDataSecondHalf = isSecondHalf
    ? await getLeagueData(leagueId, true)
    : null
  if (!leagueData) {
    return null
  }
  const league = normalizeLeague(
    leagueData,
    teamsDataFirstHalf,
    leagueDataSecondHalf?.teamsData ?? null,
    fixturesDataFirstHalf,
    leagueDataSecondHalf?.fixturesData ?? null,
  )
  return league
}

async function getLeagueData(
  leagueId: number,
  isSecondHalf: boolean = false,
): Promise<{
  leagueData: Record<string, any> | null
  teamsData: any[] | null
  fixturesData: any[] | null
}> {
  const leagueUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=${
    isSecondHalf ? 2 : 1
  }&SpielerRunde=${isSecondHalf ? 2 : 1}`
  try {
    const response = await fetchAndParseXML(leagueUrl)
    if (response?.error) {
      throw new Error(`Error fetching league data: ${response.error}`)
    }
    if (!response?.data?.Staffel) {
      return { leagueData: null, teamsData: null, fixturesData: null }
    }
    return {
      leagueData: response.data.Staffel,
      teamsData: response?.data?.Teams?.Mannschaft ?? null,
      fixturesData: response?.data?.Spielplan?.Runde?.Spiel ?? null,
    }
  } catch (error) {
    console.error('Error fetching league data:', error)
    throw error
  }
}

function normalizeLeague(
  leagueData: Record<string, any>,
  teamsDataFirstHalf: any[] | null,
  teamsDataSecondHalf: any[] | null,
  fixturesDataFirstHalf: any[] | null,
  fixturesDataSecondHalf: any[] | null,
): League {
  const { StaffelID, VerbandID, StaffelName, StaffelKurz } = leagueData
  const leagueId = StaffelID
  return {
    id: leagueId,
    associationId: VerbandID,
    name: StaffelName,
    shortName: StaffelKurz,
    teams: normalizeTeams(leagueId, teamsDataFirstHalf, teamsDataSecondHalf),
    fixtures: normalizeFixtures(
      leagueId,
      fixturesDataFirstHalf,
      fixturesDataSecondHalf,
    ),
  }
}
