import { BookOpen, Scale, Users } from 'lucide-react'

export default function Education() {
  const resources = [
    {
      icon: BookOpen,
      title: 'Education Hub',
      description: 'Seasonal diseases, prevention methods, and treatment guides',
      action: 'Browse Resources',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Scale,
      title: 'Rules & Policies',
      description: 'Government regulations and farm policy updates',
      action: 'View Updates',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: Users,
      title: 'Community Platform',
      description: 'Connect with farmers and veterinarians, share experiences',
      action: 'Join Community',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Learning & Awareness Hub</h2>
        <p className="text-gray-600">Educational resources and community knowledge sharing</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const Icon = resource.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{resource.title}</h3>
                <p className="text-gray-600">{resource.description}</p>
                <button className={`w-full py-3 px-6 text-white font-medium rounded-lg transition-colors ${resource.color}`}>
                  {resource.action}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}