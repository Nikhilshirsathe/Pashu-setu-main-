import { MessageCircle, Send, Image, Paperclip } from 'lucide-react'

export default function ChatSupport() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        Chat Support
      </h2>
      
      <div className="card p-6">
        <div className="h-96 bg-neutral-50 rounded-xl p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg max-w-xs">
                Hello! How can I help you today?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-xs">
                My cow seems unwell. Can you help?
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-neutral-600 hover:text-emerald-600">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-neutral-600 hover:text-emerald-600">
            <Image className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            placeholder="Type your message..."
            className="input flex-1"
          />
          <button className="btn btn-success">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}