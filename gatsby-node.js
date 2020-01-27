const fetch = require("node-fetch")
const { parseStringPromise } = require("xml2js")
const { processAssociation } = require("./lib/processAssociation")
const { processLeague } = require("./lib/processLeague")
const { processTeam } = require("./lib/processTeam")
const { processPlayer } = require("./lib/processPlayer")
const { processFixture } = require("./lib/processFixture")

const xml2jsOptions = {
  normalize: true,
  normalizeTags: true,
  explicitArray: false,
  explicitRoot: false,
}

const baseUrl = "https://bettv.tischtennislive.de/Export/default.aspx"
const associationsUrl = "https://app.web4sport.de/ajax/Verband.ashx"

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  const { leagueId } = configOptions

  const scheduleFirstHalfUrl = `${baseUrl}?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=1`
  const scheduleSecondHalfUrl = `${baseUrl}?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=2`
  const leagueTableUrl = `${baseUrl}?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Tabelle`

  const leagueTable = await fetchAndParse(leagueTableUrl)

  // Create associations
  // TODO: also create child associations
  const associations = createAssociations(await fetchAndParse(associationsUrl))

  // Create league
  const league = {
    id: leagueId,
    association:
      associations.find(association => association.name === leagueTable.verband)
        .id || null,
    name: leagueTable.liga,
    link: leagueTable.ligalink,
  }

  // Create teams with players and own fixtures
  const teams = await createTeams(leagueTable.content.mannschaft, leagueId)

  // Create fixtures
  // TODO: map teams to fixtures by teamid (team id missing on fixture)
  const scheduleFirstHalf = await fetchAndParse(scheduleFirstHalfUrl)
  const scheduleSecondHalf = await fetchAndParse(scheduleSecondHalfUrl)
  const fixtures = [
    ...createFixtures(scheduleFirstHalf.content.spiel, true),
    ...createFixtures(scheduleSecondHalf.content.spiel, false),
  ]

  // Create association nodes
  associations.forEach(association => {
    createNode(
      processAssociation({
        association,
        createNodeId,
      })
    )
  })

  // Create league node
  createNode(
    processLeague({
      league,
      createNodeId,
    })
  )

  // Create fixture nodes
  fixtures.forEach(fixture => {
    createNode(
      processFixture({
        fixture,
        createNodeId,
      })
    )
  })

  // Create team nodes
  teams.forEach(team => {
    // Create player nodes
    team.players.forEach(player => {
      createNode(processPlayer({ player, createNodeId, teamId: team.id }))
    })
    createNode(
      processTeam({
        team,
        createNodeId,
      })
    )
  })
  // TODO: create league - association node relation

  return
}

async function fetchAndParse(url) {
  const response = await fetch(url)
  return parseStringPromise(await response.text(), xml2jsOptions)
}

function createFixtures(fixturesData, isFirstHalf = null) {
  return fixturesData.map(
    ({
      nr,
      datum,
      heimmannschaft,
      gastmannschaft,
      ergebnis,
      kennzeichnung,
      link,
    }) => ({
      id: nr,
      isFirstHalf,
      date: datum,
      homeTeam: heimmannschaft,
      guestTeam: gastmannschaft,
      result: ergebnis === "Vorbericht" ? null : getResult(ergebnis),
      note: kennzeichnung,
      link,
    })
  )
}

function createPlayers(playersData) {
  return playersData.map(
    ({
      id,
      position,
      spielername,
      teilnahme,
      pk1,
      pk2,
      pk3,
      pk4,
      gesamtplus,
      gesamtminus,
      leistung,
      livepz,
    }) => {
      return {
        id,
        position: parseInt(position),
        name: spielername,
        gamesPlayed: teilnahme,
        pk1Diff: pk1 ? getResult(pk1) : null,
        pk2Diff: pk2 ? getResult(pk2) : null,
        pk3Diff: pk3 ? getResult(pk3) : null,
        pk4Diff: pk4 ? getResult(pk4) : null,
        won: gesamtplus,
        lost: gesamtminus,
        performance: leistung ? parseFloat(leistung.replace(",", ".")) : null,
        score: parseInt(livepz),
      }
    }
  )
}

function createAssociations(associationsData) {
  return associationsData.verband.map(({ id, name, logo, sportart_id }) => ({
    id,
    name,
    sportCategoryId: sportart_id,
    logo,
  }))
}

async function createTeam(
  {
    teamid,
    mannschaft,
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
  leagueId
) {
  const {
    content: {
      spielplan: { spiel: fixturesData },
      bilanz: { spieler: playersData },
    },
  } = await fetchAndParse(getTeamReportUrl(teamid, leagueId))
  return {
    id: teamid,
    name: mannschaft,
    position: parseInt(platz),
    gamesPlayed: parseInt(spiele),
    won: parseInt(siege),
    drawn: parseInt(unentschieden),
    lost: parseInt(niederlagen),
    matchesWon: parseInt(spieleplus),
    matchesLost: parseInt(spieleminus),
    matchesDiff: parseInt(spieledif),
    setsDiff: parseInt(saetzedif),
    pointsWon: parseInt(punkteplus),
    pointsLost: parseInt(punkteminus),
    pointsDiff: parseInt(punktedif),
    fixtures: createFixtures(fixturesData),
    players: createPlayers(playersData),
  }
}

function createTeams(teamsData, leagueId) {
  return Promise.all(
    teamsData.map(teamData => {
      return createTeam(teamData, leagueId)
    })
  )
}

function getTeamReportUrl(teamId, leagueId) {
  return `${baseUrl}?TeamID=${teamId}&WettID=${leagueId}&Format=XML&SportArt=96&Area=TeamReport`
}

function getResult(resultData) {
  return [...resultData.split(":").map(string => parseInt(string))]
}
