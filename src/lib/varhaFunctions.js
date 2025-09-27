// VARHA Function Calling Integration
import { supabase } from './supabase'

class VarhaFunctions {
  constructor() {
    this.onNavigate = null
    this.onStartVideoCall = null
  }

  // Set callback functions from App component
  setCallbacks(callbacks) {
    this.onNavigate = callbacks.onNavigate
    this.onStartVideoCall = callbacks.onStartVideoCall
  }

  // Initialize VARHA integration
  init() {
    // Listen for VARHA function calls from VAPI
    if (typeof window !== 'undefined') {
      window.varhaFunctions = {
        call_vet: this.callVet.bind(this),
        connect_doctor_now: this.callVet.bind(this),
        get_disease_advice: this.getDiseaseAdvice.bind(this),
        navigate_to_section: this.navigateToSection.bind(this),
        check_animal_health: this.checkAnimalHealth.bind(this)
      }
    }
  }

  // Call a veterinarian
  async callVet(params = {}) {
    try {
      // Navigate to consultation page first
      if (this.onNavigate) {
        this.onNavigate('consultation', `/${localStorage.getItem('userRole') || 'farmer'}/dashboard/consultation`)
      }
      
      // Trigger immediate vet call without database
      setTimeout(() => {
        const event = new CustomEvent('varhaCallVet', { 
          detail: { 
            roomId: `consultation_${Date.now()}`, 
            requestId: Date.now(), 
            reason: 'VARHA: User requested doctor connection' 
          } 
        })
        window.dispatchEvent(event)
      }, 500)
      
      return {
        success: true,
        message: "Connecting you to a veterinarian now! Starting video call..."
      }
    } catch (error) {
      console.error('Error calling vet:', error)
      return {
        success: false,
        message: "Let me take you to the consultation page."
      }
    }
  }

  // Get disease advice
  async getDiseaseAdvice(params = {}) {
    try {
      const { animal, symptoms, description } = params
      
      const prompt = `Animal: ${animal || 'pig'}
Symptoms: ${symptoms || description || 'general health concern'}

Provide brief veterinary advice for this farm animal health issue. Include:
1. Possible causes
2. Immediate care steps
3. When to contact a vet
4. Prevention tips

Keep response under 200 words and farm-friendly.`

      return {
        success: true,
        message: "Based on the symptoms, I recommend monitoring your animal closely and consulting with a veterinarian for proper diagnosis. Would you like me to connect you with a vet?"
      }
    } catch (error) {
      console.error('Error getting disease advice:', error)
      return {
        success: false,
        message: "I can help with basic animal health guidance. For your pig's health concerns, I recommend consulting our veterinarians. Would you like me to call a vet for you?"
      }
    }
  }

  // Navigate to different sections
  async navigateToSection(params = {}) {
    const { section } = params
    const userRole = localStorage.getItem('userRole') || 'farmer'
    
    const sectionMap = {
      'consultation': 'consultation',
      'health': 'consultation', 
      'records': 'records',
      'animals': 'records',
      'lab': 'lab',
      'emergency': 'emergency',
      'pharmacy': 'pharmacy',
      'education': 'education',
      'alerts': 'alerts',
      'dashboard': 'dashboard'
    }
    
    const targetSection = sectionMap[section?.toLowerCase()] || 'dashboard'
    const newPath = `/${userRole}/dashboard/${targetSection}`
    
    if (this.onNavigate) {
      this.onNavigate(targetSection, newPath)
    }
    
    // If navigating to consultation, also trigger vet call
    if (targetSection === 'consultation') {
      setTimeout(() => {
        const event = new CustomEvent('varhaCallVet', { 
          detail: { 
            roomId: `consultation_${Date.now()}`, 
            requestId: Date.now(), 
            reason: 'VARHA: User requested doctor via navigation' 
          } 
        })
        window.dispatchEvent(event)
      }, 1000)
      
      return {
        success: true,
        message: "I've taken you to the consultation section and started connecting you with a veterinarian!"
      }
    }
    
    return {
      success: true,
      message: `I've navigated you to the ${targetSection} section.`
    }
  }

  // Check animal health records
  async checkAnimalHealth(params = {}) {
    try {
      const userEmail = localStorage.getItem('userEmail')
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: animals } = await supabase
        .from('animals')
        .select('*, health_records(*)')
        .eq('owner_id', user?.id || userEmail)
        .limit(5)
      
      if (!animals?.length) {
        return {
          success: true,
          message: "You don't have any animals registered yet. Would you like me to help you add your animals to the records?"
        }
      }
      
      const healthSummary = animals.map(animal => {
        const recentRecord = animal.health_records?.[0]
        return `${animal.name} (${animal.species}): ${recentRecord ? 'Recent checkup recorded' : 'No recent records'}`
      }).join(', ')
      
      return {
        success: true,
        message: `Here's your animal health summary: ${healthSummary}. Would you like me to open the records page for more details?`
      }
    } catch (error) {
      return {
        success: true,
        message: "I can help you check your animal health records. Let me navigate you to the records section."
      }
    }
  }
}

export const varhaFunctions = new VarhaFunctions()