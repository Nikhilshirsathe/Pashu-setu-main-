import { BookOpen, Play, Download, Star, Clock, Users, Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function Education() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showLearningPath, setShowLearningPath] = useState(null)
  const [activeCourse, setActiveCourse] = useState(null)
  const [courseProgress, setCourseProgress] = useState({})
  const [currentLesson, setCurrentLesson] = useState(0)

  const categories = [
    { id: 'all', name: 'All Topics', count: 24 },
    { id: 'health', name: 'Animal Health', count: 8 },
    { id: 'nutrition', name: 'Nutrition', count: 6 },
    { id: 'breeding', name: 'Breeding', count: 5 },
    { id: 'management', name: 'Farm Management', count: 5 }
  ]

  const courses = [
    {
      id: 1,
      title: 'Basic Animal Health Management',
      category: 'health',
      duration: '2 hours',
      rating: 4.8,
      students: 1250,
      type: 'video',
      description: 'Learn fundamental principles of keeping your animals healthy',
      progress: courseProgress[1] || 0,
      lessons: [
        { id: 1, title: 'Introduction to Animal Health', duration: '15 min', content: 'Animal health is fundamental to successful farming. Healthy animals are more productive, have better reproduction rates, and provide higher quality products. This lesson covers the basic principles of animal health management, including understanding normal behavior, recognizing signs of good health, and the economic importance of maintaining healthy livestock. Key indicators of healthy animals include bright eyes, good appetite, normal body temperature (38-39°C for cattle), regular breathing, and active behavior.', videoUrl: 'https://youtu.be/uiC_-RTGTLM?si=jlsuuj1Cs78uJxNG' },
        { id: 2, title: 'Daily Health Monitoring', duration: '20 min', content: 'Daily health checks are essential for early disease detection. Start by observing animals from a distance to note their behavior, posture, and movement. Look for signs like isolation from the herd, reduced appetite, abnormal discharge from eyes or nose, limping, or changes in milk production. Check body temperature using a rectal thermometer - normal ranges are 38-39°C for cattle, 38.5-40°C for sheep/goats. Monitor breathing rate (12-20 breaths per minute for cattle) and check for coughing or labored breathing.', videoUrl: 'https://youtu.be/Ck1fnrUMFKE?si=J1_BTDvz9ZT6rSdT' },
        { id: 3, title: 'Common Health Issues', duration: '25 min', content: 'The most common health problems in farm animals include: 1) Mastitis - inflammation of mammary glands causing reduced milk quality and quantity. 2) Foot and Mouth Disease - highly contagious viral disease causing fever and blisters. 3) Respiratory infections - causing coughing, nasal discharge, and breathing difficulties. 4) Digestive disorders like bloat and acidosis from improper feeding. 5) Parasitic infections both internal (worms) and external (ticks, lice). Early recognition and prompt treatment are crucial for preventing spread and minimizing economic losses.', videoUrl: 'https://youtu.be/nV7lk3lht60?si=te81W03Vtl7tEMhs' },
        { id: 4, title: 'When to Call a Vet', duration: '15 min', content: 'Call a veterinarian immediately for: High fever (above 40°C), difficulty breathing, severe diarrhea or constipation, inability to stand or walk, signs of pain like grinding teeth or restlessness, sudden drop in milk production, abnormal discharge, loss of appetite for more than 24 hours, or any unusual behavior. For pregnant animals, call for prolonged labor, retained placenta, or signs of pregnancy complications. Emergency situations require immediate veterinary attention to prevent death or permanent damage.', videoUrl: 'https://youtu.be/qjLHifQJxAc?si=SgKZlo2vJ8Y2bviR' },
        { id: 5, title: 'Preventive Care', duration: '20 min', content: 'Prevention is always better than treatment. Key preventive measures include: 1) Vaccination schedules - FMD every 6 months, Brucellosis before breeding, annual BVD vaccination. 2) Regular deworming every 3-4 months. 3) Proper nutrition with balanced minerals and vitamins. 4) Clean water supply changed daily. 5) Good hygiene in housing with regular cleaning and disinfection. 6) Quarantine new animals for 2-3 weeks. 7) Maintain proper ventilation and avoid overcrowding. 8) Regular hoof trimming and body condition scoring.', videoUrl: 'https://youtu.be/avY3IjwqdPQ?si=T7Kdlt1t4stLaGwa' }
      ]
    },
    {
      id: 2,
      title: 'Cattle Nutrition Guidelines',
      category: 'nutrition',
      duration: '1.5 hours',
      rating: 4.6,
      students: 890,
      type: 'document',
      description: 'Complete guide to proper cattle feeding and nutrition',
      progress: courseProgress[2] || 0,
      lessons: [
        { id: 1, title: 'Nutritional Requirements', duration: '20 min', content: 'Cattle require six essential nutrients: water, carbohydrates, proteins, fats, vitamins, and minerals. Adult cattle need 2-3% of their body weight in dry matter daily. Protein requirements vary: 8-10% for maintenance, 12-14% for lactating cows, 14-16% for growing animals. Energy needs are met through carbohydrates (50-70% of diet) from grasses, hay, and grains. Essential minerals include calcium, phosphorus (2:1 ratio), salt, and trace elements like copper, zinc, selenium. Vitamins A, D, E are crucial, with vitamin A being most important for reproduction and immunity.' },
        { id: 2, title: 'Feed Types and Quality', duration: '25 min', content: 'Feed types include: 1) Roughages (grass, hay, silage) - should be 60-70% of diet, check for mold, dust, and proper color. 2) Concentrates (grains, oilcakes) - provide energy and protein, store in dry conditions. 3) Green fodder - fresh grass, maize, sorghum provide vitamins and minerals. Quality indicators: good smell (no musty odor), proper color (green for grass, golden for grains), no visible mold or insects, appropriate moisture content (12-14% for grains). Avoid feeding moldy, dusty, or contaminated feed as it can cause digestive disorders and toxicity.' },
        { id: 3, title: 'Feeding Schedules', duration: '15 min', content: 'Establish regular feeding times - typically 2-3 times daily at 6-8 hour intervals. Morning feeding (6-7 AM): 40% of daily ration with fresh fodder. Afternoon feeding (2-3 PM): 30% with concentrate feed. Evening feeding (6-7 PM): 30% with roughage. Provide concentrate 30 minutes before milking to stimulate milk let-down. Gradually change feed over 7-10 days to avoid digestive upset. Lactating animals need more frequent feeding (3-4 times daily). Always feed according to body weight, production stage, and weather conditions.' },
        { id: 4, title: 'Water Management', duration: '20 min', content: 'Water is the most important nutrient - cattle need 30-50 liters per day, lactating cows need 3-5 liters per liter of milk produced. Provide clean, fresh water at all times in clean containers. Water temperature should be 10-20°C for optimal consumption. Check water quality regularly - it should be colorless, odorless, and free from harmful bacteria. Clean water containers daily and disinfect weekly. In hot weather, increase water availability as consumption can double. Poor water quality can reduce feed intake by 25% and milk production significantly.' }
      ]
    },
    {
      id: 3,
      title: 'Common Diseases in Farm Animals',
      category: 'health',
      duration: '2 hours',
      rating: 4.9,
      students: 2100,
      type: 'video',
      description: 'Learn about common diseases affecting livestock and their prevention',
      progress: courseProgress[3] || 0,
      lessons: [
        { id: 1, title: 'Introduction to Animal Diseases', duration: '20 min', content: 'Animal diseases significantly impact farm productivity and profitability. Diseases can be classified as: 1) Infectious (caused by bacteria, viruses, parasites) - spread between animals. 2) Non-infectious (nutritional, genetic, environmental) - do not spread. Common infectious diseases include FMD, mastitis, pneumonia, and diarrhea. Economic losses include reduced milk production (20-50%), poor reproduction rates, treatment costs, and mortality. Prevention through vaccination, good hygiene, and proper nutrition is more cost-effective than treatment. Understanding disease patterns helps in planning preventive measures.', videoUrl: 'https://youtu.be/nV7lk3lht60?si=te81W03Vtl7tEMhs' },
        { id: 2, title: 'Mastitis in Dairy Animals', duration: '25 min', content: 'Mastitis is inflammation of mammary glands, causing 70% of dairy losses. Types: 1) Clinical - visible symptoms like swollen udder, abnormal milk, fever. 2) Subclinical - no visible signs but reduced milk quality. Causes: bacterial infection through teat canal, poor milking hygiene, environmental contamination. Symptoms: hot, swollen, painful udder; clots or blood in milk; reduced milk yield; fever above 39.5°C. Prevention: proper milking technique, teat dipping with iodine solution, dry cow therapy, clean environment. Treatment: antibiotics as per veterinary advice, frequent milking, anti-inflammatory drugs.', videoUrl: 'https://youtu.be/qjLHifQJxAc?si=SgKZlo2vJ8Y2bviR' },
        { id: 3, title: 'Foot and Mouth Disease', duration: '20 min', content: 'FMD is highly contagious viral disease affecting cloven-hoofed animals. Symptoms: fever (40-41°C), blisters on mouth, tongue, feet, and teats; excessive salivation; lameness; reduced milk production. Spreads through direct contact, contaminated feed/water, airborne droplets, and vehicles. Prevention: vaccination every 6 months with trivalent vaccine (O, A, Asia-1 strains), quarantine new animals, disinfect vehicles and equipment, restrict visitor movement. No specific treatment - provide supportive care, soft feed, clean water, wound care for blisters. Report suspected cases to veterinary authorities immediately.' },
        { id: 4, title: 'Respiratory Diseases', duration: '25 min', content: 'Common respiratory diseases include pneumonia, bronchitis, and shipping fever. Causes: viral/bacterial infections, stress, poor ventilation, overcrowding, sudden weather changes. Symptoms: coughing, nasal discharge, difficulty breathing, fever, reduced appetite, depression. Pneumonia signs: rapid breathing (>30/min), mouth breathing, extended neck. Prevention: adequate ventilation, avoid overcrowding, reduce stress, vaccination against IBR/BVD, quarantine sick animals. Treatment: antibiotics for bacterial infections, anti-inflammatory drugs, supportive care with good nutrition and clean environment. Ensure proper air circulation in animal housing.' },
        { id: 5, title: 'Digestive Disorders', duration: '20 min', content: 'Common digestive disorders: 1) Bloat - gas accumulation in rumen, causes distended left side, difficulty breathing. Emergency treatment: trocar insertion, avoid rich legume pastures. 2) Acidosis - from excess grain feeding, causes diarrhea, dehydration, lameness. Prevention: gradual feed changes, adequate fiber. 3) Diarrhea - from infections, poor feed quality, stress. Treatment: fluid therapy, probiotics, identify underlying cause. 4) Constipation - from inadequate water, poor quality feed. Provide plenty of clean water, laxatives if needed. Maintain proper feed ratios and feeding schedules.' },
        { id: 6, title: 'Parasitic Infections', duration: '30 min', content: 'Internal parasites: 1) Roundworms - cause diarrhea, weight loss, anemia. 2) Tapeworms - segments visible in feces. 3) Liver flukes - cause liver damage, bottle jaw. External parasites: 1) Ticks - transmit diseases, cause anemia. 2) Lice - cause itching, hair loss. 3) Flies - spread diseases, reduce milk production. Control: regular deworming every 3-4 months, rotational grazing, tick control sprays, maintain clean environment. Use fecal egg count to monitor worm burden. Deworm all animals simultaneously to prevent reinfection. Choose appropriate anthelmintics based on parasite type and resistance patterns.', videoUrl: 'https://youtu.be/nV7lk3lht60?si=te81W03Vtl7tEMhs' }
      ]
    },
    {
      id: 5,
      title: 'Animal Health Management',
      category: 'health',
      duration: '1.5 hours',
      rating: 4.8,
      students: 1850,
      type: 'video',
      description: 'Comprehensive guide to maintaining animal health and preventing diseases',
      progress: courseProgress[5] || 0,
      lessons: [
        { id: 1, title: 'Daily Health Monitoring', duration: '20 min', content: 'Conduct systematic daily health checks: 1) Visual observation from distance - note behavior, posture, movement, appetite. 2) Close examination - check eyes (bright, clear), nose (no discharge), mouth (pink gums), body temperature (38-39°C normal). 3) Monitor vital signs - breathing rate (12-20/min for cattle), heart rate (60-80/min). 4) Check production records - milk yield, feed consumption. 5) Examine body condition score (1-5 scale, ideal 3-3.5). Record observations in health register. Early detection saves treatment costs and prevents disease spread. Train farm workers to recognize abnormal signs.', videoUrl: 'https://youtu.be/avY3IjwqdPQ?si=T7Kdlt1t4stLaGwa' },
        { id: 2, title: 'Vaccination Schedules', duration: '25 min', content: 'Essential vaccination schedule: 1) FMD - every 6 months (all animals above 4 months). 2) Brucellosis - heifers at 4-8 months (S19 vaccine). 3) BVD - annual vaccination. 4) IBR - annual or as per outbreak. 5) Clostridial diseases - annual (8-in-1 vaccine). 6) Rabies - annual in endemic areas. Maintain cold chain (2-8°C), use sterile needles, record vaccination dates, observe animals for adverse reactions. Pregnant animals need special consideration - avoid live vaccines. Consult veterinarian for farm-specific vaccination calendar based on local disease prevalence and risk factors.', videoUrl: 'https://youtu.be/nV7lk3lht60?si=te81W03Vtl7tEMhs' },
        { id: 3, title: 'Nutrition and Health', duration: '20 min', content: 'Proper nutrition is foundation of animal health. Malnutrition leads to: reduced immunity, poor reproduction, stunted growth, increased disease susceptibility. Key nutritional factors: 1) Energy balance - prevent ketosis in dairy cows, maintain body condition. 2) Protein quality - essential amino acids for growth and milk production. 3) Mineral balance - calcium/phosphorus ratio (2:1), adequate salt, trace elements. 4) Vitamin supplementation - especially A, D, E. 5) Water quality and quantity. Nutritional diseases: milk fever (calcium deficiency), grass tetany (magnesium deficiency), white muscle disease (selenium deficiency). Regular body condition scoring helps monitor nutritional status.' },
        { id: 4, title: 'Biosecurity Measures', duration: '25 min', content: 'Biosecurity prevents disease introduction and spread: 1) Perimeter security - fencing, controlled entry points, visitor log. 2) Quarantine - isolate new animals for 21 days, test for diseases. 3) Sanitation - disinfect vehicles, equipment, footwear; use footbaths with 2% formalin. 4) Personnel hygiene - clean clothes, hand washing, dedicated farm clothing. 5) Feed security - avoid contaminated feed, proper storage. 6) Water source protection - prevent contamination from wildlife, other farms. 7) Waste management - proper disposal of dead animals, manure management. 8) Vector control - control flies, rodents, wild birds. Implement all-in-all-out system where possible.' }
      ]
    },
    {
      id: 4,
      title: 'Modern Breeding Techniques',
      category: 'breeding',
      duration: '2.5 hours',
      rating: 4.7,
      students: 650,
      type: 'video',
      description: 'Advanced breeding methods for improved livestock',
      progress: courseProgress[4] || 0,
      lessons: [
        { id: 1, title: 'Breeding Fundamentals', duration: '30 min', content: 'Animal breeding aims to improve genetic merit of livestock through selection and mating. Key principles: 1) Heritability - traits passed from parents to offspring (milk yield 25-30%, fertility 5-10%). 2) Genetic variation - differences between animals provide selection opportunity. 3) Selection intensity - choosing top performers as parents. 4) Generation interval - time between birth of parents and offspring. Breeding objectives: increase production (milk, meat), improve efficiency, enhance disease resistance, better adaptation to environment. Understand breed characteristics: Holstein for milk, Jersey for fat%, Gir for heat tolerance. Maintain breeding records for genetic evaluation.' },
        { id: 2, title: 'Selection Criteria', duration: '35 min', content: 'Select breeding animals based on: 1) Production records - milk yield, fat%, protein%, lactation length. 2) Reproductive performance - age at first calving, calving interval, conception rate. 3) Health records - disease resistance, longevity, somatic cell count. 4) Physical traits - udder conformation, body structure, feet and legs. 5) Pedigree information - parent and grandparent performance. Selection tools: Estimated Breeding Values (EBV), Total Merit Index (TMI). Cull animals with: poor production, reproductive problems, chronic diseases, poor conformation. Maintain genetic diversity to avoid inbreeding depression. Use proven bulls with high genetic merit.' },
        { id: 3, title: 'Artificial Insemination', duration: '40 min', content: 'AI advantages: genetic improvement, disease control, cost-effective, breeding records. AI process: 1) Heat detection - standing heat, mucus discharge, restlessness. 2) Timing - inseminate 12-18 hours after heat onset. 3) Technique - proper restraint, clean equipment, cervical deposition. 4) Semen handling - thaw at 37°C for 30 seconds, use immediately. Equipment: AI gun, sheaths, gloves, thermometer. Success factors: accurate heat detection (80% success rate), proper timing, skilled technician, good body condition of cow. Pregnancy diagnosis at 45-60 days post-AI. Maintain AI records for genetic evaluation and herd management.' },
        { id: 4, title: 'Pregnancy Management', duration: '25 min', content: 'Pregnancy management ensures healthy calves and mothers: 1) Nutrition - increase feed by 25% in last trimester, adequate protein and minerals. 2) Health monitoring - regular checkups, vaccination schedule, parasite control. 3) Exercise - moderate exercise prevents dystocia. 4) Housing - clean, dry, comfortable maternity pen. 5) Dry period - 60 days before calving, gradual feed reduction. Pre-calving signs: udder development, relaxed pelvic ligaments, behavioral changes. Calving assistance: intervene only if necessary, maintain hygiene, call veterinarian for complications. Post-calving care: colostrum feeding within 2 hours, navel disinfection, monitor for retained placenta.' }
      ]
    }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ backgroundColor: '#f9fafa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
          Education Hub
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Learn best practices for animal care and farm management
        </p>
      </div>

      {/* Search and Filter */}
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
            placeholder="Search courses..."
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

      {/* Quick Learning Paths */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowLearningPath('beginner')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <BookOpen style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Beginner's Guide</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Start with basic animal care</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowLearningPath('videos')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Play style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Video Tutorials</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Watch expert demonstrations</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setShowLearningPath('resources')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Download style={{ width: '20px', height: '20px', color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Resources</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Download guides and charts</p>
        </div>
      </div>

      {/* Featured Courses */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
          Featured Courses
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredCourses.map((course) => (
            <div key={course.id} className="card">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {course.title}
                  </h3>
                  <div style={{ 
                    background: course.type === 'video' ? '#dbeafe' : '#fef3c7',
                    color: course.type === 'video' ? '#1d4ed8' : '#d97706',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {course.type === 'video' ? 'Video' : 'Document'}
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  {course.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{course.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star style={{ width: '14px', height: '14px', color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{course.rating}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{course.students}</span>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{course.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                      <div style={{ 
                        width: `${course.progress}%`, 
                        height: '100%', 
                        background: '#059669', 
                        borderRadius: '2px' 
                      }} />
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedCourse(course)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: course.progress > 0 ? '#f3f4f6' : '#059669',
                  color: course.progress > 0 ? '#374151' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Play style={{ width: '14px', height: '14px' }} />
                {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Stats */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Your Learning Progress
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              3
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Courses Completed</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              12h
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Learning Time</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              85%
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Average Score</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              #12
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Leaderboard Rank</p>
          </div>
        </div>
      </div>

      {/* Course Player */}
      {activeCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Course Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                {activeCourse.title}
              </h1>
              <p style={{ color: '#6b7280' }}>Lesson {currentLesson + 1} of {activeCourse.lessons.length}</p>
            </div>
            <button 
              onClick={() => {
                setActiveCourse(null)
                setCurrentLesson(0)
              }}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Exit Course
            </button>
          </div>
          
          {/* Course Content */}
          <div style={{ display: 'flex', flex: 1 }}>
            {/* Lesson Content */}
            <div style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                  {activeCourse.lessons[currentLesson]?.title}
                </h2>
                
                {activeCourse.lessons[currentLesson]?.videoUrl ? (
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '12px',
                      background: '#000',
                      marginBottom: '20px'
                    }}>
                      <iframe
                        src={activeCourse.lessons[currentLesson].videoUrl.replace('youtu.be/', 'www.youtube.com/embed/').replace('?si=', '?')}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={activeCourse.lessons[currentLesson].title}
                      />
                    </div>
                  </div>
                ) : null}
                
                <div style={{
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Lesson Content</h3>
                  <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
                    {activeCourse.lessons[currentLesson]?.content}
                  </div>
                </div>
                
                {!activeCourse.lessons[currentLesson]?.videoUrl && (
                  <div style={{ 
                    background: '#f3f4f6', 
                    padding: '30px', 
                    borderRadius: '12px', 
                    marginBottom: '30px',
                    minHeight: '200px',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <p>This lesson contains text-based content. Please refer to the lesson content section above.</p>
                  </div>
                )}
                
                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                  <button 
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    style={{
                      padding: '12px 24px',
                      background: currentLesson === 0 ? '#f3f4f6' : '#059669',
                      color: currentLesson === 0 ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentLesson === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous Lesson
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (currentLesson < activeCourse.lessons.length - 1) {
                        setCurrentLesson(currentLesson + 1)
                      } else {
                        // Course completed
                        const newProgress = { ...courseProgress }
                        newProgress[activeCourse.id] = 100
                        setCourseProgress(newProgress)
                        alert('Congratulations! You have completed the course!')
                        setActiveCourse(null)
                        setCurrentLesson(0)
                      }
                      
                      // Update progress
                      const progress = Math.round(((currentLesson + 1) / activeCourse.lessons.length) * 100)
                      const newProgress = { ...courseProgress }
                      newProgress[activeCourse.id] = progress
                      setCourseProgress(newProgress)
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {currentLesson < activeCourse.lessons.length - 1 ? 'Next Lesson' : 'Complete Course'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Lesson Sidebar */}
            <div style={{
              width: '300px',
              background: '#f9fafb',
              borderLeft: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Course Lessons</h3>
              <div style={{ space: '8px' }}>
                {activeCourse.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    style={{
                      padding: '12px',
                      background: index === currentLesson ? '#059669' : '#fff',
                      color: index === currentLesson ? '#fff' : '#374151',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {index + 1}. {lesson.title}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {lesson.duration}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress */}
              <div style={{ marginTop: '20px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Progress</h4>
                <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                  <div style={{
                    background: '#059669',
                    height: '100%',
                    borderRadius: '4px',
                    width: `${Math.round(((currentLesson + 1) / activeCourse.lessons.length) * 100)}%`
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {Math.round(((currentLesson + 1) / activeCourse.lessons.length) * 100)}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Course Preview Modal */}
      {selectedCourse && !activeCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
              {selectedCourse.title}
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
              {selectedCourse.description}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Course Lessons:</h3>
              <div style={{ space: '8px' }}>
                {selectedCourse.lessons.map((lesson, index) => (
                  <div key={lesson.id} style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {index + 1}. {lesson.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Duration: {lesson.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  setActiveCourse(selectedCourse)
                  setSelectedCourse(null)
                  setCurrentLesson(0)
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Start Learning
              </button>
              <button 
                onClick={() => setSelectedCourse(null)}
                style={{
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Path Modal */}
      {showLearningPath && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              {showLearningPath === 'beginner' && 'Beginner Learning Path'}
              {showLearningPath === 'videos' && 'Video Tutorial Library'}
              {showLearningPath === 'resources' && 'Downloadable Resources'}
            </h2>
            
            {showLearningPath === 'beginner' && (
              <div>
                <p style={{ marginBottom: '16px', color: '#6b7280' }}>Start your journey with these essential courses:</p>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: '600' }}>1. Basic Animal Health Management</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Learn fundamental principles of keeping animals healthy</p>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: '600' }}>2. Common Diseases in Farm Animals</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Identify and prevent common livestock diseases</p>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: '600' }}>3. Cattle Nutrition Guidelines</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Complete guide to proper feeding and nutrition</p>
                </div>
              </div>
            )}
            
            {showLearningPath === 'videos' && (
              <div>
                <p style={{ marginBottom: '16px', color: '#6b7280' }}>Watch expert demonstrations:</p>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: '600' }}>🎥 Common Cattle Diseases</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Educational video on disease prevention and treatment</p>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: '600' }}>🎥 Animal Health Management</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Comprehensive health management practices</p>
                </div>
              </div>
            )}
            
            {showLearningPath === 'resources' && (
              <div>
                <p style={{ marginBottom: '16px', color: '#6b7280' }}>Download helpful guides:</p>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                  const link = document.createElement('a')
                  link.href = 'https://dahd.gov.in/sites/default/files/2025-05/Annual-Report202425.pdf'
                  link.target = '_blank'
                  link.click()
                }}>
                  <h4 style={{ fontWeight: '600' }}>📊 DAHD Annual Report 2024-25</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Official government report on animal husbandry and dairying</p>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                  const link = document.createElement('a')
                  link.href = '/resources/animal-health-checklist.pdf'
                  link.download = 'animal-health-checklist.pdf'
                  link.click()
                }}>
                  <h4 style={{ fontWeight: '600' }}>📄 Animal Health Checklist</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Daily health monitoring checklist</p>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                  const link = document.createElement('a')
                  link.href = '/resources/vaccination-schedule.pdf'
                  link.target = '_blank'
                  link.click()
                }}>
                  <h4 style={{ fontWeight: '600' }}>📋 Vaccination Schedule Template</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Track vaccination dates and schedules</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowLearningPath(null)}
              style={{
                marginTop: '20px',
                padding: '10px 16px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}