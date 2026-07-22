import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
// FIX 1: PresentationControls hata kar OrbitControls import kiya
import { Environment, Float, Sparkles, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useState, useRef, useEffect, Suspense } from 'react' 
import { Model } from './Cyber_desk'

// --- 1. HOLOGRAPHIC SPHERE ---
const HolographicSphere = () => {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002
      ref.current.rotation.x += 0.001
    }
  })
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref} position={[0, 1.2, 1]}>
        <icosahedronGeometry args={[1.2, 3]} /> 
        <meshStandardMaterial color="#00D8FF" wireframe={true} emissive="#00D8FF" emissiveIntensity={2} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </Float>
  )
}

// --- 2. CINEMATIC CONTROLLER ---
const RoomController = ({ activeSection, isMobile }) => {
  const groupRef = useRef()

  useFrame(() => {
    let targetPos = new THREE.Vector3(0, 0, 0)
    let targetRot = new THREE.Euler(0, 0, 0)
    let targetScale = 1

    switch (activeSection) {
      case 'home': targetPos.set(2.5, -0.5, -1); targetRot.set(0.1, -0.2, 0); targetScale = 1; break;
      case 'about': targetPos.set(-2, -1, 1); targetRot.set(0.2, 0.4, 0); targetScale = 1.1; break;
      case 'education': targetPos.set(0, -2, -1.5); targetRot.set(0.3, 0, 0); targetScale = 1.2; break;
      case 'projects': targetPos.set(0, -1, 3.5); targetRot.set(0, 0, 0); targetScale = 1.4; break;
      case 'contact': targetPos.set(0, 0.5, -2); targetRot.set(-0.2, 0, 0); targetScale = 0.9; break;
      default: break;
    }

    if (groupRef.current) {
      groupRef.current.position.lerp(targetPos, 0.05)
      const currentQuat = new THREE.Quaternion().setFromEuler(groupRef.current.rotation)
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRot)
      currentQuat.slerp(targetQuat, 0.05)
      groupRef.current.rotation.setFromQuaternion(currentQuat)
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
    }
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <Model scale={1} position={[0, -1.5, 0]} />
      </Suspense>
      <HolographicSphere />
      <Sparkles count={50} scale={12} size={3} speed={0.4} opacity={0.3} color="#00D8FF" />
      <Sparkles count={30} scale={10} size={2} speed={0.2} opacity={0.2} color="#994DFF" />
    </group>
  )
}

// --- MAIN APP ---
export default function App() {
  const [activeSection, setActiveSection] = useState('home') 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('') 

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setFormStatus('sending');
    try {
      const response = await fetch("https://formspree.io/f/xzdngjjg", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', message: '' }); 
        setTimeout(() => setFormStatus(''), 3000); 
      } else setFormStatus('error');
    } catch (error) { setFormStatus('error'); }
  }

  const NavLink = ({ name, id }) => (
    <span onClick={() => setActiveSection(id)} style={{
      cursor: 'pointer', 
      color: activeSection === id ? '#fff' : 'rgba(255,255,255,0.6)',
      textShadow: activeSection === id ? '0 0 12px #00D8FF' : '0 2px 4px rgba(0,0,0,0.5)',
      marginRight: isMobile ? '10px' : '25px', 
      marginBottom: isMobile ? '10px' : '0',
      fontSize: isMobile ? '0.8rem' : '0.95rem', 
      fontFamily: '"Segoe UI", sans-serif', transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold'
    }}>
      {name}
    </span>
  )

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#010204', position: 'relative', overflow: 'hidden' }}>
      
      {/* Navbar */}
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', 
        padding: isMobile ? '15px 10px' : '25px 50px',
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', 
        zIndex: 20, pointerEvents: 'auto',
        background: 'linear-gradient(to bottom, rgba(1,2,4,0.9) 0%, rgba(1,2,4,0) 100%)'
      }}>
        <NavLink name="Home" id="home" />
        <NavLink name="About" id="about" />
        <NavLink name="Education" id="education" />
        <NavLink name="Projects" id="projects" />
        <NavLink name="Contact" id="contact" />
      </div>

      {/* UI Content Layer */}
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', 
        justifyContent: isMobile ? 'flex-end' : 'center', 
        paddingLeft: isMobile ? '5%' : (['home', 'education'].includes(activeSection) ? '8%' : '50%'),
        paddingRight: isMobile ? '5%' : '0',
        paddingBottom: isMobile ? '20px' : '0', 
        boxSizing: 'border-box', pointerEvents: 'none', zIndex: 10, textAlign: 'left',
        transition: 'all 1s cubic-bezier(0.25, 1, 0.5, 1)'
      }}>
        
        <div style={{ 
          background: 'radial-gradient(circle at top left, rgba(0, 216, 255, 0.08), rgba(2, 3, 8, 0.85))', 
          padding: isMobile ? '25px' : '50px', 
          borderRadius: '16px', 
          backdropFilter: 'blur(16px)', border: '1px solid rgba(0, 216, 255, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)', 
          maxWidth: isMobile ? '100%' : '650px', 
          maxHeight: isMobile ? '65vh' : 'auto', 
          overflowY: isMobile ? 'auto' : 'visible', 
          pointerEvents: 'auto',
          opacity: 1, animation: 'fadeIn 0.5s', transition: 'all 0.5s'
        }}>
          
          {activeSection === 'home' && (
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', lineHeight: '1.1', margin: '0 0 10px 0', background: 'linear-gradient(90deg, #ffffff, #00D8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '2px', fontFamily: '"Segoe UI", sans-serif', fontWeight: '900', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                MUHAMMAD MUSTAFA KHAN
              </h1>
              <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '600', color: '#994DFF', margin: '0 0 20px 0', fontFamily: '"Segoe UI", sans-serif', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                AI-Empowered Full-Stack Developer
              </h2>
              <p style={{ lineHeight: '1.7', color: '#ffffff', fontSize: isMobile ? '0.95rem' : '1.1rem', fontFamily: '"Segoe UI", sans-serif', fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                Building secure software architectures, intelligent backend systems, and immersive web experiences. Bridging the gap between network defenses and creative development.
              </p>
              <div style={{ marginTop: isMobile ? '15px' : '30px' }}>
                <button onClick={() => setActiveSection('projects')} style={{ padding: '12px 24px', background: 'linear-gradient(90deg, #00D8FF, #0088FF)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0, 216, 255, 0.5)', fontSize: '0.9rem' }}>
                  Explore Projects
                </button>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: '#ffffff', margin: '0 0 15px 0', fontFamily: '"Segoe UI", sans-serif', borderBottom: '2px solid rgba(0,216,255,0.4)', paddingBottom: '10px', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>About Me</h2>
              <p style={{ color: '#ffffff', fontSize: isMobile ? '0.95rem' : '1.15rem', lineHeight: '1.8', fontFamily: '"Segoe UI", sans-serif', fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                I am an AI-empowered full-stack developer with a deep focus on building secure software architectures and intelligent backend systems. My vision is to establish a major international software development company, bringing together creative web environments, game development, and robust network defenses.
              </p>
            </div>
          )}

          {activeSection === 'education' && (
            <div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: '#ffffff', margin: '0 0 15px 0', fontFamily: '"Segoe UI", sans-serif', borderBottom: '2px solid rgba(0,216,255,0.4)', paddingBottom: '10px', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>Education</h2>
              <div style={{ borderLeft: '3px solid #00D8FF', paddingLeft: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontFamily: '"Segoe UI", sans-serif', fontSize: isMobile ? '1.1rem' : '1.3rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Sir Syed University of Engineering & Technology</h3>
                <p style={{ margin: '0', color: '#00D8FF', fontFamily: '"Segoe UI", sans-serif', fontWeight: '600', fontSize: isMobile ? '0.9rem' : '1rem' }}>BS in Cyber Security and Networks</p>
              </div>
              <div style={{ borderLeft: '3px solid #994DFF', paddingLeft: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontFamily: '"Segoe UI", sans-serif', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>CAS HPGS</h3>
                <p style={{ margin: '0', color: '#ffffff', fontFamily: '"Segoe UI", sans-serif', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem' }}>Intermediate Education</p>
              </div>
              <div style={{ borderLeft: '3px solid #00D8FF', paddingLeft: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontFamily: '"Segoe UI", sans-serif', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>Mak Way Grammar School</h3>
                <p style={{ margin: '0', color: '#ffffff', fontFamily: '"Segoe UI", sans-serif', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem' }}>Matriculation (Computer Science)</p>
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: '#ffffff', margin: '0 0 15px 0', fontFamily: '"Segoe UI", sans-serif', borderBottom: '2px solid rgba(0,216,255,0.4)', paddingBottom: '10px', fontWeight: 'bold' }}>My Projects</h2>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0, 216, 255, 0.4)', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#00D8FF', fontFamily: '"Segoe UI", sans-serif', fontSize: isMobile ? '1.2rem' : '1.4rem' }}>ContextIQ</h3>
                <p style={{ margin: '0', color: '#ffffff', fontSize: isMobile ? '0.9rem' : '1.05rem', fontFamily: '"Segoe UI", sans-serif', lineHeight: '1.5' }}>AI-powered Chrome extension and backend platform for the Devpost Google Gemini Hackathon.</p>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(153, 77, 255, 0.4)' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#994DFF', fontFamily: '"Segoe UI", sans-serif', fontSize: isMobile ? '1.2rem' : '1.4rem' }}>Bank & Airline Management Systems</h3>
                <p style={{ margin: '0', color: '#ffffff', fontSize: isMobile ? '0.9rem' : '1.05rem', fontFamily: '"Segoe UI", sans-serif', lineHeight: '1.5' }}>Robust, secure command-line applications developed entirely in C for core logic handling.</p>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: '#ffffff', margin: '0 0 15px 0', fontFamily: '"Segoe UI", sans-serif', borderBottom: '2px solid rgba(0,216,255,0.4)', paddingBottom: '10px', fontWeight: 'bold' }}>Contact Me</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" name="name" placeholder="Your Name" required value={formData.name} onChange={handleInputChange} style={{ padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,216,255,0.5)', color: 'white', borderRadius: '8px', outline: 'none' }} />
                <input type="email" name="email" placeholder="Your Email" required value={formData.email} onChange={handleInputChange} style={{ padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,216,255,0.5)', color: 'white', borderRadius: '8px', outline: 'none' }} />
                <textarea name="message" placeholder="Message" rows="3" required value={formData.message} onChange={handleInputChange} style={{ padding: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,216,255,0.5)', color: 'white', borderRadius: '8px', outline: 'none', resize: 'none' }}></textarea>
                <button type="submit" disabled={formStatus === 'sending'} style={{ padding: '12px', background: 'linear-gradient(90deg, #00D8FF, #994DFF)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: formStatus === 'sending' ? 'not-allowed' : 'pointer', borderRadius: '8px', marginTop: '5px' }}>
                  {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus === 'success' && <p style={{ color: '#00D8FF', textAlign: 'center', marginTop: '5px', fontSize: '0.9rem' }}>Message sent successfully!</p>}
                {formStatus === 'error' && <p style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '5px', fontSize: '0.9rem' }}>Error sending message.</p>}
              </form>

              {/* --- GITHUB & LINKEDIN BUTTONS --- */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' }}>
                <a href="https://github.com/mustard-collab" target="_blank" rel="noopener noreferrer" 
                   style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid #994DFF', color: '#994DFF', textDecoration: 'none', fontFamily: '"Segoe UI", sans-serif', fontWeight: 'bold', borderRadius: '8px', transition: 'all 0.3s', boxShadow: '0 0 10px rgba(153,77,255,0.2)' }}
                   onMouseOver={(e) => { e.target.style.background = 'rgba(153,77,255,0.2)'; e.target.style.boxShadow = '0 0 15px rgba(153,77,255,0.6)'; }}
                   onMouseOut={(e) => { e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(153,77,255,0.2)'; }}
                >
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/muhammad-mustafa-khan-ab9979273" target="_blank" rel="noopener noreferrer" 
                   style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid #00D8FF', color: '#00D8FF', textDecoration: 'none', fontFamily: '"Segoe UI", sans-serif', fontWeight: 'bold', borderRadius: '8px', transition: 'all 0.3s', boxShadow: '0 0 10px rgba(0,216,255,0.2)' }}
                   onMouseOver={(e) => { e.target.style.background = 'rgba(0,216,255,0.2)'; e.target.style.boxShadow = '0 0 15px rgba(0,216,255,0.6)'; }}
                   onMouseOut={(e) => { e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(0,216,255,0.2)'; }}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      <Canvas dpr={1} camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <Environment preset="city" blur={1} />
        
        {/* FIX 2: OrbitControls lagaya jo makhan ki tarah smooth hai aur crash nahi hoga */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minAzimuthAngle={-0.3} 
          maxAzimuthAngle={0.3} 
          minPolarAngle={Math.PI / 2 - 0.2} 
          maxPolarAngle={Math.PI / 2 + 0.2} 
          enableDamping={true}
          dampingFactor={0.05}
        />

        <RoomController activeSection={activeSection} isMobile={isMobile} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.4} mipmapBlur intensity={0.8} resolutionScale={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}