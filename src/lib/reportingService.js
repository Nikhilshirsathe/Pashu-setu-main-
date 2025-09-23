// Reporting & Tracking Service
export function generateHealthReport(animalData, analysisResults, labResults = []) {
  const report = {
    id: `RPT-${Date.now()}`,
    date: new Date().toISOString(),
    animal: animalData,
    symptoms: analysisResults.symptoms,
    diagnosis: analysisResults.matches,
    recommendations: analysisResults.recommendations,
    labTests: labResults,
    treatmentPlan: analysisResults.treatmentPlan,
    followUp: analysisResults.followUp,
    veterinarian: 'To be assigned',
    nextVisit: calculateNextVisit(analysisResults.matches)
  }
  
  return report
}

export function generatePDFReport(reportData) {
  // Simplified PDF generation - in real app would use jsPDF
  const pdfContent = `
VETERINARY HEALTH REPORT
========================
Date: ${new Date(reportData.date).toLocaleDateString()}
Report ID: ${reportData.id}

ANIMAL INFORMATION
------------------
Name: ${reportData.animal.name}
Species: ${reportData.animal.species}
Age: ${reportData.animal.age} years

SYMPTOMS OBSERVED
-----------------
${reportData.symptoms.join(', ')}

DIAGNOSIS
---------
${reportData.diagnosis.map(d => `${d.disease} (${d.confidence}% confidence)`).join('\n')}

RECOMMENDATIONS
---------------
${reportData.recommendations.join('\n')}

TREATMENT PLAN
--------------
${reportData.treatmentPlan ? reportData.treatmentPlan.immediate.join('\n') : 'Consult veterinarian'}

Next Visit: ${reportData.nextVisit}
  `
  
  return pdfContent
}

export const vaccinationSchedule = {
  pig: [
    { vaccine: 'Swine Flu', interval: 6, unit: 'months' },
    { vaccine: 'FMD', interval: 6, unit: 'months' },
    { vaccine: 'Classical Swine Fever', interval: 12, unit: 'months' }
  ],
  chicken: [
    { vaccine: 'Newcastle Disease', interval: 3, unit: 'months' },
    { vaccine: 'Infectious Bronchitis', interval: 4, unit: 'months' },
    { vaccine: 'Avian Influenza', interval: 6, unit: 'months' }
  ],
  cow: [
    { vaccine: 'FMD', interval: 6, unit: 'months' },
    { vaccine: 'Brucellosis', interval: 12, unit: 'months' },
    { vaccine: 'Anthrax', interval: 12, unit: 'months' }
  ]
}

export function getVaccinationReminders(animal, lastVaccinations = {}) {
  const schedule = vaccinationSchedule[animal.species.toLowerCase()] || []
  const reminders = []
  
  schedule.forEach(vac => {
    const lastDate = lastVaccinations[vac.vaccine]
    const nextDue = lastDate 
      ? addTime(new Date(lastDate), vac.interval, vac.unit)
      : new Date() // Due now if never vaccinated
    
    reminders.push({
      vaccine: vac.vaccine,
      dueDate: nextDue,
      overdue: nextDue < new Date(),
      daysUntil: Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24))
    })
  })
  
  return reminders.sort((a, b) => a.dueDate - b.dueDate)
}

export function estimateTreatmentCost(disease, treatments, labTests = []) {
  const baseCosts = {
    'Consultation': 50,
    'Antibiotics': 25,
    'Anti-inflammatory': 15,
    'Supportive Care': 30
  }
  
  const labCosts = {
    'PCR Test': 75,
    'Blood Count': 25,
    'Serology': 40,
    'Culture': 35
  }
  
  let totalCost = baseCosts['Consultation']
  
  treatments.forEach(treatment => {
    totalCost += baseCosts[treatment] || 20
  })
  
  labTests.forEach(test => {
    totalCost += labCosts[test] || 30
  })
  
  return {
    breakdown: { consultation: 50, treatments: totalCost - 50, labs: labTests.length * 35 },
    total: totalCost,
    currency: 'USD',
    estimate: true
  }
}

function addTime(date, amount, unit) {
  const newDate = new Date(date)
  if (unit === 'months') {
    newDate.setMonth(newDate.getMonth() + amount)
  } else if (unit === 'days') {
    newDate.setDate(newDate.getDate() + amount)
  }
  return newDate
}

function calculateNextVisit(diagnoses) {
  if (diagnoses.some(d => d.severity === 'Critical')) return 'Within 24 hours'
  if (diagnoses.some(d => d.severity === 'High')) return 'Within 2-3 days'
  return 'Within 1 week'
}