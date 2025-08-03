import fetchAndParseXML from '@/api/utils/fetch-and-parse-xml'

export interface Association {
  id: number
  name: string
  sportCategoryId: number
  logo: string
}

type AssociationData = {
  id: number
  name: string
  sportart_id: number
  logo: string
  children?: { verband: unknown[] }
}

const associationsUrl = 'https://app.web4sport.de/ajax/Verband.ashx'

export async function getAssociations() {
  const associationsData = await getAssociationsData()
  const associations = normalizeAssociations(associationsData)
  return associations
}

async function getAssociationsData() {
  try {
    const response = await fetchAndParseXML(associationsUrl)
    return response?.data?.verband ?? []
  } catch (error) {
    console.error('Error fetching groups data:', error)
    throw error
  }
}

function normalizeAssociations(
  associationsData: AssociationData[],
): Association[] {
  return associationsData.map(({ id, name, logo, sportart_id }) => ({
    id,
    name,
    sportCategoryId: sportart_id,
    logo,
  }))
}
