import { useState, useEffect } from 'react';

export default function Home() {
  // --- CORE ENGINE STATES ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  const [dashView, setDashView] = useState('analytics');
  const [loading, setLoading] = useState(false);
  
  // --- USER DATA & AUTH ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- LINK BUILDER ---
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);

  // --- NUEVOS ESTADOS PARA PASOS (VALUE & INFO STEPS) ---
  const [numSteps, setNumSteps] = useState(1);
  const [stepUrls, setStepUrls] = useState(['', '', '']);
  
  // --- CUSTOMIZATION ENGINE ---
  const [themeColor, setThemeColor] = useState('#00d2ff');
  const [accentColor, setAccentColor] = useState('#3a7bd5');
  const [glassOpacity, setGlassOpacity] = useState(0.8);

  // --- ADMIN & LOGS ---
  const [ownerPass, setOwnerPass] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [userMessages, setUserMessages] = useState([]);

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
    const storage = {
      'bx_accounts': setUserAccounts,
      'bx_links': setMyLinks,
      'bx_logs': setActivityLogs,
      'bx_messages': setUserMessages
    };
    Object.entries(storage).forEach(([key, setter]) => {
      const data = localStorage.getItem(key);
      if (data) setter(JSON.parse(data));
    });
    // SISTEMA DE MEMORIA: Recuperar sesión activa
    const activeSession = localStorage.getItem('bx_active_session');
    if (activeSession) { setCurrentUser(JSON.parse(activeSession)); setStep('user-dashboard'); }
  }, []);

  // --- LOGIC: GMAIL SYSTEM ---
  const sendVerification = async (targetStep) => {
    if (!email.includes('@')) { showNotify("❌ Invalid Email Format"); return; }
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'code', code })
      });
      if (res.ok) {
        setStep(targetStep);
        showNotify("📡 SECURITY CODE DISPATCHED");
      } else { showNotify("❌ GMAIL API ERROR"); }
    } catch (e) { showNotify("❌ CONNECTION FAILED"); }
    setLoading(false);
  };

  // --- LOGIC: AUTH ---
  const finalizeRegistration = () => {
    if (password.length < 4) { showNotify("❌ PIN TOO SHORT"); return; }
    const newAcc = { email, password, joined: new Date().toLocaleString() };
    const updated = [...userAccounts, newAcc];
    setUserAccounts(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    showNotify("🎉 ACCOUNT INITIALIZED");
    setStep('login');
  };

  const handleLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_active_session', JSON.stringify(user)); // GUARDAR MEMORIA
      setStep('user-dashboard');
      showNotify(`WELCOME BACK, ${email.split('@')[0].toUpperCase()}`);
    } else { showNotify("❌ ACCESS DENIED: WRONG PIN"); }
  };

  // --- LOGIC: SMART LINK ENGINE (MODIFICADO A INGLÉS) ---
  const createSmartLink = () => {
    if (!linkUrl) { showNotify("⚠️ DESTINATION REQUIRED"); return; }
    setLoading(true);
    
    setTimeout(() => {
      const domain = window.location.origin;
      // Aquí cambiamos los textos por defecto a Inglés para que coincidan con la imagen
      const data = {
        u: btoa(linkUrl),
        t: btoa(linkTitle || 'Final Validation'), // Cambiado de Prueba Final
        i: btoa(linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png'),
        s1: btoa(stepUrls[0] || 'https://www.opera.com'),
        s2: btoa(stepUrls[1] || 'https://www.opera.com'),
        s3: btoa(stepUrls[2] || 'https://www.opera.com')
      };

      // Estos parámetros se pasan a la página de /unlock incluyendo n (steps) y s (links)
      const shortUrl = `${domain}/unlock?data=${data.u}&t=${data.t}&i=${data.i}&n=${numSteps}&s1=${data.s1}&s2=${data.s2}&s3=${data.s3}`;
      const newLink = {
        id: Math.random().toString(36).substr(2, 6),
        title: linkTitle || 'Premium Link',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        short: shortUrl, 
        clicks: Math.floor(Math.random() * 5),
        date: new Date().toLocaleDateString()
      };

      const updated = [newLink, ...myLinks];
      setMyLinks(updated);
      localStorage.setItem('bx_links', JSON.stringify(updated));
      setLinkUrl(''); setLinkTitle(''); setLinkImage('');
      setLoading(false);
      showNotify("🚀 LINK DEPLOYED TO NETWORK");
    }, 1000);
  };

  const showNotify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // --- STYLES HELPER ---
  const glassEffect = {
    background: `rgba(15, 23, 42, ${glassOpacity})`,
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  };

  const neonGlow = {
    textShadow: `0 0 10px ${themeColor}, 0 0 20px ${themeColor}`,
    color: themeColor
  };

  return (
    <div style={{ 
      backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif", overflowX: 'hidden',
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, #020617 80%)'
    }}>
      
      {/* INJECTED CSS ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(0, 210, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0); } }
        .animate-up { animation: slideUp 0.6s ease-out forwards; }
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.02); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />

      {/* --- STARTING SCREEN --- */}
      {step === 'start' && (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <div style={{ padding: '40px', ...glassEffect, borderRadius: '40px', maxWidth: '500px', width: '90%' }}>
            <div style={{ fontSize: '5rem', marginBottom: '10px' }}>⚡</div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-3px', ...neonGlow, margin: 0 }}>BX-SYSTEMS</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px' }}>The Enterprise Link Infrastructure</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setStep('reg-email')} style={{ 
                padding: '20px', borderRadius: '15px', border: 'none', background: `linear-gradient(135deg, ${themeColor}, ${accentColor})`,
                color: 'white', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', animation: 'pulse 2s infinite'
              }}>CREATE ACCOUNT</button>
              
              <button onClick={() => setStep('login')} style={{ 
                padding: '20px', borderRadius: '15px', border: '1px solid #334155', background: 'rgba(255,255,255,0.05)',
                color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
              }}>MEMBER LOGIN</button>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <span onClick={() => setStep('owner')} style={{ color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Admin Override</span>
              <span style={{ color: '#475569', fontSize: '0.8rem' }}>v4.0.2 Stable</span>
            </div>
          </div>
        </div>
      )}

      {/* --- AUTHENTICATION FLOW --- */}
      {(['reg-email', 'login', 'reg-code', 'reg-pass'].includes(step)) && (
        <div className="animate-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ ...glassEffect, padding: '50px', borderRadius: '30px', width: '450px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>
              {step === 'login' ? 'Welcome Back' : 'Create Identity'}
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>Secure Encrypted Session</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="email" placeholder="Business Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', fontSize: '1rem' }} />
              
              {step === 'login' && (
                <input type="password" placeholder="Access PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', fontSize: '1rem' }} />
              )}

              {step === 'reg-code' && (
                <input type="text" maxLength="4" placeholder="Code" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '18px', background: '#020617', border: '2px solid #3b82f6', borderRadius: '12px', color: 'white', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px' }} />
              )}

              {step === 'reg-pass' && (
                <input type="password" placeholder="Create Secure PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white' }} />
              )}

              <button 
                onClick={() => {
                  if(step === 'reg-email') sendVerification('reg-code');
                  else if(step === 'reg-code') { if(inputCode === generatedCode) setStep('reg-pass'); else showNotify("❌ CODE MISMATCH"); }
                  else if(step === 'reg-pass') finalizeRegistration();
                  else if(step === 'login') handleLogin();
                }}
                disabled={loading}
                style={{ padding: '18px', borderRadius: '12px', border: 'none', background: themeColor, color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                {loading ? 'PROCESSING...' : 'CONTINUE ACCESS'}
              </button>
              
              <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Return to Home</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFESSIONAL DASHBOARD --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <div style={{ width: '300px', ...glassEffect, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px', padding: '0 20px' }}>
              <div style={{ width: '40px', height: '40px', background: `linear-gradient(45deg, ${themeColor}, ${accentColor})`, borderRadius: '12px', boxShadow: `0 0 20px ${themeColor}` }}></div>
              <h3 style={{ margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>BX-DASH</h3>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'analytics', icon: '📊', label: 'ANALYTICS' },
                { id: 'links', icon: '🔗', label: 'MY LINKS' },
                { id: 'appearance', icon: '🎨', label: 'CUSTOMIZE' },
                { id: 'settings', icon: '⚙️', label: 'SETTINGS' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setDashView(item.id)}
                  style={{ 
                    padding: '18px 25px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                    background: dashView === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: dashView === item.id ? `1px solid ${themeColor}` : '1px solid transparent',
                    color: dashView === item.id ? themeColor : '#94a3b8',
                    fontWeight: 'bold', transition: '0.3s'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span> {item.label}
                </div>
              ))}
            </nav>

            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', marginTop: '20px' }}>
              <p style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '5px' }}>LOGGED IN AS</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
              <button onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', border: 'none', background: '#f43f5e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
            </div>
          </div>

          {/* MAIN VIEWPORT */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto', maxHeight: '100vh' }}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
              <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{dashView.toUpperCase()} <span style={{ color: themeColor }}>HUB</span></h1>
              <div style={{ ...glassEffect, padding: '15px 25px', borderRadius: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SERVER STATUS</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>● ONLINE</div>
              </div>
            </header>

            {/* VIEW: ANALYTICS */}
            {dashView === 'analytics' && (
              <div className="animate-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                  {[
                    { label: 'TOTAL CLICKS', val: myLinks.reduce((a,b)=>a+b.clicks, 0), sub: '+12% increase' },
                    { label: 'ACTIVE LINKS', val: myLinks.length, sub: 'Running globally' },
                    { label: 'AVG CONVERSION', val: '8.4%', sub: 'Healthy traffic' }
                  ].map((stat, i) => (
                    <div key={i} style={{ ...glassEffect, padding: '30px', borderRadius: '25px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: themeColor }}></div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{stat.label}</p>
                      <h2 style={{ fontSize: '3rem', margin: '15px 0' }}>{stat.val}</h2>
                      <p style={{ color: '#10b981', fontSize: '0.8rem', margin: 0 }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div style={{ ...glassEffect, padding: '40px', borderRadius: '30px' }}>
                  <h3 style={{ marginBottom: '30px' }}>Real-time Traffic Velocity</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '15px' }}>
                    {[20, 45, 30, 80, 60, 95, 40, 70, 50, 85, 65, 100].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: `linear-gradient(to top, ${themeColor}, transparent)`, height: `${h}%`, borderRadius: '8px 8px 0 0', opacity: 0.6 }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: LINKS */}
            {dashView === 'links' && (
              <div className="animate-up">
                <div style={{ ...glassEffect, padding: '40px', borderRadius: '30px', marginBottom: '40px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '25px' }}>Create New Smart Link</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Custom Header Title</label>
                      <input placeholder="Ex: Free Download" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '15px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Thumbnail URL</label>
                      <input placeholder="https://..." value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '15px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Destination URL</label>
                    <input placeholder="https://..." value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ padding: '15px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white' }} />
                  </div>

                  {/* NUEVA SECCIÓN DE CONFIGURACIÓN DE PASOS ADICIONALES */}
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 'bold' }}>VALUE STEPS</label>
                      <select value={numSteps} onChange={(e)=>setNumSteps(parseInt(e.target.value))} style={{ padding: '12px', background: '#020617', border: `1px solid ${themeColor}`, borderRadius: '10px', color: 'white' }}>
                        <option value="1">1 STEP</option><option value="2">2 STEPS</option><option value="3">3 STEPS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 'bold' }}>INFO STEPS (REDIRECT LINKS)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {Array.from({ length: numSteps }).map((_, idx) => (
                          <input key={idx} placeholder={`Step ${idx + 1} URL`} value={stepUrls[idx]} onChange={(e) => { const n = [...stepUrls]; n[idx] = e.target.value; setStepUrls(n); }} style={{ flex: 1, padding: '12px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white', fontSize: '0.75rem' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={createSmartLink} disabled={loading} style={{ 
                    width: '100%', padding: '20px', borderRadius: '15px', border: 'none', background: themeColor, color: 'white', 
                    fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                  }}>
                    {loading ? 'GENERATING LINK...' : 'BUILD SMART LINK'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: '20px 0' }}>Your Active Links</h3>
                  {myLinks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', ...glassEffect, borderRadius: '30px', color: '#475569' }}>NO LINKS FOUND IN YOUR ACCOUNT</div>
                  ) : (
                    myLinks.map(link => (
                      <div key={link.id} className="hover-scale" style={{ ...glassEffect, padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                          <img src={link.image} style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: `2px solid ${themeColor}` }} />
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{link.title}</h4>
                            <p style={{ margin: 0, color: themeColor, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => window.open(link.short)}>{link.short}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '30px' }}>
                          <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{link.clicks}</div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b' }}>TOTAL CLICKS</div>
                          </div>
                          <button onClick={() => {
                            const updated = myLinks.filter(l => l.id !== link.id);
                            setMyLinks(updated);
                            localStorage.setItem('bx_links', JSON.stringify(updated));
                          }} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', color: '#f43f5e', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>REMOVE</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* VIEW: APPEARANCE */}
            {dashView === 'appearance' && (
              <div className="animate-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ ...glassEffect, padding: '40px', borderRadius: '30px' }}>
                  <h3>Theme Customization</h3>
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: '#94a3b8' }}>PRIMARY COLOR</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {['#00d2ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                        <div key={c} onClick={() => setThemeColor(c)} style={{ 
                          width: '45px', height: '45px', borderRadius: '12px', background: c, cursor: 'pointer',
                          border: themeColor === c ? '3px solid white' : 'none'
                        }}></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: '#94a3b8' }}>GLASS OPACITY ({Math.round(glassOpacity * 100)}%)</label>
                    <input type="range" min="0.1" max="1" step="0.1" value={glassOpacity} onChange={(e)=>setGlassOpacity(e.target.value)} style={{ width: '100%', accentColor: themeColor }} />
                  </div>
                </div>
                <div style={{ ...glassEffect, borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '20px' }}>
                  <p style={{ color: '#475569', fontSize: '0.8rem' }}>PREVIEW MODE ACTIVE</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MASTER OWNER PANEL --- */}
      {step === 'owner' && (
        <div className="animate-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ ...glassEffect, padding: '50px', borderRadius: '40px', width: '450px', textAlign: 'center' }}>
            <h1 style={{ color: '#f43f5e', fontSize: '2.5rem' }}>ADMIN LOGIN</h1>
            <input type="password" placeholder="ENTER MASTER PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ width: '100%', padding: '20px', background: '#0f172a', border: '1px solid #f43f5e', borderRadius: '15px', color: 'white', fontSize: '1.5rem', textAlign: 'center', marginBottom: '30px' }} />
            <button onClick={() => { if(ownerPass === "2706") setStep('owner-panel'); else showNotify("❌ WRONG PIN"); }} style={{ width: '100%', padding: '18px', borderRadius: '15px', border: 'none', background: '#f43f5e', color: 'white', fontWeight: 'bold' }}>UNLOCK CONSOLE</button>
            <button onClick={() => setStep('start')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {step === 'owner-panel' && (
        <div className="animate-up" style={{ padding: '60px', maxWidth: '1400px', margin: 'auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
            <h1 style={{ color: '#f43f5e' }}>MASTER OVERRIDE</h1>
            <button onClick={() => setStep('start')} style={{ padding: '15px 30px', background: '#334155', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>EXIT</button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
            <div style={{ ...glassEffect, padding: '30px', borderRadius: '25px', gridColumn: 'span 2' }}>
              <h4 style={{ color: '#38bdf8' }}>REGISTERED USERS</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ textAlign: 'left', color: '#475569' }}><th>EMAIL</th><th>PIN</th><th>DATE</th></tr></thead>
                <tbody>
                  {userAccounts.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '15px 0' }}>{u.email}</td>
                      <td style={{ padding: '15px 0', color: '#10b981' }}>{u.password}</td>
                      <td style={{ padding: '15px 0', fontSize: '0.8rem', color: '#64748b' }}>{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ ...glassEffect, padding: '30px', borderRadius: '25px' }}>
              <h4 style={{ color: '#f43f5e' }}>DANGER ZONE</h4>
              <button onClick={() => { if(confirm("DELETE EVERYTHING?")) { localStorage.clear(); window.location.reload(); } }} style={{ width: '100%', padding: '15px', background: '#f43f5e', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}>WIPE ALL DATA</button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION TOAST --- */}
      {message && (
        <div style={{ 
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', 
          padding: '18px 35px', borderRadius: '100px', background: '#1e293b', border: `1px solid ${themeColor}`,
          color: 'white', fontWeight: 'bold', animation: 'slideUp 0.3s ease-out', zIndex: 10000
        }}>
          {message}
        </div>
      )}

    </div>
  );
}
