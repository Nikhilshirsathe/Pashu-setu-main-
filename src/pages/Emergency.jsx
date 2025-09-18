import { Truck } from 'lucide-react'

export default function Emergency() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Emergency & Transport Services</h2>
        <p className="text-gray-600">Immediate care and safe transportation for critical cases</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-red-200">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Truck className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">Animal Ambulance</h3>
            <p className="text-gray-600">Emergency transportation with biosecurity protocols</p>
            <button className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-lg transition-colors animate-pulse">
              🚨 Call Emergency
            </button>
            <p className="text-sm text-red-600 font-medium">Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  )
}