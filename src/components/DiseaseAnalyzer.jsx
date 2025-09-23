import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, Camera, Upload, ArrowLeft, Brain, Thermometer, Eye, Activity, FileText, Phone, Volume2, Download, Calendar } from 'lucide-react'
import { analyzeWithRAG } from '../lib/ragService'
import { getRecommendedTests, sampleCollection } from '../lib/labService'
import { languages, emergencyContacts, speakText, saveOfflineData } from '../lib/smartFeatures'
import { predictDiseaseProgression, generateTreatmentPlan, generateFollowUpReminders } from '../lib/aiEnhancements'
import { generateHealthReport, generatePDFReport, estimateTreatmentCost } from '../lib/reportingService'
import ImageAnalyzer from './ImageAnalyzer'

export default function DiseaseAnalyzer({ onBack }) {
  const [step, setStep] = useState(1)
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [severity, setSeverity] = useState('')
  const [duration, setDuration] = useState('')
  const [image, setImage] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [language, setLanguage] = useState('en')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showLabTests, setShowLabTests] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [treatmentPlan, setTreatmentPlan] = useState(null)
  const [costEstimate, setCostEstimate] = useState(null)
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false)
  const [yoloResults, setYoloResults] = useState(null)

  const animalTypes = [
    { id: 'pig', name: 'Pig', emoji: '🐷' },
    { id: 'chicken', name: 'Chicken', emoji: '🐔' },
    { id: 'cow', name: 'Cow', emoji: '🐄' },
    { id: 'goat', name: 'Goat', emoji: '🐐' },
    { id: 'sheep', name: 'Sheep', emoji: '🐑' },
    { id: 'buffalo', name: 'Buffalo', emoji: '🐃' }
  ]

  const commonSymptoms = {
    pig: ['Loss of appetite', 'Fever', 'Coughing', 'Diarrhea', 'Vomiting', 'Lethargy', 'Skin lesions', 'Difficulty breathing'],
    chicken: ['Reduced egg production', 'Respiratory distress', 'Diarrhea', 'Loss of appetite', 'Lethargy', 'Abnormal posture', 'Discharge from eyes/nose'],
    cow: ['Reduced milk production', 'Loss of appetite', 'Fever', 'Lameness', 'Coughing', 'Diarrhea', 'Bloating', 'Difficulty breathing'],
    goat: ['Loss of appetite', 'Fever', 'Coughing', 'Diarrhea', 'Lethargy', 'Nasal discharge', 'Joint swelling', 'Weight loss'],
    sheep: ['Loss of appetite', 'Fever', 'Coughing', 'Diarrhea', 'Lethargy', 'Lameness', 'Wool loss', 'Difficulty breathing'],
    buffalo: ['Reduced milk production', 'Loss of appetite', 'Fever', 'Lameness', 'Coughing', 'Diarrhea', 'Bloating', 'Skin problems']
  }

  const diseaseDatabase = {
    pig: {
      'Swine Flu': { symptoms: ['Fever', 'Coughing', 'Loss of appetite', 'Lethargy'], severity: 'High', treatment: 'Antiviral medication, supportive care' },
      'African Swine Fever': { symptoms: ['Fever', 'Loss of appetite', 'Skin lesions', 'Diarrhea'], severity: 'Critical', treatment: 'No cure - quarantine and prevention' },
      'Foot and Mouth Disease': { symptoms: ['Fever', 'Loss of appetite'], severity: 'High', treatment: 'Supportive care, vaccination' }
    },
    chicken: {
      'Avian Influenza': { symptoms: ['Respiratory distress', 'Reduced egg production', 'Lethargy'], severity: 'Critical', treatment: 'Quarantine, supportive care' },
      'Newcastle Disease': { symptoms: ['Respiratory distress', 'Diarrhea', 'Abnormal posture'], severity: 'High', treatment: 'Vaccination, supportive care' },
      'Infectious Bronchitis': { symptoms: ['Coughing', 'Respiratory distress', 'Reduced egg production'], severity: 'Medium', treatment: 'Vaccination, antibiotics' }
    },
    cow: {
      'Mastitis': { symptoms: ['Reduced milk production', 'Fever'], severity: 'Medium', treatment: 'Antibiotics, anti-inflammatory drugs' },
      'Foot and Mouth Disease': { symptoms: ['Fever', 'Lameness'], severity: 'High', treatment: 'Supportive care, vaccination' },
      'Bovine Tuberculosis': { symptoms: ['Coughing', 'Fever'], severity: 'High', treatment: 'Antibiotics, quarantine' }
    },
    goat: {
      'Pneumonia': { symptoms: ['Coughing', 'Fever', 'Difficulty breathing'], severity: 'High', treatment: 'Antibiotics, supportive care' },
      'Diarrhea': { symptoms: ['Diarrhea', 'Loss of appetite', 'Lethargy'], severity: 'Medium', treatment: 'Fluid therapy, probiotics' },
      'Joint Ill': { symptoms: ['Joint swelling', 'Lameness', 'Fever'], severity: 'Medium', treatment: 'Antibiotics, anti-inflammatory' }
    },
    sheep: {
      'Pneumonia': { symptoms: ['Coughing', 'Fever', 'Difficulty breathing'], severity: 'High', treatment: 'Antibiotics, supportive care' },
      'Foot Rot': { symptoms: ['Lameness', 'Loss of appetite'], severity: 'Medium', treatment: 'Foot trimming, antibiotics' },
      'Parasites': { symptoms: ['Weight loss', 'Diarrhea', 'Lethargy'], severity: 'Medium', treatment: 'Deworming medication' }
    },
    buffalo: {
      'Mastitis': { symptoms: ['Reduced milk production', 'Fever'], severity: 'Medium', treatment: 'Antibiotics, anti-inflammatory drugs' },
      'Foot and Mouth Disease': { symptoms: ['Fever', 'Lameness'], severity: 'High', treatment: 'Supportive care, vaccination' },
      'Skin Problems': { symptoms: ['Skin problems', 'Loss of appetite'], severity: 'Medium', treatment: 'Topical treatment, antibiotics' }
    }
  }

  const analyzeSymptoms = async () => {
    setLoading(true)
    
    try {
      // Use RAG-enhanced AI analysis
      const ragResults = await analyzeWithRAG(selectedAnimal, symptoms, severity, duration)
      
      setAnalysis({
        matches: ragResults.matches.map(match => ({
          disease: match.disease,
          confidence: match.confidence,
          severity: match.severity,
          treatment: match.treatment,
          matchedSymptoms: match.matchedSymptoms,
          mortality: match.mortality,
          contagious: match.contagious,
          prevention: match.prevention
        })),
        recommendations: ragResults.recommendations,
        analysisMethod: ragResults.analysisMethod,
        overallConfidence: ragResults.confidence
      })
      
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysis({
        matches: [],
        recommendations: [
          'Analysis temporarily unavailable',
          'Please consult a veterinarian immediately',
          'Monitor animal symptoms closely'
        ],
        analysisMethod: 'Fallback Mode'
      })
    }
    
    setLoading(false)
    setStep(4)
  }

  const toggleSymptom = (symptom) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const getSymptomDescription = (symptom) => {
    const descriptions = {
      'Loss of appetite': 'Animal refuses to eat or shows reduced interest in food',
      'Fever': 'Elevated body temperature, often accompanied by lethargy',
      'Coughing': 'Persistent coughing or respiratory sounds',
      'Diarrhea': 'Loose, watery stools or frequent bowel movements',
      'Vomiting': 'Forceful expulsion of stomach contents',
      'Lethargy': 'Unusual tiredness, lack of energy or activity',
      'Skin lesions': 'Visible wounds, rashes, or abnormal skin conditions',
      'Difficulty breathing': 'Labored breathing, wheezing, or respiratory distress',
      'Reduced egg production': 'Significant decrease in daily egg laying',
      'Respiratory distress': 'Rapid breathing, open-mouth breathing, or gasping',
      'Abnormal posture': 'Unusual body positioning or inability to stand normally',
      'Discharge from eyes/nose': 'Visible fluid or mucus from eyes or nostrils',
      'Reduced milk production': 'Significant decrease in daily milk yield',
      'Lameness': 'Difficulty walking, limping, or favoring one leg',
      'Bloating': 'Swollen or distended abdomen',
      'Nasal discharge': 'Fluid or mucus coming from the nose',
      'Joint swelling': 'Visible swelling around joints or limbs',
      'Weight loss': 'Noticeable reduction in body weight over time',
      'Wool loss': 'Patches of missing or thinning wool',
      'Skin problems': 'Rashes, lesions, or other skin abnormalities'
    }
    return descriptions[symptom] || 'Monitor this symptom carefully'
  }

  const getSymptomSigns = (symptom) => {
    const signs = {
      'Loss of appetite': 'Food left uneaten, disinterest in treats',
      'Fever': 'Hot to touch, shivering, rapid breathing',
      'Coughing': 'Audible cough sounds, throat clearing',
      'Diarrhea': 'Liquid feces, soiled rear end',
      'Vomiting': 'Expelled food/liquid, retching motions',
      'Lethargy': 'Lying down more, slow movements',
      'Skin lesions': 'Red patches, wounds, unusual bumps',
      'Difficulty breathing': 'Open mouth breathing, chest heaving',
      'Reduced egg production': 'Fewer eggs than normal daily count',
      'Respiratory distress': 'Gasping, neck extended, rapid breathing',
      'Abnormal posture': 'Hunched back, drooping wings, tilted head',
      'Discharge from eyes/nose': 'Wet areas, crusty buildup',
      'Reduced milk production': 'Lower milk volume during milking',
      'Lameness': 'Limping, reluctance to move, favoring limbs',
      'Bloating': 'Swollen belly, tight skin over abdomen',
      'Nasal discharge': 'Wet nose, mucus trails',
      'Joint swelling': 'Enlarged joints, stiffness',
      'Weight loss': 'Visible ribs, loose skin',
      'Wool loss': 'Bald patches, thin areas',
      'Skin problems': 'Scratching, red areas, scabs'
    }
    return signs[symptom] || 'Observe carefully and document changes'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-gray-700 transition-all duration-200 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Consultation</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Disease Analyzer</h1>
              <p className="text-gray-600 text-sm">RAG-Enhanced Veterinary Diagnosis</p>
            </div>
          </div>
          
          {/* Smart Features Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
              </select>
              
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmergency(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
              >
                <Phone className="w-4 h-4" />
                <span>Emergency</span>
              </button>
              
              {analysis && (
                <button
                  onClick={() => {
                    const report = generateHealthReport(
                      { name: selectedAnimal, species: selectedAnimal },
                      { symptoms, matches: analysis.matches, recommendations: analysis.recommendations }
                    )
                    const pdfContent = generatePDFReport(report)
                    
                    // Create and download the report
                    const blob = new Blob([pdfContent], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `veterinary-report-${selectedAnimal}-${Date.now()}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          {[
            { num: 1, title: 'Animal', icon: '🐾' },
            { num: 2, title: 'Symptoms', icon: '🤒' },
            { num: 3, title: 'Details', icon: '📋' },
            { num: 4, title: 'Results', icon: '🧠' }
          ].map((item, index) => (
            <div key={item.num} className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}>
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                step >= item.num 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-110' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step >= item.num ? item.icon : item.num}
              </div>
              {index < 3 && (
                <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-300 ${
                  step > item.num ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {step === 1 && '🐾 Select Your Animal Type'}
            {step === 2 && '🤒 Choose Observed Symptoms'}
            {step === 3 && '📋 Provide Additional Details'}
            {step === 4 && '🧠 AI Analysis Results'}
          </span>
        </div>
      </div>

      {/* Step 1: Animal Selection */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Select Animal Type</h2>
            <p className="text-gray-600">Choose the animal you want to analyze</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {animalTypes.map((animal) => (
              <button
                key={animal.id}
                onClick={() => setSelectedAnimal(animal.id)}
                className={`group p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedAnimal === animal.id
                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl'
                    : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-lg'
                }`}
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">{animal.emoji}</div>
                <div className={`font-bold text-lg ${
                  selectedAnimal === animal.id ? 'text-purple-700' : 'text-gray-800'
                }`}>{animal.name}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedAnimal}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:shadow-none"
            >
              Continue to Symptoms →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Symptom Selection */}
      {step === 2 && !showFlashcards && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Select Observed Symptoms</h2>
            <button
              onClick={() => setShowFlashcards(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📚 View Symptom Guide
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonSymptoms[selectedAnimal]?.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  symptoms.includes(symptom)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    symptoms.includes(symptom) ? 'bg-purple-600' : 'border-2 border-gray-300'
                  }`}>
                    {symptoms.includes(symptom) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="font-medium text-gray-800">{symptom}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={symptoms.length === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Symptom Flashcards */}
      {step === 2 && showFlashcards && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Symptom Guide - {selectedAnimal.charAt(0).toUpperCase() + selectedAnimal.slice(1)}</h2>
            <button
              onClick={() => setShowFlashcards(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              ← Back to Selection
            </button>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Flashcard */}
            <div className="relative perspective-1000">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-1 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-xl p-8 h-96 flex flex-col justify-between">
                  {/* Card Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
                      <span className="text-sm font-semibold text-indigo-700">
                        📋 Card {currentCard + 1} of {commonSymptoms[selectedAnimal]?.length || 0}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                      {commonSymptoms[selectedAnimal]?.[currentCard]}
                    </h3>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">🔍</span>
                          <span className="font-semibold text-gray-800">Description</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {getSymptomDescription(commonSymptoms[selectedAnimal]?.[currentCard])}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">👁️</span>
                          <span className="font-semibold text-gray-800">What to Look For</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {getSymptomSigns(commonSymptoms[selectedAnimal]?.[currentCard])}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Action */}
                  <div className="text-center mt-6">
                    <button
                      onClick={() => {
                        const symptom = commonSymptoms[selectedAnimal]?.[currentCard]
                        if (symptom) {
                          toggleSymptom(symptom)
                        }
                      }}
                      className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 ${
                        symptoms.includes(commonSymptoms[selectedAnimal]?.[currentCard])
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 hover:from-purple-700 hover:to-indigo-700'
                      }`}
                    >
                      {symptoms.includes(commonSymptoms[selectedAnimal]?.[currentCard]) ? '✅ Selected' : '➕ Select Symptom'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
                disabled={currentCard === 0}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
              >
                <span className="text-xl">⬅️</span>
                <span>Previous</span>
              </button>
              
              {/* Progress Dots */}
              <div className="flex space-x-3">
                {commonSymptoms[selectedAnimal]?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-200 transform hover:scale-125 ${
                      index === currentCard 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => setCurrentCard(Math.min((commonSymptoms[selectedAnimal]?.length || 1) - 1, currentCard + 1))}
                disabled={currentCard === (commonSymptoms[selectedAnimal]?.length || 1) - 1}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
              >
                <span>Next</span>
                <span className="text-xl">➡️</span>
              </button>
            </div>
            
            {/* Selected Symptoms Counter */}
            {symptoms.length > 0 && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full border border-green-200">
                  <span className="text-green-700 font-semibold">
                    ✅ {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Additional Information */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Additional Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptom Severity</label>
              <div className="grid grid-cols-3 gap-3">
                {['Mild', 'Moderate', 'Severe'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`p-3 rounded-lg border-2 ${
                      severity === level ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration of Symptoms</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select duration</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="More than 2 weeks">More than 2 weeks</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Photo Analysis</label>
                <button
                  type="button"
                  onClick={() => setShowImageAnalyzer(!showImageAnalyzer)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>{showImageAnalyzer ? 'Hide' : 'YOLOv8'} AI Analysis</span>
                </button>
              </div>
              
              {showImageAnalyzer ? (
                <ImageAnalyzer 
                  animalType={selectedAnimal}
                  onAnalysisComplete={(results) => {
                    setYoloResults(results)
                    // Auto-add detected symptoms from integrated analysis
                    if (results.success) {
                      let detectedSymptoms = []
                      
                      // Extract symptoms from CNN analysis
                      if (results.cnnAnalysis?.topPrediction?.disease !== 'healthy') {
                        const diseaseSymptoms = {
                          'bacterial_dermatitis': ['Skin lesions', 'Loss of appetite'],
                          'fungal_infection': ['Skin lesions', 'Loss of appetite'],
                          'parasitic_infection': ['Skin lesions', 'Loss of appetite'],
                          'mange': ['Skin lesions', 'Loss of appetite', 'Lethargy'],
                          'ringworm': ['Skin lesions', 'Loss of appetite'],
                          'hot_spot': ['Skin lesions', 'Loss of appetite'],
                          'viral_papilloma': ['Skin lesions'],
                          'seborrhea': ['Skin lesions', 'Loss of appetite'],
                          'allergic_dermatitis': ['Skin lesions', 'Loss of appetite']
                        }
                        const disease = results.cnnAnalysis.topPrediction.disease
                        detectedSymptoms = diseaseSymptoms[disease] || ['Skin lesions']
                      }
                      
                      // Extract symptoms from YOLOv8 detections
                      if (results.detections) {
                        const yoloSymptoms = results.detections
                          .filter(d => d.severity !== 'Normal')
                          .map(d => d.class.replace('_', ' '))
                        detectedSymptoms = [...detectedSymptoms, ...yoloSymptoms]
                      }
                      
                      if (detectedSymptoms.length > 0) {
                        setSymptoms(prev => [...new Set([...prev, ...detectedSymptoms])])
                      }
                    }
                  }}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload animal photo</p>
                  </label>
                  {image && <p className="text-sm text-green-600 mt-2">Image uploaded: {image.name}</p>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
            >
              Back
            </button>
            <button
              onClick={analyzeSymptoms}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Analyze Symptoms
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Analysis Results */}
      {step === 4 && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">🧠 RAG AI analyzing symptoms...</p>
              <p className="text-sm text-gray-500 mt-2">Processing veterinary knowledge base</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">RAG-Enhanced AI Analysis</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Brain className="w-4 h-4" />
                    <span>{analysis?.analysisMethod || 'AI Analysis'}</span>
                  </div>
                </div>
                
                {analysis?.matches.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.matches.map((match, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        match.severity === 'Critical' ? 'border-red-500 bg-red-50' :
                        match.severity === 'High' ? 'border-orange-500 bg-orange-50' :
                        'border-yellow-500 bg-yellow-50'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800">{match.disease}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">{match.confidence}% match</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              match.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                              match.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {match.severity}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Matched symptoms: {match.matchedSymptoms.join(', ')}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Treatment:</strong> {match.treatment}
                        </p>
                        {match.mortality && (
                          <p className="text-xs text-gray-600">
                            <strong>Mortality:</strong> {match.mortality} | <strong>Contagious:</strong> {match.contagious ? 'Yes' : 'No'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">No specific diseases matched the symptoms.</p>
                    <p className="text-sm text-gray-500">Please consult a veterinarian for proper diagnosis.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Results Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Recommendations</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis?.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Lab Tests */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Recommended Tests</span>
                  </h3>
                  <div className="space-y-3">
                    {analysis?.matches.slice(0, 1).map((match) => {
                      const tests = getRecommendedTests(match.disease, selectedAnimal)
                      return tests.map((test, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-800">{test}</div>
                          <div className="text-xs text-blue-600">For {match.disease} diagnosis</div>
                        </div>
                      ))
                    })}
                  </div>
                </div>
                
                {/* Treatment Plan */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Treatment Plan</span>
                  </h3>
                  <div className="space-y-3">
                    {analysis?.matches.length > 0 && (
                      <>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="font-medium text-purple-800">Immediate Actions</div>
                          <div className="text-sm text-purple-600 mt-1">
                            Isolate animal, monitor vitals, ensure hydration
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="font-medium text-orange-800">Follow-up</div>
                          <div className="text-sm text-orange-600 mt-1">
                            Vet visit within 24-48 hours, document changes
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Prevention Tips */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Prevention Tips</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis?.matches.length > 0 && (
                      <>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="font-medium text-green-800">Vaccination</div>
                          <div className="text-sm text-green-600 mt-1">
                            Keep vaccination schedule up to date
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-800">Hygiene</div>
                          <div className="text-sm text-blue-600 mt-1">
                            Maintain clean environment and proper sanitation
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="font-medium text-yellow-800">Monitoring</div>
                          <div className="text-sm text-yellow-600 mt-1">
                            Regular health checks and early symptom detection
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Modal */}
              {showEmergency && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center space-x-2">
                      <Phone className="w-6 h-6" />
                      <span>Emergency Contacts</span>
                    </h3>
                    <div className="space-y-3">
                      {emergencyContacts.map((contact, index) => (
                        <div key={index} className="bg-red-50 p-4 rounded-lg">
                          <div className="font-medium text-red-800">{contact.name}</div>
                          <div className="text-red-600">{contact.number}</div>
                          <div className="text-xs text-red-500">{contact.available}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowEmergency(false)}
                      className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setStep(1)
                    setSymptoms([])
                    setSelectedAnimal('')
                    setAnalysis(null)
                    // Save offline data
                    saveOfflineData({ step: 1, symptoms: [], selectedAnimal: '', analysis: null })
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
                >
                  New Analysis
                </button>
                <button
                  onClick={onBack}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Back to Consultation
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </div>
  )
}