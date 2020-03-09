const { fetchAndParse, getTeamReportUrl } = require('./lib/helpers')
const {
  normalizeAssociations,
  processAssociation
} = require('./lib/association')
const { normalizeLeague, processLeague } = require('./lib/league')
const { normalizeTeams, processTeam } = require('./lib/team')
const {
  getPlayerScores,
  normalizePlayer,
  processPlayer
} = require('./lib/player')
const { normalizeFixtures, processFixture } = require('./lib/fixture')

const baseUrl = 'https://bettv.tischtennislive.de/Export/default.aspx'
const associationsUrl = 'https://app.web4sport.de/ajax/Verband.ashx'

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  const { leagueId } = configOptions

  const dataUrlFirstHalf = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=1&SpielerRunde=1`
  const dataUrlSecondHalf = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=2&SpielerRunde=2`

  const scheduleFirstHalfUrl = `${baseUrl}?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=1`
  const scheduleSecondHalfUrl = `${baseUrl}?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=2`

  const dataFirstHalf = await fetchAndParse(dataUrlFirstHalf)
  const dataSecondHalf = await fetchAndParse(dataUrlSecondHalf)

  // Create associations
  // TODO: also create child associations
  const associations = normalizeAssociations(
    await fetchAndParse(associationsUrl)
  )

  // Create league
  const league = normalizeLeague(dataFirstHalf.staffel)

  // Create teams
  let teams = normalizeTeams(dataFirstHalf.teams.mannschaft)
  let players = []
  const additionalTeamsData = 
      teams.map(team => {
        const allPlayers = {}
        const playersFirstHalf = []
        const playersSecondHalf = []
        const {spieler: playersDataFirstHalf 
        } = dataFirstHalf.teams.mannschaft.find((mannschaft => mannschaft.teamid === team.id)).bilanz
        const {spieler: playersDataSecondHalf 
        } = dataSecondHalf.teams.mannschaft.find((mannschaft => mannschaft.teamid === team.id)).bilanz
        
        playersDataFirstHalf.forEach(playerDataFirstHalf => {
          const player = normalizePlayer(playerDataFirstHalf)
          allPlayers[player.id] = {
            name: player.name,
            teamId: team.id,
            playerScoresFirstHalf: getPlayerScores(player)
          }
          playersFirstHalf.push({ id: player.id, position: player.position })
        })
        playersDataSecondHalf.forEach(playerDataSecondHalf => {
          const player = normalizePlayer(playerDataSecondHalf)
          allPlayers[player.id] = {
            ...allPlayers[player.id],
            teamId: team.id,
            name: player.name,
            playerScoresSecondHalf: getPlayerScores(player)
          }
          playersSecondHalf.push({ id: player.id, position: player.position })
        })
        players.push(
          ...Object.keys(allPlayers).map(key => ({
            id: key,
            ...allPlayers[key]
          }))
        )
        return {
          teamId: team.id,
          playersFirstHalf,
          playersSecondHalf
        }
      }).reduce((additionalTeamsData, additionalTeamData) => {
    const teamId = additionalTeamData.teamId
    delete additionalTeamData.teamId
    additionalTeamsData[teamId] = additionalTeamData
    return additionalTeamsData
  }, {})

  teams = teams.map(team => ({
    ...team,
    ...additionalTeamsData[team.id]
  }))

  // Create fixtures
  // TODO: map teams to fixtures by teamid (team id missing on fixture)
  const scheduleFirstHalf = await fetchAndParse(scheduleFirstHalfUrl)
  const scheduleSecondHalf = await fetchAndParse(scheduleSecondHalfUrl)
  const fixtures = [
    ...normalizeFixtures(scheduleFirstHalf.content.spiel, true),
    ...normalizeFixtures(scheduleSecondHalf.content.spiel, false)
  ]

  // Create association nodes
  associations.forEach(association => {
    createNode(
      processAssociation({
        association,
        createNodeId
      })
    )
  })

  // Create league node
  createNode(
    processLeague({
      league,
      createNodeId
    })
  )

  // Create fixture nodes
  fixtures.forEach(fixture => {
    createNode(
      processFixture({
        fixture,
        createNodeId
      })
    )
  })
  // Create player nodes
  players.forEach(player => {
    createNode(processPlayer({ player, createNodeId }))
  })

  // Create team nodes
  teams.forEach(team => {
    createNode(
      processTeam({
        team,
        createNodeId
      })
    )
  })
  return
}
