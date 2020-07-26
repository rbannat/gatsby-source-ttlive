const { fetchAndParse } = require('./lib/helpers')
const { createAssociationNodes } = require('./lib/association')
const { createLeagueNode } = require('./lib/league')
const { createFixtureNodes } = require('./lib/fixture')
const { normalizeTeams, createTeamNodes } = require('./lib/team')
const { normalizePlayer, createPlayerNodes } = require('./lib/player')

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

    createLeagueNode({
      leagueData: dataFirstHalf.staffel,
      createNode,
      createNodeId,
    })

    const fixtures = createFixtureNodes({
      leagueId,
      fixtureDataFirstHalf: dataFirstHalf.spielplan
        ? dataFirstHalf.spielplan.runde.spiel
        : null,
      fixtureDataSecondHalf: dataSecondHalf.spielplan
        ? dataSecondHalf.spielplan.runde.spiel
        : null,
      createNode,
      createNodeId,
    })

    const teamsDataFirstHalf = dataFirstHalf.teams.mannschaft
    const teamsDataSecondHalf = dataSecondHalf.teams.mannschaft

    // Normalize teams
    let teams = normalizeTeams(
      teamsDataFirstHalf,
      teamsDataSecondHalf,
      leagueId
    )

    // Normalize players
    let playersFirstHalf = teamsDataFirstHalf.reduce((players, teamData) => {
      const playersData = teamData.bilanz.spieler
      if (!playersData || !playersData.length) {
        return players
      }
      return [
        ...players,
        ...playersData.map((playerData) => {
          return normalizePlayer(playerData, teamData.teamid)
        }),
      ]
    }, [])

    let playersSecondHalf = teamsDataSecondHalf.reduce((players, teamData) => {
      const playersData = teamData.bilanz.spieler
      if (!playersData || !playersData.length) {
        return players
      }
      return [
        ...players,
        ...playersData.map((playerData) => {
          return normalizePlayer(playerData, teamData.teamid, true)
        }),
      ]
    }, [])

    // Merge players
    const players = playersFirstHalf

    for (const playerSecondHalf of playersSecondHalf) {
      const existingPlayer = players.find(
        (player) => player.id === playerSecondHalf.id
      )
      if (existingPlayer) {
        existingPlayer.scores = [
          ...existingPlayer.scores,
          ...playerSecondHalf.scores,
        ]
      } else {
        players.push(playerSecondHalf)
      }
    }
    createPlayerNodes({ players, createNode, createNodeId })
    createTeamNodes({ teams, fixtures, createNode, createNodeId })
  }
  return
}
