import { Plus, Search, Filter, FileText, Calendar, Syringe, Heart, Edit, Trash2, Eye, Baby, Milk, Upload, Download, BarChart3, Activity, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations/translations'
import { createNotification, createActivity } from '../lib/notificationService'

export default function Records() {
  const { language } = useLanguage()
  const [animals, setAnimals] = useState([])
  const [healthRecords, setHealthRecords] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [breedingRecords, setBreedingRecords] = useState([])
  const [milkProduction, setMilkProduction] = useState([])
  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [showMonthlyReport, setShowMonthlyReport] = useState(false)
  const [monthlyReportData, setMonthlyReportData] = useState({
    month: new Date().toISOString().slice(0, 7),
    weight: '',
    health_status: 'healthy',
    vaccinations_given: '',
    vaccination_date: '',
    next_vaccination_date: '',
    treatments: '',
    breeding_status: '',
    notes: ''
  })
  const [selectedAnimalId, setSelectedAnimalId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    tag_number: '',
    status: 'healthy',
    image_url: '',
    vaccination_status: '',
    microchip_id: ''
  })
  const [healthFormData, setHealthFormData] = useState({
    animal_id: '',
    record_type: 'checkup',
    description: '',
    treatment: '',
    veterinarian: '',
    cost: '',
    next_checkup: ''
  })

  useEffect(() => {
    fetchAnimals()
    fetchHealthRecords()
  }, [])

  const fetchAnimals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user?.id || localStorage.getItem('userEmail'))
      
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      console.error('Error fetching animals:', error)
      setAnimals([])
    }
  }

  const fetchHealthRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*, animals(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setHealthRecords(data || [])
    } catch (error) {
      console.error('Error fetching health records:', error)
      setHealthRecords([])
    }
  }

  const handleAddAnimal = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Clean and validate data
      const cleanData = {
        name: formData.name || '',
        species: formData.species || '',
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender || null,
        tag_number: formData.tag_number || null,
        status: formData.status || 'healthy',
        image_url: formData.image_url || null,
        vaccination_status: formData.vaccination_status || null,
        microchip_id: formData.microchip_id || null,
        owner_id: user?.id || localStorage.getItem('userEmail')
      }
      
      console.log('Inserting data:', cleanData)
      
      const { data: insertedAnimal, error } = await supabase
        .from('animals')
        .insert(cleanData)
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      // If animal is pregnant, add to maternity care system
      if (cleanData.status === 'pregnant' && insertedAnimal && insertedAnimal[0]) {
        try {
          const { error: maternityError } = await supabase
            .from('maternity_records')
            .insert({
              animal_id: insertedAnimal[0].id,
              status: 'pregnant',
              gestation_day: 1, // Default to day 1 if not specified
              expected_delivery: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 280 days from now
              current_weight: cleanData.weight,
              temperature: null,
              heart_rate: null
            })
          
          if (maternityError) {
            console.error('Error adding to maternity care:', maternityError)
          } else {
            alert('Animal added successfully and enrolled in maternity care system!')
          }
        } catch (maternityError) {
          console.log('Maternity care table may not exist yet:', maternityError)
        }
      }
      
      // Create notification and activity (if tables exist)
      const userId = user?.id || localStorage.getItem('userEmail')
      try {
        await createNotification(
          userId,
          'animal_added',
          'New Animal Added',
          `${cleanData.name} (${cleanData.species}) has been added to your farm`
        )
        
        await createActivity(
          userId,
          'animal_added',
          `Added new ${cleanData.species}: ${cleanData.name}`
        )
      } catch (error) {
        console.log('Notification tables may not exist yet:', error)
      }
      
      setFormData({ name: '', species: '', breed: '', age: '', weight: '', gender: '', tag_number: '', status: 'healthy', image_url: '', vaccination_status: '', microchip_id: '' })
      setShowAddForm(false)
      fetchAnimals()
      if (cleanData.status !== 'pregnant') {
        alert('Animal added successfully!')
      }
    } catch (error) {
      console.error('Error adding animal:', error)
      alert('Error adding animal: ' + (error.message || 'Unknown error'))
    }
  }

  const handleAddHealthRecord = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('health_records')
        .insert(healthFormData)
      
      if (error) throw error
      
      setHealthFormData({ animal_id: '', record_type: 'checkup', description: '', treatment: '', next_checkup: '' })
      setShowHealthForm(false)
      fetchHealthRecords()
      alert('Health record added successfully!')
    } catch (error) {
      console.error('Error adding health record:', error)
      alert('Error adding health record: ' + error.message)
    }
  }

  const filteredAnimals = animals.filter(animal =>
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId)

  if (selectedAnimalId && selectedAnimal) {
    return (
      <div className="min-h-screen bg-[#f9fafa] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedAnimalId(null)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                ← Back to Animals
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedAnimal.name}</h1>
                <p className="text-gray-600">{selectedAnimal.species} • {selectedAnimal.breed} • Tag: {selectedAnimal.tag_number || 'N/A'}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setMonthlyReportData({...monthlyReportData, animal_id: selectedAnimalId})
                setShowMonthlyReport(true)
              }}
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Monthly Report
            </button>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'border-[#059669] text-[#059669]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('health')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'health'
                      ? 'border-[#059669] text-[#059669]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Health Reports
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                    {selectedAnimal.image_url ? (
                      <img 
                        src={selectedAnimal.image_url} 
                        alt={selectedAnimal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                        <div className="text-center">
                          <div className="text-6xl mb-2">
                            {selectedAnimal.species === 'Cattle' ? '🐄' :
                             selectedAnimal.species === 'Buffalo' ? '🐃' :
                             selectedAnimal.species === 'Goat' ? '🐐' :
                             selectedAnimal.species === 'Sheep' ? '🐑' :
                             selectedAnimal.species === 'Pig' ? '🐷' :
                             selectedAnimal.species === 'Poultry' ? '🐔' : '🐾'}
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{selectedAnimal.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900">{selectedAnimal.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Species</label>
                        <p className="text-gray-900">{selectedAnimal.species}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Breed</label>
                        <p className="text-gray-900">{selectedAnimal.breed || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Age</label>
                        <p className="text-gray-900">{selectedAnimal.age || 'N/A'} years</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tag Number</label>
                        <p className="text-gray-900">{selectedAnimal.tag_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAnimal.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          selectedAnimal.status === 'sick' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedAnimal.status || 'healthy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Health Reports</h3>
                    <button 
                      onClick={() => {
                        setMonthlyReportData({...monthlyReportData, animal_id: selectedAnimalId})
                        setShowMonthlyReport(true)
                      }}
                      className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Monthly Report
                    </button>
                  </div>
                  <div className="space-y-3">
                    {healthRecords.filter(r => r.animal_id === selectedAnimalId).length > 0 ? (
                      healthRecords.filter(r => r.animal_id === selectedAnimalId).map((record) => (
                        <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900 text-lg">Monthly Report</h4>
                              <p className="text-sm text-gray-600">{record.symptoms}</p>
                              <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                              {record.weight && <p className="text-sm text-gray-600 mt-4">Weight: {record.weight}kg</p>}
                              {record.vaccination_record && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Vaccinations:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    {record.vaccination_record.split(' - ').map((item, index) => (
                                      <p key={index} className="bg-gray-100 p-2 rounded">{item}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {record.diagnosis && <p className="text-sm text-gray-600 mt-3">Notes: {record.diagnosis}</p>}
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Monthly Report
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-medium text-gray-600">No health reports yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add the first monthly health report for this animal</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafa] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Animal Records
            </h1>
            <p className="text-gray-600">
              Manage your animal health and records
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Animal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <Activity className="w-8 h-8 text-[#059669] mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-gray-900">{animals.length}</h3>
            <p className="text-sm text-gray-600">Total Animals</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-gray-900">{animals.filter(a => a.status === 'healthy').length}</h3>
            <p className="text-sm text-gray-600">Healthy</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-2xl text-gray-900">0</h3>
            <p className="text-sm text-gray-600">Vaccinations Due</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search animals by name, species, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Animals ({filteredAnimals.length})
          </h2>
          {filteredAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAnimalId(animal.id)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {animal.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {animal.species} • {animal.breed || 'Mixed'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      animal.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      animal.status === 'sick' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {animal.status || 'healthy'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setMonthlyReportData({...monthlyReportData, animal_id: animal.id})
                      setShowMonthlyReport(true)
                    }}
                    className="w-full px-3 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Monthly Report
                  </button>
                </div>
              ))}
              
              <div 
                onClick={() => setShowAddForm(true)}
                className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600">Add New Animal</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No animals registered yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first animal to begin tracking their health and records</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Animal
              </button>
            </div>
          )}
        </div>

        {showMonthlyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Monthly Health Report</h3>
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  // Check if user is authenticated
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    alert('Please log in to add health records')
                    return
                  }

                  const { error } = await supabase
                    .from('health_records')
                    .insert({
                      animal_id: monthlyReportData.animal_id || selectedAnimalId,
                      weight: parseFloat(monthlyReportData.weight) || null,
                      symptoms: `Monthly Report - ${monthlyReportData.month} - Status: ${monthlyReportData.health_status}`,
                      treatment: monthlyReportData.treatments,
                      vaccination_record: `${monthlyReportData.vaccinations_given} - Given: ${monthlyReportData.vaccination_date} - Next Due: ${monthlyReportData.next_vaccination_date}`,
                      medication: monthlyReportData.treatments,
                      diagnosis: `Breeding Status: ${monthlyReportData.breeding_status}. Notes: ${monthlyReportData.notes}`
                    })
                  
                  if (error) throw error
                  
                  // If breeding status is pregnant, add to maternity care system
                  if (monthlyReportData.breeding_status === 'pregnant') {
                    try {
                      const { error: maternityError } = await supabase
                        .from('maternity_records')
                        .upsert({
                          animal_id: monthlyReportData.animal_id || selectedAnimalId,
                          status: 'pregnant',
                          gestation_day: 1, // Default to day 1 if not specified
                          expected_delivery: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 280 days from now
                          current_weight: parseFloat(monthlyReportData.weight) || null,
                          temperature: null,
                          heart_rate: null
                        })
                      
                      if (maternityError) {
                        console.error('Error adding to maternity care:', maternityError)
                      } else {
                        alert('Monthly health report added successfully! Animal enrolled in maternity care system.')
                        setMonthlyReportData({ month: new Date().toISOString().slice(0, 7), weight: '', health_status: 'healthy', vaccinations_given: '', vaccination_date: '', next_vaccination_date: '', treatments: '', breeding_status: '', notes: '' })
                        setShowMonthlyReport(false)
                        fetchHealthRecords()
                        return
                      }
                    } catch (maternityError) {
                      console.log('Maternity care table may not exist yet:', maternityError)
                    }
                  }
                  
                  setMonthlyReportData({ month: new Date().toISOString().slice(0, 7), weight: '', health_status: 'healthy', vaccinations_given: '', vaccination_date: '', next_vaccination_date: '', treatments: '', breeding_status: '', notes: '' })
                  setShowMonthlyReport(false)
                  fetchHealthRecords()
                  alert('Monthly health report added successfully!')
                } catch (error) {
                  console.error('Error adding monthly report:', error)
                  alert('Error adding monthly report: ' + error.message)
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                  <input
                    type="month"
                    value={monthlyReportData.month}
                    onChange={(e) => setMonthlyReportData({...monthlyReportData, month: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={monthlyReportData.weight}
                      onChange={(e) => setMonthlyReportData({...monthlyReportData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      placeholder="Current weight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select
                      value={monthlyReportData.health_status}
                      onChange={(e) => setMonthlyReportData({...monthlyReportData, health_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    >
                      <option value="healthy">Healthy</option>
                      <option value="sick">Sick</option>
                      <option value="recovering">Recovering</option>
                      <option value="pregnant">Pregnant</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaccinations Given</label>
                  <input
                    type="text"
                    value={monthlyReportData.vaccinations_given}
                    onChange={(e) => setMonthlyReportData({...monthlyReportData, vaccinations_given: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    placeholder="e.g., FMD Vaccine, Deworming"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Date</label>
                    <input
                      type="date"
                      value={monthlyReportData.vaccination_date}
                      onChange={(e) => setMonthlyReportData({...monthlyReportData, vaccination_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Vaccination Due</label>
                    <input
                      type="date"
                      value={monthlyReportData.next_vaccination_date}
                      onChange={(e) => setMonthlyReportData({...monthlyReportData, next_vaccination_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatments</label>
                  <input
                    type="text"
                    value={monthlyReportData.treatments}
                    onChange={(e) => setMonthlyReportData({...monthlyReportData, treatments: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    placeholder="Medications given"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breeding Status</label>
                  <select
                    value={monthlyReportData.breeding_status}
                    onChange={(e) => setMonthlyReportData({...monthlyReportData, breeding_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                  >
                    <option value="">Select breeding status</option>
                    <option value="not_bred">Not Bred</option>
                    <option value="bred">Recently Bred</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="delivered">Recently Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={monthlyReportData.notes}
                    onChange={(e) => setMonthlyReportData({...monthlyReportData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                    rows="3"
                    placeholder="Feed changes, behavior observations, health concerns, etc."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                  >
                    Add Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMonthlyReport(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Animal</h3>
              <form onSubmit={handleAddAnimal} className="space-y-6">
                {/* Photo Upload */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Animal Photo</label>
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => document.getElementById('photo-upload').click()}>
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Animal" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">📷</div>
                        <p className="text-xs text-gray-500">Select Photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setFormData({...formData, image_url: e.target.result})
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload').click()}
                    className="mt-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium"
                  >
                    Choose Photo
                  </button>
                </div>

                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tag Number</label>
                      <input
                        type="text"
                        value={formData.tag_number}
                        onChange={(e) => setFormData({...formData, tag_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                      <select
                        value={formData.species}
                        onChange={(e) => setFormData({...formData, species: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        required
                      >
                        <option value="">Select Species</option>
                        <option value="Pig">Pig</option>
                        <option value="Poultry">Poultry</option>
                        <option value="Cattle">Cattle</option>
                        <option value="Buffalo">Buffalo</option>
                        <option value="Goat">Goat</option>
                        <option value="Sheep">Sheep</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => setFormData({...formData, breed: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>

                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Microchip ID</label>
                      <input
                        type="text"
                        value={formData.microchip_id}
                        onChange={(e) => setFormData({...formData, microchip_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="sick">Sick</option>
                        <option value="pregnant">Pregnant (Auto-enroll in Maternity Care)</option>
                        <option value="quarantine">Quarantine</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-medium transition-colors"
                  >
                    Add Animal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}