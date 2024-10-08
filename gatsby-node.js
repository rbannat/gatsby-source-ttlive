/**
 * @typedef { import("./lib/types").Team } Team
 */

const { fetchAndParse } = require('./lib/helpers')
const { createAssociationNodes } = require('./lib/association')
const { createGroupNodes, normalizeGroups } = require('./lib/group')
const { createClubNodes } = require('./lib/club')
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
  // Damen, Herren, ...
  const groups = normalizeGroups(groupsData)

  await createAssociationNodes({ createNode, createNodeId })

  /** @type {[]} */
  let clubs = []
  let players = []

  for (const group of groups) {
    for (const leagueId of group.leagueIds) {
      const dataFirstHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=1&SpielerRunde=1`
      const dataSecondHalfUrl = `https://app.web4sport.de/Ajax/Tischtennis/Staffel_Komplett.aspx?StaffelID=${leagueId}&PlanRunde=2&SpielerRunde=2`
      const dataFirstHalf = await fetchAndParse(dataFirstHalfUrl)
      if (dataFirstHalf.error || !!!dataFirstHalf.teams.mannschaft) continue // e. g. staffel not published
      const dataSecondHalf = await fetchAndParse(dataSecondHalfUrl)
      createLeagueNode({
        leagueData: dataFirstHalf.staffel,
        groupName: group.name,
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
      /** @type {Team[]} */
      let teams = normalizeTeams(
        teamsDataFirstHalf,
        teamsDataSecondHalf,
        leagueId,
      )

      clubs = [
        ...clubs,
        ...teams.map((team) => ({
          name: team.clubName,
          shortName: team.clubShortName,
        })),
      ]

      const firstHalfPlayers = teamsDataFirstHalf.reduce(
        (players, teamData) => {
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
        },
        [],
      )
      const secondHalfPlayers = teamsDataSecondHalf.reduce(
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
        [],
      )

      players = [...players, ...firstHalfPlayers, ...secondHalfPlayers]

      createTeamNodes({ teams, fixtures, createNode, createNodeId })
    }
  }

  // Merge players
  players = players.reduce((players, newPlayer) => {
    const existingPlayer = players.find((player) => player.id === newPlayer.id)

    if (existingPlayer) {
      existingPlayer.scores = [...existingPlayer.scores, ...newPlayer.scores]
    } else {
      players.push(newPlayer)
    }

    return players
  }, [])

  createPlayerNodes({ players, createNode, createNodeId })

  clubs = [...new Map(clubs.map((club) => [club['shortName'], club])).values()]

  createClubNodes({
    clubs,
    createNode,
    createNodeId,
  })

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
      pk1Diff: [Int]
      pk2Diff: [Int]
      pk3Diff: [Int]
      pk4Diff: [Int]
    }

    type Club implements Node {
      teams: [Team] @link(by: "club.id", from: "id")
      logo: ClubLogosJson @link(by: "clubId", from: "id")
    }
    
    type Group implements Node {
      leagues: [League] @link(by: "group.id", from: "id")
    }

    type Team implements Node {
      league: League @link
      club: Club @link
      fixtures: [Fixture]
    }

    type League implements Node {
      association: Association @link
      group: Group @link
    }

    type ClubLogosJson implements Node {
      club: Club @link(by: "id", from: "clubId")
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
          return homeFixtures.mergeSorted(guestFixtures, (a, b) =>
            a.date > b.date ? 1 : -1,
          )
        },
      },
    },
  }
  createResolvers(resolvers)
}
