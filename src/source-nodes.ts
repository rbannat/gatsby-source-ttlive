import { createAssociationNodes } from './lib/association'
import { createGroupNodes } from './lib/group'
import { createClubNodes } from './lib/club'
import { createLeagueNode } from './lib/league'
import { createFixtureNodes } from './lib/fixture'
import { createTeamNodes } from './lib/team'
import { createPlayerNodes } from './lib/player'
import { GatsbyNode } from 'gatsby'
import { Club, getGroups, getLeague, Player } from '@/api'
import { getAssociations } from '@/api/lib/association'

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (
  { actions, createNodeId },
  configOptions,
) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete (configOptions as { plugins?: unknown }).plugins

  const groups = await getGroups()
  const associations = await getAssociations()

  let clubs: Club[] = []
  let players: Player[] = []

  for (const group of groups) {
    for (const leagueId of group.leagueIds) {
      const league = await getLeague(leagueId)
      if (!league) {
        console.warn(`No league data found for League with ID ${leagueId}`)
        continue
      }

      createLeagueNode({
        league,
        groupName: group.name,
        createNode,
        createNodeId,
      })

      const fixtures = league.fixtures

      createFixtureNodes({
        fixtures,
        createNode,
        createNodeId,
      })

      clubs = [
        ...clubs,
        ...league.teams.map((team) => ({
          name: team.clubName,
          shortName: team.clubShortName,
        })),
      ]

      players = league.teams.reduce<Player[]>((players, team) => {
        return [...players, ...team.playersFirstHalf, ...team.playersSecondHalf]
      }, players)

      createTeamNodes({
        teams: league.teams,
        fixtures,
        createNode,
        createNodeId,
      })
    }
  }

  // Merge to unique clubs
  clubs = [...new Map(clubs.map((club) => [club['shortName'], club])).values()]
  createClubNodes({ clubs, createNode, createNodeId })

  // Merge to unique players
  players = players.reduce<Player[]>((players, newPlayer) => {
    const existingPlayer = players.find((player) => player.id === newPlayer.id)

    // add found player's scores to existing player
    if (existingPlayer) {
      existingPlayer.scores = [...existingPlayer.scores, ...newPlayer.scores]
    } else {
      players.push(newPlayer)
    }

    return players
  }, [])

  createAssociationNodes({ associations, createNode, createNodeId })

  createPlayerNodes({ players, createNode, createNodeId })

  createGroupNodes({ groups, createNode, createNodeId })
  return
}
