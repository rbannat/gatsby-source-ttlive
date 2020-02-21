const axios = require('axios')

const { parseStringPromise } = require('xml2js')
const xml2jsOptions = {
  normalize: true,
  normalizeTags: true,
  explicitArray: false,
  explicitRoot: false
}

exports.getResult = resultData => {
  return [...resultData.split(':').map(string => parseInt(string))]
}

exports.fetchAndParse = async url => {
  const response = await axios.get(url, {responseType: 'text'})
  return parseStringPromise(response.data, xml2jsOptions)
}

exports.getTeamReportUrl = (baseUrl, teamId, leagueId, secondHalf = false) => {
  return `${baseUrl}?TeamID=${teamId}&WettID=${leagueId}&Format=XML&SportArt=96&Area=TeamReport&${
    secondHalf ? 'Runde=2' : 'Runde=1'
  }`
}
