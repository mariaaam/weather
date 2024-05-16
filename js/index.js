const forecastContainer= document.querySelector(".forecast-cards")
const searchBox= document.getElementById("searchBox");
const locationElement = document.querySelector(".location p");
const rainHoursElements = document.querySelectorAll("[data-clock]");
const cityContainer = document.querySelector(".city-items")

// &===========> App Variables
// let currentLocation = "cairo";
const recentCities = JSON.parse(localStorage.getItem("cities")) || []
const apiKey ="e03097f18dba4a2fa42144039242904";
const baseUrl = `http://api.weatherapi.com/v1/forecast.json`;



async function getWeather(location){
    let response= await fetch(`${baseUrl}?key=${apiKey}&q=${location}&days=3`);
    if ( response.status != 200) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Make sure you entered a valid city or Location',
      })
    
      searchBox.value = "";
      return;
    }
    let finalRespons=await response.json();
  displayWeather(finalRespons)
  searchBox.value = ""
// console.log(finalRespons)
}
// getWeather("cairo")


function success(possition){
    let location=`${possition.coords.latitude},${possition.coords.longitude}`
    // console.log(possition.coords.latitude,possition.coords.longitude)
    getWeather(location)
}


function displayWeather (data) {
    const days=data.forecast.forecastday;

    locationElement.innerHTML = `<span class="city-name">${data.location.name}</span>,${data.location.country}`
    const now =new Date();

    let cardsHtml="";
    for(const [index,day] of days.entries()){
        const date =new Date(day.date);
        const weekday = date.toLocaleDateString("en-us", { weekday: "long" })

        cardsHtml +=`
        
        <div class="${index == 0 ? "card active" : "card"}" data-index=${index} >
        <div class="card-header">
        <div class="day">${weekday}</div>
        <div class="time">${now.getHours()}:${now.getMinutes()} ${now.getHours() > 11 ? "pm" : "am"}</div>
      </div>


      <div class="card-body">
        <img src= "./images/conditions/${day.day.condition.text }.svg"  />
        <div class="degree">${day.hour[now.getHours()].temp_c}°C</div>
      </div>
        

      <div class="card-data">
      <ul class="left-column">
        <li>Real Feel: <span class="real-feel">${day.hour[now.getHours()].feelslike_c}°C</span></li>
        <li>Wind: <span class="wind">${day.hour[now.getHours()].wind_kph} K/h</span></li>
        <li>Pressure: <span class="pressure">${day.hour[now.getHours()].pressure_mb}Mb</span></li>
        <li>Humidity: <span class="humidity">${day.hour[now.getHours()].humidity}%</span></li>
      </ul>
      <ul class="right-column">
        <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
        <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
      </ul>
    </div>
        </div>

        
        `
    }

    
    forecastContainer.innerHTML = cardsHtml;


    const AllCardes=document.querySelectorAll(".card");
    for(const card of AllCardes){
        card.addEventListener("click",function(e){
            const activeCard = document.querySelector(".card.active");
            activeCard.classList.remove("active")
            e.currentTarget.classList.add("active")
            displayRain(days[e.currentTarget.dataset.index])
        })
    }

    let exist = recentCities.find((currentCity) => currentCity.city == data.location.name)
  if (exist) return
  recentCities.push({ city: data.location.name, country: data.location.country });
  localStorage.setItem("cities", JSON.stringify(recentCities))
  displayRecentCity(data.location.name, data.location.country)
  }

  function displayRain(weatherInfo){
    for (let element of rainHoursElements) {
      const clock = element.dataset.clock;
      let height = weatherInfo.hour[clock].chance_of_rain
      element.querySelector(".percent").style.height = `${height}%`
    }
  }

  async function getCityImage(city) {
    const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
    const data = await response.json();
    const random = Math.trunc(Math.random() * data.results.length)
    return data.results[random]
  }



  async function displayRecentCity(city, country) {
    let cityInfo = await getCityImage(city);
    if (cityInfo) {
      let itemContent = `
    <div class="item">
      <div class="city-image">
        <img src="${cityInfo.urls.regular}" alt="Image for ${city} city" />
      </div>
      <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
    </div>
  `;
  
      cityContainer.innerHTML += itemContent;

    }
    
  }

window.addEventListener("load",function(){
    navigator.geolocation.getCurrentPosition(success)
})
 

// searchBox.addEventListener("blur",function(){
// getWeather(this.value);
// })


document.addEventListener("keyup", function (e) {
  if (e.key == "Enter"){
      getWeather(searchBox.value);
  }
   
})






