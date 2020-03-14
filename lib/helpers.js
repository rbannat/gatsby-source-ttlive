const axios = require('axios')
const Bottleneck = require('bottleneck')
const limiter = new Bottleneck({
  minTime: 333,
})

const { parseStringPromise } = require('xml2js')
const xml2jsOptions = {
  normalize: true,
  normalizeTags: true,
  explicitArray: false,
  explicitRoot: false,
}

exports.getResult = resultData => {
  return [...resultData.split(':').map(string => parseInt(string))]
}

exports.fetchAndParse = async url => {
  const response = await limiter.schedule(() =>
    axios.get(url, { responseType: 'text' })
  )
  return parseStringPromise(response.data, xml2jsOptions)
}
