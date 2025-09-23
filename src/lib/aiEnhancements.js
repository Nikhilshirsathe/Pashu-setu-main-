// AI Enhancements Service
export function predictDiseaseProgression(currentSymptoms, duration, severity) {
  const progressionRisk = {
    'Mild': { progression: 'Stable', timeframe: '3-7 days', risk: 'Low' },
    'Moderate': { progression: 'May worsen', timeframe: '1-3 days', risk: 'Medium' },
    'Severe': { progression: 'Likely to worsen', timeframe: '12-24 hours', risk: 'High' }
  }
  
  return progressionRisk[severity] || progressionRisk['Moderate']
}

export function generateTreatmentPlan(disease, animal, symptoms) {
  const treatments = {
    immediate: [
      'Isolate affected animal',
      'Monitor vital signs every 2 hours',
      'Ensure adequate hydration'
    ],
    medication: [
      'Consult veterinarian for prescription',
      'Follow dosage instructions carefully',
      'Monitor for side effects'
    ],
    followUp: [
      'Schedule vet visit within 24-48 hours',
      'Document symptom changes',
      'Prepare for potential lab tests'
    ]
  }
  
  return treatments
}

export const drugInteractions = {
  'Antibiotics': {
    contraindications: ['Certain vaccines', 'Probiotics'],
    sideEffects: ['Digestive upset', 'Allergic reactions'],
    monitoring: 'Check liver function if long-term use'
  },
  'Anti-inflammatory': {
    contraindications: ['Blood thinners', 'Kidney disease'],
    sideEffects: ['Stomach irritation', 'Kidney stress'],
    monitoring: 'Monitor kidney function'
  }
}

export function checkDrugInteractions(medications) {
  const interactions = []
  medications.forEach(med => {
    if (drugInteractions[med]) {
      interactions.push({
        drug: med,
        ...drugInteractions[med]
      })
    }
  })
  return interactions
}

export function generateFollowUpReminders(disease, treatment) {
  const reminders = [
    { time: '6 hours', action: 'Check temperature and appetite' },
    { time: '24 hours', action: 'Assess symptom improvement' },
    { time: '3 days', action: 'Veterinary follow-up if no improvement' },
    { time: '1 week', action: 'Complete recovery assessment' }
  ]
  
  return reminders.map(reminder => ({
    ...reminder,
    dueDate: new Date(Date.now() + parseTimeToMs(reminder.time))
  }))
}

function parseTimeToMs(timeStr) {
  const [num, unit] = timeStr.split(' ')
  const multipliers = { hours: 3600000, days: 86400000, weeks: 604800000 }
  return parseInt(num) * (multipliers[unit] || 3600000)
}