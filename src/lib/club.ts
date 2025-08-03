import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { Club } from '@/api'

export const createClubNodes = ({
  clubs,
  createNode,
  createNodeId,
}: {
  clubs: Club[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  clubs.forEach((club) => {
    createNode(
      processClub({
        club,
        createNodeId,
      }),
    )
  })
}

function processClub({
  club,
  createNodeId,
}: {
  club: Club
  createNodeId: NodePluginArgs['createNodeId']
}) {
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
