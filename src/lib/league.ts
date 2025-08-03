import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { League } from '@/api'

export const createLeagueNode = ({
  league,
  groupName,
  createNode,
  createNodeId,
}: {
  league: League
  groupName: string
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  createNode(
    processLeague({
      league,
      groupName,
      createNodeId,
    }),
  )
}

function processLeague({
  league,
  groupName,
  createNodeId,
}: {
  league: League
  groupName: string
  createNodeId: NodePluginArgs['createNodeId']
}) {
  const nodeId = createNodeId(`League${league.id}`)
  // create node relationship
  league.association = createNodeId(`Association${league.associationId}`)
  delete league.associationId

  // create group relationship
  league.group = createNodeId(`Group${groupName}`)

  const nodeContent = JSON.stringify(league)
  const nodeData = {
    ...league,
    id: nodeId,
    ogiginalId: league.id,
    parent: null,
    children: [],
    internal: {
      type: `League`,
      content: nodeContent,
      contentDigest: createContentDigest(league),
    },
  }
  return nodeData
}
