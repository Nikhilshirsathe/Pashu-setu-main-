const API_BASE_URL = 'https://pashu-setu-backend.onrender.com/api'

export const apiService = {
  // Animals
  getAnimals: () => fetch(`${API_BASE_URL}/animals`).then(res => res.json()),
  createAnimal: (data) => fetch(`${API_BASE_URL}/animals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // Health Records
  getHealthRecords: (animalId) => fetch(`${API_BASE_URL}/health-records/${animalId}`).then(res => res.json()),
  createHealthRecord: (data) => fetch(`${API_BASE_URL}/health-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // Consultations
  requestConsultation: (data) => fetch(`${API_BASE_URL}/consultations/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  getAvailableVets: () => fetch(`${API_BASE_URL}/consultations/available-vets`).then(res => res.json()),

  // Pharmacy
  getMedicines: () => fetch(`${API_BASE_URL}/pharmacy/medicines`).then(res => res.json()),
  placeOrder: (data) => fetch(`${API_BASE_URL}/pharmacy/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // AI Health Analytics
  analyzeHealth: (data) => fetch(`${API_BASE_URL}/health/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
}