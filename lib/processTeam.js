const { createContentDigest } = require(`gatsby-core-utils`)

exports.processTeam = ({ team, createNodeId }) => {
  const nodeId = createNodeId(team.id)
  // create players node relationship
  team.players___NODE = team.players.map(player => createNodeId(player.id))
  delete team.players

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
      contentDigest: createContentDigest(team),
    },
  })
  return nodeData
}
