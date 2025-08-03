import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { Player, PlayerScore } from '@/api'

export const createPlayerNodes = ({
  players,
  createNode,
  createNodeId,
}: {
  players: Player[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  players.forEach((player) => {
    const playerNode = processPlayer({
      player,
      createNodeId,
      createNode,
    })
    createNode(playerNode)
  })
}

function processPlayer({
  player,
  createNodeId,
  createNode,
}: {
  player: Player
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) {
  const nodeId = createNodeId(`Player${player.id}`)
  player.scores___NODE = player.scores.map((score: PlayerScore) => {
    const nodeData = processPlayerScore({
      playerScore: score,
      createNodeId,
    })
    createNode(nodeData)

    return nodeData.id
  })
  delete player.scores

  const nodeContent = JSON.stringify(player)
  const nodeData = {
    ...player,
    originalId: player.id,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Player`,
      content: nodeContent,
      contentDigest: createContentDigest(player),
    },
  }

  return nodeData
}

function processPlayerScore({
  playerScore,
  createNodeId,
}: {
  playerScore: PlayerScore
  createNodeId: NodePluginArgs['createNodeId']
}) {
  const nodeId = createNodeId(
    `PlayerScore${playerScore.playerId}${playerScore.position}${playerScore.teamId}${playerScore.isSecondHalf}`,
  )
  playerScore.team___NODE = createNodeId(`Team${playerScore.teamId}`)
  delete playerScore.teamId

  playerScore.player___NODE = createNodeId(`Player${playerScore.playerId}`)
  delete playerScore.playerId

  const nodeContent = JSON.stringify(playerScore)
  const nodeData = {
    ...playerScore,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `PlayerScore`,
      content: nodeContent,
      contentDigest: createContentDigest(playerScore),
    },
  }
  return nodeData
}
