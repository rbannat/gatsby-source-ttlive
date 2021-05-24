const { createContentDigest } = require(`gatsby-core-utils`)
const { getResult } = require(`./helpers`)

exports.createPlayerNodes = ({ players, createNode, createNodeId }) => {
  players.forEach((player) => {
    createNode(
      processPlayer({
        player,
        createNodeId,
        createNode,
      })
    )
  })
}

exports.normalizePlayers = (playersData) => {
  return playersData.map(normalizePlayer)
}

exports.normalizePlayer = (
  {
    id,
    position,
    spielername,
    teilnahme,
    pk1,
    pk2,
    pk3,
    pk4,
    gesamtplus,
    gesamtminus,
    leistung,
    livepz,
  },
  teamId,
  isSecondHalf = false
) => {
  return {
    id,
    name: spielername,
    scores: [
      {
        teamId,
        position,
        isSecondHalf,
        gamesPlayed: teilnahme,
        pk1Diff: pk1 ? getResult(pk1) : null,
        pk2Diff: pk2 ? getResult(pk2) : null,
        pk3Diff: pk3 ? getResult(pk3) : null,
        pk4Diff: pk4 ? getResult(pk4) : null,
        won: gesamtplus,
        lost: gesamtminus,
        performance: leistung ? parseFloat(leistung.replace(',', '.')) : null,
        score: livepz ? parseInt(livepz) : null,
      },
    ],
  }
}

function processPlayer({ player, createNodeId, createNode }) {
  const nodeId = createNodeId(`Player${player.id}`)
  player.scores___NODE = player.scores.map((score) => {
    const nodeData = processPlayerScore({
      playerScore: { playerId: player.id, ...score },
      createNodeId,
    })
    createNode(nodeData)
    return nodeData.id
  })
  delete player.scores

  const nodeContent = JSON.stringify(player)
  const nodeData = Object.assign({}, player, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Player`,
      content: nodeContent,
      contentDigest: createContentDigest(player),
    },
  })
  return nodeData
}

function processPlayerScore({ playerScore, createNodeId }) {
  const nodeId = createNodeId(
    `PlayerScore${playerScore.playerId}${playerScore.teamId}${playerScore.isSecondHalf}`
  )
  playerScore.team___NODE = createNodeId(`Team${playerScore.teamId}`)
  delete playerScore.teamId

  playerScore.player___NODE = createNodeId(`Player${playerScore.playerId}`)
  delete playerScore.playerId

  const nodeContent = JSON.stringify(playerScore)
  const nodeData = Object.assign({}, playerScore, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `PlayerScore`,
      content: nodeContent,
      contentDigest: createContentDigest(playerScore),
    },
  })
  return nodeData
}
