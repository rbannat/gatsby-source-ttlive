const { createContentDigest } = require(`gatsby-core-utils`)

exports.processLeague = ({ league, createNodeId }) => {
  const nodeId = createNodeId(league.id)
  // create node relationship
  league.association___NODE = createNodeId(league.association)
  delete league.association

  const nodeContent = JSON.stringify(league)
  const nodeData = Object.assign({}, league, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `League`,
      content: nodeContent,
      contentDigest: createContentDigest(league),
    },
  })
  return nodeData
}
