import { Menu, CloudSun, User, Bell, Search, ChevronDown, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Header({ isOpen, setIsOpen, user }) {
  return (
    <header className="glass shadow-xl border-b border-neutral-200/50 px-6 py-4 fixed top-0 left-0 right-0 z-30 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <Menu className="w-6 h-6 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Pashu Setu</h1>
            <p className="text-sm text-neutral-500">Animal Healthcare Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-neutral-100 rounded-xl px-4 py-2 space-x-2 hover:shadow-md transition-all duration-200">
            <Search className="w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search animals, records..."
              className="bg-transparent text-sm text-neutral-600 placeholder-neutral-400 outline-none w-48"
            />
          </div>
          
          {/* Weather */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-105">
            <CloudSun className="w-5 h-5 text-blue-500" />
            <div className="text-sm">
              <span className="text-blue-700 font-semibold">28°C</span>
              <span className="text-blue-600 ml-1">Sunny</span>
            </div>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
            <Bell className="w-5 h-5 text-neutral-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200">
              <User className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {user?.email || 'User'}
              </span>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-2 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-neutral-600 group-hover:text-red-600" />
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}