import { createAssociationNodes } from './lib/association'
import { createGroupNodes } from './lib/group'
import { createClubNodes } from './lib/club'
import { createLeagueNode } from './lib/league'
import { createFixtureNodes } from './lib/fixture'
import { createTeamNodes } from './lib/team'
import { createPlayerNodes } from './lib/player'
import type { GatsbyNode } from 'gatsby'
import { createTtliveClient } from '@rennitlb/ttlive-client'
import type { IPluginOptionsInternal } from './types'

export const sourceNodes: GatsbyNode[`sourceNodes`] = async (
  { actions, createNodeId, reporter },
  pluginOptions,
) => {
  const { createNode } = actions
  const { associationId } = pluginOptions as IPluginOptionsInternal

  const client = createTtliveClient({
    associationId,
    logger: { warn: (message) => reporter.warn(message) },
  })
  const { groups, associations, leagues, clubs, players } =
    await client.getSnapshot()

  for (const { groupName, ...league } of leagues) {
    createLeagueNode({ league, groupName, createNode, createNodeId })
    // createFixtureNodes adds the node references createTeamNodes filters by
    createFixtureNodes({ fixtures: league.fixtures, createNode, createNodeId })
    createTeamNodes({
      teams: league.teams,
      fixtures: league.fixtures,
      createNode,
      createNodeId,
    })
  }

  createClubNodes({ clubs, createNode, createNodeId })
  createAssociationNodes({ associations, createNode, createNodeId })
  createPlayerNodes({ players, createNode, createNodeId })
  createGroupNodes({ groups, createNode, createNodeId })
}
