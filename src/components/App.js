import React, { Component } from "react";
import Header from "./Header";
import Form from "./Form";
import Result from "./Result";
import Footer from "./Footer";
import "../styles/App.css";

//  some initial variables

const google = window.google;

const weatherAPIKey = "bfae98d5c94c0d9269ea9eb5224e2693";
const timezoneAPIKey = "VS7P90IJ8KL9";
const IPToken = "6e867cc4cd3a5e";
const googleAPIKey = "AIzaSyBl3efYiJYIr2sYmV99VSlGfQNLr8EK5FM";

// preparation for getting suggestions in Form component, using downloaded DB of cities

const cityList = require("../data/citylist.json");

const getSuggestions = value => {
  const escapeRegexCharacters = str =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inputValue = escapeRegexCharacters(value.trim().toLowerCase());
  const inputLength = inputValue.length;

  return inputValue === ""
    ? []
    : cityList
        .filter(
          city => city.name.toLowerCase().slice(0, inputLength) === inputValue
        )
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
  state = {
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
    map: false,
    err: false
  };

  // starting with user's IP location in input field

  componentDidMount = () => {
    const IPAPI = `//ipinfo.io/json?token=${IPToken}`;
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
      map: false,
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

  handleSubmit = async e => {
    e.preventDefault();
    const whereIDStarts = this.state.value.indexOf(":");
    const inputID = this.state.value.slice(whereIDStarts + 2);
    const ifIDmatches = cityList.find(city => city.id.toString() === inputID);
    const cityIDcheck = () =>
      ifIDmatches ? `id=${ifIDmatches.id}` : `q=${this.state.value}`;
    const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?${cityIDcheck()}&APPID=${weatherAPIKey}&units=metric`;
    const timezoneAPI = `http://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneAPIKey}&format=json&by=position&lat=${
      this.state.latitude
    }&lng=${this.state.longitude}`;

    await fetch(weatherAPI)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else throw Error("Cannot fetch data from server");
      })
      .then(data => {
        this.setState(prevState => ({
          suggestions: [],
          city: prevState.value,
          country: data.sys.country,
          latitude: data.coord.lat,
          longitude: data.coord.lon,
          temp: data.main.temp.toFixed(1),
          icon: data.weather[0].icon,
          description: data.weather[0].description,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
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
    return await fetch(timezoneAPI)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else throw Error("Cannot fetch timezone from server");
      })
      .then(result => {
        const timezone = result.gmtOffset - 3600;
        this.setState({
          sunrise: new Date(
            (this.state.sunrise + timezone) * 1000
          ).toLocaleTimeString(),
          sunset: new Date(
            (this.state.sunset + timezone) * 1000
          ).toLocaleTimeString()
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
    this.setState({
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
      map: false,
      err: false
    });
  };

  // toggling map visibility available only after searching

  handleToggleMap = () => {
    this.setState({
      map: !this.state.map
    });
  };

  // promise with a global handler for when API finishes loading, returning a promise for the Google Maps API

  getGoogleMaps = () => {
    if (!this.googleMapsPromise) {
      this.googleMapsPromise = new Promise(resolve => {
        window.resolveGoogleMapsPromise = () => {
          resolve(google);
          delete window.resolveGoogleMapsPromise;
        };
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&callback=resolveGoogleMapsPromise`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      });
    }
    return this.googleMapsPromise;
  };

  // initializing the actual map after loading the Google Maps API

  componentDidUpdate = (prevProps, prevState) => {
    const showMap = document.getElementById("result-map");
    if (this.state.map !== prevState.map && this.state.map) {
      this.getGoogleMaps().then(google => {
        const place = {
          lat: this.state.latitude,
          lng: this.state.longitude
        };
        const newMap = new window.google.maps.Map(showMap, {
          zoom: 12,
          center: place
        });
        const marker = new window.google.maps.Marker({
          position: place,
          map: newMap
        });
        showMap.style.height = "400px";
      });
    }
    if (
      this.state.map !== prevState.map &&
      !this.state.map &&
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
      map,
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
            map={map}
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
