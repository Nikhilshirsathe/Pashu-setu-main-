// Lab Integration Service
export const labTests = {
  pig: {
    'African Swine Fever': ['PCR Test', 'Antigen ELISA', 'Blood Smear'],
    'Swine Flu': ['RT-PCR', 'Viral Culture', 'Complete Blood Count'],
    'Foot and Mouth Disease': ['RT-PCR', 'Virus Isolation', 'Serology']
  },
  chicken: {
    'Avian Influenza': ['RT-PCR', 'Antigen Detection', 'Serology'],
    'Newcastle Disease': ['RT-PCR', 'Virus Isolation', 'HI Test'],
    'Infectious Bronchitis': ['RT-PCR', 'Serology', 'Tracheal Swab']
  },
  cow: {
    'Mastitis': ['Milk Culture', 'Somatic Cell Count', 'CMT Test'],
    'Foot and Mouth Disease': ['RT-PCR', 'Antigen ELISA', 'Serology'],
    'Bovine Tuberculosis': ['Tuberculin Test', 'Gamma Interferon', 'PCR']
  }
}

export const sampleCollection = {
  'Blood Sample': {
    instructions: 'Clean injection site, use sterile needle, collect 5-10ml in EDTA tube',
    storage: 'Refrigerate at 2-8°C, transport within 24 hours',
    cost: '$15-25'
  },
  'Nasal Swab': {
    instructions: 'Insert sterile swab 2-3cm into nostril, rotate gently, place in viral transport medium',
    storage: 'Keep cool, transport within 4 hours',
    cost: '$10-15'
  },
  'Milk Sample': {
    instructions: 'Clean udder, discard first streams, collect mid-stream in sterile container',
    storage: 'Refrigerate immediately, test within 12 hours',
    cost: '$8-12'
  }
}

export function getRecommendedTests(disease, animal) {
  return labTests[animal]?.[disease] || ['Complete Blood Count', 'Basic Metabolic Panel']
}

export function generateLabReport(results) {
  return {
    id: `LAB-${Date.now()}`,
    date: new Date().toISOString(),
    tests: results,
    recommendations: generateTestRecommendations(results),
    followUp: calculateFollowUpDate(results)
  }
}