const { createContentDigest } = require(`gatsby-core-utils`)
const { fetchAndParse } = require(`./helpers`)
const associationsUrl = 'https://app.web4sport.de/ajax/Verband.ashx'

exports.createAssociationNodes = async ({ createNode, createNodeId }) => {
  // TODO: also create child associations
  const associations = normalizeAssociations(
    await fetchAndParse(associationsUrl)
  )
  associations.forEach((association) => {
    createNode(
      processAssociation({
        association,
        createNodeId,
      })
    )
  })
}

function normalizeAssociations(associationsData) {
  return associationsData.verband.map(({ id, name, logo, sportart_id }) => ({
    id,
    name,
    sportCategoryId: sportart_id,
    logo,
  }))
}

function processAssociation({ association, createNodeId }) {
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
