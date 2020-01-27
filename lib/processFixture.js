const { createContentDigest } = require(`gatsby-core-utils`)

exports.processFixture = ({ fixture, createNodeId }) => {
  const nodeId = createNodeId(`${fixture.id}-${fixture.date}`)
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
