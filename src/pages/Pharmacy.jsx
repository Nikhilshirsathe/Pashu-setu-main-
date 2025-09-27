import { Pill, Search, ShoppingCart, Package, Truck, Star, Plus, Filter } from 'lucide-react'
import { useState } from 'react'

export default function Pharmacy() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Products', count: 24 },
    { id: 'antibiotics', name: 'Antibiotics', count: 8 },
    { id: 'vaccines', name: 'Vaccines', count: 6 },
    { id: 'supplements', name: 'Supplements', count: 10 }
  ]

  const products = [
    { id: 1, name: 'Amoxicillin 500mg', category: 'antibiotics', price: 225, originalPrice: 250, subsidy: 10, rating: 4.5, inStock: true, description: 'Broad-spectrum antibiotic for bacterial infections' },
    { id: 2, name: 'Vitamin B Complex', category: 'supplements', price: 144, originalPrice: 180, subsidy: 20, rating: 4.8, inStock: true, description: 'Essential vitamins for animal health' },
    { id: 3, name: 'FMD Vaccine', category: 'vaccines', price: 84, originalPrice: 120, subsidy: 30, rating: 4.7, inStock: true, description: 'Foot and mouth disease prevention' },
    { id: 4, name: 'Calcium Supplement', category: 'supplements', price: 160, originalPrice: 200, subsidy: 20, rating: 4.6, inStock: true, description: 'Bone health and milk production' },
    { id: 5, name: 'Deworming Tablet', category: 'antibiotics', price: 68, originalPrice: 80, subsidy: 15, rating: 4.4, inStock: true, description: 'Effective parasite control' },
    { id: 6, name: 'Iron Supplement', category: 'supplements', price: 120, originalPrice: 150, subsidy: 20, rating: 4.7, inStock: true, description: 'Prevents anemia in livestock' },
    { id: 7, name: 'Brucellosis Vaccine', category: 'vaccines', price: 75, originalPrice: 100, subsidy: 25, rating: 4.6, inStock: true, description: 'Brucellosis prevention vaccine' },
    { id: 8, name: 'Multivitamin Syrup', category: 'supplements', price: 176, originalPrice: 220, subsidy: 20, rating: 4.8, inStock: true, description: 'Complete nutrition support' }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  return (
    <div style={{ backgroundColor: '#f9fafa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
            Online Pharmacy
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Affordable veterinary medicines for farmers
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
              💰 Up to 30% Discount Available
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShoppingCart style={{ width: '16px', height: '16px' }} />
            Cart ({cart.length})
          </button>
        </div>
      </div>

      {/* Search and Categories */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '16px', 
            height: '16px', 
            color: '#6b7280' 
          }} />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fff'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                background: selectedCategory === category.id ? '#059669' : '#fff',
                color: selectedCategory === category.id ? '#fff' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
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
            <Package style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>My Orders</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Track your medicine orders</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Truck style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Free Delivery</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Free delivery on orders above ₹100</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Pill style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Prescription Upload</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Upload vet prescriptions</p>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
          Available Products
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {product.name}
                  </h3>
                  <div style={{ 
                    background: product.inStock ? '#dcfce7' : '#fee2e2',
                    color: product.inStock ? '#059669' : '#dc2626',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  {product.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star style={{ width: '14px', height: '14px', color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{product.rating}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                        ₹{product.originalPrice}
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                        ₹{product.price}
                      </span>
                    </div>
                    <div style={{ 
                      background: '#fef3c7', 
                      color: '#d97706', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      fontWeight: '600',
                      marginTop: '4px'
                    }}>
                      {product.subsidy}% OFF
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: product.inStock ? '#059669' : '#d1d5db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: product.inStock ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Government Partnership Info */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #0ea5e9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏛️</span>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1' }}>
            Government Partnership Program
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
          In collaboration with Ministry of Animal Husbandry & Dairying and leading NGOs to support farmers
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>Up to 30%</span>
            <p style={{ fontSize: '12px', color: '#0369a1' }}>Discount</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>FAST</span>
            <p style={{ fontSize: '12px', color: '#0369a1' }}>Delivery</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>24/7</span>
            <p style={{ fontSize: '12px', color: '#0369a1' }}>Support</p>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Popular Categories
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '12px' 
        }}>
          {categories.slice(1).map((category) => (
            <div 
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '16px',
                background: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <Pill style={{ width: '24px', height: '24px', color: '#059669', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{category.name}</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{category.count} products</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}