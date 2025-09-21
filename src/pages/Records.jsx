import { ClipboardList, FolderOpen, Plus, Edit, Trash2, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Records() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [showAnimalReport, setShowAnimalReport] = useState(false)
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
    respiratory_rate: '',
    heart_rate: '',
    feed_intake: '',
    water_intake: '',
    vaccination_record: '',
    past_illness: '',
    medication: '',
    last_vaccination_date: '',
    next_vaccination_due: '',
    vaccination_status: 'Up to date',
    health_status: 'Healthy',
    feeding_schedule: '',
    special_notes: '',
    last_medication_date: '',
    last_checkup_date: '',
    next_checkup_due: '',
    last_feeding_time: '',
    breeding_status: '',
    pregnancy_status: '',
    // Poultry-specific fields
    flock_id: '',
    batch_number: '',
    flock_size: '',
    mortality_rate: '',
    feed_conversion_ratio: '',
    water_intake_ml: '',
    droppings_condition: '',
    feather_condition: '',
    respiratory_signs: '',
    growth_rate: '',
    egg_production_rate: '',
    egg_weight: '',
    shell_quality: '',
    housing_type: '',
    stocking_density: '',
    ventilation_status: '',
    temperature_celsius: '',
    humidity_percent: '',
    lighting_schedule: ''
  })

  useEffect(() => {
    fetchAnimals()
  }, [])

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
          respiratory_rate: healthData.respiratory_rate ? parseInt(healthData.respiratory_rate) : null,
          heart_rate: healthData.heart_rate ? parseInt(healthData.heart_rate) : null,
          feed_intake: healthData.feed_intake,
          water_intake: healthData.water_intake,
          vaccination_record: healthData.vaccination_record,
          past_illness: healthData.past_illness,
          medication: healthData.medication,
          last_vaccination_date: healthData.last_vaccination_date || null,
          next_vaccination_due: healthData.next_vaccination_due || null,
          vaccination_status: healthData.vaccination_status,
          health_status: healthData.health_status,
          feeding_schedule: healthData.feeding_schedule,
          special_notes: healthData.special_notes,
          last_medication_date: healthData.last_medication_date || null,
          last_checkup_date: healthData.last_checkup_date || null,
          next_checkup_due: healthData.next_checkup_due || null,
          last_feeding_time: healthData.last_feeding_time || null,
          breeding_status: healthData.breeding_status,
          pregnancy_status: healthData.pregnancy_status,
          // Poultry-specific fields
          flock_id: healthData.flock_id,
          batch_number: healthData.batch_number,
          flock_size: healthData.flock_size ? parseInt(healthData.flock_size) : null,
          mortality_rate: healthData.mortality_rate ? parseFloat(healthData.mortality_rate) : null,
          feed_conversion_ratio: healthData.feed_conversion_ratio ? parseFloat(healthData.feed_conversion_ratio) : null,
          water_intake_ml: healthData.water_intake_ml ? parseInt(healthData.water_intake_ml) : null,
          droppings_condition: healthData.droppings_condition,
          feather_condition: healthData.feather_condition,
          respiratory_signs: healthData.respiratory_signs,
          growth_rate: healthData.growth_rate ? parseFloat(healthData.growth_rate) : null,
          egg_production_rate: healthData.egg_production_rate ? parseFloat(healthData.egg_production_rate) : null,
          egg_weight: healthData.egg_weight ? parseFloat(healthData.egg_weight) : null,
          shell_quality: healthData.shell_quality,
          housing_type: healthData.housing_type,
          stocking_density: healthData.stocking_density ? parseInt(healthData.stocking_density) : null,
          ventilation_status: healthData.ventilation_status,
          temperature_celsius: healthData.temperature_celsius ? parseFloat(healthData.temperature_celsius) : null,
          humidity_percent: healthData.humidity_percent ? parseFloat(healthData.humidity_percent) : null,
          lighting_schedule: healthData.lighting_schedule,
          diagnosis: `${selectedAnimal.species} Health Check - ${new Date().toLocaleDateString()}`,
          treatment: `Weight: ${healthData.weight || 'N/A'}kg${healthData.temperature ? `, Temp: ${healthData.temperature}°C` : ''}${selectedAnimal.species === 'Chicken' && healthData.flock_size ? `, Flock: ${healthData.flock_size} birds` : ''}`,
          symptoms: healthData.special_notes || 'Regular health assessment',
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
        respiratory_rate: '',
        heart_rate: '',
        feed_intake: '',
        water_intake: '',
        vaccination_record: '',
        past_illness: '',
        medication: '',
        last_vaccination_date: '',
        next_vaccination_due: '',
        vaccination_status: 'Up to date',
        health_status: 'Healthy',
        feeding_schedule: '',
        special_notes: '',
        last_medication_date: '',
        last_checkup_date: '',
        next_checkup_due: '',
        last_feeding_time: '',
        breeding_status: '',
        pregnancy_status: ''
      })
      setShowHealthForm(false)
      // Refresh health records if report is open
      if (showAnimalReport) {
        fetchAnimalHealthRecords(selectedAnimal.id)
      } else {
        setSelectedAnimal(null)
      }
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
      tag_number: `TAG-${animal.name}`,
      sex: '',
      weight: '',
      growth_stage: '',
      temperature: '',
      respiratory_rate: '',
      heart_rate: '',
      feed_intake: '',
      water_intake: '',
      vaccination_record: '',
      past_illness: '',
      medication: '',
      last_vaccination_date: '',
      next_vaccination_due: '',
      vaccination_status: 'Up to date',
      health_status: 'Healthy',
      feeding_schedule: '',
      special_notes: '',
      last_medication_date: '',
      last_checkup_date: new Date().toISOString().split('T')[0],
      next_checkup_due: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      last_feeding_time: '',
      breeding_status: '',
      pregnancy_status: ''
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Animal Records</h2>
          <p className="text-gray-600">Manage your farm animals and their records</p>
        </div>
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

          <form onSubmit={handleHealthRecord} className="p-6">
            {/* Basic Information Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📋 Basic Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Tag Number</label>
                  <input
                    type="text"
                    value={healthData.tag_number}
                    onChange={(e) => setHealthData({...healthData, tag_number: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Tag no."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Name</label>
                  <input
                    type="text"
                    value={selectedAnimal.name}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🧬 Species</label>
                  <input
                    type="text"
                    value={selectedAnimal.species}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Age</label>
                  <input
                    type="text"
                    value={`${selectedAnimal.age || '?'} years`}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">♂️♀️ Sex</label>
                  <select
                    value={healthData.sex}
                    onChange={(e) => setHealthData({...healthData, sex: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">⚖️ Weight (kg)</label>
                  <input
                    type="number"
                    value={healthData.weight}
                    onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Weight in kg"
                  />
                </div>
              </div>
            </div>

            {/* Vaccination & Medical History */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                💉 Vaccination & Medical History
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💉 Last Vaccination Date</label>
                  <input
                    type="date"
                    value={healthData.last_vaccination_date}
                    onChange={(e) => setHealthData({...healthData, last_vaccination_date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Next Vaccination Due</label>
                  <input
                    type="date"
                    value={healthData.next_vaccination_due}
                    onChange={(e) => setHealthData({...healthData, next_vaccination_due: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">✅ Vaccination Status</label>
                  <select
                    value={healthData.vaccination_status}
                    onChange={(e) => setHealthData({...healthData, vaccination_status: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Up to date">Up to date</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                    <option value="Not started">Not started</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💉 Vaccination Record</label>
                  <textarea
                    value={healthData.vaccination_record}
                    onChange={(e) => setHealthData({...healthData, vaccination_record: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="Types of vaccines given, batch numbers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏥 Past Illness</label>
                  <textarea
                    value={healthData.past_illness}
                    onChange={(e) => setHealthData({...healthData, past_illness: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="Previous diseases or conditions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💊 Last Medication Date</label>
                  <input
                    type="date"
                    value={healthData.last_medication_date}
                    onChange={(e) => setHealthData({...healthData, last_medication_date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💊 Medication Details</label>
                  <textarea
                    value={healthData.medication}
                    onChange={(e) => setHealthData({...healthData, medication: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="Medicine name, dosage, reason"
                  />
                </div>
              </div>
            </div>

            {/* Feeding & Care */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🍽️ Feeding & Daily Care
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🕰️ Last Feeding Time</label>
                  <input
                    type="datetime-local"
                    value={healthData.last_feeding_time}
                    onChange={(e) => setHealthData({...healthData, last_feeding_time: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🍽️ Feeding Schedule</label>
                  <textarea
                    value={healthData.feeding_schedule}
                    onChange={(e) => setHealthData({...healthData, feeding_schedule: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="Daily feeding times and portions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Special Notes</label>
                  <textarea
                    value={healthData.special_notes}
                    onChange={(e) => setHealthData({...healthData, special_notes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="Any special care instructions or observations"
                  />
                </div>
              </div>
            </div>

            {/* Breeding Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🐷 Breeding Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🐷 Breeding Status</label>
                  <select
                    value={healthData.breeding_status}
                    onChange={(e) => setHealthData({...healthData, breeding_status: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select status</option>
                    <option value="Not breeding">Not breeding</option>
                    <option value="Ready for breeding">Ready for breeding</option>
                    <option value="Bred">Bred</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Nursing">Nursing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🤰 Pregnancy Status</label>
                  <input
                    type="text"
                    value={healthData.pregnancy_status}
                    onChange={(e) => setHealthData({...healthData, pregnancy_status: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Due date, weeks pregnant, etc."
                  />
                </div>
              </div>
            </div>

            {/* Poultry-Specific Sections */}
            {selectedAnimal && selectedAnimal.species === 'Chicken' && (
              <>
                {/* Flock Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🐔 Flock Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Flock ID</label>
                      <input
                        type="text"
                        value={healthData.flock_id}
                        onChange={(e) => setHealthData({...healthData, flock_id: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Flock identifier"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📦 Batch Number</label>
                      <input
                        type="text"
                        value={healthData.batch_number}
                        onChange={(e) => setHealthData({...healthData, batch_number: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Batch number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🐔 Flock Size</label>
                      <input
                        type="number"
                        value={healthData.flock_size}
                        onChange={(e) => setHealthData({...healthData, flock_size: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Number of birds"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    📊 Performance Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💀 Mortality Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={healthData.mortality_rate}
                        onChange={(e) => setHealthData({...healthData, mortality_rate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Daily mortality %"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🌾 Feed Conversion Ratio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={healthData.feed_conversion_ratio}
                        onChange={(e) => setHealthData({...healthData, feed_conversion_ratio: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="FCR"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💧 Water Intake (ml/day)</label>
                      <input
                        type="number"
                        value={healthData.water_intake_ml}
                        onChange={(e) => setHealthData({...healthData, water_intake_ml: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="ml per bird per day"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📈 Growth Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        value={healthData.growth_rate}
                        onChange={(e) => setHealthData({...healthData, growth_rate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="g/day"
                      />
                    </div>
                  </div>
                </div>

                {/* Health Observations */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🔍 Health Observations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💩 Droppings Condition</label>
                      <select
                        value={healthData.droppings_condition}
                        onChange={(e) => setHealthData({...healthData, droppings_condition: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select condition</option>
                        <option value="Normal">Normal</option>
                        <option value="Watery">Watery</option>
                        <option value="Bloody">Bloody</option>
                        <option value="Loose">Loose</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🪶 Feather Condition</label>
                      <input
                        type="text"
                        value={healthData.feather_condition}
                        onChange={(e) => setHealthData({...healthData, feather_condition: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Parasites, pecking wounds, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🫁 Respiratory Signs</label>
                      <input
                        type="text"
                        value={healthData.respiratory_signs}
                        onChange={(e) => setHealthData({...healthData, respiratory_signs: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Coughing, sneezing, discharge"
                      />
                    </div>
                  </div>
                </div>

                {/* Production Parameters */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🥚 Production Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🥚 Egg Production Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={healthData.egg_production_rate}
                        onChange={(e) => setHealthData({...healthData, egg_production_rate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Hen-day production %"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">⚖️ Egg Weight (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={healthData.egg_weight}
                        onChange={(e) => setHealthData({...healthData, egg_weight: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Average egg weight"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🐚 Shell Quality</label>
                      <select
                        value={healthData.shell_quality}
                        onChange={(e) => setHealthData({...healthData, shell_quality: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select quality</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Environmental Conditions */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🏠 Environmental Conditions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Housing Type</label>
                      <select
                        value={healthData.housing_type}
                        onChange={(e) => setHealthData({...healthData, housing_type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select housing</option>
                        <option value="Deep litter">Deep litter</option>
                        <option value="Cage">Cage</option>
                        <option value="Free range">Free range</option>
                        <option value="Semi-intensive">Semi-intensive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📏 Stocking Density</label>
                      <input
                        type="number"
                        value={healthData.stocking_density}
                        onChange={(e) => setHealthData({...healthData, stocking_density: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Birds per sq ft"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🌡️ Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={healthData.temperature_celsius}
                        onChange={(e) => setHealthData({...healthData, temperature_celsius: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Temperature"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💧 Humidity (%)</label>
                      <input
                        type="number"
                        value={healthData.humidity_percent}
                        onChange={(e) => setHealthData({...healthData, humidity_percent: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Humidity %"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🌬️ Ventilation Status</label>
                      <select
                        value={healthData.ventilation_status}
                        onChange={(e) => setHealthData({...healthData, ventilation_status: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select status</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">💡 Lighting Schedule</label>
                      <input
                        type="text"
                        value={healthData.lighting_schedule}
                        onChange={(e) => setHealthData({...healthData, lighting_schedule: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 16L:8D (16 hours light, 8 hours dark)"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4 pt-6 border-t border-gray-200 mt-8">
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