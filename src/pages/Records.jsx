import { ClipboardList, FolderOpen, Plus, Edit, Trash2, Heart, Calendar, Syringe, Clock, Camera, Save, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Records() {
  const [userRole, setUserRole] = useState('farmer')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [showAnimalReport, setShowAnimalReport] = useState(false)
  const [showVaccinationSchedule, setShowVaccinationSchedule] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [vaccinationSchedule, setVaccinationSchedule] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [animals, setAnimals] = useState([])
  const [animalHealthRecords, setAnimalHealthRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    image: null
  })
  const [healthData, setHealthData] = useState({
    animal_id: '',
    tag_number: '',
    sex: '',
    weight: '',
    growth_stage: '',
    temperature: '',
    vaccination_record: '',
    past_illness: '',
    medication: '',
    last_vaccination_date: ''
  })

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer'
    setUserRole(role)
    if (role === 'farmer') {
      fetchAnimals()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchAllHealthRecords = async (animalList = animals) => {
    try {
      if (animalList.length === 0) return
      
      const animalIds = animalList.map(animal => animal.id)
      
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .in('animal_id', animalIds)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnimalHealthRecords(data || [])
      generateVaccinationSchedule(data || [], animalList)
    } catch (error) {
      console.error('Error fetching health records:', error)
    }
  }

  const generateVaccinationSchedule = (healthRecords = animalHealthRecords, animalList = animals) => {
    const schedule = []
    const today = new Date()
    
    animalList.forEach(animal => {
      // Get last vaccination from health records
      const lastVaccination = healthRecords
        .filter(record => record.animal_id === animal.id && record.last_vaccination_date)
        .sort((a, b) => new Date(b.last_vaccination_date) - new Date(a.last_vaccination_date))[0]
      
      const lastVacDate = lastVaccination ? new Date(lastVaccination.last_vaccination_date) : null
      
      // Calculate next vaccination dates based on species
      const getVaccinationInterval = (species) => {
        switch(species.toLowerCase()) {
          case 'pig': return 180 // 6 months
          case 'chicken': return 90 // 3 months
          case 'cow':
          case 'buffalo': return 365 // 1 year
          case 'goat':
          case 'sheep': return 180 // 6 months
          default: return 365 // 1 year default
        }
      }
      
      const interval = getVaccinationInterval(animal.species)
      const nextVacDate = lastVacDate ? 
        new Date(lastVacDate.getTime() + interval * 24 * 60 * 60 * 1000) :
        new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days if no previous vaccination
      
      const daysUntil = Math.ceil((nextVacDate - today) / (1000 * 60 * 60 * 24))
      
      schedule.push({
        animal,
        lastVaccination: lastVacDate,
        nextVaccination: nextVacDate,
        daysUntil,
        status: daysUntil < 0 ? 'overdue' : daysUntil <= 7 ? 'due_soon' : 'scheduled'
      })
    })
    
    setVaccinationSchedule(schedule.sort((a, b) => a.daysUntil - b.daysUntil))
  }

  const fetchAnimals = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setAnimals(data || [])
      
      // Fetch health records only if animals exist
      if (data && data.length > 0) {
        await fetchAllHealthRecords(data)
      }
    } catch (error) {
      console.error('Error fetching animals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnimalHealthRecords = async (animalId) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('animal_id', animalId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnimalHealthRecords(data || [])
    } catch (error) {
      console.error('Error fetching health records:', error)
      setAnimalHealthRecords([])
    }
  }

  const handleAddAnimal = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let imageUrl = null
      
      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('animal-images')
          .upload(fileName, formData.image)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('animal-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }
      
      const { data, error } = await supabase
        .from('animals')
        .insert({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: parseInt(formData.age),
          owner_id: user?.id,
          image_url: imageUrl
        })
      
      if (error) throw error
      
      setNotification({ type: 'success', message: `${formData.name} added successfully!` })
      setTimeout(() => setNotification(null), 3000)
      setFormData({ name: '', species: '', breed: '', age: '', image: null })
      setShowAddForm(false)
      fetchAnimals()
    } catch (error) {
      setNotification({ type: 'error', message: 'Error adding animal: ' + error.message })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleDeleteAnimal = async (id) => {
    if (confirm('Are you sure you want to delete this animal?')) {
      try {
        const { error } = await supabase
          .from('animals')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        setNotification({ type: 'success', message: 'Animal deleted successfully!' })
        setTimeout(() => setNotification(null), 3000)
        fetchAnimals()
      } catch (error) {
        setNotification({ type: 'error', message: 'Error deleting animal: ' + error.message })
        setTimeout(() => setNotification(null), 3000)
      }
    }
  }

  const handleHealthRecord = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          animal_id: selectedAnimal.id,
          tag_number: healthData.tag_number,
          sex: healthData.sex,
          weight: healthData.weight ? parseFloat(healthData.weight) : null,
          growth_stage: healthData.growth_stage,
          temperature: healthData.temperature ? parseFloat(healthData.temperature) : null,
          vaccination_record: healthData.vaccination_record,
          past_illness: healthData.past_illness,
          medication: healthData.medication,
          last_vaccination_date: healthData.last_vaccination_date || null,
          diagnosis: `🐾 Animal Health Record - ${new Date().toLocaleDateString()}`,
          treatment: `Weight: ${healthData.weight || 'N/A'}kg${healthData.temperature ? `, Temp: ${healthData.temperature}°C` : ''}`,
          symptoms: `Growth Stage: ${healthData.growth_stage || 'Not specified'}`,
          vet_id: user?.id
        })
      
      if (error) throw error
      
      setNotification({ type: 'success', message: 'Health record saved successfully!' })
      setTimeout(() => setNotification(null), 3000)
      setHealthData({
        animal_id: '',
        tag_number: '',
        sex: '',
        weight: '',
        growth_stage: '',
        temperature: '',
        vaccination_record: '',
        past_illness: '',
        medication: '',
        last_vaccination_date: ''
      })
      setShowHealthForm(false)
      // Refresh health records if report is open
      if (showAnimalReport) {
        fetchAnimalHealthRecords(selectedAnimal.id)
      } else {
        setSelectedAnimal(null)
      }
      // Refresh vaccination schedule
      if (animals.length > 0) {
        fetchAllHealthRecords()
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error saving health record: ' + error.message })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const openHealthForm = (animal) => {
    if (showHealthForm && selectedAnimal?.id === animal.id) {
      setShowHealthForm(false)
      setSelectedAnimal(null)
      return
    }
    setSelectedAnimal(animal)
    setHealthData({
      animal_id: '',
      tag_number: `${animal.name}-${Date.now()}`,
      sex: '',
      weight: '',
      growth_stage: '',
      temperature: '',
      vaccination_record: '',
      past_illness: '',
      medication: '',
      last_vaccination_date: ''
    })
    setShowHealthForm(true)
  }

  const openAnimalReport = (animal) => {
    if (showAnimalReport && selectedAnimal?.id === animal.id) {
      setShowAnimalReport(false)
      setSelectedAnimal(null)
      setAnimalHealthRecords([])
      return
    }
    setSelectedAnimal(animal)
    setShowAnimalReport(true)
    fetchAnimalHealthRecords(animal.id)
  }

  if (userRole !== 'farmer') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600">Animal Records are only available for farmers.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-800' 
            : 'bg-red-50 border-red-500 text-red-800'
        } animate-in slide-in-from-right-4 duration-300`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Animal Records</h2>
          <p className="text-gray-600">Manage your farm animals and their records</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowVaccinationSchedule(!showVaccinationSchedule)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Vaccination Schedule</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setShowAddForm(!showAddForm)
            }}
            className="bg-indigo-800 hover:bg-indigo-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>{showAddForm ? 'Cancel' : 'Add Animal'}</span>
          </button>
        </div>
      </div>

      {/* Vaccination Schedule */}
      {showVaccinationSchedule && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Syringe className="w-6 h-6 text-blue-600" />
            <span>Vaccination Schedule</span>
          </h3>
          <div className="space-y-4">
            {vaccinationSchedule.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No animals found. Add animals to see vaccination schedule.</p>
            ) : (
              vaccinationSchedule.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  item.status === 'overdue' ? 'bg-red-50 border-red-500' :
                  item.status === 'due_soon' ? 'bg-orange-50 border-orange-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        item.status === 'due_soon' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Syringe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.animal.name} - {item.animal.species}
                        </p>
                        <p className="text-sm text-gray-600">
                          Next vaccination: {item.nextVaccination.toLocaleDateString()}
                        </p>
                        {item.lastVaccination && (
                          <p className="text-xs text-gray-500">
                            Last vaccinated: {item.lastVaccination.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`badge ${
                        item.status === 'overdue' ? 'badge-danger' :
                        item.status === 'due_soon' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {item.status === 'overdue' ? `${Math.abs(item.daysUntil)} days overdue` :
                         item.status === 'due_soon' ? `Due in ${item.daysUntil} days` :
                         `${item.daysUntil} days remaining`}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {item.animal.species === 'Pig' ? '6 months interval' :
                           item.animal.species === 'Chicken' ? '3 months interval' :
                           item.animal.species === 'Cow' || item.animal.species === 'Buffalo' ? '1 year interval' :
                           item.animal.species === 'Goat' || item.animal.species === 'Sheep' ? '6 months interval' :
                           '1 year interval'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Animal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">🐾</span>
                </div>
                <h1 className="text-xl font-bold">Pashu Setu</h1>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Animal Record</h2>
              <p className="text-gray-600">Enter your farm animal details below</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <form onSubmit={handleAddAnimal} className="space-y-6">
                {/* Two-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Animal Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter animal name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={`REG-${Date.now().toString().slice(-6)}`}
                      className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                    <select
                      value={formData.species}
                      onChange={(e) => setFormData({...formData, species: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      <option value="">Select species</option>
                      <option value="Pig">🐷 Pig</option>
                      <option value="Chicken">🐔 Chicken (Poultry)</option>
                      <optgroup label="Other Animals">
                        <option value="Cow">🐄 Cow</option>
                        <option value="Buffalo">🐃 Buffalo</option>
                        <option value="Goat">🐐 Goat</option>
                        <option value="Sheep">🐑 Sheep</option>
                        <option value="Duck">🦆 Duck</option>
                        <option value="Turkey">🦃 Turkey</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter breed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter age"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <select className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                      <option value="">Select sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
                    <select className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                      <option value="Healthy">Healthy</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Quarantine">Quarantine</option>
                    </select>
                  </div>
                </div>

                {/* Full width fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Animal Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ name: '', species: '', breed: '', age: '', image: null })
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-sm transition-colors"
                  >
                    Clear All Data
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-800 hover:bg-indigo-900 text-white px-8 py-4 rounded-lg font-bold text-sm transition-colors"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Decoration */}
            <div className="flex justify-center items-center space-x-4 mt-8 py-4">
              <span className="text-4xl">🐷</span>
              <span className="text-4xl">🐔</span>
              <span className="text-4xl">🐄</span>
              <span className="text-4xl">🐐</span>
              <span className="text-4xl">🐑</span>
              <span className="text-4xl">🦆</span>
            </div>
          </div>
        </div>
      )}

      {/* Animals Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Your Animals ({animals.length})</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">Loading animals...</span>
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐄</div>
              <p className="text-gray-500 mb-4">No animals added yet</p>
              <p className="text-sm text-gray-400">Click "Add Animal" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => (
                <div key={animal.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {/* Animal Photo */}
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                      {animal.image_url ? (
                        <img 
                          src={animal.image_url} 
                          alt={animal.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-6xl ${animal.image_url ? 'hidden' : 'flex'}`}>
                        {animal.species === 'Pig' ? '🐷' : animal.species === 'Chicken' ? '🐔' : animal.species === 'Cow' ? '🐄' : animal.species === 'Goat' ? '🐐' : animal.species === 'Sheep' ? '🐑' : '🐾'}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-white/50">
                      ID: {animal.id.slice(0, 6)}
                    </div>
                  </div>

                  {/* Animal Info */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{animal.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>🏷️</span>
                        <span>{animal.species}</span>
                      </span>
                      {animal.breed && (
                        <span className="flex items-center space-x-1">
                          <span>🧬</span>
                          <span>{animal.breed}</span>
                        </span>
                      )}
                    </div>
                    {animal.age && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                        <span>📅</span>
                        <span>{animal.age} years old</span>
                      </div>
                    )}
                  </div>

                  {/* Health Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Health Status</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ Healthy
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => openAnimalReport(animal)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>📊</span>
                      <span>View Report</span>
                    </button>
                    <button 
                      onClick={() => openHealthForm(animal)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>🏥</span>
                      <span>Health Check</span>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-gray-400">
                      Added {new Date(animal.created_at).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDeleteAnimal(animal.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animal Health Management Form */}
      {showHealthForm && selectedAnimal && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6 animate-in slide-in-from-top-4 duration-500 fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-2xl">{selectedAnimal.species === 'Pig' ? '🐷' : selectedAnimal.species === 'Chicken' ? '🐔' : '🐄'}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">🏥 Animal Health & Management Report</h3>
                  <p className="text-green-100">Complete health assessment for {selectedAnimal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthForm(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleHealthRecord} className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Animal ID</label>
                <input
                  type="text"
                  value={healthData.tag_number}
                  onChange={(e) => setHealthData({...healthData, tag_number: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Animal ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Name</label>
                <input
                  type="text"
                  value={selectedAnimal.name}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">♂️♀️ Sex</label>
                <select
                  value={healthData.sex}
                  onChange={(e) => setHealthData({...healthData, sex: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📅 Age</label>
                <input
                  type="text"
                  value={`${selectedAnimal.age || '?'} yrs`}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">⚖️ Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={healthData.weight}
                  onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📈 Growth Stage</label>
                <select
                  value={healthData.growth_stage}
                  onChange={(e) => setHealthData({...healthData, growth_stage: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select</option>
                  <option value="Newborn">Newborn</option>
                  <option value="Young">Young</option>
                  <option value="Adult">Adult</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🌡️ Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={healthData.temperature}
                  onChange={(e) => setHealthData({...healthData, temperature: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📅 Last Vaccination</label>
                <input
                  type="date"
                  value={healthData.last_vaccination_date}
                  onChange={(e) => setHealthData({...healthData, last_vaccination_date: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💉 Vaccination Record</label>
                <textarea
                  value={healthData.vaccination_record}
                  onChange={(e) => setHealthData({...healthData, vaccination_record: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Vaccines given"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏥 Past Illnesses</label>
                <textarea
                  value={healthData.past_illness}
                  onChange={(e) => setHealthData({...healthData, past_illness: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Previous diseases"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💊 Medication History</label>
                <textarea
                  value={healthData.medication}
                  onChange={(e) => setHealthData({...healthData, medication: e.target.value})}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Medicine history"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-5 border-t border-gray-200 mt-5">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                💾 Save Health Record
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHealthForm(false)
                  setSelectedAnimal(null)
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animal Report Section */}
      {showAnimalReport && selectedAnimal && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-2xl">{selectedAnimal.species === 'Pig' ? '🐷' : selectedAnimal.species === 'Chicken' ? '🐔' : '🐄'}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedAnimal.name}</h3>
                  <p className="text-indigo-200">Animal Profile & Records</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnimalReport(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-0">
              {[
                { id: 'profile', label: 'Animal Profile', icon: '🐾' },
                { id: 'health', label: 'Health & Vaccinations', icon: '💉' },
                { id: 'records', label: 'Production Records', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-indigo-800 bg-yellow-50'
                      : 'border-transparent text-gray-600 hover:text-indigo-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Animal Photo */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-full border-4 border-gray-200 overflow-hidden">
                  {selectedAnimal.image_url ? (
                    <img 
                      src={selectedAnimal.image_url} 
                      alt={selectedAnimal.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {selectedAnimal.species === 'Pig' ? '🐷' : selectedAnimal.species === 'Chicken' ? '🐔' : '🐄'}
                    </div>
                  )}
                </div>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto">
                  <Camera className="w-4 h-4" />
                  <span>Edit Picture</span>
                </button>
              </div>
            </div>

            {/* Right Column - Animal Details */}
            <div className="lg:col-span-2">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration No.</label>
                      <input
                        type="text"
                        value={selectedAnimal.id.slice(0, 8)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={selectedAnimal.name}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                      <input
                        type="text"
                        value={selectedAnimal.species}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                      <input
                        type="text"
                        value={selectedAnimal.breed || ''}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="text"
                        value={`${selectedAnimal.age || 0} years`}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="Enter current weight"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Vaccination History</h4>
                    <div className="space-y-3">
                      {animalHealthRecords.filter(r => r.vaccination_record).map((record, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{record.vaccination_record}</p>
                            <p className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">Health Records</h4>
                    <div className="space-y-3">
                      {animalHealthRecords.slice(0, 3).map((record, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{record.diagnosis || 'Health Check'}</p>
                            <p className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                          </div>
                          {record.temperature && (
                            <span className="text-sm text-blue-600">{record.temperature}°C</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'records' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">{animalHealthRecords.length}</div>
                      <div className="text-sm text-purple-600">Total Records</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-700">{animalHealthRecords.filter(r => r.weight).length}</div>
                      <div className="text-sm text-orange-600">Weight Records</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Production Data</h4>
                    <div className="text-center py-8 text-gray-500">
                      <p>No production records available</p>
                      <p className="text-sm">Add production data to track performance</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Your Data</span>
                </button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium">
                  Find Your Data
                </button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>


        </div>
      )}
    </div>
  )
}