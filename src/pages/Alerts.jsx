import { useState, useEffect } from 'react'
import { CloudSun, MapPin, Thermometer, Droplets, Wind, Eye, Sun } from 'lucide-react'

export default function Alerts() {
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState('Loading...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords
          await getWeatherByCoords(latitude, longitude)
        }, () => {
          getWeatherByCity('Pune')
        })
      } else {
        getWeatherByCity('Pune')
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      setLoading(false)
    }
  }

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const API_KEY = 'f3348345e448453ea29181418251209'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          feelsLike: Math.round(data.current.feelslike_c),
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          pressure: data.current.pressure_mb,
          icon: getWeatherIcon(data.current.condition.text),
          visibility: Math.round(data.current.vis_km) || 10
        })
        setLocation(`${data.location.name}, ${data.location.country}`)
      }
    } catch (error) {
      console.error('Error fetching weather by coords:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherByCity = async (city) => {
    try {
      const API_KEY = 'f3348345e448453ea29181418251209'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather({
          temp: Math.round(data.current.temp_c),
          feelsLike: Math.round(data.current.feelslike_c),
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          pressure: data.current.pressure_mb,
          icon: getWeatherIcon(data.current.condition.text),
          visibility: Math.round(data.current.vis_km) || 10
        })
        setLocation(`${data.location.name}, ${data.location.country}`)
      }
    } catch (error) {
      console.error('Error fetching weather by city:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const text = condition.toLowerCase()
    if (text.includes('sunny') || text.includes('clear')) return '☀️'
    if (text.includes('cloud')) return '☁️'
    if (text.includes('rain')) return '🌧️'
    if (text.includes('drizzle')) return '🌦️'
    if (text.includes('thunder')) return '⛈️'
    if (text.includes('snow')) return '❄️'
    if (text.includes('mist') || text.includes('fog')) return '🌫️'
    return '☀️'
  }

  const alerts = [
    {
      id: 1,
      type: 'Disease Alert',
      severity: 'High',
      title: 'Foot & Mouth Disease Outbreak',
      description: 'FMD cases reported 15km from your location. Implement immediate biosecurity measures.',
      location: '15km Northeast',
      time: '2 hours ago',
      color: 'bg-red-500'
    },
    {
      id: 2,
      type: 'Weather Warning',
      severity: 'Medium',
      title: 'Heavy Rain Expected',
      description: 'Monsoon rains expected in next 48 hours. Secure livestock and feed storage.',
      location: 'Regional',
      time: '6 hours ago',
      color: 'bg-orange-500'
    },
    {
      id: 3,
      type: 'Vaccination Reminder',
      severity: 'Low',
      title: 'Annual Vaccination Drive',
      description: 'Government vaccination program starts next week. Register your animals.',
      location: 'District Wide',
      time: '1 day ago',
      color: 'bg-blue-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Risk Management & Alerts</h2>
        <p className="text-gray-600">Stay informed about weather and regional health risks</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CloudSun className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Current Weather</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading weather...</p>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{weather.icon}</div>
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{weather.temp}°C</p>
                    <p className="text-gray-600 capitalize">{weather.description}</p>
                    <p className="text-sm text-gray-500">{location}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Feels like</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{weather.feelsLike}°C</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{weather.humidity}%</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Wind Speed</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{weather.windSpeed} km/h</p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Visibility</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{weather.visibility} km</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Unable to load weather data</p>
            </div>
          )}
        </div>
        
        {/* Regional Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Regional Alerts</h3>
          </div>
          
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${alert.color}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">{alert.type}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{alert.location}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}