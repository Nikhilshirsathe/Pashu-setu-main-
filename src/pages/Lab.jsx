import { Truck, ClipboardCheck, FlaskConical, FileText, BarChart3, Clock } from 'lucide-react'

export default function Lab() {
  const services = [
    {
      icon: Truck,
      title: 'Sample Pickup',
      description: 'Request sample collection and delivery to laboratory',
      action: 'Request Pickup',
      color: 'purple',
      stats: 'Same day pickup'
    },
    {
      icon: ClipboardCheck,
      title: 'Lab Management',
      description: 'Test recording, digital reports, and result notifications',
      action: 'Manage Tests',
      color: 'indigo',
      stats: 'Digital reports'
    },
    {
      icon: FlaskConical,
      title: 'Test Processing',
      description: 'Advanced diagnostic testing with certified laboratories',
      action: 'View Tests',
      color: 'teal',
      stats: '24-48hr results'
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Automated report generation and delivery system',
      action: 'Generate Report',
      color: 'blue',
      stats: 'Instant delivery'
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Laboratory & Diagnostics
        </h1>
        <p className="text-neutral-600 text-lg">Comprehensive lab services and sample management</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 text-center hover-lift">
          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">500+</h3>
          <p className="text-sm text-neutral-600">Tests Processed</p>
        </div>
        <div className="card p-6 text-center hover-lift">
          <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">24hr</h3>
          <p className="text-sm text-neutral-600">Avg Turnaround</p>
        </div>
        <div className="card p-6 text-center hover-lift">
          <FlaskConical className="w-8 h-8 text-teal-600 mx-auto mb-3" />
          <h3 className="font-bold text-2xl text-neutral-800">99%</h3>
          <p className="text-sm text-neutral-600">Accuracy Rate</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div key={index} className="card p-8 hover-lift hover-glow group">
              <div className="flex items-start justify-between mb-6">
                <div className={`bg-gradient-to-br from-${service.color}-100 to-${service.color}-200 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 text-${service.color}-600`} />
                </div>
                <div className="badge badge-primary">
                  {service.stats}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-neutral-800 mb-3">{service.title}</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">{service.description}</p>
              
              <button className="btn btn-primary w-full">
                {service.action}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Recent Lab Results</h3>
        <div className="space-y-4">
          {[
            { test: 'Blood Analysis', animal: 'Cow #123', date: '2 days ago', status: 'Completed', result: 'Normal' },
            { test: 'Urine Test', animal: 'Buffalo #456', date: '3 days ago', status: 'Completed', result: 'Abnormal' },
            { test: 'Milk Quality', animal: 'Cow #789', date: '5 days ago', status: 'Processing', result: 'Pending' }
          ].map((result, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{result.test}</p>
                  <p className="text-sm text-neutral-600">{result.animal} • {result.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`badge ${
                  result.result === 'Normal' ? 'badge-success' :
                  result.result === 'Abnormal' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {result.result}
                </div>
                <button className="btn btn-outline text-sm py-1 px-3">View Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}