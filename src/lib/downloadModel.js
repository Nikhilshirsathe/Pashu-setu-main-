// Download and setup the Animal Skin Disease CNN model
export async function downloadAndSetupModel() {
  try {
    console.log('🔄 Setting up Animal Skin Disease CNN model...')
    
    // GitHub raw URLs for the model files
    const modelFiles = {
      'model.json': 'https://raw.githubusercontent.com/mushabtinumbang/AnimalSkinDiseasePrediction_CNN/main/model/model.json',
      'model_weights.bin': 'https://raw.githubusercontent.com/mushabtinumbang/AnimalSkinDiseasePrediction_CNN/main/model/model_weights.bin'
    }
    
    // Create models directory if it doesn't exist
    const modelsDir = '/models/'
    
    for (const [filename, url] of Object.entries(modelFiles)) {
      try {
        console.log(`📥 Downloading ${filename}...`)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Failed to download ${filename}: ${response.status}`)
        }
        
        const blob = await response.blob()
        console.log(`✅ Downloaded ${filename} (${blob.size} bytes)`)
        
        // Store in browser cache for offline use
        if ('caches' in window) {
          const cache = await caches.open('animal-disease-model')
          await cache.put(modelsDir + filename, new Response(blob))
        }
        
      } catch (error) {
        console.error(`❌ Failed to download ${filename}:`, error)
      }
    }
    
    console.log('🎉 Model setup complete!')
    return true
    
  } catch (error) {
    console.error('❌ Model setup failed:', error)
    return false
  }
}

// Auto-download on import
downloadAndSetupModel()