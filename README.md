# gatsby-source-ttlive

This is a Gatsby source plugin that sources nodes from [TT-Live](https://bettv.tischtennislive.de).

An example site for using this plugin is at https://tt-live-scores.netlify.app/

## How to install

`npm install --save gatsby-source-ttlive`

## Available options

| Option    | Description                                    | Example   |
| --------- | ---------------------------------------------- | --------- |
| leagueIds | Ids of the TT-Live leagues to source data from | [ 12345 ] |  |

## Example of usage

Add plugin to `gatsby-config.js`:

```js
{
    plugins: [
    {
      resolve: `gatsby-source-ttlive`,
      options: {
        leagueIds: [ 12345 ],
      },
    },
  ],
}
```

## How to query data

This is an example query to load all fixtures of a league:

```graphql
query FixturesByLeague($leagueId: String!) {
  allFixture(filter: { league: { id: { eq: $leagueId } } }) {
    nodes {
      date
      guestTeam {
        ... on Team {
          id
          name
          shortName
        }
      }
      homeTeam {
        ... on Team {
          id
          name
          shortName
        }
      }
      id
      isFirstHalf
      link
      note
      nr
      result
    }
  }
}
```
