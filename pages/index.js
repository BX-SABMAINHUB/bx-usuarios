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
  
  // --- UNLOCKER ENGINE (EL FIX PARA LA PÁGINA BLANCA) ---
  const [isUnlockPage, setIsUnlockPage] = useState(false);
  const [unlockData, setUnlockData] = useState(null);
  const [currentUnlockStep, setCurrentUnlockStep] = useState(0);

  // --- CUSTOMIZATION ENGINE & SHORTENER ---
  const [themeColor, setThemeColor] = useState('#00d2ff');
  const [accentColor, setAccentColor] = useState('#3a7bd5');
  const [glassOpacity, setGlassOpacity] = useState(0.8);
  const [urlToShorten, setUrlToShorten] = useState('');
  const [shortenedResult, setShortenedResult] = useState('');

  // --- ADMIN & LOGS ---
  const [ownerPass, setOwnerPass] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [userMessages, setUserMessages] = useState([]);

  // --- PERSISTENCE & SMART ROUTING LAYER ---
  useEffect(() => {
    // DETECTOR DE ENLACES BX (SOLUCIÓN PÁGINA BLANCA)
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');
    
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setUnlockData(decoded);
        setIsUnlockPage(true);
      } catch (e) {
        showNotify("❌ ENLACE BX CORRUPTO O INVÁLIDO");
      }
    }

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

    const activeSession = localStorage.getItem('bx_active_session');
    if (activeSession && !payload) { 
      setCurrentUser(JSON.parse(activeSession)); 
      setStep('user-dashboard'); 
    }
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
      } else { showNotify("⚠️ MODO PRUEBA: CÓDIGO " + code); setStep(targetStep); }
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
      localStorage.setItem('bx_active_session', JSON.stringify(user)); 
      setStep('user-dashboard');
      showNotify(`WELCOME BACK, ${email.split('@')[0].toUpperCase()}`);
    } else { showNotify("❌ ACCESS DENIED: WRONG PIN"); }
  };

  // --- LOGIC: SMART LINK ENGINE (FIXED URL) ---
  const createSmartLink = () => {
    if (!linkUrl) { showNotify("⚠️ DESTINATION REQUIRED"); return; }
    setLoading(true);
    
    setTimeout(() => {
      const domain = window.location.origin + window.location.pathname;
      
      const linkData = {
        target: linkUrl,
        title: linkTitle || 'Premium Content',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: numSteps,
        info: stepUrls.slice(0, numSteps)
      };
      const encodedData = btoa(JSON.stringify(linkData));
      const finalUrl = `${domain}?payload=${encodedData}`;
      
      const newLink = {
        id: Math.random().toString(36).substring(2, 10),
        title: linkTitle || 'Premium Link',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        short: finalUrl, 
        clicks: 0,
        date: new Date().toLocaleDateString()
      };

      const updated = [newLink, ...myLinks];
      setMyLinks(updated);
      localStorage.setItem('bx_links', JSON.stringify(updated)); 
      setLinkUrl(''); setLinkTitle(''); setLinkImage('');
      setLoading(false);
      showNotify("🚀 LINK DEPLOYED SUCCESSFULLY");
    }, 1000);
  };

  // --- LOGIC: INTERNAL SHORTENER ---
  const handleInternalShorten = async () => {
    if (!urlToShorten) return;
    setLoading(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
      if (response.ok) {
        const short = await response.text();
        setShortenedResult(short);
        showNotify("✨ URL OPTIMIZED");
      }
    } catch (e) { showNotify("❌ SHORTENER ERROR"); }
    setLoading(false);
  };

  const showNotify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // --- UI COMPONENTS & STYLES ---
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

  // --- RENDER: BX UNLOCKER PAGE ---
  if (isUnlockPage && unlockData) {
    return (
      <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ ...glassEffect, padding: '50px', borderRadius: '40px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
          <img src={unlockData.image} style={{ width: '120px', height: '120px', borderRadius: '30px', marginBottom: '20px', border: `3px solid ${themeColor}` }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>{unlockData.title}</h2>
          <p style={{ color: '#64748b', marginBottom: '40px' }}>Completa los pasos para desbloquear el enlace</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {unlockData.info.map((url, i) => (
              <button key={i} onClick={() => { window.open(url, '_blank'); if(currentUnlockStep === i) setCurrentUnlockStep(i+1); }} style={{ 
                padding: '20px', borderRadius: '15px', border: '1px solid #1e293b', 
                background: currentUnlockStep > i ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                color: currentUnlockStep > i ? '#10b981' : 'white', cursor: 'pointer', fontWeight: 'bold'
              }}>
                {currentUnlockStep > i ? `✅ PASO ${i+1} LISTO` : `🔓 DESBLOQUEAR PASO ${i+1}`}
              </button>
            ))}

            <button 
              disabled={currentUnlockStep < unlockData.steps}
              onClick={() => window.location.href = unlockData.target}
              style={{ 
                padding: '22px', borderRadius: '15px', border: 'none', 
                background: currentUnlockStep >= unlockData.steps ? themeColor : '#1e293b',
                color: 'white', fontWeight: '900', fontSize: '1.2rem', marginTop: '20px', cursor: 'pointer',
                boxShadow: currentUnlockStep >= unlockData.steps ? `0 0 30px ${themeColor}` : 'none'
              }}>
              {currentUnlockStep >= unlockData.steps ? 'ACCEDER AHORA' : 'PASOS PENDIENTES'}
            </button>
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#475569' }}>Powered by BX-SYSTEMS</p>
        </div>
      </div>
    );
  }

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

                  {/* CONFIGURACIÓN DE PASOS ADICIONALES */}
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
                  {myLinks.map(link => (
                    <div key={link.id} className="hover-scale" style={{ ...glassEffect, padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <img src={link.image} style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: `2px solid ${themeColor}` }} />
                        <div style={{maxWidth: '400px', overflow: 'hidden'}}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{link.title}</h4>
                          <p style={{ margin: 0, color: themeColor, fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} onClick={() => window.open(link.short)}>{link.short}</p>
                        </div>
                      </div>
                      <button onClick={() => setMyLinks(myLinks.filter(l => l.id !== link.id))} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', color: '#f43f5e', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>REMOVE</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: APPEARANCE */}
            {dashView === 'appearance' && (
              <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div style={{ ...glassEffect, padding: '40px', borderRadius: '30px' }}>
                    <h3>Theme Customization</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: '#94a3b8' }}>PRIMARY COLOR</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        {['#00d2ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                          <div key={c} onClick={() => setThemeColor(c)} style={{ width: '45px', height: '45px', borderRadius: '12px', background: c, cursor: 'pointer', border: themeColor === c ? '3px solid white' : 'none' }}></div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                      <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', color: '#94a3b8' }}>GLASS OPACITY ({Math.round(glassOpacity * 100)}%)</label>
                      <input type="range" min="0.1" max="1" step="0.1" value={glassOpacity} onChange={(e)=>setGlassOpacity(e.target.value)} style={{ width: '100%', accentColor: themeColor }} />
                    </div>
                  </div>
                </div>

                {/* PROPIETORY SHORTENER ENGINE */}
                <div style={{ ...glassEffect, padding: '40px', borderRadius: '30px', border: `1px dashed ${themeColor}` }}>
                  <h3 style={{color: themeColor, marginBottom: '20px'}}>BX-SHORTENER TOOL</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input placeholder="Pega el link largo aquí..." value={urlToShorten} onChange={(e)=>setUrlToShorten(e.target.value)} style={{ flex: 1, padding: '18px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white' }} />
                    <button onClick={handleInternalShorten} style={{ padding: '0 40px', background: themeColor, color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
                  </div>
                  {shortenedResult && (
                    <div className="animate-up" style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <code style={{ color: '#10b981', fontSize: '1.1rem' }}>{shortenedResult}</code>
                      <button onClick={() => { navigator.clipboard.writeText(shortenedResult); showNotify("📋 COPIED"); }} style={{ padding: '10px 20px', background: '#334155', color: 'white', borderRadius: '8px' }}>COPY</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {message && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '18px 35px', borderRadius: '100px', background: '#1e293b', border: `1px solid ${themeColor}`, color: 'white', fontWeight: 'bold', animation: 'slideUp 0.3s ease-out', zIndex: 10000 }}>
          {message}
        </div>
      )}

    </div>
  );
}
