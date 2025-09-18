import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Consultation from './pages/Consultation'
import Lab from './pages/Lab'
import Emergency from './pages/Emergency'
import Education from './pages/Education'
import Alerts from './pages/Alerts'
import Pharmacy from './pages/Pharmacy'
import Records from './pages/Records'

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard' },
  consultation: { component: Consultation, title: 'Health & Consultation' },
  lab: { component: Lab, title: 'Lab & Diagnostics' },
  emergency: { component: Emergency, title: 'Emergency Services' },
  education: { component: Education, title: 'Education Hub' },
  alerts: { component: Alerts, title: 'Risk & Alerts' },
  pharmacy: { component: Pharmacy, title: 'Pharmacy' },
  records: { component: Records, title: 'Records Management' },
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const CurrentPage = pages[activeSection].component

  return (
    <div className="min-h-screen">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
      />
      
      <Header 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <main className="p-6 min-h-screen mt-20">
          <CurrentPage />
        </main>
      </div>
    </div>
  )
}