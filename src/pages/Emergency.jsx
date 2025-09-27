import { Phone, MapPin, Clock, AlertTriangle, Truck, Heart, Shield, Users } from 'lucide-react'
import { useState } from 'react'

export default function Emergency() {
  const [emergencyType, setEmergencyType] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  const emergencyTypes = [
    { id: 'medical', name: 'Medical Emergency', icon: Heart, color: '#dc2626' },
    { id: 'accident', name: 'Animal Accident', icon: AlertTriangle, color: '#ea580c' },
    { id: 'disease', name: 'Disease Outbreak', icon: Shield, color: '#7c2d12' },
    { id: 'other', name: 'Other Emergency', icon: Phone, color: '#059669' }
  ]

  const handleEmergencyCall = () => {
    alert('Emergency services contacted! Help is on the way.')
  }

  return (
    <div style={{ backgroundColor: '#f9fafa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
          Emergency Services
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          24/7 emergency support for your animals
        </p>
      </div>

      {/* Emergency Alert */}
      <div style={{
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        border: '1px solid #fca5a5',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#7f1d1d' }}>
            Emergency Hotline: 1800-ANIMAL (1800-264625)
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#991b1b', lineHeight: '1.5' }}>
          Available 24/7 for immediate assistance. Our veterinary emergency team is ready to help.
        </p>
      </div>

      {/* Quick Emergency Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '30px'
      }}>
        <button 
          onClick={handleEmergencyCall}
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Phone style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Call Emergency</h3>
          <p style={{ fontSize: '12px', opacity: 0.9 }}>Immediate veterinary assistance</p>
        </button>

        <button style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
          <Truck style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Animal Ambulance</h3>
          <p style={{ fontSize: '12px', opacity: 0.9 }}>Mobile veterinary unit</p>
        </button>

        <button style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
          <MapPin style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Nearest Clinic</h3>
          <p style={{ fontSize: '12px', opacity: 0.9 }}>Find emergency clinics</p>
        </button>
      </div>

      {/* Emergency Request Form */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Request Emergency Assistance
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
              Emergency Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {emergencyTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setEmergencyType(type.id)}
                    style={{
                      padding: '12px',
                      border: emergencyType === type.id ? `2px solid ${type.color}` : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: emergencyType === type.id ? `${type.color}10` : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: type.color, margin: '0 auto 4px' }} />
                    <p style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937' }}>{type.name}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
              Location
            </label>
            <input
              type="text"
              placeholder="Enter your farm location or address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
              Description
            </label>
            <textarea
              placeholder="Describe the emergency situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            onClick={handleEmergencyCall}
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Phone style={{ width: '16px', height: '16px' }} />
            Send Emergency Request
          </button>
        </div>
      </div>

      {/* Emergency Services Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Clock style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Response Time</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            Average response time: 15-30 minutes for emergency calls. Mobile units available 24/7.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Expert Team</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            Qualified veterinarians and emergency technicians ready to handle any animal health crisis.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Shield style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Biosecurity</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            All emergency protocols follow strict biosecurity measures to prevent disease spread.
          </p>
        </div>
      </div>
    </div>
  )
}