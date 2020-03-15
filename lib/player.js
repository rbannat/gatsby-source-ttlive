const { createContentDigest } = require(`gatsby-core-utils`)
const { getResult } = require(`./helpers`)

exports.processPlayer = ({ player, createNodeId }) => {
  const nodeId = createNodeId(`Player${player.id}`)
  // create node relationship
  player.team___NODE = createNodeId(`Team${player.teamId}`)
  delete player.teamId

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

function normalizePlayer({
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
}) {
  return {
    id,
    position,
    name: spielername,
    gamesPlayed: teilnahme,
    pk1Diff: pk1 ? getResult(pk1) : null,
    pk2Diff: pk2 ? getResult(pk2) : null,
    pk3Diff: pk3 ? getResult(pk3) : null,
    pk4Diff: pk4 ? getResult(pk4) : null,
    won: gesamtplus,
    lost: gesamtminus,
    performance: leistung ? parseFloat(leistung.replace(',', '.')) : null,
    score: parseInt(livepz),
  }
}

exports.normalizePlayers = playersData => {
  return playersData.map(normalizePlayer)
}

exports.getPlayerScores = player => {
  return ({
    gamesPlayed,
    pk1Diff,
    pk2Diff,
    pk3Diff,
    pk4Diff,
    won,
    lost,
    score,
  } = player)
}

exports.normalizePlayer = normalizePlayer
