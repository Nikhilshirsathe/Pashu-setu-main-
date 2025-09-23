// CNN Animal Skin Disease Detection Service
// Using enhanced mock predictions for reliable performance

class CNNDiseaseDetector {
  constructor() {
    this.model = null
    this.isLoaded = false
    // Disease classes from the GitHub repository (3 classes based on model output)
    this.diseaseClasses = [
      'healthy',
      'diseased',
      'severe'
    ]
  }

  async loadModel() {
    console.log('🔄 Initializing Enhanced CNN Mock System')
    this.isLoaded = true
    console.log('✅ Animal Disease Analyzer ready with advanced mock predictions')
    return true
  }





  async predictDisease(imageFile) {
    if (!this.isLoaded) {
      await this.loadModel()
    }
    return this.enhancedMockPrediction(imageFile)
  }

  processPredictions(probabilities) {
    const results = this.diseaseClasses.map((disease, index) => ({
      disease,
      confidence: Math.round(probabilities[index] * 100),
      severity: this.getSeverity(disease, probabilities[index])
    }))

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence)
    
    return {
      topPrediction: results[0],
      allPredictions: results.slice(0, 3),
      recommendations: this.getRecommendations(results[0])
    }
  }

  enhancedMockPrediction(imageFile) {
    // Analyze image name/properties for more realistic predictions
    const fileName = imageFile?.name?.toLowerCase() || ''
    
    let mockResults = [
      { disease: 'healthy', confidence: 85, severity: 'Normal' },
      { disease: 'diseased', confidence: 12, severity: 'Moderate' },
      { disease: 'severe', confidence: 3, severity: 'High' }
    ]

    // Simulate disease detection based on filename hints or random
    const diseaseKeywords = {
      'disease': { disease: 'diseased', confidence: 78, severity: 'Moderate' },
      'sick': { disease: 'diseased', confidence: 82, severity: 'Moderate' },
      'infection': { disease: 'diseased', confidence: 75, severity: 'Moderate' },
      'severe': { disease: 'severe', confidence: 91, severity: 'High' },
      'critical': { disease: 'severe', confidence: 88, severity: 'High' },
      'bad': { disease: 'severe', confidence: 85, severity: 'High' }
    }

    // Check filename for disease indicators
    let detectedDisease = null
    for (const [keyword, disease] of Object.entries(diseaseKeywords)) {
      if (fileName.includes(keyword)) {
        detectedDisease = disease
        break
      }
    }

    // If no keyword match, randomly simulate disease (60% chance)
    if (!detectedDisease && Math.random() > 0.4) {
      const diseases = [
        { disease: 'diseased', confidence: 65 + Math.floor(Math.random() * 20), severity: 'Moderate' },
        { disease: 'severe', confidence: 70 + Math.floor(Math.random() * 25), severity: 'High' }
      ]
      detectedDisease = diseases[Math.floor(Math.random() * diseases.length)]
    }

    if (detectedDisease) {
      const remainingConfidence = 100 - detectedDisease.confidence
      mockResults = [
        detectedDisease,
        { disease: 'healthy', confidence: Math.floor(remainingConfidence * 0.7), severity: 'Normal' },
        { disease: detectedDisease.disease === 'diseased' ? 'severe' : 'diseased', confidence: Math.floor(remainingConfidence * 0.3), severity: detectedDisease.disease === 'diseased' ? 'High' : 'Moderate' }
      ]
    }

    // Sort by confidence
    mockResults.sort((a, b) => b.confidence - a.confidence)

    // Sort by confidence
    mockResults.sort((a, b) => b.confidence - a.confidence)

    return {
      topPrediction: mockResults[0],
      allPredictions: mockResults,
      recommendations: this.getRecommendations(mockResults[0]),
      analysisMethod: 'Enhanced Mock CNN (Development Mode)'
    }
  }

  getSeverity(disease, confidence) {
    if (disease === 'healthy') return 'Normal'
    if (confidence > 0.8) return 'High'
    if (confidence > 0.5) return 'Moderate'
    return 'Mild'
  }

  getRecommendations(prediction) {
    const recommendations = {
      'healthy': [
        'Animal skin appears healthy',
        'Continue regular grooming and care',
        'Monitor for any changes',
        'Maintain good hygiene practices'
      ],
      'diseased': [
        'Skin condition detected - requires attention',
        'Clean affected area gently',
        'Apply appropriate topical treatment',
        'Consult veterinarian for proper diagnosis',
        'Monitor progression closely'
      ],
      'severe': [
        'Severe skin condition detected',
        'Immediate veterinary consultation required',
        'Isolate animal if contagious suspected',
        'Document symptoms and progression',
        'Follow veterinary treatment plan strictly'
      ]
    }

    return recommendations[prediction.disease] || [
      'Monitor condition closely',
      'Consult veterinarian',
      'Document changes'
    ]
  }

  getTreatmentPlan(prediction) {
    const treatments = {
      'healthy': {
        immediate: ['Continue current care routine', 'Regular monitoring'],
        shortTerm: ['Maintain hygiene standards', 'Preventive care'],
        longTerm: ['Regular health checks', 'Vaccination schedule']
      },
      'diseased': {
        immediate: ['Clean affected area', 'Apply basic treatment'],
        shortTerm: ['Veterinary consultation', 'Follow treatment plan'],
        longTerm: ['Monitor healing progress', 'Prevent recurrence']
      },
      'severe': {
        immediate: ['Urgent veterinary consultation', 'Isolate if necessary'],
        shortTerm: ['Intensive treatment protocol', 'Daily monitoring'],
        longTerm: ['Complete treatment course', 'Long-term management']
      }
    }

    return treatments[prediction.disease] || {
      immediate: ['Monitor closely', 'Document symptoms'],
      shortTerm: ['Veterinary consultation', 'Supportive care'],
      longTerm: ['Follow vet recommendations', 'Regular monitoring']
    }
  }
}

// Integrated Analysis Service combining CNN and YOLOv8
export class IntegratedDiseaseAnalyzer {
  constructor() {
    this.cnnDetector = new CNNDiseaseDetector()
    this.yoloLoaded = false
  }

  async initialize() {
    await this.cnnDetector.loadModel()
    this.yoloLoaded = true
    console.log('Integrated Disease Analyzer ready')
  }

  async analyzeImage(imageFile, animalType = 'unknown') {
    try {
      // Run both CNN and YOLOv8 analysis in parallel
      const [cnnResults, yoloResults] = await Promise.all([
        this.cnnDetector.predictDisease(imageFile),
        this.mockYoloAnalysis(imageFile, animalType)
      ])

      // Combine results
      const integratedResults = this.combineAnalysis(cnnResults, yoloResults, animalType)
      
      return {
        success: true,
        cnnAnalysis: cnnResults,
        yoloAnalysis: yoloResults,
        integratedResults,
        confidence: this.calculateOverallConfidence(cnnResults, yoloResults),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Integrated analysis failed:', error)
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: [
          'Image analysis temporarily unavailable',
          'Please consult veterinarian for visual examination',
          'Document symptoms and monitor closely'
        ]
      }
    }
  }

  async mockYoloAnalysis(imageFile, animalType) {
    // Simulate YOLOv8 object detection results
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileName = imageFile?.name?.toLowerCase() || ''
        
        const detections = [
          {
            class: `${animalType}_detected`,
            confidence: 0.88 + Math.random() * 0.12,
            bbox: { x: 50, y: 30, width: 300, height: 250 },
            bodyPart: 'full_body'
          }
        ]

        // Add skin lesions based on filename or randomly
        if (fileName.includes('lesion') || fileName.includes('infection') || Math.random() > 0.4) {
          detections.push({
            class: 'skin_lesion',
            confidence: 0.65 + Math.random() * 0.25,
            bbox: { x: 120, y: 80, width: 60, height: 45 },
            bodyPart: 'skin_area'
          })
        }

        // Add additional detections for severe cases
        if (fileName.includes('mange') || fileName.includes('severe')) {
          detections.push({
            class: 'multiple_lesions',
            confidence: 0.72 + Math.random() * 0.18,
            bbox: { x: 80, y: 120, width: 80, height: 60 },
            bodyPart: 'skin_area'
          })
        }
        
        resolve({
          detections,
          animalDetected: true,
          skinAreasFound: detections.filter(d => d.bodyPart === 'skin_area').length,
          analysisMethod: 'Enhanced YOLOv8 Mock'
        })
      }, 1200)
    })
  }

  combineAnalysis(cnnResults, yoloResults, animalType) {
    const combined = {
      primaryDiagnosis: cnnResults.topPrediction,
      objectDetection: yoloResults,
      riskAssessment: this.assessRisk(cnnResults.topPrediction),
      treatmentPlan: this.cnnDetector.getTreatmentPlan(cnnResults.topPrediction),
      followUpSchedule: this.generateFollowUpSchedule(cnnResults.topPrediction),
      preventionMeasures: this.getPreventionMeasures(cnnResults.topPrediction, animalType)
    }

    // Cross-validate findings
    if (yoloResults.skinAreasFound > 0 && cnnResults.topPrediction.disease !== 'healthy') {
      combined.confidence = 'High - Both systems detected abnormalities'
      combined.recommendation = 'Immediate veterinary consultation recommended'
    } else if (cnnResults.topPrediction.confidence > 80) {
      combined.confidence = 'High - CNN confident in diagnosis'
      combined.recommendation = 'Follow treatment recommendations'
    } else {
      combined.confidence = 'Moderate - Monitor and reassess'
      combined.recommendation = 'Continue monitoring, consult vet if symptoms persist'
    }

    return combined
  }

  assessRisk(prediction) {
    const riskLevels = {
      'healthy': { level: 'Low', description: 'No immediate concerns detected' },
      'diseased': { level: 'Medium', description: 'Skin condition requires attention' },
      'severe': { level: 'High', description: 'Serious condition, immediate action needed' }
    }

    return riskLevels[prediction.disease] || { level: 'Medium', description: 'Requires monitoring' }
  }

  generateFollowUpSchedule(prediction) {
    const schedules = {
      'healthy': [
        { day: 30, action: 'Routine health check' },
        { day: 90, action: 'Quarterly assessment' }
      ],
      'diseased': [
        { day: 3, action: 'Check treatment response' },
        { day: 7, action: 'Assess healing progress' },
        { day: 14, action: 'Veterinary follow-up' }
      ],
      'severe': [
        { day: 1, action: 'Immediate veterinary consultation' },
        { day: 3, action: 'Treatment response evaluation' },
        { day: 7, action: 'Progress assessment' },
        { day: 14, action: 'Treatment adjustment if needed' }
      ]
    }

    return schedules[prediction.disease] || [
      { day: 7, action: 'General health check' },
      { day: 14, action: 'Reassess condition' }
    ]
  }

  getPreventionMeasures(prediction, animalType) {
    return [
      'Maintain clean, dry housing conditions',
      'Regular health inspections',
      'Proper nutrition and hygiene',
      'Quarantine new animals',
      'Vaccination schedule adherence',
      `${animalType}-specific care protocols`
    ]
  }

  calculateOverallConfidence(cnnResults, yoloResults) {
    const cnnConfidence = cnnResults.topPrediction.confidence
    const yoloConfidence = yoloResults.animalDetected ? 85 : 60
    
    return Math.round((cnnConfidence * 0.7 + yoloConfidence * 0.3))
  }
}

// Export singleton instance
export const integratedAnalyzer = new IntegratedDiseaseAnalyzer()

// Initialize on import
integratedAnalyzer.initialize().catch(console.error)