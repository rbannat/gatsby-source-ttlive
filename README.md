# gatsby-source-ttlive

This is a Gatsby source plugin that sources nodes from [TT-Live](https://bettv.tischtennislive.de).

An example site that uses this plugin can be found here: https://tt-live-scores.netlify.app/.

## How to install

1. Install dependency

   ```bash
   npm install --save gatsby-source-ttlive
   ```

2. Add to _`gatsby-config.js`_

   ```js
     {
         plugins: [
         `gatsby-source-ttlive`,
       ],
     }
   ```

## Example query

This is an example query for loading all fixtures of a league sorted by date in descending order:

```graphql
query LatestFixturesByLeagueId($leagueId: String!) {
  allFixture(
    filter: { league: { id: { eq: $leagueId } } }
    sort: { order: DESC, fields: date }
  ) {
    nodes {
      date
      link
      note
      nr
      homeTeam {
        name
      }
      guestTeam {
        name
      }
      result
    }
  }
}
```
