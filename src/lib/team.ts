import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { Fixture, Team } from '@/api'

export const createTeamNodes = ({
  teams,
  fixtures,
  createNode,
  createNodeId,
}: {
  teams: Team[]
  fixtures: Fixture[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  teams.forEach((team) => {
    const teamNode = processTeam({
      team,
      createNodeId,
      fixtures,
    })
    createNode(teamNode)
  })
}

function processTeam({
  team,
  createNodeId,
  fixtures,
}: {
  team: Team
  createNodeId: NodePluginArgs['createNodeId']
  fixtures: Fixture[]
}) {
  const nodeId = createNodeId(`Team${team.id}`)
  // create players node relationships
  team.playersFirstHalf = team.playersFirstHalf
    ? team.playersFirstHalf.map((player) => {
        return {
          player___NODE: createNodeId(`Player${player.id}`),
        }
      })
    : []
  team.playersSecondHalf = team.playersSecondHalf
    ? team.playersSecondHalf.map((player) => {
        return {
          player___NODE: createNodeId(`Player${player.id}`),
        }
      })
    : []

  // create fixture relationships
  team.fixtures = fixtures
    ? fixtures
        .filter(
          (fixture) =>
            fixture.homeTeam___NODE === nodeId ||
            fixture.guestTeam___NODE === nodeId,
        )
        .map((fixture) =>
          createNodeId(`Fixture${fixture.nr}-${fixture.date}-${fixture.link}`),
        )
    : []

  // create league node relationship
  team.league = createNodeId(`League${team.leagueId}`)
  delete team.leagueId

  // create club node relationship
  team.club = createNodeId(`Club${team.clubName}`)
  delete team.clubName
  delete team.clubShortName

  const nodeContent = JSON.stringify(team)
  const nodeData = {
    ...team,
    originalId: team.id,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Team`,
      content: nodeContent,
      contentDigest: createContentDigest(team),
    },
  }

  return nodeData
}
