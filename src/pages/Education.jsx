import { useState, useEffect } from 'react'
import { BookOpen, Scale, Users, Search, Calendar, Download, MessageCircle, ThumbsUp, Eye, FileText, Video, Image, Plus, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Education() {
  const [activeTab, setActiveTab] = useState('resources')
  const [searchTerm, setSearchTerm] = useState('')
  const [resources, setResources] = useState([])
  const [policies, setPolicies] = useState([])
  const [communityPosts, setCommunityPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Experience Sharing' })
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [postComments, setPostComments] = useState({})

  useEffect(() => {
    // Check for selected tab from sidebar
    const savedTab = localStorage.getItem('educationTab')
    if (savedTab) {
      setActiveTab(savedTab)
      localStorage.removeItem('educationTab')
    }
    
    // Listen for tab changes from sidebar
    const handleTabChange = () => {
      const savedTab = localStorage.getItem('educationTab')
      if (savedTab) {
        setActiveTab(savedTab)
        localStorage.removeItem('educationTab')
      }
    }
    
    window.addEventListener('educationTabChange', handleTabChange)
    fetchData()
    
    return () => {
      window.removeEventListener('educationTabChange', handleTabChange)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [resourcesRes, policiesRes, postsRes] = await Promise.all([
        supabase.from('educational_resources').select('*').order('created_at', { ascending: false }),
        supabase.from('government_policies').select('*').order('created_at', { ascending: false }),
        supabase.from('community_posts').select('*').order('created_at', { ascending: false })
      ])
      
      // Check if we got data from database
      if (resourcesRes.data && resourcesRes.data.length > 0) {
        setResources(resourcesRes.data)
      } else {
        setResources(getFallbackResources())
      }
      
      if (policiesRes.data && policiesRes.data.length > 0) {
        setPolicies(policiesRes.data)
      } else {
        setPolicies(getFallbackPolicies())
      }
      
      if (postsRes.data && postsRes.data.length > 0) {
        setCommunityPosts(postsRes.data)
      } else {
        setCommunityPosts(getFallbackPosts())
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      // Use fallback data if database fails
      setResources(getFallbackResources())
      setPolicies(getFallbackPolicies())
      setCommunityPosts(getFallbackPosts())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackResources = () => [
    {
      id: '1',
      title: 'Seasonal Disease Prevention in Cattle',
      type: 'article',
      category: 'Disease Prevention',
      description: 'Comprehensive guide on preventing common seasonal diseases in cattle including FMD, mastitis, and respiratory infections.',
      author: 'Dr. Rajesh Kumar',
      created_at: '2024-01-15',
      views: 1250,
      likes: 89,
      content: 'SEASONAL DISEASE PREVENTION IN CATTLE\n\nIntroduction:\nSeasonal diseases pose significant threats to cattle health and farm productivity. Understanding prevention strategies is crucial for maintaining healthy herds year-round.\n\nCommon Seasonal Diseases:\n\n1. FOOT AND MOUTH DISEASE (FMD)\n- Peak season: Monsoon and post-monsoon\n- Symptoms: Fever, blisters on mouth, feet, and udder\n- Prevention: Regular vaccination, quarantine new animals, disinfect premises\n\n2. MASTITIS\n- Peak season: Summer and rainy season\n- Symptoms: Swollen udder, abnormal milk, fever\n- Prevention: Proper milking hygiene, dry cow therapy, clean housing\n\n3. RESPIRATORY INFECTIONS\n- Peak season: Winter and monsoon\n- Symptoms: Coughing, nasal discharge, difficulty breathing\n- Prevention: Adequate ventilation, avoid overcrowding, vaccination\n\n4. TICK-BORNE DISEASES\n- Peak season: Monsoon\n- Symptoms: Fever, anemia, loss of appetite\n- Prevention: Regular tick control, use of acaricides, pasture management\n\nGeneral Prevention Strategies:\n\n• Vaccination Schedule: Follow recommended vaccination calendar\n• Biosecurity: Quarantine new animals for 21 days\n• Nutrition: Provide balanced feed with adequate vitamins and minerals\n• Housing: Ensure proper ventilation and drainage\n• Water Quality: Provide clean, fresh water daily\n• Regular Health Checks: Monitor animals daily for early signs\n• Record Keeping: Maintain detailed health records\n\nSeasonal Management:\n\nSUMMER:\n- Provide shade and adequate water\n- Monitor for heat stress\n- Increase mastitis prevention measures\n\nMONSOON:\n- Improve drainage around housing\n- Increase tick and fly control\n- Monitor for FMD and respiratory issues\n\nWINTER:\n- Provide windbreaks\n- Ensure adequate nutrition\n- Monitor for pneumonia\n\nConclusion:\nProactive seasonal disease prevention through vaccination, proper management, and regular veterinary consultation is essential for maintaining cattle health and farm profitability. Early detection and prompt treatment remain key to successful disease management.'
    },
    {
      id: '2',
      title: 'Cattle Vaccination Techniques',
      type: 'video',
      category: 'Vaccination',
      description: 'Professional demonstration of proper cattle vaccination techniques by veterinary experts.',
      author: 'Veterinary Training Institute',
      created_at: '2025-01-12',
      views: 2100,
      likes: 156,
      videoId: 'NeNqJU_Sf9A',
      duration: '12:45'
    },
    {
      id: '3',
      title: 'Dairy Farm Management',
      type: 'video',
      category: 'Farm Management',
      description: 'Complete guide to modern dairy farm management including hygiene, feeding, and health monitoring.',
      author: 'Agricultural Extension Service',
      created_at: '2025-01-10',
      views: 1850,
      likes: 134,
      videoId: 'eLKScfjYhac',
      duration: '18:30'
    }
  ]

  const getFallbackPolicies = () => [
    {
      id: '1',
      title: 'National Livestock Mission (NLM) Guidelines 2025',
      department: 'Ministry of Fisheries, Animal Husbandry & Dairying',
      created_at: '2025-01-18',
      status: 'Active',
      summary: 'Comprehensive guidelines for livestock development, breed improvement, and infrastructure development under NLM.',
      impact: 'High',
      pdf_url: 'https://dahd.nic.in/sites/default/filess/NLM%20Guidelines.pdf'
    },
    {
      id: '2',
      title: 'Livestock Health & Disease Control (LH&DC) Scheme',
      department: 'Department of Animal Husbandry & Dairying',
      created_at: '2025-01-14',
      status: 'Active',
      summary: 'Central sector scheme for prevention and control of animal diseases including FMD, PPR, and Brucellosis.',
      impact: 'High',
      pdf_url: 'https://dahd.nic.in/sites/default/filess/LH%26DC%20Guidelines.pdf'
    },
    {
      id: '3',
      title: 'Rashtriya Gokul Mission Guidelines',
      department: 'Department of Animal Husbandry & Dairying',
      created_at: '2025-01-08',
      status: 'Active',
      summary: 'Guidelines for indigenous cattle breed development and conservation through Gokul Grams and breeding programs.',
      impact: 'Medium',
      pdf_url: 'https://dahd.nic.in/sites/default/filess/RGM%20Guidelines.pdf'
    },
    {
      id: '4',
      title: 'Animal Quarantine and Certification Services Rules',
      department: 'Ministry of Agriculture & Farmers Welfare',
      created_at: '2025-01-05',
      status: 'Active',
      summary: 'Updated rules for import/export of animals and animal products, quarantine procedures, and health certification.',
      impact: 'Medium',
      pdf_url: 'https://dahd.nic.in/sites/default/filess/AQCS%20Rules.pdf'
    }
  ]

  const getFallbackPosts = () => [
    {
      id: '1',
      author_name: 'Ramesh Patel',
      author_role: 'Dairy Farmer',
      author_location: 'Gujarat',
      title: 'Successful Treatment of Mastitis Using Herbal Remedies',
      content: 'I want to share my experience treating mastitis in my dairy cows using traditional herbal remedies combined with modern veterinary care.',
      created_at: '2025-01-16',
      likes: 45,
      comments_count: 12,
      category: 'Experience Sharing'
    },
    {
      id: '2',
      author_name: 'Dr. Meera Singh',
      author_role: 'Veterinarian',
      author_location: 'Punjab',
      title: 'Early Detection Signs of Foot and Mouth Disease',
      content: 'As we enter the monsoon season, I want to highlight the early warning signs of FMD that every farmer should watch for.',
      created_at: '2025-01-13',
      likes: 78,
      comments_count: 23,
      category: 'Expert Advice'
    }
  ]

  const handleLike = async (type, id) => {
    try {
      if (type === 'resource') {
        const resource = resources.find(r => r.id === id)
        await supabase.from('educational_resources').update({ likes: resource.likes + 1 }).eq('id', id)
      } else if (type === 'post') {
        const post = communityPosts.find(p => p.id === id)
        await supabase.from('community_posts').update({ likes: post.likes + 1 }).eq('id', id)
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    }
    
    // Update local state regardless of database success
    if (type === 'resource') {
      setResources(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r))
    } else if (type === 'post') {
      setCommunityPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    }
  }

  const handlePolicyDownload = (policy) => {
    // Generate PDF content as HTML and convert to PDF
    const pdfContent = `
      <html>
        <head>
          <title>${policy.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 18px; font-weight: bold; margin: 10px 0; }
            .department { font-size: 14px; color: #666; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .content { line-height: 1.6; }
            ul { margin: 10px 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GOVERNMENT OF INDIA</h1>
            <div class="department">${policy.department}</div>
          </div>
          
          <div class="title">${policy.title}</div>
          
          <div class="section">
            <strong>Status:</strong> ${policy.status}<br>
            <strong>Impact Level:</strong> ${policy.impact}<br>
            <strong>Published:</strong> January 2025
          </div>
          
          <div class="section">
            <div class="section-title">EXECUTIVE SUMMARY</div>
            <div class="content">${policy.summary}</div>
          </div>
          
          <div class="section">
            <div class="section-title">DETAILED GUIDELINES</div>
            <div class="content">
              <h4>1. OBJECTIVE</h4>
              <p>This policy aims to strengthen the livestock sector through comprehensive guidelines and support mechanisms for farmers and stakeholders.</p>
              
              <h4>2. SCOPE</h4>
              <ul>
                <li>Coverage of all livestock categories</li>
                <li>Implementation across all states and union territories</li>
                <li>Integration with existing government schemes</li>
              </ul>
              
              <h4>3. KEY PROVISIONS</h4>
              <ul>
                <li>Financial assistance for infrastructure development</li>
                <li>Technical support and training programs</li>
                <li>Disease prevention and control measures</li>
                <li>Quality assurance and certification</li>
              </ul>
              
              <h4>4. IMPLEMENTATION</h4>
              <ul>
                <li>State-wise implementation through designated agencies</li>
                <li>Regular monitoring and evaluation</li>
                <li>Stakeholder consultation and feedback</li>
              </ul>
              
              <h4>5. BENEFITS</h4>
              <ul>
                <li>Enhanced livestock productivity</li>
                <li>Improved farmer income</li>
                <li>Better animal health management</li>
                <li>Sustainable development practices</li>
              </ul>
            </div>
          </div>
          
          <div class="section">
            <small>
              <p>For more information, visit: <a href="https://dahd.nic.in">https://dahd.nic.in</a></p>
              <p>This document is generated for educational purposes.</p>
              <p>For official policy documents, please visit the respective government websites.</p>
            </small>
          </div>
        </body>
      </html>
    `
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${policy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_policy.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    // Also trigger print dialog for PDF conversion
    const printWindow = window.open('', '_blank')
    printWindow.document.write(pdfContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleCommentClick = (post) => {
    if (!postComments[post.id]) {
      const sampleComments = [
        {
          id: 1,
          author: 'Priya Sharma',
          role: 'Veterinarian',
          content: 'Great insights! I\'ve seen similar results with herbal treatments in my practice.',
          time: '2 hours ago'
        },
        {
          id: 2,
          author: 'Amit Kumar',
          role: 'Dairy Farmer',
          content: 'Thank you for sharing this. Which herbs did you use specifically?',
          time: '4 hours ago'
        }
      ]
      setPostComments(prev => ({ ...prev, [post.id]: sampleComments }))
    }
    setSelectedPost(post)
  }

  const handleAddComment = (postId) => {
    if (!newComment.trim()) return
    
    const comment = {
      id: Date.now(),
      author: 'Current User',
      role: 'Farmer',
      content: newComment,
      time: 'Just now'
    }
    
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }))
    
    setCommunityPosts(prev => 
      prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)
    )
    
    setNewComment('')
  }

  const handleNewPost = async (e) => {
    e.preventDefault()
    if (!newPost.title || !newPost.content) return
    
    const newPostData = {
      id: Date.now().toString(),
      author_name: 'Current User',
      author_role: 'Farmer',
      author_location: 'India',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      created_at: new Date().toISOString(),
      likes: 0,
      comments_count: 0
    }
    
    try {
      const { data, error } = await supabase.from('community_posts').insert(newPostData).select()
      
      if (error) throw error
      setCommunityPosts(prev => [data[0], ...prev])
    } catch (error) {
      console.error('Error creating post:', error)
      // Add to local state if database fails
      setCommunityPosts(prev => [newPostData, ...prev])
    }
    
    setNewPost({ title: '', content: '', category: 'Experience Sharing' })
    setShowNewPostForm(false)
  }



  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'infographic': return <Image className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Learning & Awareness Hub</h2>
        <p className="text-gray-600">Educational resources and community knowledge sharing</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'resources'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Educational Resources
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'policies'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Scale className="w-4 h-4 inline mr-2" />
          Government Policies
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'community'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Community Platform
        </button>
      </div>

      {/* Educational Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getTypeIcon(resource.type)}
                      <span className="ml-1 capitalize">{resource.type}</span>
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{resource.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>By {resource.author}</span>
                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {resource.views}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {resource.likes}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        if (resource.type === 'video' && resource.videoId) {
                          setSelectedVideo(resource)
                        } else if (resource.type === 'article') {
                          setSelectedArticle(resource)
                        }
                        handleLike('resource', resource.id)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {resource.type === 'video' ? 'Watch Video' : 'Read Article'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{policy.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      policy.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {policy.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      policy.impact === 'High'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {policy.impact} Impact
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>{policy.department}</span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      January 2025
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{policy.summary}</p>
                </div>
                
                <button 
                  onClick={() => handlePolicyDownload(policy)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Platform Tab */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          {/* New Post Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {!showNewPostForm ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Share Your Knowledge</h3>
                <p className="text-gray-600 mb-4">Help fellow farmers by sharing your experiences and insights</p>
                <button 
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Post
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewPost} className="space-y-4">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Experience Sharing">Experience Sharing</option>
                  <option value="Expert Advice">Expert Advice</option>
                  <option value="Tips & Tricks">Tips & Tricks</option>
                </select>
                <textarea
                  placeholder="Share your knowledge..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-500"
                  required
                />
                <div className="flex space-x-3">
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewPostForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Community Posts */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{post.author_name}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.author_role}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.author_location}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => handleLike('post', post.id)}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {post.likes} Likes
                        </button>
                        <button 
                          onClick={() => handleCommentClick(post)}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments_count} Comments
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm">{selectedVideo.description}</p>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>By {selectedVideo.author}</span>
                <span>Duration: {selectedVideo.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedArticle.title}</h3>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>By {selectedArticle.author}</span>
                <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedArticle.category}</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedPost.title}</h3>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>By {selectedPost.author_name}</span>
                <span>{selectedPost.author_role}</span>
                <span>{selectedPost.author_location}</span>
                <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{selectedPost.category}</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{selectedPost.content}</p>
              
              <div className="flex items-center space-x-6 mb-6 pb-4 border-b">
                <button 
                  onClick={() => handleLike('post', selectedPost.id)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{selectedPost.likes} Likes</span>
                </button>
                <span className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedPost.comments_count} Comments</span>
                </span>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Comments</h4>
                
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                    <button 
                      onClick={() => handleAddComment(selectedPost.id)}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(postComments[selectedPost.id] || []).map((comment) => (
                    <div key={comment.id} className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{comment.author}</span>
                          <span className="text-sm text-gray-500">{comment.role}</span>
                          <span className="text-sm text-gray-400">{comment.time}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}