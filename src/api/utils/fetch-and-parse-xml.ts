import { XMLParser } from 'fast-xml-parser'

export default async function fetchAndParseXML(url: string) {
  try {
    const response = await fetch(url)
    const xmlText = await response.text()

    const parser = new XMLParser({
      htmlEntities: true,
    })
    const json = parser.parse(xmlText)

    return json
  } catch (err) {
    console.log('Error fetching or parsing XML:', err)
    throw err
  }
}
