import type { GatsbyNode } from 'gatsby'

// Create type defs for when there is no data to infer the type from
export const createSchemaCustomization: GatsbyNode[`createSchemaCustomization`] =
  ({ actions }) => {
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
      position: String
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
