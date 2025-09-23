import { useState } from 'react'
import { Camera, Upload, Eye, AlertTriangle, CheckCircle, Brain, Loader, Activity, FileText } from 'lucide-react'
import { analyzeAnimalImage } from '../lib/yoloService'
import { integratedAnalyzer } from '../lib/cnnDiseaseService'

export default function ImageAnalyzer({ onAnalysisComplete, animalType = 'unknown' }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [analysisMode, setAnalysisMode] = useState('integrated')

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResults(null)
  }

  const analyzeImage = async () => {
    if (!selectedImage) return
    
    setAnalyzing(true)
    try {
      let analysis
      
      if (analysisMode === 'integrated') {
        analysis = await integratedAnalyzer.analyzeImage(selectedImage, animalType)
      } else if (analysisMode === 'cnn') {
        const cnnResults = await integratedAnalyzer.cnnDetector.predictDisease(selectedImage)
        analysis = { success: true, cnnAnalysis: cnnResults, analysisType: 'CNN' }
      } else {
        analysis = await analyzeAnimalImage(selectedImage)
        analysis.analysisType = 'YOLOv8'
      }
      
      setResults(analysis)
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">AI Disease Detection</h3>
        </div>
        <select
          value={analysisMode}
          onChange={(e) => setAnalysisMode(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <option value="integrated">🔬 CNN + YOLOv8</option>
          <option value="cnn">🧠 CNN Disease Detection</option>
          <option value="yolo">👁️ YOLOv8 Object Detection</option>
        </select>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e.target.files[0])}
            className="hidden"
            id="yolo-image-upload"
          />
          <label htmlFor="yolo-image-upload" className="cursor-pointer">
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Selected animal" 
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-600">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Upload Animal Photo</p>
                  <p className="text-sm text-gray-500">Click to select or drag and drop</p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Analyze Button */}
      {selectedImage && (
        <div className="mb-6">
          <button
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            {analyzing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing with {analysisMode === 'integrated' ? 'CNN+YOLOv8' : analysisMode.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Analyze with {analysisMode === 'integrated' ? 'CNN+YOLOv8' : analysisMode.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-800 mb-2">Analysis Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-700">Analysis Type</div>
                <div className="text-gray-600">{results.analysisType || 'Integrated Analysis'}</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-700">Overall Confidence</div>
                <div className="text-gray-600">{results.confidence || 'N/A'}%</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-medium text-gray-700">Status</div>
                <div className={`font-medium ${
                  results.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.success ? '✅ Analysis Complete' : '❌ Analysis Failed'}
                </div>
              </div>
            </div>
          </div>
          {/* Integrated Results */}
          {results.integratedResults && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Integrated CNN + YOLOv8 Analysis</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border">
                  <h5 className="font-medium text-gray-800 mb-2 flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Primary Diagnosis</span>
                  </h5>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {results.integratedResults.primaryDiagnosis.disease.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        results.integratedResults.primaryDiagnosis.severity === 'High' ? 'bg-red-100 text-red-800' :
                        results.integratedResults.primaryDiagnosis.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {results.integratedResults.primaryDiagnosis.severity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Confidence: {results.integratedResults.primaryDiagnosis.confidence}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border">
                  <h5 className="font-medium text-gray-800 mb-2 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>Risk Level</span>
                  </h5>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    results.integratedResults.riskAssessment.level.includes('High') ? 'bg-red-100 text-red-800' :
                    results.integratedResults.riskAssessment.level.includes('Medium') ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {results.integratedResults.riskAssessment.level}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {results.integratedResults.riskAssessment.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-gray-800 mb-2 flex items-center space-x-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Immediate Actions</span>
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  {results.integratedResults.treatmentPlan.immediate.map((action, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* CNN Results */}
          {results.cnnAnalysis && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center justify-between">
                <span>CNN Disease Classification</span>
                <span className="text-xs text-blue-600">{results.cnnAnalysis.analysisMethod || 'CNN Analysis'}</span>
              </h4>
              <div className="space-y-2">
                {results.cnnAnalysis.allPredictions?.slice(0, 4).map((prediction, index) => (
                  <div key={index} className={`bg-white rounded p-3 border-l-4 ${
                    index === 0 ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800 capitalize">
                        {prediction.disease.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{prediction.confidence}%</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          prediction.severity === 'High' ? 'bg-red-100 text-red-800' :
                          prediction.severity === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                          prediction.severity === 'Normal' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prediction.severity}
                        </span>
                      </div>
                    </div>
                    {index === 0 && prediction.confidence > 50 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Primary diagnosis:</strong> Most likely condition detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {results.cnnAnalysis.recommendations && (
                <div className="mt-3 bg-white rounded p-3 border">
                  <h5 className="font-medium text-blue-800 mb-2">Recommendations</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {results.cnnAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* YOLOv8 Results */}
          {(results.detections || results.yoloAnalysis) && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center justify-between">
                <span>YOLOv8 Object Detection</span>
                <span className="text-xs text-green-600">
                  {results.yoloAnalysis?.analysisMethod || 'YOLOv8 Analysis'}
                </span>
              </h4>
              <div className="space-y-2">
                {(results.detections || results.yoloAnalysis?.detections || []).map((detection, index) => (
                  <div key={index} className="bg-white rounded p-3 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 capitalize">
                        {detection.class.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round((detection.confidence || 0) * 100)}%
                      </span>
                    </div>
                    {detection.bodyPart && (
                      <div className="text-xs text-gray-600 mt-1">
                        Location: {detection.bodyPart.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {results.yoloAnalysis && (
                <div className="mt-3 bg-white rounded p-3 border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      Animal detected: {results.yoloAnalysis.animalDetected ? '✅ Yes' : '❌ No'}
                    </span>
                    <span className="text-gray-700">
                      Skin areas found: {results.yoloAnalysis.skinAreasFound || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}