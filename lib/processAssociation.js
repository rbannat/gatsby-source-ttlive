const { createContentDigest } = require(`gatsby-core-utils`)

exports.processAssociation = ({ association, createNodeId }) => {
  const nodeId = createNodeId(association.id)
  const nodeContent = JSON.stringify(association)
  const nodeData = Object.assign({}, association, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Association`,
      content: nodeContent,
      contentDigest: createContentDigest(association),
    },
  })
  return nodeData
}
