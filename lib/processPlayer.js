const { createContentDigest } = require(`gatsby-core-utils`)

exports.processPlayer = ({ player, teamId, createNodeId }) => {
  const nodeId = createNodeId(player.id)
  // create node relationship
  player.team___NODE = createNodeId(teamId)

  const nodeContent = JSON.stringify(player)
  const nodeData = Object.assign({}, player, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Player`,
      content: nodeContent,
      contentDigest: createContentDigest(player),
    },
  })
  return nodeData
}
