const { createContentDigest } = require(`gatsby-core-utils`)

exports.createClubNodes = ({ clubs, createNode, createNodeId }) => {
  clubs.forEach((club) => {
    createNode(
      processClub({
        club,
        createNodeId,
      })
    )
  })
}

function processClub({ club, createNodeId }) {
  const nodeId = createNodeId(`Club${club.name}`)

  const nodeContent = JSON.stringify(club)
  const nodeData = Object.assign({}, club, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Club`,
      content: nodeContent,
      contentDigest: createContentDigest(club),
    },
  })
  return nodeData
}
