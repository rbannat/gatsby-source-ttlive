const { createContentDigest } = require(`gatsby-core-utils`)

exports.processTeam = ({ team, createNodeId }) => {
  const nodeId = createNodeId(team.id)
  // create players node relationships
  team.playersFirstHalf = team.playersFirstHalf.map(({ position, id }) => {
    return {
      position,
      player___NODE: createNodeId(id)
    }
  })
  team.playersSecondHalf = team.playersSecondHalf.map(({ position, id }) => {
    return {
      position,
      player___NODE: createNodeId(id)
    }
  })

  // create fixtures node relationship
  team.fixtures___NODE = team.fixtures.map(fixture =>
    createNodeId(`${fixture.id}-${fixture.date}`)
  )
  delete team.fixtures

  const nodeContent = JSON.stringify(team)
  const nodeData = Object.assign({}, team, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Team`,
      content: nodeContent,
      contentDigest: createContentDigest(team)
    }
  })
  return nodeData
}

exports.normalizeTeams = teamsData => {
  return teamsData.map(teamData => {
    return normalizeTeam(teamData)
  })
}

function normalizeTeam({
  teamid,
  mannschaft,
  platz,
  spiele,
  siege,
  unentschieden,
  niederlagen,
  saetzedif,
  spieleplus,
  spieleminus,
  spieledif,
  punkteplus,
  punkteminus,
  punktedif
}) {
  return {
    id: teamid,
    name: mannschaft,
    position: parseInt(platz),
    gamesPlayed: parseInt(spiele),
    won: parseInt(siege),
    drawn: parseInt(unentschieden),
    lost: parseInt(niederlagen),
    matchesWon: parseInt(spieleplus),
    matchesLost: parseInt(spieleminus),
    matchesDiff: parseInt(spieledif),
    setsDiff: parseInt(saetzedif),
    pointsWon: parseInt(punkteplus),
    pointsLost: parseInt(punkteminus),
    pointsDiff: parseInt(punktedif)
    // fixtures: normalizeFixtures(fixturesData),
    // playersFirstHalf: normalizePlayers(playersDataFirstHalf),
    // playersSecondHalf: normalizePlayers(playersDataSecondHalf)
  }
}
