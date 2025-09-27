import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    this.genAI = null
    this.model = null
    this.apiKey = 'AIzaSyAtUr7mMIDeAZJk4HWGvVoNQa_W6yfQ8GE'
  }

  initialize() {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    }
  }

  async sendMessage(message) {
    try {
      // Fallback responses for common topics
      const responses = {
        'vaccination': 'For animal vaccination schedules, consult with a veterinarian. Common vaccines include FMD, Brucellosis, and seasonal flu vaccines. Keep vaccination records updated and follow your local veterinary guidelines.',
        'disease': 'Common disease symptoms include fever, loss of appetite, lethargy, and unusual behavior. Always consult a veterinarian for proper diagnosis. Early detection and treatment are crucial for animal health.',
        'breeding': 'For breeding and maternity care, maintain proper nutrition, provide clean shelter, monitor pregnancy progress, and have a veterinarian on standby during delivery. Keep detailed breeding records.',
        'milk': 'To optimize milk production, ensure proper nutrition, maintain clean milking conditions, follow regular milking schedules, and monitor animal health. Quality feed and clean water are essential.',
        'health': 'Regular health checkups, proper nutrition, clean living conditions, and vaccination schedules are key to maintaining animal health. Contact veterinarians for any health concerns.',
        'emergency': 'For animal emergencies, contact your local veterinarian immediately. Keep emergency contact numbers handy and have a basic first aid kit for animals.',
        'platform': 'Pashu Setu helps you manage animal records, schedule consultations, track health data, and connect with veterinarians. Use the different sections to access various features.',
        'hello': 'Hello! I\'m here to help you with animal healthcare and farm management questions.',
        'hi': 'Hi there! How can I assist you with your farm and animal care today?'
      }

      const lowerMessage = message.toLowerCase()
      
      for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          return response
        }
      }
      
      return "I can help you with animal health, vaccination schedules, breeding care, milk production, and farm management. What specific topic would you like to know about?"
    } catch (error) {
      console.error('Error in geminiService:', error)
      return "I'm having trouble responding right now. Please try again."
    }
  }
}

export const geminiService = new GeminiService()
geminiService.initialize()