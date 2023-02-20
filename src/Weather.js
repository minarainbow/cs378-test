import { useEffect, useState } from "react";

async function getLatLon(location) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`;
    const response = await fetch(url);
    const json = await response.json();
    if (!json.results) {
        throw new Error(`Could not geo-locate city: ${location}`);
    }
    const {latitude, longitude} = json.results[0];
    return {lat: latitude, lon: longitude};
}

function getWeatherUrl({ lat, lon }) {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&temperature_unit=fahrenheit`;
}

function NoWeather() {
    return <div>Sad, no weather today.</div>
}

function prettyPrintDateHourFormat(date) {
    return `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:00`;
}

function WeatherDisplay({ weatherData }) {
    const { temperature_2m: temps, time: times } = weatherData.hourly;

    return <table>
        <thead>
            <tr>
                <th>Time</th>
                <th>Forecast (F)</th>
            </tr>
        </thead>
        <tbody>
            {times.map((time, i) => {
                const date = new Date(time);
                const temp = temps[i];
                return (
                    <tr className="foo" key={time}> 
                        <td style={{padding: '20px'}}>{prettyPrintDateHourFormat(date)}</td>
                        <td style={{padding: '20px'}}>{temp}</td>
                    </tr>
                )
            })}
        </tbody>
    </table>
}

export default function Weather() {
    const [weatherData, setWeatherData] = useState(undefined);
    const [weatherDataError, setWeatherDataError] =  useState(undefined);
    const [location, setLocation] = useState('austin');
    const [isLoading, setIsLoading] = useState(false);
    const [customLocation, setCustomLocation] = useState('');
    const [cities, setCities] = useState(['austin', 'dallas', 'houston']);
    const [twiddle, setTwiddle] = useState(0);

    useEffect(() => {
        setIsLoading(true);
        setWeatherData(undefined);

        // async await example
        // you can only call await in an async function
        // async -- wait for promise to be resolved (instead of callback)

        async function fetchWeatherData() {
            try {
                const latLon = await getLatLon(location);

                const response = await fetch(getWeatherUrl(latLon));
                // response has the headers, but not the body
                const json = await response.json(); // get the body, parse as json
                setWeatherData(json);
                setWeatherDataError(undefined);
            } catch (err) {
                setWeatherDataError(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchWeatherData();

        // promise approach
        // fetch(getWeatherUrl())
        //     .then((response) => {
        //         return response.json();
        //     })
        //     .then((json) => {
        //         setWeatherData(json);
        //         setWeatherDataError(undefined);
        //     })
        //     .catch((err) => {
        //         setWeatherDataError(err);
        //     })
        //     .finally(() => {
        //         setIsLoading(false);
        //     })
    }, [location, twiddle]); // almost always have 2nd parameter for useEffect -- dependency array

    // periodic updates, the simple way
    // useEffect(() => {
    //     const handle = setInterval(() => {
    //         setTwiddle(tw => tw + 1);
    //     }, 30_000);
    //     return () => {
    //         clearInterval(handle);
    //     }
    // }, []);

    return (<div>
        {cities.map((city) => {
            return (<button key={city} onClick={() => setLocation(city)}>{city}</button>);
        })}
        <div>
            Other: 
            {/* pattern called "controlled component" */}
            <input
                value={customLocation}
                onChange={(event) => setCustomLocation(event.target.value) } 
            />
            <button onClick={() => {
                if (!cities.includes(customLocation)) {
                    setCities([...cities, customLocation]);
                }

                // const newCities = Array.from(cities);
                // newCities.push(customLocation);
                // setCities(newCities);

                // const newCities = [...cities];
                // newCities.push(customLocation)
                // setCities(newCities);

                setCustomLocation('');
            }}>Set</button>
        </div>
         {/* uncontrolled component */}
        {/* <div>
            <input onChange={(event) => setCustomLocation(event.target.value)} />
        </div> */}

        {/* students should never have to do anything with dom elements directly */}
        {/* example antipattern */}
        {/* <div>
            Bad: 
            <input id="foo" />
            <button onClick={() => setLocation(document.getElementById('foo').value)}>Set</button>
        </div> */}

        <div>Current location: {location}</div>
        {weatherDataError && <div>o no! {weatherDataError.toString()}</div>}
        {isLoading && <div>SpInNeR</div>}
        {weatherData && <WeatherDisplay weatherData={weatherData} />}
    </div>);
}


