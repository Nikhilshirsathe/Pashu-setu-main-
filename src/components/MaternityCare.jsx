import { useState, useEffect } from 'react'
import { Baby, Calendar, Heart, Milk, Plus, Save, X, Bell, Check, AlertTriangle, Clock, Home, Eye, Thermometer, Utensils } from 'lucide-react'

export default function MaternityCase() {
  const [maternityRecords, setMaternityRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    animalName: '',
    species: '',
    breedingDate: '',
    expectedDelivery: '',
    gestationPeriod: '',
    actualDelivery: '',
    litterSize: '',
    colostrumGiven: null,
    notes: ''
  })
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('maternityRecords')
    if (saved) {
      setMaternityRecords(JSON.parse(saved))
    }
    checkColostrumReminders()
  }, [])

  useEffect(() => {
    const interval = setInterval(checkColostrumReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [maternityRecords])

  const saveToStorage = (records) => {
    localStorage.setItem('maternityRecords', JSON.stringify(records))
  }

  const speciesData = {
    'cattle': { gestationDays: 280, avgLitterSize: 1 },
    'goat': { gestationDays: 150, avgLitterSize: 2 },
    'sheep': { gestationDays: 147, avgLitterSize: 2 },
    'pig': { gestationDays: 114, avgLitterSize: 8 },
    'horse': { gestationDays: 340, avgLitterSize: 1 },
    'buffalo': { gestationDays: 310, avgLitterSize: 1 },
    'chicken': { gestationDays: 21, avgLitterSize: 12 },
    'duck': { gestationDays: 28, avgLitterSize: 10 }
  }

  const calculateGestation = (breedingDate, species) => {
    if (!breedingDate || !species) return { expectedDelivery: '', gestationPeriod: '' }
    const breeding = new Date(breedingDate)
    const data = speciesData[species.toLowerCase()]
    if (!data) return { expectedDelivery: '', gestationPeriod: '' }
    
    const expected = new Date(breeding)
    expected.setDate(expected.getDate() + data.gestationDays)
    
    return {
      expectedDelivery: expected.toISOString().split('T')[0],
      gestationPeriod: `${data.gestationDays} days`
    }
  }

  const checkColostrumReminders = () => {
    const now = new Date()
    const newNotifications = []
    
    maternityRecords.forEach(record => {
      if (record.actualDelivery && record.colostrumGiven === null) {
        const deliveryDate = new Date(record.actualDelivery)
        const hoursSinceDelivery = (now - deliveryDate) / (1000 * 60 * 60)
        
        if (hoursSinceDelivery <= 24 && hoursSinceDelivery >= 0) {
          newNotifications.push({
            id: record.id,
            animalName: record.animalName,
            hoursSinceDelivery: Math.floor(hoursSinceDelivery),
            urgent: hoursSinceDelivery > 6
          })
        }
      }
    })
    
    setNotifications(newNotifications)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { expectedDelivery, gestationPeriod } = calculateGestation(formData.breedingDate, formData.species)
    const avgLitterSize = speciesData[formData.species.toLowerCase()]?.avgLitterSize || 1
    
    const newRecord = {
      id: Date.now(),
      ...formData,
      expectedDelivery,
      gestationPeriod,
      litterSize: formData.litterSize || avgLitterSize,
      createdAt: new Date().toISOString()
    }
    const updated = [newRecord, ...maternityRecords]
    setMaternityRecords(updated)
    saveToStorage(updated)
    setFormData({
      animalName: '',
      species: '',
      breedingDate: '',
      expectedDelivery: '',
      gestationPeriod: '',
      actualDelivery: '',
      litterSize: '',
      colostrumGiven: null,
      notes: ''
    })
    setShowForm(false)
  }

  const updateRecord = (id, field, value) => {
    const updated = maternityRecords.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    )
    setMaternityRecords(updated)
    saveToStorage(updated)
    if (field === 'actualDelivery') {
      setTimeout(checkColostrumReminders, 100)
    }
  }

  const handleColostrumConfirmation = (recordId, given) => {
    updateRecord(recordId, 'colostrumGiven', given)
    setNotifications(prev => prev.filter(n => n.id !== recordId))
  }

  const handleSpeciesChange = (species) => {
    const { expectedDelivery, gestationPeriod } = calculateGestation(formData.breedingDate, species)
    const avgLitterSize = speciesData[species.toLowerCase()]?.avgLitterSize || 1
    
    setFormData({
      ...formData,
      species,
      expectedDelivery,
      gestationPeriod,
      litterSize: avgLitterSize
    })
  }

  const handleBreedingDateChange = (breedingDate) => {
    const { expectedDelivery, gestationPeriod } = calculateGestation(breedingDate, formData.species)
    
    setFormData({
      ...formData,
      breedingDate,
      expectedDelivery,
      gestationPeriod
    })
  }

  const deleteRecord = (id) => {
    const updated = maternityRecords.filter(record => record.id !== id)
    setMaternityRecords(updated)
    saveToStorage(updated)
  }

  const getDaysRemaining = (expectedDate) => {
    if (!expectedDate) return null
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getCountdownDisplay = (expectedDate) => {
    if (!expectedDate) return null
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), status: 'overdue', text: 'Days Overdue' }
    } else if (diffDays === 0) {
      return { days: 0, status: 'today', text: 'Due Today!' }
    } else if (diffDays <= 7) {
      return { days: diffDays, status: 'soon', text: 'Days Until Delivery' }
    } else {
      return { days: diffDays, status: 'normal', text: 'Days Until Delivery' }
    }
  }

  const careGuidanceCards = [
    {
      icon: Home,
      title: 'Clean Environment',
      description: 'Prepare a clean, dry, and quiet birthing area',
      tips: ['Fresh bedding', 'Good ventilation', 'Easy access to water'],
      color: 'blue'
    },
    {
      icon: Eye,
      title: 'Signs of Labor',
      description: 'Watch for restlessness, nesting, and contractions',
      tips: ['Isolation behavior', 'Mucus discharge', 'Frequent lying down'],
      color: 'purple'
    },
    {
      icon: Thermometer,
      title: 'Warming Newborns',
      description: 'Keep newborns warm and dry immediately after birth',
      tips: ['Towel dry quickly', 'Heat lamps if cold', 'Check breathing'],
      color: 'orange'
    },
    {
      icon: Utensils,
      title: 'Feed the Mother',
      description: 'Provide extra nutrition during pregnancy and nursing',
      tips: ['High-quality feed', 'Fresh water always', 'Calcium supplements'],
      color: 'green'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Colostrum Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
              notification.urgent ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.urgent ? 
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" /> :
                    <Bell className="w-5 h-5 text-yellow-600 mr-2" />
                  }
                  <div>
                    <p className={`font-medium ${
                      notification.urgent ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      Colostrum Reminder: {notification.animalName}
                    </p>
                    <p className={`text-sm ${
                      notification.urgent ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {notification.hoursSinceDelivery} hours since delivery
                      {notification.urgent && ' - URGENT: Critical window closing!'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleColostrumConfirmation(notification.id, true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Given
                  </button>
                  <button
                    onClick={() => handleColostrumConfirmation(notification.id, false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Not Given
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Baby className="w-6 h-6 mr-2 text-pink-600" />
            Maternity Care Tracking
          </h2>
          <p className="text-gray-600">Automated pregnancy tracking with smart reminders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </button>
      </div>

      {/* Add New Record Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">New Maternity Record</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animal Name</label>
              <input
                type="text"
                value={formData.animalName}
                onChange={(e) => setFormData({...formData, animalName: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <select
                value={formData.species}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select Species</option>
                <option value="cattle">Cattle (280 days)</option>
                <option value="goat">Goat (150 days)</option>
                <option value="sheep">Sheep (147 days)</option>
                <option value="pig">Pig (114 days)</option>
                <option value="horse">Horse (340 days)</option>
                <option value="buffalo">Buffalo (310 days)</option>
                <option value="chicken">Chicken (21 days)</option>
                <option value="duck">Duck (28 days)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breeding/Incubation Date</label>
              <input
                type="date"
                value={formData.breedingDate}
                onChange={(e) => handleBreedingDateChange(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            {formData.expectedDelivery && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery/Hatch Date</label>
                <input
                  type="date"
                  value={formData.expectedDelivery}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated: {formData.gestationPeriod}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Litter Size</label>
              <input
                type="number"
                value={formData.litterSize}
                onChange={(e) => setFormData({...formData, litterSize: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                min="0"
                placeholder={formData.species ? `Average: ${speciesData[formData.species.toLowerCase()]?.avgLitterSize || 1}` : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
              <input
                type="date"
                value={formData.actualDelivery}
                onChange={(e) => setFormData({...formData, actualDelivery: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                rows="2"
                placeholder="Additional notes..."
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Record
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Care Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {careGuidanceCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className={`bg-gradient-to-br from-${card.color}-50 to-${card.color}-100 rounded-2xl p-6 border-2 border-${card.color}-200 hover:shadow-lg transition-all`}>
              <div className={`w-12 h-12 bg-${card.color}-500 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-lg font-bold text-${card.color}-800 mb-2`}>{card.title}</h3>
              <p className={`text-sm text-${card.color}-700 mb-3`}>{card.description}</p>
              <ul className="space-y-1">
                {card.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className={`text-xs text-${card.color}-600 flex items-center`}>
                    <span className={`w-1.5 h-1.5 bg-${card.color}-400 rounded-full mr-2`}></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Records List */}
      <div className="space-y-6">
        {maternityRecords.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
            <Baby className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-pink-800 mb-2">No maternity records yet</h3>
            <p className="text-pink-600">Add your first record to start tracking and get care guidance</p>
          </div>
        ) : (
          maternityRecords.map((record) => {
            const countdown = getCountdownDisplay(record.expectedDelivery)
            const speciesInfo = speciesData[record.species?.toLowerCase()]
            
            return (
              <div key={record.id} className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{record.animalName}</h3>
                    <p className="text-lg text-gray-600 capitalize">{record.species}</p>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Large Countdown Timer */}
                  <div className={`col-span-1 lg:col-span-1 p-6 rounded-2xl text-center ${
                    countdown?.status === 'overdue' ? 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300' :
                    countdown?.status === 'today' ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300' :
                    countdown?.status === 'soon' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300' :
                    'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300'
                  }`}>
                    <Clock className={`w-8 h-8 mx-auto mb-3 ${
                      countdown?.status === 'overdue' ? 'text-red-600' :
                      countdown?.status === 'today' ? 'text-orange-600' :
                      countdown?.status === 'soon' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div className={`text-4xl font-bold mb-2 ${
                      countdown?.status === 'overdue' ? 'text-red-700' :
                      countdown?.status === 'today' ? 'text-orange-700' :
                      countdown?.status === 'soon' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {countdown?.days || 0}
                    </div>
                    <p className={`text-sm font-medium ${
                      countdown?.status === 'overdue' ? 'text-red-600' :
                      countdown?.status === 'today' ? 'text-orange-600' :
                      countdown?.status === 'soon' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {countdown?.text || 'Days Until Delivery'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Expected: {new Date(record.expectedDelivery).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Litter Size Card */}
                  <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 p-6 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <Heart className="w-6 h-6 text-green-600 mr-3" />
                      <span className="text-lg font-bold text-green-800">Expected Litter</span>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {speciesInfo?.avgLitterSize || 1}
                      </div>
                      <p className="text-sm text-green-600 font-medium mb-3">Average for {record.species}</p>
                      <input
                        type="number"
                        value={record.litterSize || ''}
                        onChange={(e) => updateRecord(record.id, 'litterSize', e.target.value)}
                        className="w-full p-2 text-center border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                        placeholder="Actual count"
                        min="0"
                      />
                      <p className="text-xs text-green-600 mt-1">Update after delivery</p>
                    </div>
                  </div>

                  {/* Colostrum Reminder Card */}
                  <div className={`p-6 rounded-2xl ${
                    record.actualDelivery && record.colostrumGiven === null ? 
                    'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300' :
                    record.colostrumGiven === true ?
                    'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300' :
                    record.colostrumGiven === false ?
                    'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300' :
                    'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300'
                  }`}>
                    <div className="flex items-center mb-4">
                      <Milk className={`w-6 h-6 mr-3 ${
                        record.actualDelivery && record.colostrumGiven === null ? 'text-red-600' :
                        record.colostrumGiven === true ? 'text-green-600' :
                        record.colostrumGiven === false ? 'text-gray-600' :
                        'text-yellow-600'
                      }`} />
                      <span className={`text-lg font-bold ${
                        record.actualDelivery && record.colostrumGiven === null ? 'text-red-800' :
                        record.colostrumGiven === true ? 'text-green-800' :
                        record.colostrumGiven === false ? 'text-gray-800' :
                        'text-yellow-800'
                      }`}>Colostrum Care</span>
                    </div>
                    <div className="text-center">
                      {record.actualDelivery ? (
                        record.colostrumGiven === null ? (
                          <div>
                            <p className="text-2xl font-bold text-red-700 mb-2">⚠️ URGENT</p>
                            <p className="text-sm text-red-600 font-medium mb-4">Give colostrum within 24 hours</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => handleColostrumConfirmation(record.id, true)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium"
                              >
                                ✅ Given
                              </button>
                              <button
                                onClick={() => handleColostrumConfirmation(record.id, false)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium"
                              >
                                ❌ Not Given
                              </button>
                            </div>
                          </div>
                        ) : record.colostrumGiven ? (
                          <div>
                            <p className="text-3xl mb-2">✅</p>
                            <p className="text-lg font-bold text-green-700">Colostrum Given</p>
                            <p className="text-sm text-green-600">Great job! Immunity protected</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl mb-2">❌</p>
                            <p className="text-lg font-bold text-gray-700">Not Given</p>
                            <p className="text-sm text-gray-600">Consider vet consultation</p>
                          </div>
                        )
                      ) : (
                        <div>
                          <p className="text-3xl mb-2">⏳</p>
                          <p className="text-lg font-bold text-yellow-700">Waiting for Birth</p>
                          <p className="text-sm text-yellow-600">Reminder will activate after delivery</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Date Input */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Delivery Date (update when delivered)</label>
                  <input
                    type="date"
                    value={record.actualDelivery || ''}
                    onChange={(e) => updateRecord(record.id, 'actualDelivery', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {record.notes && (
                  <div className="bg-blue-50 p-4 rounded-xl mt-4">
                    <h4 className="font-medium text-blue-800 mb-2">Notes:</h4>
                    <p className="text-sm text-blue-700">{record.notes}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}