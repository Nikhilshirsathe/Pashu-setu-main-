import { Pill } from 'lucide-react'

export default function Pharmacy() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Medicine & Pharmacy Services</h2>
        <p className="text-gray-600">Easy access to animal medicines and pharmaceutical supplies</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Pill className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Pharmacy Connect</h3>
            <p className="text-gray-600">Order animal medicines and pharmaceutical supplies directly</p>
            <button className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
              Browse Medicines
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}