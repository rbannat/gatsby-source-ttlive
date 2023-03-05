const { createContentDigest } = require(`gatsby-core-utils`)

exports.createLeagueNode = ({
  leagueData,
  groupName,
  createNode,
  createNodeId,
}) => {
  const league = normalizeLeague(leagueData)
  createNode(
    processLeague({
      league,
      groupName,
      createNodeId,
    })
  )
}

function normalizeLeague({ staffelid, staffelname, staffelkurz, verbandid }) {
  return {
    id: staffelid,
    associationId: verbandid,
    name: staffelname,
    shortName: staffelkurz,
  }
}

function processLeague({ league, groupName, createNodeId }) {
  const nodeId = createNodeId(`League${league.id}`)
  // create node relationship
  league.association = createNodeId(`Association${league.associationId}`)
  delete league.associationId

  // create group relationship
  league.group = createNodeId(`Group${groupName}`)

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
