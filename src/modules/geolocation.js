const geolocation = (() => {
    function getPosition() {
      return new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
      )
    }
  
    async function getUserPosition() {
      try {
        if (navigator.geolocation) {
          const position = await getPosition()
          const {
            coords: { latitude, longitude },
          } = position
          return { latitude, longitude }
        } else {
          throw new Error('Browser does not support geolocation')
        }
      } catch (error) {
        console.warn(`${error.message}, default location will be used.`)
      }
    }
  
    return { getUserPosition }
  })()
  
  export default geolocation