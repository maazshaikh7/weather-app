const utils = (() => {
    function _shortenDecimal(number) {
      return Number((number).toFixed(2).replace(/[.,]00$/, ""))
    }
  
    function convertCToF(tempInCelcius) {
      return _shortenDecimal(tempInCelcius * 1.8 + 32)
    }
  
    function convertKmhToMph(speedInKmh) {
      return _shortenDecimal(speedInKmh / 1.609344)
    }
  
    function convertMetersToKm(meters) {
      return _shortenDecimal(meters / 1000)
    }
  
    function convertMetersToMiles(meters) {
      return _shortenDecimal(meters * 0.00062137)
    }
  
    function convertTimestampToDay(timestamp, timezone) {
      const date = new Date((timestamp + timezone) * 1000)
      return date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC'})
    }
  
    function convertTimestampToHour(timestamp, timezone, hourFormat) {
      const format = (Number(hourFormat) == 12) ? true : false
      const date = new Date((timestamp + timezone) * 1000)
      return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', timeZone: 'UTC', hour12: format })
    }
  
    function convertToImperial(data) {
      const convertedData = Object.assign({}, data, {
        temperature: convertCToF(data.temperature),
        feelsLike: convertCToF(data.feelsLike),
        maxTemp: convertCToF(data.maxTemp),
        minTemp: convertCToF(data.minTemp),
        windSpeed: convertKmhToMph(data.windSpeed),
        visibility: convertMetersToMiles(data.visibility),
        sunriseTimestamp: convertTimestampToHour(data.sunriseTimestamp, data.timezone, 12),
        sunsetTimestamp: convertTimestampToHour(data.sunsetTimestamp, data.timezone, 12),
      })
      return convertedData
    }
  
    function convertToMetric(data) {
      const convertedData = Object.assign({}, data, {
        visibility: convertMetersToKm(data.visibility),
        sunriseTimestamp: convertTimestampToHour(data.sunriseTimestamp, data.timezone, 24),
        sunsetTimestamp: convertTimestampToHour(data.sunsetTimestamp, data.timezone, 24),
      })
      return convertedData
    }
  
    return {
      convertTimestampToDay,
      convertToImperial,
      convertToMetric,
    }
  })()
  
  export default utils