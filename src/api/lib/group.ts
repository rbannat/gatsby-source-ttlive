import fetchAndParseXML from '../utils/fetch-and-parse-xml'

const associationId = 397
const groupsUrl = `https://app.web4sport.de/ajax/tischtennis/staffeln.ashx?VerbandID=${associationId}`

export interface Group {
  name: string
  leagueIds: number[]
}

/**
 * Erwachsene, Jugend, ...
 */
export async function getGroups() {
  const groupsData = await getGroupsData()
  const groups = normalizeGroups(groupsData)
  return groups
}

async function getGroupsData() {
  try {
    const data = await fetchAndParseXML(groupsUrl)
    return data?.root?.gruppe ?? []
  } catch (error) {
    console.error('Error fetching groups data:', error)
    throw error
  }
}

function normalizeGroups(groupsData: any): Group[] {
  return groupsData.map(({ title, staffeln }: any) => {
    const leagueIds = Array.isArray(staffeln.staffel)
      ? staffeln.staffel.map((league: any) => league.id).reverse()
      : [staffeln.staffel.id]
    return {
      name: title,
      leagueIds: leagueIds || [],
    }
  })
}
