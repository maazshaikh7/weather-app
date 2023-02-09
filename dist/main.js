/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/geolocation.js":
/*!************************************!*\
  !*** ./src/modules/geolocation.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
  
  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (geolocation);

/***/ }),

/***/ "./src/modules/storage.js":
/*!********************************!*\
  !*** ./src/modules/storage.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
  
  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (storage);

/***/ }),

/***/ "./src/modules/utils.js":
/*!******************************!*\
  !*** ./src/modules/utils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
  
  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);

/***/ }),

/***/ "./src/modules/view.js":
/*!*****************************!*\
  !*** ./src/modules/view.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _weather__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./weather */ "./src/modules/weather.js");
/* harmony import */ var _geolocation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./geolocation */ "./src/modules/geolocation.js");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./storage */ "./src/modules/storage.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/modules/utils.js");





const view = (() => {
  let lastFetchData;

  function initWebsite() {
    loadInitialData()
    renderUnitButton(_storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement())
    initSearchForm()
    initSystemOfMeasurementSwitch()
  }

  function removePreloadOverlay() {
    const overlay = document.querySelector('.preload-overlay')
    overlay.style.visibility = 'collapse'
    overlay.style.opacity = 0;
  }

  async function loadInitialData() {
    try {
      // Load default data (to be shown in the meantime if user hasn't yet allowed or blocked geolocation)
      const initialData = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData('New York')
      lastFetchData = Object.assign({}, initialData)
      renderView(convertData(initialData, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      removePreloadOverlay()

      // Switch to local data if user geolocation permission is granted
      const position = await _geolocation__WEBPACK_IMPORTED_MODULE_1__["default"].getUserPosition()
      if (position !== undefined) {
        const data = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(null, position)
        lastFetchData = Object.assign({}, data)
        renderView(convertData(data, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
      }
    } catch (error) {
      console.error(error)
    } finally {
      removePreloadOverlay()
    }
  }

  function initSearchForm() {
    const searchForm = document.querySelector('form')
    searchForm.addEventListener('submit', searchLocation)
  }

  function renderSearchError(message) {
    const searchForm = document.querySelector('form')
    const errorSpan = document.createElement('span')

    errorSpan.classList.add('error')
    errorSpan.textContent = message

    searchForm.appendChild(errorSpan)
  }

  function removeSearchError() {
    const errorSpan = document.querySelector('span.error')
    if (errorSpan !== null) errorSpan.remove()
  }

  function renderSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]')
    const loaderSpan = document.createElement('span')
    loaderSpan.classList.add('loader')

    if (searchButton.getElementsByClassName('search-img')) {
      searchButton.removeChild(searchButton.children[0])
      searchButton.appendChild(loaderSpan)
    }
  }

  function removeSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]')
    const searchImg = document.createElement('img')
    searchImg.src = './images/search.svg'
    searchImg.height = 20
    searchImg.width = 20
    searchImg.alt = 'Search Button Icon'
    searchImg.classList.add('search-img')

    if (searchButton.getElementsByClassName('loader')) {
      searchButton.removeChild(searchButton.children[0])
      searchButton.appendChild(searchImg)
    }
  }

  async function searchLocation(e) {
    e.preventDefault()
    removeSearchError()
    try {
      const searchValue = document.querySelector('input[type="search"]').value.trim()
      if (searchValue === '') return renderSearchError('Please enter a location name')

      renderSearchLoader()

      const data = await _weather__WEBPACK_IMPORTED_MODULE_0__["default"].getData(searchValue)

      if (data.cod === 200) {
        lastFetchData = Object.assign({}, data)
        renderView(convertData(data, _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()))
        console.log(data)
      } else if (data.cod === '404' || data.cod === '400') {
        renderSearchError('No results found')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      removeSearchLoader()
    }
  }

  function initSystemOfMeasurementSwitch() {
    const switchWrapper = document.querySelector('.switch-wrapper')
    switchWrapper.addEventListener('click', switchSystemOfMeasurement)
  }

  function switchSystemOfMeasurement(e) {
    const switchBtns = document.querySelectorAll('.switch-btn')
    const systemOfMeasurement = e.target.dataset.system

    _storage__WEBPACK_IMPORTED_MODULE_2__["default"].setSystemOfMeasurement(systemOfMeasurement)
    switchBtns.forEach(btn => btn.classList.remove('active'))
    e.target.classList.add('active')

    renderView(convertData(lastFetchData, systemOfMeasurement))
  }

  function getUnitSymbol(systemOfMeasurement, unitType) {
    const unitSymbols = {
      metric: {
        temp: '\u00B0C',
        speed: 'Km/h',
        distance: 'Km',
      },
      imperial: {
        temp: '\u00B0F',
        speed: 'Mph',
        distance: 'Mi',
      },
    }

    return unitSymbols[systemOfMeasurement][unitType]
  }

  function getWeatherIconURL(iconName) {
    const icons = {
      '01d': '01d',
      '01n': '01n',
      '02d': '02d',
      '02n': '02n',
      '03d': '03d_03n',
      '03n': '03d_03n',
      '04d': '04d_04n',
      '04n': '04d_04n',
      '09d': '09d_09n',
      '09n': '09d_09n',
      '10d': '10d',
      '10n': '10n',
      '11d': '11d',
      '11n': '11n',
      '13d': '13d_13n',
      '13n': '13d_13n',
      '50d': '50d_50n',
      '50n': '50d_50n',
    }
    const imgSrc = `images/weather_conditions/${icons[iconName]}.svg`

    return imgSrc
  }

  function convertData(data, outputMeasurementSystem) {
    if (outputMeasurementSystem === 'imperial') {
      const convertedData = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertToImperial(data)
      return convertedData
    } else if (outputMeasurementSystem === 'metric') {
      const convertedData = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertToMetric(data)
      return convertedData
    }
  }

  function renderView(data) {
    const measurementSystem = _storage__WEBPACK_IMPORTED_MODULE_2__["default"].getSystemOfMeasurement()
    const description = document.querySelector('.description')
    const conditionImg = document.querySelector('.condition')
    const city = document.querySelector('.city')
    const country = document.querySelector('.country')
    const temperature = document.querySelector('.temperature')
    const day = document.querySelector('.day')
    const minTemp = document.querySelector('.min-temp')
    const maxTemp = document.querySelector('.max-temp')
    const feelsLike = document.querySelector('.feels-like .temp')
    const humidity = document.querySelector('.humidity .percentage')
    const windSpeed = document.querySelector('.wind .speed')
    const visibility = document.querySelector('.visibility .distance')
    const sunrise = document.querySelector('.sunrise .time')
    const sunset = document.querySelector('.sunset .time')


    description.textContent = data.weatherDescription
    conditionImg.src = getWeatherIconURL(data.weatherIcon)
    city.textContent = data.cityName
    country.textContent = data.countryName
    day.textContent = _utils__WEBPACK_IMPORTED_MODULE_3__["default"].convertTimestampToDay(data.timeOfCalculation, data.timezone)
    temperature.textContent = Math.round(data.temperature) + getUnitSymbol(measurementSystem, 'temp')
    minTemp.textContent = Math.round(data.minTemp) + getUnitSymbol(measurementSystem, 'temp')
    maxTemp.textContent = Math.round(data.maxTemp) + getUnitSymbol(measurementSystem, 'temp')
    feelsLike.textContent = Math.round(data.feelsLike) + ' ' + getUnitSymbol(measurementSystem, 'temp')
    humidity.textContent = data.humidity
    windSpeed.textContent = Math.round(data.windSpeed) + ' ' + getUnitSymbol(measurementSystem, 'speed')
    visibility.textContent = Math.round(data.visibility) + ' ' + getUnitSymbol(measurementSystem, 'distance')
    sunrise.textContent = data.sunriseTimestamp
    sunset.textContent = data.sunsetTimestamp
  }

  function renderUnitButton(unit) {
    const cButton = document.querySelector('.celcius')
    const fButton = document.querySelector('.fahrenheit')

    if (unit === 'metric') {
      fButton.classList.remove('active')
      cButton.classList.add('active')
    } else if (unit === 'imperial') {
      cButton.classList.remove('active')
      fButton.classList.add('active')
    }
  }

  return { initWebsite }
})()

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (view);

/***/ }),

/***/ "./src/modules/weather.js":
/*!********************************!*\
  !*** ./src/modules/weather.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
      const APIKey = '4a690db620f1dcc5aa19b64e38ecec86' // Not safe, but it's a free API key just for the purpose of this project.
      const apiURL = coordinates
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${APIKey}`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${APIKey}`
  
      try {
        const response = await fetch(apiURL, { mode: 'cors' })
        const data = await response.json()
        if (data.cod === 200) return filterData(data)
        else return data
      } catch (error) {
        console.error('Fetch Error:', error.message)
      }
    }
    return { getData }
  })()
  
  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (weather);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/view */ "./src/modules/view.js");


window.addEventListener("load", _modules_view__WEBPACK_IMPORTED_MODULE_0__["default"].initWebsite);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ekg7QUFDQTtBQUNBLCtDQUErQyxjQUFjO0FBQzdEO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsR0FBRztBQUNIO0FBQ0EsRUFBRSxpRUFBZTs7Ozs7O1VDckVqQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTmtDO0FBQ2xDO0FBQ0EsZ0NBQWdDLGlFQUFnQixFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy9nZW9sb2NhdGlvbi5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9tb2R1bGVzL3ZpZXcuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvbW9kdWxlcy93ZWF0aGVyLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ2VvbG9jYXRpb24gPSAoKCkgPT4ge1xyXG4gICAgZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24ocmVzb2x2ZSwgcmVqZWN0LCB7IHRpbWVvdXQ6IDYwMDAgfSlcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIFxyXG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlclBvc2l0aW9uKCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gYXdhaXQgZ2V0UG9zaXRpb24oKVxyXG4gICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBjb29yZHM6IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9LFxyXG4gICAgICAgICAgfSA9IHBvc2l0aW9uXHJcbiAgICAgICAgICByZXR1cm4geyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyIGRvZXMgbm90IHN1cHBvcnQgZ2VvbG9jYXRpb24nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oYCR7ZXJyb3IubWVzc2FnZX0sIGRlZmF1bHQgbG9jYXRpb24gd2lsbCBiZSB1c2VkLmApXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIHJldHVybiB7IGdldFVzZXJQb3NpdGlvbiB9XHJcbiAgfSkoKVxyXG4gIFxyXG4gIGV4cG9ydCBkZWZhdWx0IGdlb2xvY2F0aW9uIiwiY29uc3Qgc3RvcmFnZSA9ICgoKSA9PiB7XHJcbiAgICBmdW5jdGlvbiBzZXRTeXN0ZW1PZk1lYXN1cmVtZW50KHVuaXROYW1lKSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1bml0JywgdW5pdE5hbWUpXHJcbiAgICB9XHJcbiAgXHJcbiAgICBmdW5jdGlvbiBnZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkge1xyXG4gICAgICBsZXQgY2hvc2VuVW5pdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1bml0JylcclxuICAgICAgaWYgKGNob3NlblVuaXQgPT09ICdtZXRyaWMnIHx8IGNob3NlblVuaXQgPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgICByZXR1cm4gY2hvc2VuVW5pdFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldFN5c3RlbU9mTWVhc3VyZW1lbnQoJ21ldHJpYycpXHJcbiAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1bml0JylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2V0U3lzdGVtT2ZNZWFzdXJlbWVudCxcclxuICAgICAgZ2V0U3lzdGVtT2ZNZWFzdXJlbWVudCxcclxuICAgIH1cclxuICB9KSgpXHJcbiAgXHJcbiAgZXhwb3J0IGRlZmF1bHQgc3RvcmFnZSIsImNvbnN0IHV0aWxzID0gKCgpID0+IHtcclxuICAgIGZ1bmN0aW9uIF9zaG9ydGVuRGVjaW1hbChudW1iZXIpIHtcclxuICAgICAgcmV0dXJuIE51bWJlcigobnVtYmVyKS50b0ZpeGVkKDIpLnJlcGxhY2UoL1suLF0wMCQvLCBcIlwiKSlcclxuICAgIH1cclxuICBcclxuICAgIGZ1bmN0aW9uIGNvbnZlcnRDVG9GKHRlbXBJbkNlbGNpdXMpIHtcclxuICAgICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbCh0ZW1wSW5DZWxjaXVzICogMS44ICsgMzIpXHJcbiAgICB9XHJcbiAgXHJcbiAgICBmdW5jdGlvbiBjb252ZXJ0S21oVG9NcGgoc3BlZWRJbkttaCkge1xyXG4gICAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKHNwZWVkSW5LbWggLyAxLjYwOTM0NClcclxuICAgIH1cclxuICBcclxuICAgIGZ1bmN0aW9uIGNvbnZlcnRNZXRlcnNUb0ttKG1ldGVycykge1xyXG4gICAgICByZXR1cm4gX3Nob3J0ZW5EZWNpbWFsKG1ldGVycyAvIDEwMDApXHJcbiAgICB9XHJcbiAgXHJcbiAgICBmdW5jdGlvbiBjb252ZXJ0TWV0ZXJzVG9NaWxlcyhtZXRlcnMpIHtcclxuICAgICAgcmV0dXJuIF9zaG9ydGVuRGVjaW1hbChtZXRlcnMgKiAwLjAwMDYyMTM3KVxyXG4gICAgfVxyXG4gIFxyXG4gICAgZnVuY3Rpb24gY29udmVydFRpbWVzdGFtcFRvRGF5KHRpbWVzdGFtcCwgdGltZXpvbmUpIHtcclxuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCh0aW1lc3RhbXAgKyB0aW1lem9uZSkgKiAxMDAwKVxyXG4gICAgICByZXR1cm4gZGF0ZS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IHdlZWtkYXk6ICdsb25nJywgdGltZVpvbmU6ICdVVEMnfSlcclxuICAgIH1cclxuICBcclxuICAgIGZ1bmN0aW9uIGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIodGltZXN0YW1wLCB0aW1lem9uZSwgaG91ckZvcm1hdCkge1xyXG4gICAgICBjb25zdCBmb3JtYXQgPSAoTnVtYmVyKGhvdXJGb3JtYXQpID09IDEyKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKHRpbWVzdGFtcCArIHRpbWV6b25lKSAqIDEwMDApXHJcbiAgICAgIHJldHVybiBkYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1VUycsIHsgaG91cjogJ251bWVyaWMnLCBtaW51dGU6ICdudW1lcmljJywgdGltZVpvbmU6ICdVVEMnLCBob3VyMTI6IGZvcm1hdCB9KVxyXG4gICAgfVxyXG4gIFxyXG4gICAgZnVuY3Rpb24gY29udmVydFRvSW1wZXJpYWwoZGF0YSkge1xyXG4gICAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwge1xyXG4gICAgICAgIHRlbXBlcmF0dXJlOiBjb252ZXJ0Q1RvRihkYXRhLnRlbXBlcmF0dXJlKSxcclxuICAgICAgICBmZWVsc0xpa2U6IGNvbnZlcnRDVG9GKGRhdGEuZmVlbHNMaWtlKSxcclxuICAgICAgICBtYXhUZW1wOiBjb252ZXJ0Q1RvRihkYXRhLm1heFRlbXApLFxyXG4gICAgICAgIG1pblRlbXA6IGNvbnZlcnRDVG9GKGRhdGEubWluVGVtcCksXHJcbiAgICAgICAgd2luZFNwZWVkOiBjb252ZXJ0S21oVG9NcGgoZGF0YS53aW5kU3BlZWQpLFxyXG4gICAgICAgIHZpc2liaWxpdHk6IGNvbnZlcnRNZXRlcnNUb01pbGVzKGRhdGEudmlzaWJpbGl0eSksXHJcbiAgICAgICAgc3VucmlzZVRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnJpc2VUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDEyKSxcclxuICAgICAgICBzdW5zZXRUaW1lc3RhbXA6IGNvbnZlcnRUaW1lc3RhbXBUb0hvdXIoZGF0YS5zdW5zZXRUaW1lc3RhbXAsIGRhdGEudGltZXpvbmUsIDEyKSxcclxuICAgICAgfSlcclxuICAgICAgcmV0dXJuIGNvbnZlcnRlZERhdGFcclxuICAgIH1cclxuICBcclxuICAgIGZ1bmN0aW9uIGNvbnZlcnRUb01ldHJpYyhkYXRhKSB7XHJcbiAgICAgIGNvbnN0IGNvbnZlcnRlZERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCB7XHJcbiAgICAgICAgdmlzaWJpbGl0eTogY29udmVydE1ldGVyc1RvS20oZGF0YS52aXNpYmlsaXR5KSxcclxuICAgICAgICBzdW5yaXNlVGltZXN0YW1wOiBjb252ZXJ0VGltZXN0YW1wVG9Ib3VyKGRhdGEuc3VucmlzZVRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMjQpLFxyXG4gICAgICAgIHN1bnNldFRpbWVzdGFtcDogY29udmVydFRpbWVzdGFtcFRvSG91cihkYXRhLnN1bnNldFRpbWVzdGFtcCwgZGF0YS50aW1lem9uZSwgMjQpLFxyXG4gICAgICB9KVxyXG4gICAgICByZXR1cm4gY29udmVydGVkRGF0YVxyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udmVydFRpbWVzdGFtcFRvRGF5LFxyXG4gICAgICBjb252ZXJ0VG9JbXBlcmlhbCxcclxuICAgICAgY29udmVydFRvTWV0cmljLFxyXG4gICAgfVxyXG4gIH0pKClcclxuICBcclxuICBleHBvcnQgZGVmYXVsdCB1dGlscyIsImltcG9ydCB3ZWF0aGVyIGZyb20gJy4vd2VhdGhlcidcclxuaW1wb3J0IGdlb2xvY2F0aW9uIGZyb20gJy4vZ2VvbG9jYXRpb24nXHJcbmltcG9ydCBzdG9yYWdlIGZyb20gJy4vc3RvcmFnZSdcclxuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnXHJcblxyXG5jb25zdCB2aWV3ID0gKCgpID0+IHtcclxuICBsZXQgbGFzdEZldGNoRGF0YTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdFdlYnNpdGUoKSB7XHJcbiAgICBsb2FkSW5pdGlhbERhdGEoKVxyXG4gICAgcmVuZGVyVW5pdEJ1dHRvbihzdG9yYWdlLmdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKSlcclxuICAgIGluaXRTZWFyY2hGb3JtKClcclxuICAgIGluaXRTeXN0ZW1PZk1lYXN1cmVtZW50U3dpdGNoKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZVByZWxvYWRPdmVybGF5KCkge1xyXG4gICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVsb2FkLW92ZXJsYXknKVxyXG4gICAgb3ZlcmxheS5zdHlsZS52aXNpYmlsaXR5ID0gJ2NvbGxhcHNlJ1xyXG4gICAgb3ZlcmxheS5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGxvYWRJbml0aWFsRGF0YSgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIExvYWQgZGVmYXVsdCBkYXRhICh0byBiZSBzaG93biBpbiB0aGUgbWVhbnRpbWUgaWYgdXNlciBoYXNuJ3QgeWV0IGFsbG93ZWQgb3IgYmxvY2tlZCBnZW9sb2NhdGlvbilcclxuICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBhd2FpdCB3ZWF0aGVyLmdldERhdGEoJ05ldyBZb3JrJylcclxuICAgICAgbGFzdEZldGNoRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGluaXRpYWxEYXRhKVxyXG4gICAgICByZW5kZXJWaWV3KGNvbnZlcnREYXRhKGluaXRpYWxEYXRhLCBzdG9yYWdlLmdldFN5c3RlbU9mTWVhc3VyZW1lbnQoKSkpXHJcbiAgICAgIHJlbW92ZVByZWxvYWRPdmVybGF5KClcclxuXHJcbiAgICAgIC8vIFN3aXRjaCB0byBsb2NhbCBkYXRhIGlmIHVzZXIgZ2VvbG9jYXRpb24gcGVybWlzc2lvbiBpcyBncmFudGVkXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gYXdhaXQgZ2VvbG9jYXRpb24uZ2V0VXNlclBvc2l0aW9uKClcclxuICAgICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgd2VhdGhlci5nZXREYXRhKG51bGwsIHBvc2l0aW9uKVxyXG4gICAgICAgIGxhc3RGZXRjaERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhKVxyXG4gICAgICAgIHJlbmRlclZpZXcoY29udmVydERhdGEoZGF0YSwgc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpKVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgcmVtb3ZlUHJlbG9hZE92ZXJsYXkoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdFNlYXJjaEZvcm0oKSB7XHJcbiAgICBjb25zdCBzZWFyY2hGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZm9ybScpXHJcbiAgICBzZWFyY2hGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHNlYXJjaExvY2F0aW9uKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyU2VhcmNoRXJyb3IobWVzc2FnZSkge1xyXG4gICAgY29uc3Qgc2VhcmNoRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKVxyXG4gICAgY29uc3QgZXJyb3JTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXHJcblxyXG4gICAgZXJyb3JTcGFuLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJylcclxuICAgIGVycm9yU3Bhbi50ZXh0Q29udGVudCA9IG1lc3NhZ2VcclxuXHJcbiAgICBzZWFyY2hGb3JtLmFwcGVuZENoaWxkKGVycm9yU3BhbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZVNlYXJjaEVycm9yKCkge1xyXG4gICAgY29uc3QgZXJyb3JTcGFuID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3Bhbi5lcnJvcicpXHJcbiAgICBpZiAoZXJyb3JTcGFuICE9PSBudWxsKSBlcnJvclNwYW4ucmVtb3ZlKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclNlYXJjaExvYWRlcigpIHtcclxuICAgIGNvbnN0IHNlYXJjaEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJylcclxuICAgIGNvbnN0IGxvYWRlclNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcclxuICAgIGxvYWRlclNwYW4uY2xhc3NMaXN0LmFkZCgnbG9hZGVyJylcclxuXHJcbiAgICBpZiAoc2VhcmNoQnV0dG9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlYXJjaC1pbWcnKSkge1xyXG4gICAgICBzZWFyY2hCdXR0b24ucmVtb3ZlQ2hpbGQoc2VhcmNoQnV0dG9uLmNoaWxkcmVuWzBdKVxyXG4gICAgICBzZWFyY2hCdXR0b24uYXBwZW5kQ2hpbGQobG9hZGVyU3BhbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZVNlYXJjaExvYWRlcigpIHtcclxuICAgIGNvbnN0IHNlYXJjaEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJylcclxuICAgIGNvbnN0IHNlYXJjaEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXHJcbiAgICBzZWFyY2hJbWcuc3JjID0gJy4vaW1hZ2VzL3NlYXJjaC5zdmcnXHJcbiAgICBzZWFyY2hJbWcuaGVpZ2h0ID0gMjBcclxuICAgIHNlYXJjaEltZy53aWR0aCA9IDIwXHJcbiAgICBzZWFyY2hJbWcuYWx0ID0gJ1NlYXJjaCBCdXR0b24gSWNvbidcclxuICAgIHNlYXJjaEltZy5jbGFzc0xpc3QuYWRkKCdzZWFyY2gtaW1nJylcclxuXHJcbiAgICBpZiAoc2VhcmNoQnV0dG9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xvYWRlcicpKSB7XHJcbiAgICAgIHNlYXJjaEJ1dHRvbi5yZW1vdmVDaGlsZChzZWFyY2hCdXR0b24uY2hpbGRyZW5bMF0pXHJcbiAgICAgIHNlYXJjaEJ1dHRvbi5hcHBlbmRDaGlsZChzZWFyY2hJbWcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBzZWFyY2hMb2NhdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIHJlbW92ZVNlYXJjaEVycm9yKClcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNlYXJjaFZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLnZhbHVlLnRyaW0oKVxyXG4gICAgICBpZiAoc2VhcmNoVmFsdWUgPT09ICcnKSByZXR1cm4gcmVuZGVyU2VhcmNoRXJyb3IoJ1BsZWFzZSBlbnRlciBhIGxvY2F0aW9uIG5hbWUnKVxyXG5cclxuICAgICAgcmVuZGVyU2VhcmNoTG9hZGVyKClcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB3ZWF0aGVyLmdldERhdGEoc2VhcmNoVmFsdWUpXHJcblxyXG4gICAgICBpZiAoZGF0YS5jb2QgPT09IDIwMCkge1xyXG4gICAgICAgIGxhc3RGZXRjaERhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhKVxyXG4gICAgICAgIHJlbmRlclZpZXcoY29udmVydERhdGEoZGF0YSwgc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KCkpKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jb2QgPT09ICc0MDQnIHx8IGRhdGEuY29kID09PSAnNDAwJykge1xyXG4gICAgICAgIHJlbmRlclNlYXJjaEVycm9yKCdObyByZXN1bHRzIGZvdW5kJylcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignU2VhcmNoIGVycm9yOicsIGVycm9yKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgcmVtb3ZlU2VhcmNoTG9hZGVyKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRTeXN0ZW1PZk1lYXN1cmVtZW50U3dpdGNoKCkge1xyXG4gICAgY29uc3Qgc3dpdGNoV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zd2l0Y2gtd3JhcHBlcicpXHJcbiAgICBzd2l0Y2hXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3dpdGNoU3lzdGVtT2ZNZWFzdXJlbWVudClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN3aXRjaFN5c3RlbU9mTWVhc3VyZW1lbnQoZSkge1xyXG4gICAgY29uc3Qgc3dpdGNoQnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zd2l0Y2gtYnRuJylcclxuICAgIGNvbnN0IHN5c3RlbU9mTWVhc3VyZW1lbnQgPSBlLnRhcmdldC5kYXRhc2V0LnN5c3RlbVxyXG5cclxuICAgIHN0b3JhZ2Uuc2V0U3lzdGVtT2ZNZWFzdXJlbWVudChzeXN0ZW1PZk1lYXN1cmVtZW50KVxyXG4gICAgc3dpdGNoQnRucy5mb3JFYWNoKGJ0biA9PiBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykpXHJcbiAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG5cclxuICAgIHJlbmRlclZpZXcoY29udmVydERhdGEobGFzdEZldGNoRGF0YSwgc3lzdGVtT2ZNZWFzdXJlbWVudCkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRVbml0U3ltYm9sKHN5c3RlbU9mTWVhc3VyZW1lbnQsIHVuaXRUeXBlKSB7XHJcbiAgICBjb25zdCB1bml0U3ltYm9scyA9IHtcclxuICAgICAgbWV0cmljOiB7XHJcbiAgICAgICAgdGVtcDogJ1xcdTAwQjBDJyxcclxuICAgICAgICBzcGVlZDogJ0ttL2gnLFxyXG4gICAgICAgIGRpc3RhbmNlOiAnS20nLFxyXG4gICAgICB9LFxyXG4gICAgICBpbXBlcmlhbDoge1xyXG4gICAgICAgIHRlbXA6ICdcXHUwMEIwRicsXHJcbiAgICAgICAgc3BlZWQ6ICdNcGgnLFxyXG4gICAgICAgIGRpc3RhbmNlOiAnTWknLFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1bml0U3ltYm9sc1tzeXN0ZW1PZk1lYXN1cmVtZW50XVt1bml0VHlwZV1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFdlYXRoZXJJY29uVVJMKGljb25OYW1lKSB7XHJcbiAgICBjb25zdCBpY29ucyA9IHtcclxuICAgICAgJzAxZCc6ICcwMWQnLFxyXG4gICAgICAnMDFuJzogJzAxbicsXHJcbiAgICAgICcwMmQnOiAnMDJkJyxcclxuICAgICAgJzAybic6ICcwMm4nLFxyXG4gICAgICAnMDNkJzogJzAzZF8wM24nLFxyXG4gICAgICAnMDNuJzogJzAzZF8wM24nLFxyXG4gICAgICAnMDRkJzogJzA0ZF8wNG4nLFxyXG4gICAgICAnMDRuJzogJzA0ZF8wNG4nLFxyXG4gICAgICAnMDlkJzogJzA5ZF8wOW4nLFxyXG4gICAgICAnMDluJzogJzA5ZF8wOW4nLFxyXG4gICAgICAnMTBkJzogJzEwZCcsXHJcbiAgICAgICcxMG4nOiAnMTBuJyxcclxuICAgICAgJzExZCc6ICcxMWQnLFxyXG4gICAgICAnMTFuJzogJzExbicsXHJcbiAgICAgICcxM2QnOiAnMTNkXzEzbicsXHJcbiAgICAgICcxM24nOiAnMTNkXzEzbicsXHJcbiAgICAgICc1MGQnOiAnNTBkXzUwbicsXHJcbiAgICAgICc1MG4nOiAnNTBkXzUwbicsXHJcbiAgICB9XHJcbiAgICBjb25zdCBpbWdTcmMgPSBgaW1hZ2VzL3dlYXRoZXJfY29uZGl0aW9ucy8ke2ljb25zW2ljb25OYW1lXX0uc3ZnYFxyXG5cclxuICAgIHJldHVybiBpbWdTcmNcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnREYXRhKGRhdGEsIG91dHB1dE1lYXN1cmVtZW50U3lzdGVtKSB7XHJcbiAgICBpZiAob3V0cHV0TWVhc3VyZW1lbnRTeXN0ZW0gPT09ICdpbXBlcmlhbCcpIHtcclxuICAgICAgY29uc3QgY29udmVydGVkRGF0YSA9IHV0aWxzLmNvbnZlcnRUb0ltcGVyaWFsKGRhdGEpXHJcbiAgICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgICB9IGVsc2UgaWYgKG91dHB1dE1lYXN1cmVtZW50U3lzdGVtID09PSAnbWV0cmljJykge1xyXG4gICAgICBjb25zdCBjb252ZXJ0ZWREYXRhID0gdXRpbHMuY29udmVydFRvTWV0cmljKGRhdGEpXHJcbiAgICAgIHJldHVybiBjb252ZXJ0ZWREYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXJWaWV3KGRhdGEpIHtcclxuICAgIGNvbnN0IG1lYXN1cmVtZW50U3lzdGVtID0gc3RvcmFnZS5nZXRTeXN0ZW1PZk1lYXN1cmVtZW50KClcclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRlc2NyaXB0aW9uJylcclxuICAgIGNvbnN0IGNvbmRpdGlvbkltZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb25kaXRpb24nKVxyXG4gICAgY29uc3QgY2l0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaXR5JylcclxuICAgIGNvbnN0IGNvdW50cnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY291bnRyeScpXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZW1wZXJhdHVyZScpXHJcbiAgICBjb25zdCBkYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGF5JylcclxuICAgIGNvbnN0IG1pblRlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWluLXRlbXAnKVxyXG4gICAgY29uc3QgbWF4VGVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYXgtdGVtcCcpXHJcbiAgICBjb25zdCBmZWVsc0xpa2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmVlbHMtbGlrZSAudGVtcCcpXHJcbiAgICBjb25zdCBodW1pZGl0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5odW1pZGl0eSAucGVyY2VudGFnZScpXHJcbiAgICBjb25zdCB3aW5kU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2luZCAuc3BlZWQnKVxyXG4gICAgY29uc3QgdmlzaWJpbGl0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy52aXNpYmlsaXR5IC5kaXN0YW5jZScpXHJcbiAgICBjb25zdCBzdW5yaXNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bnJpc2UgLnRpbWUnKVxyXG4gICAgY29uc3Qgc3Vuc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1bnNldCAudGltZScpXHJcblxyXG5cclxuICAgIGRlc2NyaXB0aW9uLnRleHRDb250ZW50ID0gZGF0YS53ZWF0aGVyRGVzY3JpcHRpb25cclxuICAgIGNvbmRpdGlvbkltZy5zcmMgPSBnZXRXZWF0aGVySWNvblVSTChkYXRhLndlYXRoZXJJY29uKVxyXG4gICAgY2l0eS50ZXh0Q29udGVudCA9IGRhdGEuY2l0eU5hbWVcclxuICAgIGNvdW50cnkudGV4dENvbnRlbnQgPSBkYXRhLmNvdW50cnlOYW1lXHJcbiAgICBkYXkudGV4dENvbnRlbnQgPSB1dGlscy5jb252ZXJ0VGltZXN0YW1wVG9EYXkoZGF0YS50aW1lT2ZDYWxjdWxhdGlvbiwgZGF0YS50aW1lem9uZSlcclxuICAgIHRlbXBlcmF0dXJlLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLnRlbXBlcmF0dXJlKSArIGdldFVuaXRTeW1ib2wobWVhc3VyZW1lbnRTeXN0ZW0sICd0ZW1wJylcclxuICAgIG1pblRlbXAudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEubWluVGVtcCkgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBtYXhUZW1wLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLm1heFRlbXApICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3RlbXAnKVxyXG4gICAgZmVlbHNMaWtlLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChkYXRhLmZlZWxzTGlrZSkgKyAnICcgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAndGVtcCcpXHJcbiAgICBodW1pZGl0eS50ZXh0Q29udGVudCA9IGRhdGEuaHVtaWRpdHlcclxuICAgIHdpbmRTcGVlZC50ZXh0Q29udGVudCA9IE1hdGgucm91bmQoZGF0YS53aW5kU3BlZWQpICsgJyAnICsgZ2V0VW5pdFN5bWJvbChtZWFzdXJlbWVudFN5c3RlbSwgJ3NwZWVkJylcclxuICAgIHZpc2liaWxpdHkudGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKGRhdGEudmlzaWJpbGl0eSkgKyAnICcgKyBnZXRVbml0U3ltYm9sKG1lYXN1cmVtZW50U3lzdGVtLCAnZGlzdGFuY2UnKVxyXG4gICAgc3VucmlzZS50ZXh0Q29udGVudCA9IGRhdGEuc3VucmlzZVRpbWVzdGFtcFxyXG4gICAgc3Vuc2V0LnRleHRDb250ZW50ID0gZGF0YS5zdW5zZXRUaW1lc3RhbXBcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlclVuaXRCdXR0b24odW5pdCkge1xyXG4gICAgY29uc3QgY0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jZWxjaXVzJylcclxuICAgIGNvbnN0IGZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmFocmVuaGVpdCcpXHJcblxyXG4gICAgaWYgKHVuaXQgPT09ICdtZXRyaWMnKSB7XHJcbiAgICAgIGZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgICAgY0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG4gICAgfSBlbHNlIGlmICh1bml0ID09PSAnaW1wZXJpYWwnKSB7XHJcbiAgICAgIGNCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgICAgZkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgaW5pdFdlYnNpdGUgfVxyXG59KSgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB2aWV3IiwiY29uc3Qgd2VhdGhlciA9ICgoKSA9PiB7XHJcbiAgICBmdW5jdGlvbiBmaWx0ZXJEYXRhKGRhdGEpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGR0OiB0aW1lT2ZDYWxjdWxhdGlvbixcclxuICAgICAgICBuYW1lOiBjaXR5TmFtZSxcclxuICAgICAgICBtYWluOiB7XHJcbiAgICAgICAgICB0ZW1wOiB0ZW1wZXJhdHVyZSxcclxuICAgICAgICAgIGZlZWxzX2xpa2U6IGZlZWxzTGlrZSxcclxuICAgICAgICAgIHRlbXBfbWluOiBtaW5UZW1wLFxyXG4gICAgICAgICAgdGVtcF9tYXg6IG1heFRlbXAsXHJcbiAgICAgICAgICBodW1pZGl0eSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN5czoge1xyXG4gICAgICAgICAgY291bnRyeTogY291bnRyeU5hbWUsXHJcbiAgICAgICAgICBzdW5yaXNlOiBzdW5yaXNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgc3Vuc2V0OiBzdW5zZXRUaW1lc3RhbXAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lem9uZSxcclxuICAgICAgICB2aXNpYmlsaXR5LFxyXG4gICAgICAgIHdlYXRoZXI6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbWFpbjogd2VhdGhlck5hbWUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB3ZWF0aGVyRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIGljb246IHdlYXRoZXJJY29uLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIHdpbmQ6IHsgc3BlZWQ6IHdpbmRTcGVlZCB9LFxyXG4gICAgICAgIGNvZCxcclxuICAgICAgfSA9IGRhdGFcclxuICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0aW1lT2ZDYWxjdWxhdGlvbixcclxuICAgICAgICBjaXR5TmFtZSxcclxuICAgICAgICBjb3VudHJ5TmFtZSxcclxuICAgICAgICB0ZW1wZXJhdHVyZSxcclxuICAgICAgICBmZWVsc0xpa2UsXHJcbiAgICAgICAgbWluVGVtcCxcclxuICAgICAgICBtYXhUZW1wLFxyXG4gICAgICAgIGh1bWlkaXR5LFxyXG4gICAgICAgIHN1bnJpc2VUaW1lc3RhbXAsXHJcbiAgICAgICAgc3Vuc2V0VGltZXN0YW1wLFxyXG4gICAgICAgIHRpbWV6b25lLFxyXG4gICAgICAgIHZpc2liaWxpdHksXHJcbiAgICAgICAgd2luZFNwZWVkLFxyXG4gICAgICAgIHdlYXRoZXJOYW1lLFxyXG4gICAgICAgIHdlYXRoZXJEZXNjcmlwdGlvbixcclxuICAgICAgICB3ZWF0aGVySWNvbixcclxuICAgICAgICBjb2RcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIFxyXG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YShjaXR5TmFtZSwgY29vcmRpbmF0ZXMpIHtcclxuICAgICAgY29uc3QgQVBJS2V5ID0gJzRhNjkwZGI2MjBmMWRjYzVhYTE5YjY0ZTM4ZWNlYzg2JyAvLyBOb3Qgc2FmZSwgYnV0IGl0J3MgYSBmcmVlIEFQSSBrZXkganVzdCBmb3IgdGhlIHB1cnBvc2Ugb2YgdGhpcyBwcm9qZWN0LlxyXG4gICAgICBjb25zdCBhcGlVUkwgPSBjb29yZGluYXRlc1xyXG4gICAgICAgID8gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2Nvb3JkaW5hdGVzLmxhdGl0dWRlfSZsb249JHtjb29yZGluYXRlcy5sb25naXR1ZGV9JnVuaXRzPW1ldHJpYyZhcHBpZD0ke0FQSUtleX1gXHJcbiAgICAgICAgOiBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/cT0ke2VuY29kZVVSSUNvbXBvbmVudChjaXR5TmFtZSl9JnVuaXRzPW1ldHJpYyZhcHBpZD0ke0FQSUtleX1gXHJcbiAgXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChhcGlVUkwsIHsgbW9kZTogJ2NvcnMnIH0pXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICAgIGlmIChkYXRhLmNvZCA9PT0gMjAwKSByZXR1cm4gZmlsdGVyRGF0YShkYXRhKVxyXG4gICAgICAgIGVsc2UgcmV0dXJuIGRhdGFcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGZXRjaCBFcnJvcjonLCBlcnJvci5tZXNzYWdlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBnZXREYXRhIH1cclxuICB9KSgpXHJcbiAgXHJcbiAgZXhwb3J0IGRlZmF1bHQgd2VhdGhlciIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHZpZXcgZnJvbSBcIi4vbW9kdWxlcy92aWV3XCI7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdmlldy5pbml0V2Vic2l0ZSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9