const { createContentDigest } = require(`gatsby-core-utils`)

exports.normalizeTeams = (
  teamsDataFirstHalf,
  teamsDataSecondHalf,
  leagueId
) => {
  return teamsDataFirstHalf.map((teamDataFirstHalf, index) => {
    return normalizeTeam(
      teamDataFirstHalf,
      teamsDataSecondHalf[index],
      leagueId
    )
  })
}

exports.createTeamNodes = ({ teams, fixtures, createNode, createNodeId }) => {
  teams.forEach((team) => {
    createNode(
      processTeam({
        team,
        createNodeId,
        fixtures,
      })
    )
  })
}

function normalizeTeam(
  {
    teamid,
    teamname,
    teamnamekurz,
    tabelle: {
      platz,
      spiele,
      siege,
      unentschieden,
      niederlagen,
      saetzedif,
      spieleplus,
      spieleminus,
      spieledif,
      punkteplus,
      punkteminus,
      punktedif,
    },
    bilanz: { spieler: playersDataFirstHalf },
  },
  { bilanz: { spieler: playersDataSecondHalf } },
  leagueId
) {
  return {
    id: teamid,
    leagueId,
    name: teamname,
    shortName: teamnamekurz,
    position: parseInt(platz),
    gamesPlayed: spiele ? parseInt(spiele) : null,
    won: siege ? parseInt(siege) : null,
    drawn: unentschieden ? parseInt(unentschieden) : null,
    lost: niederlagen ? parseInt(niederlagen) : null,
    matchesWon: spieleplus ? parseInt(spieleplus) : null,
    matchesLost: spieleminus ? parseInt(spieleminus) : null,
    matchesDiff: spieledif ? parseInt(spieledif) : null,
    setsDiff: saetzedif ? parseInt(saetzedif) : null,
    pointsWon: punkteplus ? parseInt(punkteplus) : null,
    pointsLost: punkteminus ? parseInt(punkteminus) : null,
    pointsDiff: punktedif ? parseInt(punktedif) : null,
    playersFirstHalf:
      playersDataFirstHalf && playersDataFirstHalf.length
        ? playersDataFirstHalf.map((playerData) => playerData.id)
        : null,
    playersSecondHalf:
      playersDataSecondHalf && playersDataSecondHalf.length
        ? playersDataSecondHalf.map((playerData) => playerData.id)
        : null,
  }
}

function processTeam({ team, createNodeId, fixtures }) {
  const nodeId = createNodeId(`Team${team.id}`)
  // create players node relationships
  team.playersFirstHalf = team.playersFirstHalf
    ? team.playersFirstHalf.map((id) => {
        return {
          player___NODE: createNodeId(`Player${id}`),
        }
      })
    : null
  team.playersSecondHalf = team.playersSecondHalf
    ? team.playersSecondHalf.map((id) => {
        return {
          player___NODE: createNodeId(`Player${id}`),
        }
      })
    : null

  // create fixture relationships
  team.fixtures___NODE = fixtures
    .filter(
      (fixture) =>
        fixture.homeTeam___NODE === nodeId ||
        fixture.guestTeam___NODE === nodeId
    )
    .map((fixture) =>
      createNodeId(`Fixture${fixture.nr}-${fixture.date}-${fixture.link}`)
    )

  // create league node relationship
  team.league___NODE = createNodeId(`League${team.leagueId}`)
  delete team.leagueId

  const nodeContent = JSON.stringify(team)
  const nodeData = Object.assign({}, team, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Team`,
      content: nodeContent,
      contentDigest: createContentDigest(team),
    },
  })
  return nodeData
}
