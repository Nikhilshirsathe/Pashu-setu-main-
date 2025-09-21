import { ClipboardList, FolderOpen, Plus, Edit, Trash2, Heart, Calendar, Syringe, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Records() {
  const [userRole, setUserRole] = useState('farmer')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [showAnimalReport, setShowAnimalReport] = useState(false)
  const [showVaccinationSchedule, setShowVaccinationSchedule] = useState(false)
  const [vaccinationSchedule, setVaccinationSchedule] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [animals, setAnimals] = useState([])
  const [animalHealthRecords, setAnimalHealthRecords] = useState([])
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
    }
  }, [])

  useEffect(() => {
    if (animals.length > 0) {
      fetchAllHealthRecords()
    }
  }, [animals])

  const fetchAllHealthRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const animalIds = animals.map(animal => animal.id)
      
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .in('animal_id', animalIds)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnimalHealthRecords(data || [])
      generateVaccinationSchedule(data || [])
    } catch (error) {
      console.error('Error fetching health records:', error)
    }
  }

  const generateVaccinationSchedule = (healthRecords = animalHealthRecords) => {
    const schedule = []
    const today = new Date()
    
    animals.forEach(animal => {
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
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      console.error('Error fetching animals:', error)
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
      
      alert('Animal added successfully!')
      setFormData({ name: '', species: '', breed: '', age: '', image: null })
      setShowAddForm(false)
      fetchAnimals()
    } catch (error) {
      alert('Error adding animal: ' + error.message)
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
        alert('Animal deleted successfully!')
        fetchAnimals()
      } catch (error) {
        alert('Error deleting animal: ' + error.message)
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
      
      alert('Health record saved successfully!')
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
      fetchAllHealthRecords()
    } catch (error) {
      alert('Error saving health record: ' + error.message)
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
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
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
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Animal</h3>
          <form onSubmit={handleAddAnimal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Animal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter animal name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({...formData, species: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <option value="Horse">🐎 Horse</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({...formData, breed: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter breed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter age"
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Animal Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add Animal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animals List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Your Animals ({animals.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No animals added yet. Click "Add Animal" to get started.
                  </td>
                </tr>
              ) : (
                animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {animal.image_url ? (
                        <img src={animal.image_url} alt={animal.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Photo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.species}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.breed || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.age || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openAnimalReport(animal)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          📊 Report
                        </button>
                        <button 
                          onClick={() => openHealthForm(animal)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          🏥 Health Form
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAnimal(animal.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6 animate-in slide-in-from-top-4 duration-500 fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-2xl">{selectedAnimal.species === 'Pig' ? '🐷' : selectedAnimal.species === 'Chicken' ? '🐔' : '🐄'}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">📊 Animal Profile Report</h3>
                  <p className="text-blue-100">Complete overview for {selectedAnimal.name}</p>
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

            <div className="p-6">
              {/* Basic Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    📝 Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-bold text-gray-800">{selectedAnimal.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <span className="font-medium text-gray-600">Species:</span>
                      <span className="font-bold text-gray-800">{selectedAnimal.species}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <span className="font-medium text-gray-600">Breed:</span>
                      <span className="font-bold text-gray-800">{selectedAnimal.breed || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <span className="font-medium text-gray-600">Age:</span>
                      <span className="font-bold text-gray-800">{selectedAnimal.age || 'Not specified'} years</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    💚 Health Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl">
                      <div className={`w-4 h-4 rounded-full ${animalHealthRecords.length > 0 && animalHealthRecords[0].health_status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="font-semibold text-green-800">{animalHealthRecords.length > 0 ? animalHealthRecords[0].health_status || 'Healthy' : 'No records'}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2">
                        <span className="text-green-700">Last Check:</span>
                        <span className="font-bold text-green-800">{animalHealthRecords.length > 0 ? new Date(animalHealthRecords[0].created_at).toLocaleDateString() : 'No records'}</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-green-700">Weight:</span>
                        <span className="font-bold text-green-800">{animalHealthRecords.length > 0 && animalHealthRecords[0].weight ? `${animalHealthRecords[0].weight}kg` : 'Not recorded'}</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-green-700">Vaccinations:</span>
                        <span className="font-bold text-green-800">{animalHealthRecords.length > 0 ? animalHealthRecords[0].vaccination_status || 'Not recorded' : 'No records'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-blue-700 mb-2">{animalHealthRecords.length}</div>
                  <div className="text-sm font-medium text-blue-600">Health Records</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-green-700 mb-2">{animalHealthRecords.filter(r => r.vaccination_record).length}</div>
                  <div className="text-sm font-medium text-green-600">Vaccinations</div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-orange-700 mb-2">{animalHealthRecords.filter(r => r.feeding_schedule).length}</div>
                  <div className="text-sm font-medium text-orange-600">Feeding Logs</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-purple-700 mb-2">{animalHealthRecords.filter(r => r.medication).length}</div>
                  <div className="text-sm font-medium text-purple-600">Medications</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  🕰️ Recent Health Records
                </h4>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {animalHealthRecords.length > 0 ? (
                    animalHealthRecords.slice(0, 5).map((record, index) => (
                      <div key={record.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">🏥</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{record.diagnosis || 'Health Record'}</p>
                          <p className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                          {record.weight && <p className="text-xs text-gray-500">Weight: {record.weight}kg</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No health records yet</p>
                      <p className="text-sm">Add a health record to see activity here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowAnimalReport(false)
                    openHealthForm(selectedAnimal)
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  🏥 Add Health Record
                </button>
                <button
                  onClick={() => setShowAnimalReport(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  )
}