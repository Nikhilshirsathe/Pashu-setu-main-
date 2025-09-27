class VapiService {
  constructor() {
    this.assistantId = "a6aa90ec-1153-4e24-90a4-47a27fbbda98"
    this.vapi = null
    this.isCallActive = false
    this.isInitialized = false
  }

  async initialize() {
    if (typeof window !== 'undefined' && !this.vapi) {
      try {
        const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY
        if (!apiKey) {
          throw new Error('VAPI public key not found')
        }

        const { default: Vapi } = await import('@vapi-ai/web')
        this.vapi = new Vapi(apiKey)
        
        this.vapi.on('call-start', () => {
          this.isCallActive = true
          console.log('VARHA call started')
        })
        
        this.vapi.on('call-end', () => {
          this.isCallActive = false
          console.log('VARHA call ended')
        })

        this.vapi.on('error', (error) => {
          console.error('VARHA error:', error)
          this.isCallActive = false
        })

        // Handle function calls from VARHA
        this.vapi.on('function-call', this.handleFunctionCall.bind(this))
        
        this.isInitialized = true
      } catch (error) {
        console.error('Failed to initialize VARHA:', error)
        throw error
      }
    }
  }

  async startCall() {
    try {
      await this.initialize()
      
      if (this.vapi && !this.isCallActive) {
        await this.vapi.start(this.assistantId)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to start VARHA call:', error)
      throw error
    }
  }

  async endCall() {
    try {
      if (this.vapi && this.isCallActive) {
        await this.vapi.stop()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to end VARHA call:', error)
      throw error
    }
  }

  getCallStatus() {
    return this.isCallActive
  }

  isReady() {
    return this.isInitialized && this.vapi !== null
  }

  // Handle function calls from VARHA
  async handleFunctionCall(functionCall) {
    const { varhaFunctions } = await import('./varhaFunctions')
    
    try {
      let result
      
      switch (functionCall.name) {
        case 'call_vet':
          result = await varhaFunctions.callVet(functionCall.parameters)
          break
        case 'connect_doctor_now':
          result = await varhaFunctions.callVet(functionCall.parameters)
          break
        case 'get_disease_advice':
          result = await varhaFunctions.getDiseaseAdvice(functionCall.parameters)
          break
        case 'navigate_to_section':
          result = await varhaFunctions.navigateToSection(functionCall.parameters)
          break
        case 'check_animal_health':
          result = await varhaFunctions.checkAnimalHealth(functionCall.parameters)
          break
        default:
          result = { success: false, message: "I don't know how to do that yet." }
      }
      
      // Return result to VAPI
      return result
    } catch (error) {
      console.error('Function call error:', error)
      return { success: false, message: "Sorry, I encountered an error. Please try again." }
    }
  }
}

export const vapiService = new VapiService()