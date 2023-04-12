import './style.css'
import sun from './icons/sun.png'
import cloud from './icons/cloud.png'
import cloudBolt from './icons/cloud-bolt.png'
import cloudShower from './icons/cloud-shower-heavy.png'
import cloudSun from './icons/cloud-sun.png'
import smog from './icons/smog.png'
import snowflake from './icons/snowflake.png'
import axios from 'axios'
import { useState } from 'react'

export default function App() {

  var [lat,setLat]= useState(49.2827)
  var [lon, setLon] = useState(-123.1207)

  navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

  function positionSuccess({coords}){
    setLat(coords.latitude)
    setLon(lon = coords.longitude)
  }

  function positionError(){
    alert('not able to get the lat and lon my boYY')
  }

  function getWeather(lat, lon){
    return axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime&timezone=America%2FLos_Angeles`)
    .then(({data})=>{
        return {
          current: parseCurrentWeather(data) ,
          daily: parseDailyWeather(data) ,
          hourly: parseHourlyWeather(data) 
        }
      }
    )
  }

  function parseCurrentWeather({current_weather, daily}){
    const {
      temperature: currentTemp,
      windspeed: windSpeed,
      weathercode: iconCode
    } = current_weather

    const {
      temperature_2m_max: [maxTemp],
      temperature_2m_min: [minTemp],
      apparent_temperature_max: [maxFeelsLike],
      apparent_temperature_min: [minFeelsLike],
      precipitation_sum: [precip],
    } = daily

    return {
      currentTemp: Math.round(currentTemp),
      highTemp: Math.round(maxTemp),
      lowTemp: Math.round(minTemp),
      highFeelsLike: Math.round(maxFeelsLike),
      lowFeelsLike: Math.round(minFeelsLike),
      windSpeed: Math.round(windSpeed),
      precip:Math.round(precip*100)/100,
      iconCode,
    }
  }

  function parseDailyWeather({daily}){
    return daily.time.map((time, index)=>{
      return {
        timestamp: time * 1000, 
        iconCode: daily.weathercode[index],
        maxTemp: Math.round(daily.temperature_2m_max[index])
      }
    })
  }

  function parseHourlyWeather({hourly, current_weather}){
    return hourly.time.map((time,index)=>{
      return{
        timestamp: time*1000,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index]*100)/100,
      }
    }).filter(({timestamp})=>timestamp>=current_weather.time*1000)
  }

  getWeather(lat,lon).then(({current, daily, hourly})=>{
    document.querySelector('[data-current-temp]').textContent = current.currentTemp
    document.querySelector('[data-current-high]').textContent = current.highTemp
    document.querySelector('[data-current-low]').textContent = current.lowTemp
    document.querySelector('[data-current-fl-high]').textContent = current.highFeelsLike
    document.querySelector('[data-current-fl-low]').textContent = current.lowFeelsLike
    document.querySelector('[data-current-wind]').textContent = current.windSpeed
    document.querySelector('[data-current-precip]').textContent = current.precip
    document.querySelector('[data-current-icon]').src = getIconUrl(current.iconCode)

    for(let x=0; x<7; x++){
    document.querySelector(`[data-daycard-${x+1}-img]`).src = getIconUrl(daily[x].iconCode)
    document.querySelector(`[data-daycard-${x+1}-day]`).textContent = DAY_FORMATTER.format(daily[x].timestamp)
    document.querySelector(`[data-daycard-${x+1}-temp]`).textContent = daily[x].maxTemp
  } 

  
  var wrapper = document.getElementById("myHTMLWrapper")
  var myHTML = ''
  for (var i = 1; i < 23; i++) {
    myHTML += `
    <tr>
    <td>
        <h5>${DAY_FORMATTER.format(hourly[i].timestamp)}</h5>
        <p>${HOUR_FORMATTER.format(hourly[i].timestamp)}</p>
    </td>

    <td>
      <img src=${getIconUrl(hourly[i].iconCode)} width=40px/>
    </td>
    
    <td>
        <h5>Temp
        <p>${hourly[i].temp}&deg;</p></h5>
    </td>
    
    <td>
        <div className='label'>FL Temp</div>
        <div>${hourly[i].feelsLike}&deg;</div>
    </td>
    
    <td>
        <div className='label'>Wind</div>
        <div>${hourly[i].windSpeed}<span className='value-sub-info'>kph</span></div>
    </td>
    
    <td>
        <div className='label'>Precip</div>
        <div>${hourly[i].precip}<span className='value-sub-info'>mm</span></div>
    </td>
  </tr>
    `
  }
  wrapper.innerHTML = myHTML
  })

  function getIconUrl(iconCode){
    if(iconCode === 0 || iconCode === 1){ return sun}
    if(iconCode === 2 ){ return cloudSun}
    if(iconCode === 3 ){ return cloud}
    if(iconCode === 45 || iconCode === 48 ){ return smog}
    if(iconCode === 51 || iconCode === 53 || iconCode === 55 || iconCode === 56 || iconCode === 57 || iconCode === 61 || iconCode === 63 || iconCode === 65 || iconCode === 66 || iconCode === 67 || iconCode === 80 || iconCode === 81 || iconCode === 82 ){ return cloudShower}
    if(iconCode === 71 || iconCode === 73 || iconCode === 75 || iconCode === 77 || iconCode === 85 || iconCode === 86 ){ return snowflake}
    if(iconCode === 95 || iconCode === 96 || iconCode === 99 ){ return cloudBolt}
  }

  const DAY_FORMATTER = new Intl.DateTimeFormat(undefined,{weekday:'long'})
  const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined,{hour:'numeric'})

  return (
    <div> 
      <div className='coordinates'>Latitude: {lat}, Longitude: {lon}, TimeZone: LosAngeles/Vancover</div>
      <header className='header'>
        <div className='header-left'>
          <img src={sun} className='weather-icon large' data-current-icon alt='sun icon'/>
          <div className='header-current-temp'>
            <span data-current-temp>-</span>&deg;
          </div>
        </div>
          
        <div className='header-right'>
          <div className='info-group'>
            <div className='label'>HIGH</div>
            <div><span data-current-high>-</span>&deg;</div>
          </div>

          <div className='info-group'>
            <div className='label'>FL HIGH</div>
            <div><span data-current-fl-high>-</span>&deg;</div>
          </div>

          <div className='info-group'>
            <div className='label'>WIND</div>
            <div><span data-current-wind>-</span><span className='value-sub-info'>kph</span></div>
          </div>

          <div className='info-group'>
            <div className='label'>LOW</div>
            <div><span data-current-low>-</span>&deg;</div>
          </div>

          <div className='info-group'>
            <div className='label'>FL LOW</div>
            <div><span data-current-fl-low>-</span>&deg;</div>
          </div>

          <div className='info-group'>
            <div className='label'>PRECIP</div>
            <div><span data-current-precip>-</span><span className='value-sub-info'>mm</span></div>
          </div>
        </div>
      </header>

      <section className='day-section'>  
      <div className='day-card'>
          <img className='weather-icon'  data-daycard-1-img/>
          <div className='day-card-day' data-daycard-1-day></div>
          <div><span data-daycard-1-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-2-img/>
          <div className='day-card-day' data-daycard-2-day></div>
          <div><span data-daycard-2-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-3-img/>
          <div className='day-card-day' data-daycard-3-day></div>
          <div><span data-daycard-3-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-4-img/>
          <div className='day-card-day' data-daycard-4-day></div>
          <div><span data-daycard-4-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-5-img/>
          <div className='day-card-day' data-daycard-5-day></div>
          <div><span data-daycard-5-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-6-img/>
          <div className='day-card-day' data-daycard-6-day></div>
          <div><span data-daycard-6-temp></span>&deg;</div>
        </div>

        <div className='day-card'>
          <img className='weather-icon' data-daycard-7-img/>
          <div className='day-card-day' data-daycard-7-day></div>
          <div><span data-daycard-7-temp></span>&deg;</div>
        </div>
      </section>

      <table className='hour-section'>
        <tbody id='myHTMLWrapper'>
           
        </tbody> 
      </table>

    </div>
  );
}

/*
function getLatitude() {  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position)=>{
        document.querySelector('[data-latitude]').textContent = position.coords.latitude
      });
    } 
  }

  function getLongitude() {  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position)=>{
        document.querySelector('[data-longitude]').textContent = position.coords.longitude
      });
    } 
  }
  getLongitude()
  getLatitude()
 */ 



