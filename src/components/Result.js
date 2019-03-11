import React from "react";
import "../styles/Result.css";

const Result = props => {
  const {
    city,
    country,
    temp,
    icon,
    description,
    sunrise,
    sunset,
    pressure,
    wind,
    map,
    error,
    clear,
    toggleMap
  } = props;

  let content = null;

  const source = `https://openweathermap.org/img/w/${icon}.png`;

  if (!error && city) {
    content = (
      <div className="result-container">
        <div className="result-wrapper">
          <button onClick={clear}>Clear</button>
          <h2>
            In {city.charAt(0).toUpperCase() + city.slice(1, city.indexOf(","))}
            , {country}, the weather right now is as follows:
          </h2>
          <img src={source} alt="Weather icon" />
          <h3>
            It is <span>{`${temp}${"\xB0"}`}C</span> and {description}
          </h3>
          <h3>
            Sunrise at <span>{sunrise}</span>
          </h3>
          <h3>
            Sunset at <span>{sunset}</span>
          </h3>
          <h3>
            Wind speed: <span>{wind} m/s</span>
          </h3>
          <h3>
            Atmospheric pressure: <span>{pressure} hPa</span>
          </h3>
        </div>
        <div className="result-map-wrapper">
          <button onClick={toggleMap}>
            {map ? "Hide map" : "Show on map"}
          </button>
          <div id="result-map" />
        </div>
      </div>
    );
  }
  return (
    <div>
      {error ? (
        <h2 className="result__neg-message">{`There is no such a city in our database :(`}</h2>
      ) : (
        content
      )}
    </div>
  );
};

export default Result;
