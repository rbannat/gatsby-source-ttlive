const { fetchAndParse } = require('./lib/helpers')
const { createAssociationNodes } = require('./lib/association')
const { createGroupNodes, normalizeGroups } = require('./lib/group')
const { createLeagueNode } = require('./lib/league')
const { createFixtureNodes } = require('./lib/fixture')
const { normalizeTeams, createTeamNodes } = require('./lib/team')
const { normalizePlayer, createPlayerNodes } = require('./lib/player')

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  const associationId = 397

  const groupsUrl = `https://app.web4sport.de/ajax/tischtennis/staffeln.ashx?VerbandID=${associationId}`
  const groupsData = await fetchAndParse(groupsUrl)
  const groups = normalizeGroups(groupsData)
  await createAssociationNodes({ createNode, createNodeId })
  for (const group of groups) {
    for (const leagueId of group.leagueIds) {
      const dataFirstHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=1&SpielerRunde=1`
      const dataSecondHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=2&SpielerRunde=2`
      const dataFirstHalf = await fetchAndParse(dataFirstHalfUrl)
      if (dataFirstHalf.error || !!!dataFirstHalf.teams.mannschaft) continue // e. g. staffel not published
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

      const teamsDataFirstHalf = Array.isArray(dataFirstHalf.teams.mannschaft)
        ? dataFirstHalf.teams.mannschaft
        : [dataFirstHalf.teams.mannschaft]
      const teamsDataSecondHalf = Array.isArray(dataSecondHalf.teams.mannschaft)
        ? dataSecondHalf.teams.mannschaft
        : [dataSecondHalf.teams.mannschaft]

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

      let playersSecondHalf = teamsDataSecondHalf.reduce(
        (players, teamData) => {
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
        },
        []
      )

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
  }
  createGroupNodes({
    groups,
    createNode,
    createNodeId,
  })
  return
}

// Create type defs for when there is no data to infer the type from
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = [
    `
    type Fixture implements Node {
      id: ID!
      date: Date
      link: String
      homeTeam: Team @link
      guestTeam: Team @link
      league: League @link
      result: [Int]
    }

    type PlayerScore implements Node {
      won: Int
      lost: Int
      gamesPlayed: Int
    }

    type Team implements Node {
      league: League @link
      fixtures: [Fixture]
    }

    type League implements Node {
      association: Association @link
    }
  `,
  ]
  createTypes(typeDefs)
}

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Team: {
      fixtures: {
        type: ['Fixture'],
        resolve: async (source, args, context, info) => {
          const { entries: homeFixtures } = await context.nodeModel.findAll({
            query: {
              filter: {
                homeTeam: {
                  id: { eq: source.id },
                },
              },
            },
            type: 'Fixture',
          })
          const { entries: guestFixtures } = await context.nodeModel.findAll({
            query: {
              filter: {
                guestTeam: {
                  id: { eq: source.id },
                },
              },
            },
            type: 'Fixture',
          })
          guestFixtures.forEach((fixture) => console.log(fixture.date))
          return homeFixtures.mergeSorted(guestFixtures, (a, b) =>
            a.date > b.date ? 1 : -1
          )
        },
      },
    },
  }
  createResolvers(resolvers)
}
