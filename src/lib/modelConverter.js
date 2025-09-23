// Model Converter for Animal Skin Disease CNN
import * as tf from '@tensorflow/tfjs'

export class ModelConverter {
  static async convertKerasModel(modelPath) {
    try {
      // Convert Keras .h5 model to TensorFlow.js format
      const model = await tf.loadLayersModel(modelPath)
      
      // Save in web format
      await model.save('downloads://animal_skin_disease_model')
      
      console.log('Model converted successfully!')
      return model
    } catch (error) {
      console.error('Model conversion failed:', error)
      return null
    }
  }

  static async loadFromURL(modelURL) {
    try {
      const model = await tf.loadLayersModel(modelURL)
      console.log('Model loaded from URL successfully!')
      return model
    } catch (error) {
      console.error('Failed to load model from URL:', error)
      return null
    }
  }
}