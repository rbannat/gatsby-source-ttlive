const { createContentDigest } = require(`gatsby-core-utils`)

exports.createGroupNodes = ({ groups, createNode, createNodeId }) => {
  groups.forEach((group) => {
    createNode(
      processGroup({
        group,
        createNodeId,
      })
    )
  })
}

exports.normalizeGroups = (groupsData) => {
  const { gruppe: groups } = groupsData
  return groups.map(({ title, staffeln }) => {
    const leagueIds = Array.isArray(staffeln.staffel)
      ? staffeln.staffel.map((league) => league.id).reverse()
      : [staffeln.staffel.id]
    return {
      name: title,
      leagueIds: leagueIds || [],
    }
  })
}

function processGroup({ group, createNodeId }) {
  const nodeId = createNodeId(`Group${group.name}`)

  group.leagues___NODE = group.leagueIds.map((leagueId) =>
    createNodeId(`League${leagueId}`)
  )
  delete group.leagueIds

  const nodeContent = JSON.stringify(group)
  const nodeData = Object.assign({}, group, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Group`,
      content: nodeContent,
      contentDigest: createContentDigest(group),
    },
  })
  return nodeData
}
