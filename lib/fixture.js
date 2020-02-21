const { createContentDigest } = require(`gatsby-core-utils`)
const { getResult } = require('./helpers')

exports.processFixture = ({ fixture, createNodeId }) => {
  const nodeId = createNodeId(`${fixture.id}-${fixture.date}`)
  const nodeContent = JSON.stringify(fixture)
  const nodeData = Object.assign({}, fixture, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Fixture`,
      content: nodeContent,
      contentDigest: createContentDigest(fixture),
    },
  })
  return nodeData
}

exports.normalizeFixtures = (fixturesData, isFirstHalf = null) => {
  return fixturesData.map(
    ({
      nr,
      datum,
      heimmannschaft,
      gastmannschaft,
      ergebnis,
      kennzeichnung,
      link,
    }) => ({
      id: nr,
      isFirstHalf,
      date: datum,
      homeTeam: heimmannschaft,
      guestTeam: gastmannschaft,
      result:
        ergebnis && ergebnis !== 'Vorbericht' ? getResult(ergebnis) : null,
      note: kennzeichnung,
      link,
    })
  )
}
