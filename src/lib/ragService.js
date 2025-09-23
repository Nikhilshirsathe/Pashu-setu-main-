// Veterinary Knowledge Base for RAG
const veterinaryKnowledgeBase = [
  // Pig diseases
  {
    id: 1,
    animal: "pig",
    disease: "African Swine Fever",
    symptoms: ["high fever", "loss of appetite", "skin lesions", "diarrhea", "vomiting", "lethargy"],
    severity: "Critical",
    treatment: "No specific treatment. Immediate quarantine, report to authorities",
    prevention: "Vaccination, biosecurity measures",
    mortality: "Up to 100%",
    contagious: true
  },
  {
    id: 2,
    animal: "pig",
    disease: "Swine Flu",
    symptoms: ["fever", "coughing", "loss of appetite", "lethargy"],
    severity: "High",
    treatment: "Antiviral drugs, supportive care, isolation",
    prevention: "Vaccination, good hygiene",
    mortality: "1-4%",
    contagious: true
  },
  {
    id: 3,
    animal: "pig",
    disease: "Porcine Respiratory Disease",
    symptoms: ["coughing", "difficulty breathing", "fever", "lethargy"],
    severity: "Medium",
    treatment: "Antibiotics, supportive care",
    prevention: "Vaccination, ventilation",
    mortality: "5-15%",
    contagious: true
  },
  // Chicken diseases
  {
    id: 4,
    animal: "chicken",
    disease: "Avian Influenza",
    symptoms: ["respiratory distress", "reduced egg production", "lethargy", "diarrhea"],
    severity: "Critical",
    treatment: "No treatment. Culling, quarantine, disinfection",
    prevention: "Biosecurity, vaccination",
    mortality: "90-100%",
    contagious: true
  },
  {
    id: 5,
    animal: "chicken",
    disease: "Newcastle Disease",
    symptoms: ["respiratory distress", "diarrhea", "abnormal posture"],
    severity: "High",
    treatment: "Supportive care, antibiotics for secondary infections",
    prevention: "Vaccination",
    mortality: "10-100%",
    contagious: true
  },
  {
    id: 6,
    animal: "chicken",
    disease: "Infectious Bronchitis",
    symptoms: ["coughing", "respiratory distress", "reduced egg production"],
    severity: "Medium",
    treatment: "Supportive care, vaccination",
    prevention: "Vaccination program",
    mortality: "5-25%",
    contagious: true
  },
  // Cow diseases
  {
    id: 7,
    animal: "cow",
    disease: "Mastitis",
    symptoms: ["reduced milk production", "fever"],
    severity: "Medium",
    treatment: "Antibiotics, anti-inflammatory drugs",
    prevention: "Proper milking hygiene",
    mortality: "Low",
    contagious: false
  },
  {
    id: 8,
    animal: "cow",
    disease: "Foot and Mouth Disease",
    symptoms: ["fever", "lameness", "loss of appetite"],
    severity: "High",
    treatment: "Supportive care, pain management",
    prevention: "Vaccination, quarantine",
    mortality: "2-5%",
    contagious: true
  },
  {
    id: 9,
    animal: "cow",
    disease: "Bovine Respiratory Disease",
    symptoms: ["coughing", "difficulty breathing", "fever"],
    severity: "Medium",
    treatment: "Antibiotics, supportive care",
    prevention: "Vaccination, stress reduction",
    mortality: "5-20%",
    contagious: true
  },
  // Goat diseases
  {
    id: 10,
    animal: "goat",
    disease: "Pneumonia",
    symptoms: ["coughing", "fever", "difficulty breathing"],
    severity: "High",
    treatment: "Antibiotics, supportive care",
    prevention: "Vaccination, proper ventilation",
    mortality: "10-30%",
    contagious: true
  },
  {
    id: 11,
    animal: "goat",
    disease: "Parasitic Infection",
    symptoms: ["diarrhea", "weight loss", "lethargy"],
    severity: "Medium",
    treatment: "Deworming, supportive care",
    prevention: "Regular deworming, pasture management",
    mortality: "5-15%",
    contagious: false
  },
  {
    id: 12,
    animal: "goat",
    disease: "Joint Ill",
    symptoms: ["joint swelling", "lameness", "fever"],
    severity: "Medium",
    treatment: "Antibiotics, anti-inflammatory drugs",
    prevention: "Proper hygiene, navel care",
    mortality: "10-25%",
    contagious: false
  },
  // Sheep diseases
  {
    id: 13,
    animal: "sheep",
    disease: "Pneumonia",
    symptoms: ["coughing", "fever", "difficulty breathing"],
    severity: "High",
    treatment: "Antibiotics, supportive care",
    prevention: "Vaccination, proper ventilation",
    mortality: "10-30%",
    contagious: true
  },
  {
    id: 14,
    animal: "sheep",
    disease: "Foot Rot",
    symptoms: ["lameness", "loss of appetite"],
    severity: "Medium",
    treatment: "Foot trimming, antibiotics",
    prevention: "Dry conditions, foot care",
    mortality: "Low",
    contagious: true
  },
  {
    id: 15,
    animal: "sheep",
    disease: "Internal Parasites",
    symptoms: ["weight loss", "diarrhea", "lethargy"],
    severity: "Medium",
    treatment: "Deworming medication",
    prevention: "Pasture rotation, regular deworming",
    mortality: "5-20%",
    contagious: false
  },
  // Buffalo diseases
  {
    id: 16,
    animal: "buffalo",
    disease: "Mastitis",
    symptoms: ["reduced milk production", "fever"],
    severity: "Medium",
    treatment: "Antibiotics, anti-inflammatory drugs",
    prevention: "Proper milking hygiene",
    mortality: "Low",
    contagious: false
  },
  {
    id: 17,
    animal: "buffalo",
    disease: "Hemorrhagic Septicemia",
    symptoms: ["fever", "difficulty breathing", "loss of appetite"],
    severity: "Critical",
    treatment: "Antibiotics, supportive care",
    prevention: "Vaccination",
    mortality: "50-90%",
    contagious: true
  },
  {
    id: 18,
    animal: "buffalo",
    disease: "Skin Problems",
    symptoms: ["skin problems", "loss of appetite"],
    severity: "Medium",
    treatment: "Topical treatment, antibiotics",
    prevention: "Proper hygiene, parasite control",
    mortality: "Low",
    contagious: false
  }
]

// Symptom embeddings (simplified vector representation)
const symptomEmbeddings = {
  "fever": [0.8, 0.2, 0.9, 0.1, 0.7],
  "high fever": [0.9, 0.3, 0.95, 0.15, 0.8],
  "coughing": [0.3, 0.8, 0.4, 0.9, 0.2],
  "loss of appetite": [0.6, 0.1, 0.7, 0.2, 0.8],
  "lethargy": [0.7, 0.2, 0.6, 0.1, 0.9],
  "diarrhea": [0.2, 0.7, 0.3, 0.8, 0.4],
  "respiratory distress": [0.4, 0.9, 0.5, 0.85, 0.3],
  "skin lesions": [0.5, 0.4, 0.8, 0.3, 0.6],
  "vomiting": [0.3, 0.6, 0.4, 0.7, 0.5],
  "lameness": [0.1, 0.3, 0.2, 0.4, 0.8],
  "reduced milk production": [0.2, 0.1, 0.3, 0.2, 0.7],
  "swollen udder": [0.1, 0.2, 0.4, 0.3, 0.6],
  "joint swelling": [0.2, 0.4, 0.3, 0.5, 0.7],
  "weight loss": [0.5, 0.3, 0.6, 0.2, 0.8],
  "difficulty breathing": [0.4, 0.8, 0.5, 0.9, 0.3],
  "nasal discharge": [0.3, 0.7, 0.4, 0.6, 0.2],
  "decreased egg production": [0.1, 0.2, 0.3, 0.1, 0.6],
  "facial swelling": [0.2, 0.3, 0.5, 0.4, 0.4],
  "abnormal milk": [0.1, 0.1, 0.2, 0.1, 0.5]
}

// Calculate cosine similarity between vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// RAG-based disease analysis
export async function analyzeWithRAG(animalType, symptoms, severity, duration) {
  try {
    // Step 1: Retrieve relevant documents
    const relevantDiseases = veterinaryKnowledgeBase.filter(
      disease => disease.animal === animalType.toLowerCase()
    )

    // Step 2: Calculate direct symptom matching
    const diseaseScores = relevantDiseases.map(disease => {
      const matchedSymptoms = []
      let exactMatches = 0
      let partialMatches = 0

      symptoms.forEach(symptom => {
        const symptomLower = symptom.toLowerCase()
        
        // Check for exact matches
        const exactMatch = disease.symptoms.find(ds => 
          ds.toLowerCase() === symptomLower ||
          ds.toLowerCase().includes(symptomLower) ||
          symptomLower.includes(ds.toLowerCase())
        )
        
        if (exactMatch) {
          exactMatches++
          matchedSymptoms.push(symptom)
        } else {
          // Check for semantic similarity
          const semanticMatch = disease.symptoms.find(ds => {
            const symptomVector = symptomEmbeddings[symptomLower] || [0.5, 0.5, 0.5, 0.5, 0.5]
            const diseaseVector = symptomEmbeddings[ds.toLowerCase()] || [0.5, 0.5, 0.5, 0.5, 0.5]
            return cosineSimilarity(symptomVector, diseaseVector) > 0.6
          })
          
          if (semanticMatch) {
            partialMatches++
            matchedSymptoms.push(symptom)
          }
        }
      })

      // Calculate confidence based on matches
      const totalSymptoms = disease.symptoms.length
      const matchScore = (exactMatches * 2 + partialMatches) / (symptoms.length + totalSymptoms)
      const confidence = Math.min(matchScore * 100, 95)

      return {
        ...disease,
        confidence: Math.round(confidence),
        matchedSymptoms,
        exactMatches,
        partialMatches
      }
    })

    // Step 3: Rank and filter results
    const rankedDiseases = diseaseScores
      .filter(disease => disease.confidence > 15 || disease.exactMatches > 0)
      .sort((a, b) => {
        // Prioritize exact matches, then confidence
        if (a.exactMatches !== b.exactMatches) {
          return b.exactMatches - a.exactMatches
        }
        return b.confidence - a.confidence
      })
      .slice(0, 3)

    // Step 4: Generate contextual recommendations using RAG
    const recommendations = generateRAGRecommendations(rankedDiseases, severity, duration)

    return {
      matches: rankedDiseases,
      recommendations,
      analysisMethod: "RAG-Enhanced AI Analysis",
      confidence: rankedDiseases.length > 0 ? rankedDiseases[0].confidence : 0
    }

  } catch (error) {
    console.error('RAG Analysis Error:', error)
    return {
      matches: [],
      recommendations: [
        "Unable to complete AI analysis",
        "Please consult a veterinarian immediately",
        "Monitor animal closely for changes"
      ],
      analysisMethod: "Fallback Analysis",
      confidence: 0
    }
  }
}

// Generate contextual recommendations based on RAG results
function generateRAGRecommendations(diseases, severity, duration) {
  const recommendations = []

  // Base recommendations
  recommendations.push("Consult with a veterinarian immediately")

  // Severity-based recommendations
  if (severity === "Severe" || diseases.some(d => d.severity === "Critical")) {
    recommendations.push("URGENT: Seek emergency veterinary care")
    recommendations.push("Isolate animal immediately to prevent spread")
  }

  // Contagious disease recommendations
  if (diseases.some(d => d.contagious)) {
    recommendations.push("Implement strict biosecurity measures")
    recommendations.push("Quarantine affected and exposed animals")
  }

  // Duration-based recommendations
  if (duration === "More than 2 weeks") {
    recommendations.push("Chronic condition suspected - comprehensive examination needed")
  }

  // Disease-specific recommendations
  diseases.forEach(disease => {
    if (disease.confidence > 70) {
      recommendations.push(`Specific for ${disease.disease}: ${disease.prevention}`)
    }
  })

  recommendations.push("Monitor vital signs and document symptoms")
  recommendations.push("Ensure proper nutrition and hydration")

  return [...new Set(recommendations)] // Remove duplicates
}

// Simulate AI/ML API call (replace with actual service)
export async function callAIService(prompt) {
  // This would be replaced with actual AI service like OpenAI, Hugging Face, etc.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analysis: "AI-generated analysis based on veterinary knowledge",
        confidence: 85,
        recommendations: [
          "Based on AI analysis of symptoms",
          "Veterinary consultation recommended",
          "Monitor for symptom progression"
        ]
      })
    }, 1000)
  })
}