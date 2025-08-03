import type { GatsbyNode } from 'gatsby'

export const createResolvers: GatsbyNode[`createResolvers`] = ({
  createResolvers,
}) => {
  createResolvers({
    Team: {
      fixtures: {
        type: ['Fixture'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve: async (source: any, _args: any, context: any) => {
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
          return homeFixtures.mergeSorted(
            guestFixtures,
            (a: { date: number }, b: { date: number }) =>
              a.date > b.date ? 1 : -1,
          )
        },
      },
    },
  })
}
