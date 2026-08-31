import { XMLParser } from 'fast-xml-parser'

export type FetchAndParseXMLOptions = {
  // Tags that should always be parsed as arrays, even when the source XML
  // contains only a single occurrence. fast-xml-parser only returns an array
  // when a tag occurs more than once, which breaks any code that assumes an
  // array shape (e.g. calling `.map`). Callers know which of their own tags
  // represent collections and should list them here.
  alwaysArrayTags?: string[]
}

export default async function fetchAndParseXML(
  url: string,
  options: FetchAndParseXMLOptions = {},
) {
  const alwaysArrayTags = new Set(options.alwaysArrayTags ?? [])

  try {
    const response = await fetch(url)
    const xmlText = await response.text()

    const parser = new XMLParser({
      htmlEntities: true,
      isArray: (tagName) => alwaysArrayTags.has(tagName),
    })
    const json = parser.parse(xmlText)

    return json
  } catch (err) {
    console.log('Error fetching or parsing XML:', err)
    throw err
  }
}
