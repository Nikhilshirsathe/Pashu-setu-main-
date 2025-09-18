import { Plus, Calendar, Bell, FileText } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { icon: Plus, title: 'Add New Animal', color: 'blue' },
    { icon: Calendar, title: 'Schedule Checkup', color: 'emerald' },
    { icon: Bell, title: 'Set Reminder', color: 'orange' },
    { icon: FileText, title: 'Generate Report', color: 'purple' }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <div key={index} className="card p-6 hover-lift text-center cursor-pointer">
              <Icon className={`w-12 h-12 text-${action.color}-600 mx-auto mb-4`} />
              <h3 className="text-lg font-semibold text-neutral-800">{action.title}</h3>
              <button className="btn btn-primary mt-4 w-full">Execute</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}