import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
        Analytics Dashboard
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-neutral-800">Milk Production Trends</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="h-48 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
            <p className="text-neutral-600">Chart Placeholder</p>
          </div>
        </div>
        
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-neutral-800">Health Statistics</h3>
            <PieChart className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="h-48 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center">
            <p className="text-neutral-600">Pie Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}