const weather = (() => {
    function filterData(data) {
      const {
        dt: timeOfCalculation,
        name: cityName,
        main: {
          temp: temperature,
          feels_like: feelsLike,
          temp_min: minTemp,
          temp_max: maxTemp,
          humidity,
        },
        sys: {
          country: countryName,
          sunrise: sunriseTimestamp,
          sunset: sunsetTimestamp,
        },
        timezone,
        visibility,
        weather: [
          {
            main: weatherName,
            description: weatherDescription,
            icon: weatherIcon,
          },
        ],
        wind: { speed: windSpeed },
        cod,
      } = data
  
      return {
        timeOfCalculation,
        cityName,
        countryName,
        temperature,
        feelsLike,
        minTemp,
        maxTemp,
        humidity,
        sunriseTimestamp,
        sunsetTimestamp,
        timezone,
        visibility,
        windSpeed,
        weatherName,
        weatherDescription,
        weatherIcon,
        cod
      }
    }
  
    async function getData(cityName, coordinates) {
      const APIKey = '23a93e5ae30923e04e82d1d6f9936b73' // Not safe, but it's a free API key just for the purpose of this project.
      const apiURL = coordinates
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${APIKey}`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${APIKey}`
  
      try {
        const response = await fetch(apiURL, { mode: 'cors' })
        const data = await response.json()
        console.log(apiURL);
        if (data.cod === 200) return filterData(data)
        else return data
      } catch (error) {
        console.error('Fetch Error:', error.message)
      }
    }
    return { getData }
  })()
  
  export default weather