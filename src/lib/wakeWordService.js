import { PorcupineWorker } from '@picovoice/porcupine-web'

class WakeWordService {
  constructor() {
    this.porcupine = null
    this.isListening = false
    this.onWakeWordDetected = null
  }

  async initialize(accessKey, onWakeWordDetected) {
    try {
      this.onWakeWordDetected = onWakeWordDetected
      
      // Initialize Porcupine with built-in "Hey Google" keyword (closest to "Hey VARHA")
      this.porcupine = await PorcupineWorker.create(
        accessKey,
        [{ builtin: "Hey Google", sensitivity: 0.5 }], // Using built-in keyword
        (keywordIndex) => {
          console.log('Wake word detected!')
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected()
          }
        }
      )
      
      console.log('Porcupine wake word detection initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize Porcupine:', error)
      return false
    }
  }

  async startListening() {
    if (!this.porcupine) {
      console.error('Porcupine not initialized')
      return false
    }

    try {
      await this.porcupine.start()
      this.isListening = true
      console.log('Wake word listening started - say "Hey Google" to activate VARHA')
      return true
    } catch (error) {
      console.error('Failed to start wake word listening:', error)
      return false
    }
  }

  async stopListening() {
    if (this.porcupine && this.isListening) {
      try {
        await this.porcupine.stop()
        this.isListening = false
        console.log('Wake word listening stopped')
        return true
      } catch (error) {
        console.error('Failed to stop wake word listening:', error)
        return false
      }
    }
    return false
  }

  async release() {
    if (this.porcupine) {
      await this.porcupine.release()
      this.porcupine = null
      this.isListening = false
    }
  }

  getListeningStatus() {
    return this.isListening
  }
}

export const wakeWordService = new WakeWordService()