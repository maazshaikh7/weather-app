const storage = (() => {
    function setSystemOfMeasurement(unitName) {
      localStorage.setItem('unit', unitName)
    }
  
    function getSystemOfMeasurement() {
      let chosenUnit = localStorage.getItem('unit')
      if (chosenUnit === 'metric' || chosenUnit === 'imperial') {
        return chosenUnit
      } else {
        setSystemOfMeasurement('metric')
        return localStorage.getItem('unit')
      }
    }
  
    return {
      setSystemOfMeasurement,
      getSystemOfMeasurement,
    }
  })()
  
  export default storage