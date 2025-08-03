import { createContentDigest } from 'gatsby-core-utils'
import { Actions, NodePluginArgs } from 'gatsby'
import { Association } from '@/api/lib/association'

export const createAssociationNodes = async ({
  associations,
  createNode,
  createNodeId,
}: {
  associations: Association[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  // TODO: also create child associations
  associations.forEach((association) => {
    createNode(
      processAssociation({
        association,
        createNodeId,
      }),
    )
  })
}

function processAssociation({
  association,
  createNodeId,
}: {
  association: Association
  createNodeId: (id: string) => string
}) {
  const nodeId = createNodeId(`Association${association.id}`)
  const nodeContent = JSON.stringify(association)
  const nodeData = {
    ...association,
    id: nodeId,
    originalId: association.id,
    parent: null,
    children: [],
    internal: {
      type: `Association`,
      content: nodeContent,
      contentDigest: createContentDigest(association),
    },
  }
  return nodeData
}
