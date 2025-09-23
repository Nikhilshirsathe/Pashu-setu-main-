// Smart Features Service
export const languages = {
  en: {
    selectAnimal: 'Select Animal Type',
    symptoms: 'Choose Symptoms',
    analyzing: 'Analyzing symptoms...',
    results: 'Analysis Results',
    emergency: 'Emergency Contact'
  },
  hi: {
    selectAnimal: 'पशु का प्रकार चुनें',
    symptoms: 'लक्षण चुनें',
    analyzing: 'लक्षणों का विश्लेषण...',
    results: 'विश्लेषण परिणाम',
    emergency: 'आपातकालीन संपर्क'
  }
}

export const emergencyContacts = [
  { name: 'Veterinary Emergency Helpline', number: '1800-XXX-XXXX', available: '24/7' },
  { name: 'Animal Disease Control', number: '1800-XXX-YYYY', available: 'Business Hours' },
  { name: 'Local Veterinarian', number: 'Add Your Vet', available: 'Custom' }
]

// Offline Storage
export function saveOfflineData(data) {
  localStorage.setItem('diseaseAnalyzer_offline', JSON.stringify({
    ...data,
    timestamp: Date.now(),
    synced: false
  }))
}

export function getOfflineData() {
  const data = localStorage.getItem('diseaseAnalyzer_offline')
  return data ? JSON.parse(data) : null
}

// Voice Narration
export function speakText(text, language = 'en') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
}