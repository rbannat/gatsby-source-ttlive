import { Actions, NodePluginArgs } from 'gatsby'
import { createContentDigest } from 'gatsby-core-utils'
import { Fixture } from '@/api'

export const createFixtureNodes = ({
  fixtures,
  createNode,
  createNodeId,
}: {
  fixtures: Fixture[]
  createNode: Actions['createNode']
  createNodeId: NodePluginArgs['createNodeId']
}) => {
  fixtures.forEach((fixture) => {
    createNode(
      processFixture({
        fixture,
        createNodeId,
      }),
    )
  })
}

function processFixture({
  fixture,
  createNodeId,
}: {
  fixture: Fixture
  createNodeId: NodePluginArgs['createNodeId']
}) {
  const nodeId = createNodeId(
    `Fixture${fixture.nr}-${fixture.date}-${fixture.link}`,
  )
  // create home team relationship
  fixture.homeTeam = createNodeId(`Team${fixture.homeTeamId}`)
  delete fixture.homeTeamId
  // create guest team relationship
  fixture.guestTeam = createNodeId(`Team${fixture.guestTeamId}`)
  delete fixture.guestTeamId
  // create league node relationship
  fixture.league = createNodeId(`League${fixture.leagueId}`)
  delete fixture.leagueId

  const nodeContent = JSON.stringify(fixture)
  const nodeData = Object.assign({}, fixture, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Fixture`,
      content: nodeContent,
      contentDigest: createContentDigest(fixture),
    },
  })
  return nodeData
}
