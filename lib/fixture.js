const { createContentDigest } = require(`gatsby-core-utils`)
const { getResult } = require('./helpers')

exports.createFixtureNodes = ({
  leagueId,
  fixtureDataFirstHalf,
  fixtureDataSecondHalf,
  createNode,
  createNodeId,
}) => {
  const fixtures = [
    ...(fixtureDataFirstHalf
      ? normalizeFixtures(
          Array.isArray(fixtureDataFirstHalf)
            ? fixtureDataFirstHalf
            : [fixtureDataFirstHalf],
          leagueId,
          true
        )
      : []),
    ...(fixtureDataSecondHalf
      ? normalizeFixtures(
          Array.isArray(fixtureDataSecondHalf)
            ? fixtureDataSecondHalf
            : [fixtureDataSecondHalf],
          leagueId,
          false
        )
      : []),
  ]
  fixtures.forEach((fixture) => {
    createNode(
      processFixture({
        fixture,
        createNodeId,
      })
    )
  })
  return fixtures
}

function normalizeFixtures(fixturesData, leagueId, isFirstHalf = null) {
  return fixturesData.map(
    ({ nr, datum, heimteamid, gastteamid, ergebnis, kennzeichnung, link }) => ({
      leagueId,
      nr,
      isFirstHalf,
      date: datum,
      homeTeamId: heimteamid,
      guestTeamId: gastteamid,
      result: ergebnis ? getResult(ergebnis) : null,
      note: kennzeichnung,
      link,
    })
  )
}

function processFixture({ fixture, createNodeId }) {
  const nodeId = createNodeId(
    `Fixture${fixture.nr}-${fixture.date}-${fixture.link}`
  )
  // create home team relationship
  fixture.homeTeam___NODE = createNodeId(`Team${fixture.homeTeamId}`)
  delete fixture.homeTeamId
  // create guest team relationship
  fixture.guestTeam___NODE = createNodeId(`Team${fixture.guestTeamId}`)
  delete fixture.guestTeamId
  // create league node relationship
  fixture.league___NODE = createNodeId(`League${fixture.leagueId}`)
  delete fixture.leagueId

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
