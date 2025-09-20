import { ClipboardList, FolderOpen, Plus, Edit, Trash2, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Records() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [animals, setAnimals] = useState([])
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
    medication: ''
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
          diagnosis: `Health Check - ${healthData.growth_stage}`,
          treatment: `Weight: ${healthData.weight}kg, Temp: ${healthData.temperature}°C`,
          symptoms: `Respiratory: ${healthData.respiratory_rate}/min, Heart: ${healthData.heart_rate}/min, Feed: ${healthData.feed_intake}, Water: ${healthData.water_intake}`,
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
        medication: ''
      })
      setShowHealthForm(false)
      setSelectedAnimal(null)
    } catch (error) {
      alert('Error saving health record: ' + error.message)
    }
  }

  const openHealthForm = (animal) => {
    if (animal.species === 'Pig') {
      setSelectedAnimal(animal)
      setHealthData({...healthData, animal_id: animal.id, tag_number: animal.id})
      setShowHealthForm(true)
    } else {
      alert('Detailed health management is currently available for pigs only.')
    }
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
                <option value="Cow">🐄 Cow</option>
                <option value="Buffalo">🐃 Buffalo</option>
                <optgroup label="Other Animals">
                  <option value="Goat">🐐 Goat</option>
                  <option value="Sheep">🐑 Sheep</option>
                  <option value="Pig">🐷 Pig</option>
                  <option value="Chicken">🐔 Chicken</option>
                  <option value="Horse">🐎 Horse</option>
                  <option value="Dog">🐕 Dog</option>
                  <option value="Cat">🐱 Cat</option>
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
                          onClick={() => openHealthForm(animal)}
                          className="text-green-600 hover:text-green-800"
                          title="Health Management"
                        >
                          <Heart className="w-4 h-4" />
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

      {/* Pig Health Management Form */}
      {showHealthForm && selectedAnimal && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🐷 Health Management - {selectedAnimal.name}
          </h3>
          <form onSubmit={handleHealthRecord} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Animal ID / Tag Number</label>
              <input
                type="text"
                value={healthData.tag_number}
                onChange={(e) => setHealthData({...healthData, tag_number: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Unique tag number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
              <select
                value={healthData.sex}
                onChange={(e) => setHealthData({...healthData, sex: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={healthData.weight}
                onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Current weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth Stage</label>
              <select
                value={healthData.growth_stage}
                onChange={(e) => setHealthData({...healthData, growth_stage: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select stage</option>
                <option value="Piglet">Piglet</option>
                <option value="Juvenile">Juvenile</option>
                <option value="Adult">Adult</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={healthData.temperature}
                onChange={(e) => setHealthData({...healthData, temperature: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Body temperature"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate (/min)</label>
              <input
                type="number"
                value={healthData.respiratory_rate}
                onChange={(e) => setHealthData({...healthData, respiratory_rate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Breaths per minute"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (/min)</label>
              <input
                type="number"
                value={healthData.heart_rate}
                onChange={(e) => setHealthData({...healthData, heart_rate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Beats per minute"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feed Intake (daily)</label>
              <input
                type="text"
                value={healthData.feed_intake}
                onChange={(e) => setHealthData({...healthData, feed_intake: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Quantity & type of feed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Water Intake (daily)</label>
              <input
                type="text"
                value={healthData.water_intake}
                onChange={(e) => setHealthData({...healthData, water_intake: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Daily water consumption"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Record</label>
              <textarea
                value={healthData.vaccination_record}
                onChange={(e) => setHealthData({...healthData, vaccination_record: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="2"
                placeholder="Dates, types of vaccines given"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Past Illness</label>
              <textarea
                value={healthData.past_illness}
                onChange={(e) => setHealthData({...healthData, past_illness: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="2"
                placeholder="Previous diseases or conditions"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
              <textarea
                value={healthData.medication}
                onChange={(e) => setHealthData({...healthData, medication: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="2"
                placeholder="Current or past medications administered"
              />
            </div>
            <div className="md:col-span-3 flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Save Health Record
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHealthForm(false)
                  setSelectedAnimal(null)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}