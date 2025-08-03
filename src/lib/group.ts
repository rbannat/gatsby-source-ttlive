import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { Group } from '@/api'

export const createGroupNodes = ({
  groups,
  createNode,
  createNodeId,
}: {
  groups: Group[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  groups.forEach((group) => {
    createNode(
      processGroup({
        group,
        createNodeId,
      }),
    )
  })
}

function processGroup({
  group,
  createNodeId,
}: {
  group: Group
  createNodeId: NodePluginArgs['createNodeId']
}) {
  const nodeId = createNodeId(`Group${group.name}`)

  group.leagues___NODE = group.leagueIds.map((leagueId: number) =>
    createNodeId(`League${leagueId}`),
  )
  delete group.leagueIds

  const nodeContent = JSON.stringify(group)
  const nodeData = {
    ...group,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Group`,
      content: nodeContent,
      contentDigest: createContentDigest(group),
    },
  }
  return nodeData
}
