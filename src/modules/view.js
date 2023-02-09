import weather from "./weather";
import geolocation from "./geolocation";
import storage from "./storage";
import utils from "./utils";

const view = (() => {
  let lastFetchData;

  function initWebsite() {
    loadInitialData();
    renderUnitButton(storage.getSystemOfMeasurement());
    initSearchForm();
    initSystemOfMeasurementSwitch();
  }

  function removePreloadOverlay() {
    const overlay = document.querySelector(".preload-overlay");
    overlay.style.visibility = "collapse";
    overlay.style.opacity = 0;
  }

  async function loadInitialData() {
    try {
      // Load default data (to be shown in the meantime if user hasn't yet allowed or blocked geolocation)
      const initialData = await weather.getData("New York");
      lastFetchData = Object.assign({}, initialData);
      renderView(convertData(initialData, storage.getSystemOfMeasurement()));
      removePreloadOverlay();

      // Switch to local data if user geolocation permission is granted
      const position = await geolocation.getUserPosition();
      if (position !== undefined) {
        const data = await weather.getData(null, position);
        lastFetchData = Object.assign({}, data);
        renderView(convertData(data, storage.getSystemOfMeasurement()));
      }
    } catch (error) {
      console.error(error);
    } finally {
      removePreloadOverlay();
    }
  }

  function initSearchForm() {
    const searchForm = document.querySelector("form");
    searchForm.addEventListener("submit", searchLocation);
  }

  function renderSearchError(message) {
    const searchForm = document.querySelector("form");
    const errorSpan = document.createElement("span");

    errorSpan.classList.add("error");
    errorSpan.textContent = message;

    searchForm.appendChild(errorSpan);
  }

  function removeSearchError() {
    const errorSpan = document.querySelector("span.error");
    if (errorSpan !== null) errorSpan.remove();
  }

  function renderSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]');
    const loaderSpan = document.createElement("span");
    loaderSpan.classList.add("loader");

    if (searchButton.getElementsByClassName("search-img")) {
      searchButton.removeChild(searchButton.children[0]);
      searchButton.appendChild(loaderSpan);
    }
  }

  function removeSearchLoader() {
    const searchButton = document.querySelector('button[type="submit"]');
    const searchImg = document.createElement("img");
    searchImg.src = "./images/search.svg";
    searchImg.height = 20;
    searchImg.width = 20;
    searchImg.alt = "Search Button Icon";
    searchImg.classList.add("search-img");

    if (searchButton.getElementsByClassName("loader")) {
      searchButton.removeChild(searchButton.children[0]);
      searchButton.appendChild(searchImg);
    }
  }

  async function searchLocation(e) {
    e.preventDefault();
    removeSearchError();
    try {
      const searchValue = document
        .querySelector('input[type="search"]')
        .value.trim();
      if (searchValue === "")
        return renderSearchError("Please enter a location name");

      renderSearchLoader();

      const data = await weather.getData(searchValue);

      if (data.cod === 200) {
        lastFetchData = Object.assign({}, data);
        renderView(convertData(data, storage.getSystemOfMeasurement()));
        console.log(data);
      } else if (data.cod === "404" || data.cod === "400") {
        renderSearchError("No results found");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      removeSearchLoader();
    }
  }

  function initSystemOfMeasurementSwitch() {
    const switchWrapper = document.querySelector(".switch-wrapper");
    switchWrapper.addEventListener("click", switchSystemOfMeasurement);
  }

  function switchSystemOfMeasurement(e) {
    const switchBtns = document.querySelectorAll(".switch-btn");
    const systemOfMeasurement = e.target.dataset.system;

    storage.setSystemOfMeasurement(systemOfMeasurement);
    switchBtns.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    renderView(convertData(lastFetchData, systemOfMeasurement));
  }

  function getUnitSymbol(systemOfMeasurement, unitType) {
    const unitSymbols = {
      metric: {
        temp: "\u00B0C",
        speed: "Km/h",
        distance: "Km",
      },
      imperial: {
        temp: "\u00B0F",
        speed: "Mph",
        distance: "Mi",
      },
    };

    return unitSymbols[systemOfMeasurement][unitType];
  }

  function getWeatherIconURL(iconName) {
    const icons = {
      "01d": "01d",
      "01n": "01n",
      "02d": "02d",
      "02n": "02n",
      "03d": "03d_03n",
      "03n": "03d_03n",
      "04d": "04d_04n",
      "04n": "04d_04n",
      "09d": "09d_09n",
      "09n": "09d_09n",
      "10d": "10d",
      "10n": "10n",
      "11d": "11d",
      "11n": "11n",
      "13d": "13d_13n",
      "13n": "13d_13n",
      "50d": "50d_50n",
      "50n": "50d_50n",
    };
    const imgSrc = `images/weather_conditions/${icons[iconName]}.svg`;

    return imgSrc;
  }

  function convertData(data, outputMeasurementSystem) {
    if (outputMeasurementSystem === "imperial") {
      const convertedData = utils.convertToImperial(data);
      return convertedData;
    } else if (outputMeasurementSystem === "metric") {
      const convertedData = utils.convertToMetric(data);
      return convertedData;
    }
  }

  function renderView(data) {
    const measurementSystem = storage.getSystemOfMeasurement();
    const description = document.querySelector(".description");
    const conditionImg = document.querySelector(".condition");
    const city = document.querySelector(".city");
    const country = document.querySelector(".country");
    const temperature = document.querySelector(".temperature");
    const day = document.querySelector(".day");
    const minTemp = document.querySelector(".min-temp");
    const maxTemp = document.querySelector(".max-temp");
    const feelsLike = document.querySelector(".feels-like .temp");
    const humidity = document.querySelector(".humidity .percentage");
    const windSpeed = document.querySelector(".wind .speed");
    const visibility = document.querySelector(".visibility .distance");
    const sunrise = document.querySelector(".sunrise .time");
    const sunset = document.querySelector(".sunset .time");

    description.textContent = data.weatherDescription;
    conditionImg.src = getWeatherIconURL(data.weatherIcon);
    city.textContent = data.cityName;
    country.textContent = data.countryName;
    day.textContent = utils.convertTimestampToDay(
      data.timeOfCalculation,
      data.timezone
    );
    temperature.textContent =
      Math.round(data.temperature) + getUnitSymbol(measurementSystem, "temp");
    minTemp.textContent =
      Math.round(data.minTemp) + getUnitSymbol(measurementSystem, "temp");
    maxTemp.textContent =
      Math.round(data.maxTemp) + getUnitSymbol(measurementSystem, "temp");
    feelsLike.textContent =
      Math.round(data.feelsLike) +
      " " +
      getUnitSymbol(measurementSystem, "temp");
    humidity.textContent = data.humidity;
    windSpeed.textContent =
      Math.round(data.windSpeed) +
      " " +
      getUnitSymbol(measurementSystem, "speed");
    visibility.textContent =
      Math.round(data.visibility) +
      " " +
      getUnitSymbol(measurementSystem, "distance");
    sunrise.textContent = data.sunriseTimestamp;
    sunset.textContent = data.sunsetTimestamp;
  }

  function renderUnitButton(unit) {
    const cButton = document.querySelector(".celcius");
    const fButton = document.querySelector(".fahrenheit");

    if (unit === "metric") {
      fButton.classList.remove("active");
      cButton.classList.add("active");
    } else if (unit === "imperial") {
      cButton.classList.remove("active");
      fButton.classList.add("active");
    }
  }

  return { initWebsite };

})();

export default view;
