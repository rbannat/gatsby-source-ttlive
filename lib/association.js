const { createContentDigest } = require(`gatsby-core-utils`)

exports.processAssociation = ({ association, createNodeId }) => {
  const nodeId = createNodeId(`Association${association.id}`)
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

exports.normalizeAssociations = associationsData => {
  return associationsData.verband.map(({ id, name, logo, sportart_id }) => ({
    id,
    name,
    sportCategoryId: sportart_id,
    logo,
  }))
}
