import { TestTube, Calendar, Clock, CheckCircle, AlertCircle, Truck, FileText, Plus } from 'lucide-react'
import { useState } from 'react'

export default function Lab() {
  const [activeTab, setActiveTab] = useState('request')

  const sampleRequests = [
    {
      id: 1,
      animalName: 'Cow 1',
      testType: 'Blood Test',
      status: 'pending',
      requestDate: '2024-01-15',
      expectedDate: '2024-01-17'
    },
    {
      id: 2,
      animalName: 'Cow 2',
      testType: 'Milk Quality',
      status: 'completed',
      requestDate: '2024-01-10',
      completedDate: '2024-01-12'
    }
  ]

  const testTypes = [
    { id: 'blood', name: 'Blood Test', price: 420, originalPrice: 500, discount: 16, duration: '2-3 days' },
    { id: 'milk', name: 'Milk Quality', price: 240, originalPrice: 300, discount: 20, duration: '1-2 days' },
    { id: 'urine', name: 'Urine Analysis', price: 320, originalPrice: 400, discount: 20, duration: '2-3 days' },
    { id: 'fecal', name: 'Fecal Examination', price: 280, originalPrice: 350, discount: 20, duration: '1-2 days' },
    { id: 'pregnancy', name: 'Pregnancy Test', price: 180, originalPrice: 200, discount: 10, duration: '1 day' },
    { id: 'disease', name: 'Disease Screening', price: 350, originalPrice: 450, discount: 22, duration: '3-4 days' }
  ]

  return (
    <div style={{ backgroundColor: '#f9fafa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
          Lab & Diagnostics
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Affordable lab tests with up to 30% discount for farmers
        </p>
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a',
          padding: '8px 12px', 
          borderRadius: '6px', 
          marginTop: '8px',
          display: 'inline-block'
        }}>
          <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
            💰 Special Pricing for Farmers
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '25px',
        background: '#f3f4f6',
        padding: '4px',
        borderRadius: '8px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('request')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'request' ? '#fff' : 'transparent',
            color: activeTab === 'request' ? '#1f2937' : '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Request Tests
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'samples' ? '#fff' : 'transparent',
            color: activeTab === 'samples' ? '#1f2937' : '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          My Samples
        </button>
        <button
          onClick={() => setActiveTab('results')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'results' ? '#fff' : 'transparent',
            color: activeTab === 'results' ? '#1f2937' : '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Results
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <TestTube style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Quick Test Request</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Request common lab tests</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Truck style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Sample Pickup</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Schedule collection service</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FileText style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Digital Reports</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Access test results online</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'request' && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
            Available Lab Tests
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            {testTypes.map((test) => (
              <div key={test.id} className="card">
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {test.name}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                          ₹{test.originalPrice}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                          ₹{test.price}
                        </span>
                      </div>
                      <div style={{ 
                        background: '#fef3c7', 
                        color: '#d97706', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        fontWeight: '600',
                        marginTop: '4px',
                        width: 'fit-content'
                      }}>
                        {test.discount}% OFF
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {test.duration}
                    </span>
                  </div>
                </div>
                
                <button style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Request Test
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'samples' && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Sample Requests
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sampleRequests.map((request) => (
              <div key={request.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: request.status === 'completed' ? '#dcfce7' : '#fef3c7', 
                    padding: '8px', 
                    borderRadius: '8px' 
                  }}>
                    {request.status === 'completed' ? 
                      <CheckCircle style={{ width: '20px', height: '20px', color: '#059669' }} /> :
                      <Clock style={{ width: '20px', height: '20px', color: '#d97706' }} />
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {request.testType} - {request.animalName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Requested: {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                    {request.status === 'pending' && (
                      <p style={{ fontSize: '12px', color: '#d97706' }}>
                        Expected: {new Date(request.expectedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ 
                  background: request.status === 'completed' ? '#dcfce7' : '#fef3c7',
                  color: request.status === 'completed' ? '#059669' : '#d97706',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {request.status === 'completed' ? 'Completed' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Test Results
          </h3>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No results available</p>
            <p style={{ fontSize: '14px' }}>Test results will appear here once completed</p>
          </div>
        </div>
      )}

      {/* Lab Services Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Truck style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Free Pickup</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            We provide free sample collection from your farm. Schedule pickup at your convenience.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TestTube style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Certified Lab</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            All tests performed in NABL accredited laboratories with quality assurance.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Clock style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Quick Results</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            Fast turnaround time with digital reports delivered directly to your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}