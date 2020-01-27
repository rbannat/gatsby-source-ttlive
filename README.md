# gatsby-source-ttlive
This is a Gatsby source plugin that sources nodes from [TT-Live](https://bettv.tischtennislive.de).

An example site for using this plugin is at https://tt-live-scores.netlify.com/

## How to install

```npm install --save gatsby-source-ttlive```

## Available options
| Option        | Description   | Example |
| ------------- |-------------| -------------      |
| leagueId      | Id of the TT-Live league | 12345        ||

## Example of usage

Add plugin to `gatsby-config.js`:


```json
{
    plugins: [
    {
      resolve: `gatsby-source-ttlive`,
      options: {
        leagueId: 12345,
      },
    },
  ],
}
```

## How to query for data

This is an example query to load all fixtures of the league:

```graphql
 query {
    allFixture {
      edges {
        node {
          isFirstHalf
          date
          result
          guestTeam
          homeTeam
          link
        }
      }
    }
  }
```