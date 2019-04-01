import React, { Component } from "react";
import Header from "./Header";
import Form from "./Form";
import Result from "./Result";
import Footer from "./Footer";
import "../styles/App.css";
import { getGoogleMaps } from "./maps";

// initial state

const initialState = {
  value: "",
  suggestions: [],
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  temp: "",
  icon: "",
  description: "",
  sunrise: "",
  sunset: "",
  wind: "",
  pressure: "",
  isMapVisible: false,
  err: false
};

// preparation for getting suggestions in Form component, using downloaded DB of cities

const cityList = require("../data/citylist.json");

const getSuggestions = value => {
  const escapeRegexCharacters = str =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inputValue = escapeRegexCharacters(value.trim().toLowerCase());

  return cityList
    .filter(city => city.name.toLowerCase().startsWith(inputValue))
    .slice(0, 50);
};

const getSuggestionValue = suggestion =>
  `${suggestion.name}, id: ${suggestion.id}`;

const renderSuggestion = (suggestion, { query, isHighlighted }) => (
  <div>
    {suggestion.name}, {suggestion.country}
  </div>
);

// the one and only class component

class App extends Component {
  state = initialState;

  // starting with user's IP location in input field

  componentDidMount = () => {
    const IPAPI = `//ipinfo.io/json?token=${process.env.REACT_APP_IPToken}`;
    fetch(IPAPI)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else throw Error("Cannot set your location");
      })
      .then(data => {
        this.setState({
          value: data.city
        });
      })
      .catch(err => {
        console.log(err);
        this.setState(prevState => ({
          err: true,
          city: prevState.value
        }));
      });
  };

  // handling with changes in input field w/ reseting the weather details for previous searching output

  handleInputChange = (e, { newValue, method }) => {
    this.setState({
      value: newValue,
      city: "",
      country: "",
      latitude: "",
      longitude: "",
      temp: "",
      icon: "",
      description: "",
      sunrise: "",
      sunset: "",
      wind: "",
      pressure: "",
      isMapVisible: false,
      err: false
    });
  };

  // two functions connected with autosuggest

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  // getting the output for my search

  handleSubmit = e => {
    e.preventDefault();
    const whereIDStarts = this.state.value.indexOf(":");
    const inputID = this.state.value.slice(whereIDStarts + 2);
    const ifIDmatches = cityList.find(city => city.id.toString() === inputID);
    const cityIDcheck = () =>
      ifIDmatches ? `id=${ifIDmatches.id}` : `q=${this.state.value}`;
    const weatherAPI = `//api.openweathermap.org/data/2.5/weather?${cityIDcheck()}&APPID=${
      process.env.REACT_APP_weatherAPIKey
    }&units=metric`;

    fetch(weatherAPI)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else throw Error("Cannot fetch data from server");
      })
      .then(data => {
        const timezoneAPI = `//api.timezonedb.com/v2.1/get-time-zone?key=${
          process.env.REACT_APP_timezoneAPIKey
        }&format=json&by=position&lat=${data.coord.lat}&lng=${data.coord.lon}`;
        fetch(timezoneAPI)
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else throw Error("Cannot fetch timezone from server");
          })
          .then(result => {
            const timezone = result.gmtOffset - 3600;
            this.setState(prevState => ({
              suggestions: [],
              city: prevState.value,
              country: data.sys.country,
              latitude: data.coord.lat,
              longitude: data.coord.lon,
              temp: data.main.temp.toFixed(1),
              icon: data.weather[0].icon,
              description: data.weather[0].description,
              sunrise: new Date(
                (data.sys.sunrise + timezone) * 1000
              ).toLocaleTimeString(),
              sunset: new Date(
                (data.sys.sunset + timezone) * 1000
              ).toLocaleTimeString(),
              wind: data.wind.speed.toFixed(1),
              pressure: data.main.pressure.toFixed(),
              err: false
            }));
          })
          .catch(err => {
            console.log(err);
            this.setState(prevState => ({
              err: true,
              city: prevState.value
            }));
          });
      })
      .catch(err => {
        console.log(err);
        this.setState(prevState => ({
          err: true,
          city: prevState.value
        }));
      });
  };

  // clearing the data from both input and result (weather details)

  handleClear = () => {
    this.setState(initialState);
  };

  // toggling map visibility (available only after searching)

  handleToggleMap = () => {
    this.setState(prevState => ({
      isMapVisible: !prevState.isMapVisible
    }));
  };

  // initializing the actual map after loading the Google Maps API

  componentDidUpdate = (prevProps, prevState) => {
    const showMap = document.getElementById("result-map");
    if (
      this.state.isMapVisible !== prevState.isMapVisible &&
      this.state.isMapVisible
    ) {
      getGoogleMaps().then(google => {
        const place = {
          lat: this.state.latitude,
          lng: this.state.longitude
        };
        const newMap = new window.google.maps.Map(showMap, {
          zoom: 12,
          center: place
        });
        showMap.style.height = "400px";
      });
    }
    if (
      this.state.isMapVisible !== prevState.isMapVisible &&
      !this.state.isMapVisible &&
      this.state.value === prevState.value
    ) {
      showMap.style.height = 0;
    }
  };

  render() {
    const {
      value,
      suggestions,
      city,
      country,
      temp,
      icon,
      description,
      sunrise,
      sunset,
      wind,
      pressure,
      isMapVisible,
      err
    } = this.state;
    return (
      <div className="app">
        <div className="app-container">
          <Header />
          <Form
            value={value}
            suggestions={suggestions}
            change={this.handleInputChange}
            submit={this.handleSubmit}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
          />
          <Result
            city={city}
            country={country}
            temp={temp}
            icon={icon}
            description={description}
            sunrise={sunrise}
            sunset={sunset}
            wind={wind}
            pressure={pressure}
            isMapVisible={isMapVisible}
            error={err}
            clear={this.handleClear}
            toggleMap={this.handleToggleMap}
          />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
