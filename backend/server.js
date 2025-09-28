import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['https://pashu-setu-2-0.onrender.com', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pashu Setu Backend API', 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Health check',
      'GET /api/animals - Get animals',
      'POST /api/consultations/request - Request consultation'
    ]
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.get('/api/animals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/animals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .insert([req.body])
      .select()
    
    if (error) throw error
    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/health-records/:animalId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('animal_id', req.params.animalId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/health-records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .insert([req.body])
      .select()
    
    if (error) throw error
    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Video Consultation APIs
app.post('/api/consultations/request', async (req, res) => {
  try {
    const { farmer_id, animal_id, symptoms, urgency } = req.body
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert([{
        farmer_id,
        animal_id,
        symptoms,
        urgency,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/consultations/available-vets', async (req, res) => {
  try {
    const vets = [
      { id: 1, name: 'Dr. Sharma', specialization: 'Large Animals', available: true },
      { id: 2, name: 'Dr. Patel', specialization: 'Small Animals', available: true },
      { id: 3, name: 'Dr. Kumar', specialization: 'Emergency Care', available: true }
    ]
    res.json(vets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Pharmacy APIs
app.get('/api/pharmacy/medicines', async (req, res) => {
  try {
    const medicines = [
      { id: 1, name: 'Amoxicillin', type: 'Antibiotic', price: 150, stock: 50 },
      { id: 2, name: 'Ivermectin', type: 'Dewormer', price: 200, stock: 30 },
      { id: 3, name: 'Vitamin B Complex', type: 'Supplement', price: 80, stock: 100 },
      { id: 4, name: 'FMD Vaccine', type: 'Vaccine', price: 300, stock: 25 }
    ]
    res.json(medicines)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/pharmacy/orders', async (req, res) => {
  try {
    const { user_id, items, total_amount, delivery_address } = req.body
    const order = {
      id: Date.now(),
      user_id,
      items,
      total_amount,
      delivery_address,
      status: 'confirmed',
      estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// AI Health Analytics
app.post('/api/health/analyze', async (req, res) => {
  try {
    const { animal_id, symptoms, image_data } = req.body
    
    const analysis = {
      diagnosis: 'Possible Erysipelas infection',
      confidence: 85,
      recommendations: [
        'Immediate antibiotic treatment',
        'Isolate affected animal',
        'Monitor temperature daily'
      ],
      severity: 'moderate',
      treatment_plan: {
        medication: 'Penicillin injection',
        dosage: '2ml per day for 5 days',
        follow_up: '3 days'
      }
    }
    
    res.json(analysis)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})