import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import humidity_icon from '../assets/humidity_actual.png';
import haze_icon from '../assets/haze.png';

const Weather = () => {
  const inputRef = useRef();
  const [forecastData, setForecastData] = useState([]); // For 7-day forecast
  const [cityName, setCityName] = useState(""); // For storing city name
  const [errorMessage, setErrorMessage] = useState(""); // For handling errors

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const search = async (city) => {
    setErrorMessage(""); // Reset error message

    if (city.trim() === "") {
      setErrorMessage("Please enter a valid city name.");
      return;
    }

    try {
      // Fetch Weather Data
      const weatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${import.meta.env.VITE_APP_ID}&days=7`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        setErrorMessage(`Failed to fetch weather data. Error: ${weatherResponse.status}`);
        return;
      }

      const weatherData = await weatherResponse.json();
      console.log('Weather Data:', weatherData); // Log the full response

      if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
        setErrorMessage("No weather data found for the city.");
        setForecastData([]);
        return;
      }

      setForecastData(weatherData.data);
      setCityName(weatherData.city_name);

    } catch (error) {
      setForecastData([]);
      setErrorMessage("Failed to fetch data. Please check your internet connection.");
      console.error("Error in fetching data", error);
    }
  };

  useEffect(() => {
    search("Mumbai"); // Default to Mumbai weather on load
  }, []);

  return (
    <div className='weather'>
      <div className='search-bar'>
        <input ref={inputRef} type="text" placeholder='Search city' />
        <img src={search_icon} alt="Search" onClick={() => search(inputRef.current.value)} />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {forecastData.length > 0 ? (
        <>
          <h2 className='city-name'>{cityName}</h2> {/* Display city name */}
          
          {/* Current Weather Card */}
          <div className="current-weather">
            <img 
              src={`https://www.weatherbit.io/static/img/icons/${forecastData[0].weather.icon}.png`} 
              alt={forecastData[0].weather.description} 
              className='current-weather-icon' 
            />
            <div className="current-weather-info">
              <p className='current-temperature'>{Math.floor(forecastData[0].temp)}°C</p>
              <p className='current-description'>{forecastData[0].weather.description}</p>
              <p>Humidity: {forecastData[0].rh}%</p>
              <p>Wind Speed: {forecastData[0].wind_spd.toFixed(1)} km/hr</p>
            </div>
          </div>

          {/* 7-day Forecast */}
          <div className="forecast-container">
            {forecastData.slice(1).map((day, index) => (
              <div key={index} className="forecast-day">
                <img 
                  src={`https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png`} 
                  alt={day.weather.description} 
                  className='weather-icon' 
                />
                <p className='date'>{day.valid_date}</p>
                <p className='day-name'>{getDayName(day.valid_date)}</p> {/* Add Day of the Week */}
                <p className='temperature'>{Math.floor(day.temp)}°C</p>
                <p className='description'>{day.weather.description}</p>
                <div className='weather-data'>
                  <div className='col'>
                    <div>
                      <img src={humidity_icon} alt="Humidity" className='humid' />
                      <p>{day.rh}%</p>
                      <span>Humidity</span> 
                    </div>
                  </div>
                  <div className='col'>
                    <div>
                      <img src={haze_icon} alt="Wind Speed" className='windy'/>
                      <p>{day.wind_spd.toFixed(1)} km/hr</p>
                      <span>Wind speed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        !errorMessage && <p>No weather data available.</p>
      )}
    </div>
  );
};

export default Weather;
