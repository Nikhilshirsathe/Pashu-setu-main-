// Simplified Disease Detection Service
class DiseaseDetector {
  constructor() {
    this.isLoaded = false
  }

  async loadModel() {
    // Simplified - always use mock for now
    this.isLoaded = true
    console.log('Disease detector ready (mock mode)')
  }

  async detectDiseases(imageFile) {
    return this.mockDetection(imageFile)
  }



  // Mock detection for development/fallback
  mockDetection(imageFile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate realistic animal health analysis
        const animalTypes = ['cow', 'pig', 'chicken', 'goat', 'sheep']
        const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)]
        
        const mockDetections = [
          {
            class: `${randomAnimal}_detected`,
            confidence: 85 + Math.floor(Math.random() * 15),
            bbox: { x: 100, y: 80, width: 200, height: 150 },
            severity: 'Normal',
            recommendations: [`${randomAnimal.charAt(0).toUpperCase() + randomAnimal.slice(1)} detected and appears healthy`, 'Continue regular monitoring', 'Maintain good nutrition']
          }
        ]
        
        // Randomly add a health issue
        if (Math.random() > 0.6) {
          const healthIssues = {
            'eye_concern': { severity: 'Mild', recommendations: ['Check for discharge', 'Clean with saline', 'Monitor closely'] },
            'skin_condition': { severity: 'Moderate', recommendations: ['Inspect affected area', 'Apply antiseptic', 'Consult veterinarian'] },
            'posture_issue': { severity: 'Moderate', recommendations: ['Check for lameness', 'Examine hooves', 'Provide comfortable bedding'] }
          }
          
          const issues = Object.keys(healthIssues)
          const randomIssue = issues[Math.floor(Math.random() * issues.length)]
          const issueData = healthIssues[randomIssue]
          
          mockDetections.push({
            class: randomIssue,
            confidence: 65 + Math.floor(Math.random() * 20),
            bbox: { x: 150, y: 120, width: 80, height: 60 },
            severity: issueData.severity,
            recommendations: issueData.recommendations
          })
        }
        
        resolve(mockDetections)
      }, 2000)
    })
  }
}

export const yoloDetector = new DiseaseDetector()

// Initialize model loading with error handling
try {
  yoloDetector.loadModel()
} catch (error) {
  console.log('Model loading will use fallback mode')
}

export async function analyzeAnimalImage(imageFile) {
  try {
    const detections = await yoloDetector.detectDiseases(imageFile)
    
    return {
      success: true,
      detections,
      summary: generateDetectionSummary(detections),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Image analysis failed:', error)
    return {
      success: false,
      error: error.message,
      detections: [],
      summary: 'Analysis failed. Please try again.'
    }
  }
}

function generateDetectionSummary(detections) {
  if (detections.length === 0) {
    return 'No significant findings detected. Animal appears healthy.'
  }
  
  const diseases = detections.filter(d => d.severity !== 'Normal')
  const healthy = detections.filter(d => d.severity === 'Normal')
  
  if (diseases.length === 0) {
    return `${healthy.length} healthy features detected. Animal appears to be in good condition.`
  }
  
  const severe = diseases.filter(d => d.severity === 'Severe').length
  const moderate = diseases.filter(d => d.severity === 'Moderate').length
  const mild = diseases.filter(d => d.severity === 'Mild').length
  
  let summary = `Detected ${diseases.length} potential health issue(s): `
  if (severe > 0) summary += `${severe} severe, `
  if (moderate > 0) summary += `${moderate} moderate, `
  if (mild > 0) summary += `${mild} mild`
  
  summary += '. Veterinary consultation recommended.'
  
  return summary
}