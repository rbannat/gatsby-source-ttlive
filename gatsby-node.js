const { fetchAndParse } = require('./lib/helpers')
const { createAssociationNodes } = require('./lib/association')
const { createLeagueNode } = require('./lib/league')
const { createFixtureNodes } = require('./lib/fixture')
const { normalizeTeams, createTeamNodes } = require('./lib/team')
const {
  getPlayerScores,
  normalizePlayer,
  createPlayerNodes,
} = require('./lib/player')

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  const { leagueIds } = configOptions

  await createAssociationNodes({ createNode, createNodeId })

  for (const leagueId of leagueIds) {
    const dataFirstHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=1&SpielerRunde=1`
    const dataSecondHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=2&SpielerRunde=2`

    const dataFirstHalf = await fetchAndParse(dataFirstHalfUrl)
    const dataSecondHalf = await fetchAndParse(dataSecondHalfUrl)

    await createLeagueNode({
      leagueData: dataFirstHalf.staffel,
      createNode,
      createNodeId,
    })

    const fixtures = await createFixtureNodes({
      fixtureDataFirstHalf: dataFirstHalf.spielplan.runde.spiel,
      fixtureDataSecondHalf: dataSecondHalf.spielplan.runde.spiel,
      createNode,
      createNodeId,
    })

    // Normalize teams and collect players
    let teams = normalizeTeams(dataFirstHalf.teams.mannschaft, leagueId)
    let players = []
    const additionalTeamsData = teams
      .map((team) => {
        const allPlayers = {}
        const playersFirstHalf = []
        const playersSecondHalf = []
        const {
          spieler: playersDataFirstHalf,
        } = dataFirstHalf.teams.mannschaft.find(
          (mannschaft) => mannschaft.teamid === team.id
        ).bilanz
        const {
          spieler: playersDataSecondHalf,
        } = dataSecondHalf.teams.mannschaft.find(
          (mannschaft) => mannschaft.teamid === team.id
        ).bilanz
        if (playersDataFirstHalf && playersDataFirstHalf.length) {
          playersDataFirstHalf.forEach((playerDataFirstHalf) => {
            const player = normalizePlayer(playerDataFirstHalf)
            allPlayers[player.id] = {
              name: player.name,
              teamId: team.id,
              playerScoresFirstHalf: getPlayerScores(player),
            }
            playersFirstHalf.push({
              id: player.id,
              position: player.position,
            })
          })
        }
        if (playersDataSecondHalf && playersDataSecondHalf.length) {
          playersDataSecondHalf.forEach((playerDataSecondHalf) => {
            const player = normalizePlayer(playerDataSecondHalf)
            allPlayers[player.id] = {
              ...allPlayers[player.id],
              teamId: team.id,
              name: player.name,
              playerScoresSecondHalf: getPlayerScores(player),
            }
            playersSecondHalf.push({
              id: player.id,
              position: player.position,
            })
          })
        }

        players.push(
          ...Object.keys(allPlayers).map((key) => ({
            id: key,
            ...allPlayers[key],
          }))
        )
        return {
          teamId: team.id,
          playersFirstHalf,
          playersSecondHalf,
        }
      })
      .reduce((additionalTeamsData, additionalTeamData) => {
        const teamId = additionalTeamData.teamId
        delete additionalTeamData.teamId
        additionalTeamsData[teamId] = additionalTeamData
        return additionalTeamsData
      }, {})

    teams = teams.map((team) => ({
      ...team,
      ...additionalTeamsData[team.id],
    }))

    createPlayerNodes({ players, createNode, createNodeId })
    createTeamNodes({ teams, fixtures, createNode, createNodeId })
  }
  return
}
