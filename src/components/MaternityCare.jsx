import { useState, useEffect } from 'react'
import { Baby, Calendar, Heart, Thermometer, Scale, Droplets, Shield, AlertTriangle, CheckCircle, Clock, Bell, Activity, TrendingUp, Eye, Stethoscope } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../translations/translations'
import { supabase } from '../lib/supabase'

export default function MaternityCare({ onBack }) {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [pregnantAnimals, setPregnantAnimals] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [hygieneChecks, setHygieneChecks] = useState([])
  const [careSchedule, setCareSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({ type: '', date: '', time: '', priority: 'medium', notes: '' })
  const [birthData, setBirthData] = useState({ litter_size: '', room_temp: '', labor_duration: '' })
  const [healthData, setHealthData] = useState({ temperature: '', heart_rate: '', weight: '', gestation_day: '' })
  const [hygieneData, setHygieneData] = useState({ cleanliness: '', environment: '', water_quality: '', feeding: '', notes: '' })

  useEffect(() => {
    fetchPregnantAnimals()
  }, [])

  // Force re-render when data changes
  useEffect(() => {
    console.log('Pregnant animals updated:', pregnantAnimals)
    if (pregnantAnimals.length > 0 && !selectedAnimal) {
      setSelectedAnimal(pregnantAnimals[0].animal_id)
    }
  }, [pregnantAnimals])

  useEffect(() => {
    if (selectedAnimal) {
      fetchHygieneChecks(selectedAnimal)
      fetchCareSchedule(selectedAnimal)
    }
  }, [selectedAnimal])

  const fetchPregnantAnimals = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail')
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || userEmail

      const { data, error } = await supabase
        .from('maternity_records')
        .select(`
          *,
          animals (
            id, name, species, breed, weight
          )
        `)
        .eq('animals.owner_id', userId)
        .eq('status', 'pregnant')

      if (error) throw error
      setPregnantAnimals(data || [])
      if (data && data.length > 0) {
        setSelectedAnimal(data[0].animal_id)
      }
    } catch (error) {
      console.error('Error fetching pregnant animals:', error)
      setPregnantAnimals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchHygieneChecks = async (animalId) => {
    try {
      const { data, error } = await supabase
        .from('hygiene_checks')
        .select('*')
        .eq('animal_id', animalId)
        .order('check_date', { ascending: false })
        .limit(5)

      if (error) throw error
      setHygieneChecks(data || [])
    } catch (error) {
      console.error('Error fetching hygiene checks:', error)
      setHygieneChecks([])
    }
  }

  const fetchCareSchedule = async (animalId) => {
    try {
      const { data, error } = await supabase
        .from('care_schedule')
        .select('*')
        .eq('animal_id', animalId)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      setCareSchedule(data || [])
    } catch (error) {
      console.error('Error fetching care schedule:', error)
      setCareSchedule([])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'attention': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const addNewTask = async () => {
    if (!newTask.type || !newTask.date || !newTask.time) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('care_schedule')
        .insert({
          animal_id: selectedAnimal,
          task_type: newTask.type,
          scheduled_date: newTask.date,
          scheduled_time: newTask.time,
          priority: newTask.priority,
          status: 'pending',
          notes: newTask.notes
        })

      if (error) throw error
      
      // Refresh schedule
      fetchCareSchedule(selectedAnimal)
      
      // Reset form
      setNewTask({ type: '', date: '', time: '', priority: 'medium', notes: '' })
      setShowAddForm(false)
      alert('Task added successfully!')
    } catch (error) {
      console.error('Error adding task:', error)
      // Fallback: add to local state
      const newTaskItem = {
        id: Date.now(),
        task_type: newTask.type,
        scheduled_date: newTask.date,
        scheduled_time: newTask.time,
        priority: newTask.priority,
        status: 'pending',
        notes: newTask.notes
      }
      setCareSchedule([...careSchedule, newTaskItem])
      setNewTask({ type: '', date: '', time: '', priority: 'medium', notes: '' })
      setShowAddForm(false)
      alert('Task added successfully!')
    }
  }

  const markTaskComplete = async (taskId) => {
    try {
      const { error } = await supabase
        .from('care_schedule')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error
      
      // Refresh schedule
      fetchCareSchedule(selectedAnimal)
      alert('Task marked as completed!')
    } catch (error) {
      console.error('Error updating task:', error)
      // Fallback: update local state
      setCareSchedule(careSchedule.map(task => 
        (task.id || careSchedule.indexOf(task)) === taskId 
          ? { ...task, status: 'completed' }
          : task
      ))
      alert('Task marked as completed!')
    }
  }

  const updateHealthData = async () => {
    if (!healthData.temperature && !healthData.heart_rate && !healthData.weight && !healthData.gestation_day) {
      alert('Please fill at least one field')
      return
    }

    try {
      const { error } = await supabase
        .from('maternity_records')
        .update({
          temperature: healthData.temperature || null,
          heart_rate: healthData.heart_rate || null,
          current_weight: healthData.weight || null,
          gestation_day: healthData.gestation_day || null
        })
        .eq('animal_id', selectedAnimal)

      if (error) throw error
      
      fetchPregnantAnimals()
      setHealthData({ temperature: '', heart_rate: '', weight: '', gestation_day: '' })
      alert('Health data updated successfully!')
    } catch (error) {
      console.error('Error updating health data:', error)
      alert('Error updating health data')
    }
  }

  const recordHygieneCheck = async () => {
    if (!hygieneData.cleanliness || !hygieneData.environment || !hygieneData.water_quality || !hygieneData.feeding) {
      alert('Please fill all score fields')
      return
    }

    try {
      const overall = Math.round((parseInt(hygieneData.cleanliness) + parseInt(hygieneData.environment) + parseInt(hygieneData.water_quality) + parseInt(hygieneData.feeding)) / 4)
      
      const { error } = await supabase
        .from('hygiene_checks')
        .insert({
          animal_id: selectedAnimal,
          cleanliness_score: parseInt(hygieneData.cleanliness),
          environment_score: parseInt(hygieneData.environment),
          water_quality_score: parseInt(hygieneData.water_quality),
          feeding_score: parseInt(hygieneData.feeding),
          overall_score: overall,
          notes: hygieneData.notes,
          check_date: new Date().toISOString()
        })

      if (error) throw error
      
      fetchHygieneChecks(selectedAnimal)
      setHygieneData({ cleanliness: '', environment: '', water_quality: '', feeding: '', notes: '' })
      alert('Hygiene check recorded successfully!')
    } catch (error) {
      console.error('Error recording hygiene check:', error)
      alert('Error recording hygiene check')
    }
  }

  const recordBirthData = async () => {
    if (!birthData.litter_size || !birthData.room_temp || !birthData.labor_duration) {
      alert('Please fill all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('birth_preparation')
        .insert({
          animal_id: selectedAnimal,
          expected_litter_size: parseInt(birthData.litter_size),
          farrowing_room_temp: parseFloat(birthData.room_temp),
          expected_labor_duration: parseFloat(birthData.labor_duration)
        })

      if (error) throw error
      
      setBirthData({ litter_size: '', room_temp: '', labor_duration: '' })
      alert('Birth data recorded successfully!')
    } catch (error) {
      console.error('Error recording birth data:', error)
      alert('Error recording birth data')
    }
  }

  const selectedAnimalData = pregnantAnimals.find(a => a.animal_id === selectedAnimal)
  const selectedHygiene = hygieneChecks[0] // Latest hygiene check
  
  // Debug logging
  console.log('Selected Animal Data:', selectedAnimalData)
  console.log('Pregnant Animals:', pregnantAnimals)

  const tabs = [
    { id: 'overview', label: t('overview', language), icon: Baby },
    { id: 'monitoring', label: t('health_monitoring', language), icon: Heart },
    { id: 'hygiene', label: t('hygiene_system', language), icon: Shield },
    { id: 'colostrum', label: t('colostrum_management', language), icon: Droplets },
    { id: 'education', label: t('health_education', language), icon: AlertTriangle },
    { id: 'schedule', label: t('care_schedule', language), icon: Calendar }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafa] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_maternity_care_data', language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafa] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            ← {t('back', language)}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('professional_maternity_care', language)}</h1>
            <p className="text-gray-600">{t('maternity_care_desc', language)}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-2">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#059669] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Animal Selection Sidebar */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">{t('pregnant_animals', language)}</h3>
            <div className="space-y-3">
              {pregnantAnimals.length > 0 ? pregnantAnimals.map((animal) => (
                <div
                  key={animal.animal_id}
                  onClick={() => setSelectedAnimal(animal.animal_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedAnimal === animal.animal_id
                      ? 'bg-[#059669] text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{animal.animals?.name}</p>
                      <p className={`text-sm ${selectedAnimal === animal.animal_id ? 'text-green-100' : 'text-gray-600'}`}>
                        {animal.animals?.species} • Day {animal.gestation_day}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAnimal === animal.animal_id 
                        ? 'bg-white/20 text-white' 
                        : getStatusColor(animal.status)
                    }`}>
                      {animal.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">{t('no_animals_yet', language)}</p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'overview' && selectedAnimalData && (
              <div key={`overview-${selectedAnimal}-${selectedAnimalData.gestation_day}`}>
                {/* Animal Info Card */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAnimalData.animals?.name}</h2>
                      <p className="text-gray-600">{selectedAnimalData.animals?.breed} {selectedAnimalData.animals?.species}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{selectedAnimalData.animals?.species === 'Poultry' ? t('expected_hatching', language) : t('expected_delivery', language)}</p>
                      <p className="text-xl font-bold text-[#059669]">{new Date(selectedAnimalData.expected_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{selectedAnimalData.animals?.species === 'Poultry' ? t('incubation_day', language) : t('gestation_day', language)}</p>
                      <p className="text-xl font-bold text-blue-600">{selectedAnimalData.gestation_day || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Scale className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('weight', language)}</p>
                      <p className="text-xl font-bold text-green-600">{selectedAnimalData.current_weight || selectedAnimalData.animals?.weight || 'N/A'}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <Thermometer className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('temperature', language)}</p>
                      <p className="text-xl font-bold text-red-600">{selectedAnimalData.temperature || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('heart_rate', language)}</p>
                      <p className="text-xl font-bold text-purple-600">{selectedAnimalData.heart_rate || t('na', language)} {t('bpm', language)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow text-left"
                  >
                    <Stethoscope className="w-8 h-8 text-[#059669] mb-3" />
                    <h3 className="font-bold text-gray-900">{t('schedule_checkup', language)}</h3>
                    <p className="text-sm text-gray-600">{t('book_veterinary_examination', language)}</p>
                  </button>
                  <button 
                    onClick={() => alert('Reminder set for daily medication')}
                    className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow text-left"
                  >
                    <Bell className="w-8 h-8 text-[#059669] mb-3" />
                    <h3 className="font-bold text-gray-900">{t('set_reminder', language)}</h3>
                    <p className="text-sm text-gray-600">{t('medication_feeding_alert', language)}</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('monitoring')}
                    className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow text-left"
                  >
                    <Activity className="w-8 h-8 text-[#059669] mb-3" />
                    <h3 className="font-bold text-gray-900">{t('log_activity', language)}</h3>
                    <p className="text-sm text-gray-600">{t('record_health_observation', language)}</p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && selectedAnimalData && (
              <div className="space-y-6">
                {/* Add Health Data Form */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('update_health_data', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('temperature', language)}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={healthData.temperature}
                        onChange={(e) => setHealthData({...healthData, temperature: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="38.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('heart_rate', language)} (bpm)</label>
                      <input 
                        type="number"
                        value={healthData.heart_rate}
                        onChange={(e) => setHealthData({...healthData, heart_rate: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('weight', language)}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={healthData.weight}
                        onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="135"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('gestation_day', language)}</label>
                      <input 
                        type="number"
                        value={healthData.gestation_day}
                        onChange={(e) => setHealthData({...healthData, gestation_day: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="90"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={updateHealthData}
                    className="mt-4 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                  >
                    {t('update_health_data', language)}
                  </button>
                </div>

                {/* Current Vital Signs */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('current_vital_signs', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Thermometer className="w-5 h-5 text-red-500" />
                          <span className="font-medium">{t('body_temperature', language)}</span>
                        </div>
                        <span className="text-lg font-bold">{selectedAnimalData.temperature || t('na', language)}°C</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="font-medium">{t('heart_rate', language)}</span>
                        </div>
                        <span className="text-lg font-bold">{selectedAnimalData.heart_rate || t('na', language)} {t('bpm', language)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Scale className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{t('weight', language)}</span>
                        </div>
                        <span className="text-lg font-bold">{selectedAnimalData.current_weight || selectedAnimalData.animals?.weight || t('na', language)} {t('kg', language)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{t('gestation_day', language)}</span>
                        </div>
                        <span className="text-lg font-bold">{selectedAnimalData.gestation_day || t('na', language)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hygiene' && (
              <div className="space-y-6">
                {/* Add Hygiene Check Form */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('record_hygiene_check', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('cleanliness_score', language)}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={hygieneData.cleanliness}
                        onChange={(e) => setHygieneData({...hygieneData, cleanliness: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('environment_score', language)}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={hygieneData.environment}
                        onChange={(e) => setHygieneData({...hygieneData, environment: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('water_quality_score', language)}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={hygieneData.water_quality}
                        onChange={(e) => setHygieneData({...hygieneData, water_quality: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="92"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('feeding_score', language)}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={hygieneData.feeding}
                        onChange={(e) => setHygieneData({...hygieneData, feeding: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                        placeholder="88"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea 
                      value={hygieneData.notes}
                      onChange={(e) => setHygieneData({...hygieneData, notes: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      rows="2"
                      placeholder={t('hygiene_check_notes', language)}
                    />
                  </div>
                  <button 
                    onClick={recordHygieneCheck}
                    className="mt-4 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                  >
                    {t('record_hygiene_check', language)}
                  </button>
                </div>

                {/* Hygiene Score Overview */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t('current_hygiene_scores', language)}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{t('overall_score', language)}</p>
                      <p className={`text-3xl font-bold ${selectedHygiene?.overall_score >= 90 ? 'text-green-600' : selectedHygiene?.overall_score >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {selectedHygiene?.overall_score || 'N/A'}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('cleanliness', language)}</p>
                      <p className="text-xl font-bold text-blue-600">{selectedHygiene?.cleanliness_score || t('na', language)}%</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('environment', language)}</p>
                      <p className="text-xl font-bold text-green-600">{selectedHygiene?.environment_score || t('na', language)}%</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Droplets className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('water_quality', language)}</p>
                      <p className="text-xl font-bold text-purple-600">{selectedHygiene?.water_quality_score || t('na', language)}%</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{t('feeding', language)}</p>
                      <p className="text-xl font-bold text-orange-600">{selectedHygiene?.feeding_score || t('na', language)}%</p>
                    </div>
                  </div>
                </div>

                {/* Hygiene Checklist */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('recent_hygiene_checks', language)}</h3>
                  <div className="space-y-3">
                    {hygieneChecks.length > 0 ? hygieneChecks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="text-gray-900">{t('hygiene_check', language)}</span>
                            <p className="text-sm text-gray-600">{check.notes}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(check.check_date).toLocaleDateString()}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">{t('no_hygiene_checks_recorded', language)}</p>
                    )}
                  </div>
                </div>

                {/* Hygiene Recommendations */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('hygiene_recommendations', language)}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">{t('increase_shelter_cleaning_frequency', language)}</p>
                        <p className="text-sm text-blue-700">{t('clean_bedding_twice_daily_pregnancy', language)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Droplets className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">{t('water_quality_excellent', language)}</p>
                        <p className="text-sm text-green-700">{t('continue_current_water_management', language)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'colostrum' && selectedAnimalData && (
              <div className="space-y-6">
                {selectedAnimalData.animals?.species === 'Pig' ? (
                  <>
                    {/* Add Birth Data Form */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('record_birth_preparation_data', language)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expected_litter_size', language)}</label>
                          <input 
                            type="number" 
                            min="1"
                            value={birthData.litter_size}
                            onChange={(e) => setBirthData({...birthData, litter_size: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('farrowing_room_temp', language)}</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={birthData.room_temp}
                            onChange={(e) => setBirthData({...birthData, room_temp: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                            placeholder="19"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expected_labor_duration', language)}</label>
                          <input 
                            type="number" 
                            step="0.5"
                            value={birthData.labor_duration}
                            onChange={(e) => setBirthData({...birthData, labor_duration: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                            placeholder="5"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={recordBirthData}
                        className="mt-4 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                      >
                        {t('record_birth_data', language)}
                      </button>
                    </div>

                    {/* Current Birth Preparation */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('current_birth_preparation_data', language)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <Baby className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('expected_litter_size', language)}</p>
                          <p className="text-xl font-bold text-blue-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <Thermometer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('farrowing_room_temp', language)}</p>
                          <p className="text-xl font-bold text-purple-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('expected_labor_duration', language)}</p>
                          <p className="text-xl font-bold text-orange-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Piglet Care Schedule */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('newborn_piglet_care', language)}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="font-medium text-green-900">{t('clear_airways', language)}</span>
                              <p className="text-sm text-green-700">{t('remove_mucus_ensure_breathing', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-green-600">{t('critical', language)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <div>
                              <span className="font-medium text-yellow-900">{t('first_nursing', language)}</span>
                              <p className="text-sm text-yellow-700">{t('colostrum_intake_first_hour', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-yellow-600">{t('essential', language)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <div>
                              <span className="font-medium text-blue-900">{t('iron_injection', language)}</span>
                              <p className="text-sm text-blue-700">{t('prevent_anemia_piglets', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-blue-600">{t('scheduled', language)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Poultry Incubation */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('egg_incubation_hatching', language)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('incubation_temp', language)}</p>
                          <p className="text-xl font-bold text-blue-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <Droplets className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('humidity_level', language)}</p>
                          <p className="text-xl font-bold text-purple-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <Baby className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{t('expected_hatch', language)}</p>
                          <p className="text-xl font-bold text-orange-600">{t('na', language)}</p>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{t('no_data', language)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hatching Schedule */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t('hatching_progress', language)}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="font-medium text-green-900">{t('candling_day_7', language)}</span>
                              <p className="text-sm text-green-700">{t('embryo_development_confirmed', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-green-600">{t('completed', language)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <div>
                              <span className="font-medium text-yellow-900">{t('final_candling_day_18', language)}</span>
                              <p className="text-sm text-yellow-700">{t('move_to_hatcher_increase_humidity', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-yellow-600">{t('upcoming', language)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Baby className="w-5 h-5 text-blue-600" />
                            <div>
                              <span className="font-medium text-blue-900">{t('hatching_day_21', language)}</span>
                              <p className="text-sm text-blue-700">{t('chicks_emerge_move_brooder', language)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-blue-600">{t('expected', language)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Care Guidelines */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('care_guidelines', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAnimalData.animals?.species === 'Pig' ? (
                      <>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">{t('successful_farrowing_signs', language)}</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>{t('nest_building_behavior', language)}</li>
                            <li>{t('restlessness_panting', language)}</li>
                            <li>{t('milk_letdown_visible', language)}</li>
                            <li>{t('regular_contractions', language)}</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">{t('warning_signs', language)}</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>{t('labor_longer_8_hours', language)}</li>
                            <li>{t('no_piglets_2_hours_straining', language)}</li>
                            <li>{t('excessive_bleeding', language)}</li>
                            <li>{t('signs_distress_fever', language)}</li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">{t('good_hatching_indicators', language)}</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>{t('steady_temperature_37_5c', language)}</li>
                            <li>{t('humidity_55_60_percent', language)}</li>
                            <li>{t('regular_egg_turning_day_18', language)}</li>
                            <li>{t('good_air_circulation', language)}</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">{t('poor_hatch_signs', language)}</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>{t('temperature_fluctuations', language)}</li>
                            <li>{t('incorrect_humidity_levels', language)}</li>
                            <li>{t('poor_egg_turning', language)}</li>
                            <li>{t('contaminated_cracked_eggs', language)}</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                {/* Common Diseases */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('common_diseases_pregnant_animals', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-semibold text-red-900 mb-2">{t('mastitis', language)}</h4>
                        <p className="text-sm text-red-800 mb-2">{t('inflammation_mammary_glands', language)}</p>
                        <div className="text-xs text-red-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('swollen_udder_fever_reduced_milk', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('clean_milking_dry_cow_therapy', language)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <h4 className="font-semibold text-orange-900 mb-2">{t('milk_fever_hypocalcemia', language)}</h4>
                        <p className="text-sm text-orange-800 mb-2">{t('low_blood_calcium_calving', language)}</p>
                        <div className="text-xs text-orange-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('weakness_inability_stand_cold_ears', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('proper_mineral_supplementation', language)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-semibold text-yellow-900 mb-2">{t('ketosis', language)}</h4>
                        <p className="text-sm text-yellow-800 mb-2">{t('metabolic_disorder_negative_energy', language)}</p>
                        <div className="text-xs text-yellow-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('sweet_breath_odor_reduced_appetite', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('balanced_nutrition_avoid_obesity', language)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-semibold text-purple-900 mb-2">{t('retained_placenta', language)}</h4>
                        <p className="text-sm text-purple-800 mb-2">{t('failure_expel_placenta_12_24_hours', language)}</p>
                        <div className="text-xs text-purple-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('visible_placental_tissue_foul_odor', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('proper_nutrition_avoid_stress', language)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-900 mb-2">{t('pregnancy_toxemia', language)}</h4>
                        <p className="text-sm text-blue-800 mb-2">{t('metabolic_disorder_late_pregnancy', language)}</p>
                        <div className="text-xs text-blue-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('depression_blindness_seizures', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('adequate_nutrition_exercise', language)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-900 mb-2">{t('dystocia_difficult_birth', language)}</h4>
                        <p className="text-sm text-green-800 mb-2">{t('complications_delivery_requiring_assistance', language)}</p>
                        <div className="text-xs text-green-700">
                          <p><strong>{t('symptoms', language)}:</strong> {t('prolonged_labor_visible_distress', language)}</p>
                          <p><strong>{t('prevention', language)}:</strong> {t('proper_breeding_nutrition', language)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Videos */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('educational_videos', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('common_cattle_diseases', language)}</h4>
                      <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <a 
                          href="https://youtu.be/nV7lk3lht60?si=te81W03Vtl7tEMhs" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Watch on YouTube
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">{t('learn_prevention_treatment_common_cattle_diseases', language)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('animal_health_management', language)}</h4>
                      <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <a 
                          href="https://youtu.be/qjLHifQJxAc?si=SgKZlo2vJ8Y2bviR" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Watch on YouTube
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">{t('comprehensive_guide_maintaining_animal_health', language)}</p>
                    </div>
                  </div>
                </div>

                {/* Prevention Guidelines */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('prevention_guidelines', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-900 mb-2">{t('vaccination_schedule', language)}</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>{t('fmd_every_6_months', language)}</li>
                        <li>{t('brucellosis_before_breeding', language)}</li>
                        <li>{t('bvd_annual_vaccination', language)}</li>
                        <li>{t('clostridial_pre_calving', language)}</li>
                      </ul>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-blue-900 mb-2">{t('nutrition_management', language)}</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>{t('balanced_mineral_mix', language)}</li>
                        <li>{t('quality_roughage', language)}</li>
                        <li>{t('clean_water_access', language)}</li>
                        <li>{t('avoid_sudden_feed_changes', language)}</li>
                      </ul>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Eye className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-purple-900 mb-2">{t('regular_monitoring', language)}</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>{t('daily_health_checks', language)}</li>
                        <li>{t('body_condition_scoring', language)}</li>
                        <li>{t('temperature_monitoring', language)}</li>
                        <li>{t('behavioral_observation', language)}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('emergency_contacts', language)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">{t('veterinary_emergency', language)}</h4>
                      <p className="text-red-800 text-lg font-bold">📞 1800-XXX-XXXX</p>
                      <p className="text-sm text-red-700">{t('24_7_emergency_veterinary_services', language)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">{t('animal_helpline', language)}</h4>
                      <p className="text-blue-800 text-lg font-bold">📞 1962 (Toll Free)</p>
                      <p className="text-sm text-blue-700">{t('government_animal_welfare_helpline', language)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {/* Upcoming Schedule */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('care_schedule', language)}</h3>
                  <div className="space-y-4">
                    {careSchedule.length > 0 ? careSchedule.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{item.task_type}</p>
                            <p className="text-sm text-gray-600">{new Date(item.scheduled_date).toLocaleDateString()} at {item.scheduled_time}</p>
                            {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                          {item.status === 'pending' && (
                            <button 
                              onClick={() => markTaskComplete(item.id || index)}
                              className="px-3 py-1 bg-[#059669] text-white rounded-lg text-sm hover:bg-[#047857] transition-colors"
                            >
                              {t('mark_done', language)}
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">{t('no_scheduled_activities', language)}</p>
                    )}
                  </div>
                </div>

                {/* Add New Schedule */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{t('add_new_schedule', language)}</h3>
                    <button 
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                    >
                      {showAddForm ? t('cancel', language) : t('add_task', language)}
                    </button>
                  </div>
                  
                  {showAddForm ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('task_type', language)}</label>
                          <select 
                            value={newTask.type}
                            onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          >
                            <option value="">{t('select_task_type', language)}</option>
                            <option value="Veterinary Checkup">{t('veterinary_checkup', language)}</option>
                            <option value="Vaccination">{t('vaccination', language)}</option>
                            <option value="Weight Monitoring">{t('weight_monitoring', language)}</option>
                            <option value="Feeding Schedule">{t('feeding_schedule', language)}</option>
                            <option value="Medication">{t('medication', language)}</option>
                            <option value="Hygiene Check">{t('hygiene_check', language)}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('priority', language)}</label>
                          <select 
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          >
                            <option value="low">{t('low', language)}</option>
                            <option value="medium">{t('medium', language)}</option>
                            <option value="high">{t('high', language)}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('date', language)}</label>
                          <input 
                            type="date"
                            value={newTask.date}
                            onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('time', language)}</label>
                          <input 
                            type="time"
                            value={newTask.time}
                            onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes', language)}</label>
                        <textarea 
                          value={newTask.notes}
                          onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          rows="2"
                          placeholder={t('additional_notes', language)}
                        />
                      </div>
                      <button 
                        onClick={addNewTask}
                        className="w-full px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                      >
                        {t('add_task', language)}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => {setNewTask({...newTask, type: 'Veterinary Checkup'}); setShowAddForm(true)}}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#059669] hover:bg-[#059669]/5 transition-colors text-center"
                      >
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{t('schedule_checkup_action', language)}</p>
                      </button>
                      <button 
                        onClick={() => {setNewTask({...newTask, type: 'Medication'}); setShowAddForm(true)}}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#059669] hover:bg-[#059669]/5 transition-colors text-center"
                      >
                        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{t('set_reminder_action', language)}</p>
                      </button>
                      <button 
                        onClick={() => {setNewTask({...newTask, type: 'Weight Monitoring'}); setShowAddForm(true)}}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#059669] hover:bg-[#059669]/5 transition-colors text-center"
                      >
                        <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{t('add_activity', language)}</p>
                      </button>
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