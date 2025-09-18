import { CloudSun, MapPin } from 'lucide-react'

export default function Alerts() {
  const services = [
    {
      icon: CloudSun,
      title: 'Weather Display',
      description: 'Real-time weather information for your farm location',
      action: 'View Weather',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: MapPin,
      title: 'Regional Risk Alerts',
      description: 'Disease outbreak warnings and climate-based risk notifications',
      action: 'View Map',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Risk Management & Alerts</h2>
        <p className="text-gray-600">Stay informed about weather and regional health risks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
                <button className={`w-full py-3 px-6 text-white font-medium rounded-lg transition-colors ${service.color}`}>
                  {service.action}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}