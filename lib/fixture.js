const { createContentDigest } = require(`gatsby-core-utils`)
const { getResult } = require('./helpers')

exports.processFixture = ({ fixture, createNodeId }) => {
  const nodeId = createNodeId(`${fixture.nr}-${fixture.date}`)
  // create home team relationship
  fixture.homeTeam___NODE = createNodeId(`Team${fixture.homeTeamId}`)
  delete fixture.homeTeamId
  // create guest team relationship
  fixture.guestTeam___NODE = createNodeId(`Team${fixture.guestTeamId}`)
  delete fixture.guestTeamId

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
    ({ nr, datum, heimteamid, gastteamid, ergebnis, kennzeichnung, link }) => ({
      nr,
      isFirstHalf,
      date: datum,
      homeTeamId: heimteamid,
      guestTeamId: gastteamid,
      result:
        ergebnis && ergebnis !== 'Vorbericht' ? getResult(ergebnis) : null,
      note: kennzeichnung,
      link,
    })
  )
}
