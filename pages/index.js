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
  const [numSteps, setNumSteps] = useState(1);
  const [stepUrls, setStepUrls] = useState(['', '', '']);
  
  // --- UNLOCKER SYSTEM (FIXED ROUTING) ---
  const [isUnlockPage, setIsUnlockPage] = useState(false);
  const [unlockData, setUnlockData] = useState(null);
  const [currentUnlockStep, setCurrentUnlockStep] = useState(0);

  // --- CUSTOMIZATION ENGINE & SHORTENER ---
  const [themeColor, setThemeColor] = useState('#00d2ff');
  const [accentColor, setAccentColor] = useState('#3a7bd5');
  const [glassOpacity, setGlassOpacity] = useState(0.8);
  const [urlToShorten, setUrlToShorten] = useState('');
  const [shortenedResult, setShortenedResult] = useState('');

  // --- ADMIN, LOGS & ANALYTICS ---
  const [ownerPass, setOwnerPass] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ total: 1240, online: 42, conversion: "8.4%" });

  // --- PERSISTENCE & AUTO-ROUTING ---
  useEffect(() => {
    // CAPTURADOR DE PAYLOAD (Evita la página en blanco al entrar en un link generado)
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');
    
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setUnlockData(decoded);
        setIsUnlockPage(true);
      } catch (e) { 
        console.error("Payload Corrupto"); 
        showNotify("❌ ENLACE INVÁLIDO O CORRUPTO");
      }
    }

    const storage = {
      'bx_accounts': setUserAccounts,
      'bx_links': setMyLinks,
      'bx_logs': setActivityLogs
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
      } else { 
        // Simulación para entornos sin API configurada aún
        setStep(targetStep);
        showNotify("⚠️ MODO TEST: CÓDIGO " + code); 
      }
    } catch (e) { showNotify("❌ CONNECTION FAILED"); }
    setLoading(false);
  };

  // --- LOGIC: AUTH ---
  const finalizeRegistration = () => {
    if (password.length < 4) { showNotify("❌ PIN TOO SHORT"); return; }
    const newAcc = { email, password, joined: new Date().toLocaleString(), role: 'user' };
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

  // --- LOGIC: SMART LINK ENGINE (FIXED URL GENERATION) ---
  const createSmartLink = () => {
    if (!linkUrl) { showNotify("⚠️ DESTINATION REQUIRED"); return; }
    setLoading(true);
    
    setTimeout(() => {
      // Usamos la URL base actual para que el link redirija al mismo sitio pero con payload
      const currentBase = window.location.origin + window.location.pathname;
      
      const linkData = {
        target: linkUrl,
        title: linkTitle || 'Premium Content',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: numSteps,
        info: stepUrls.slice(0, numSteps).filter(url => url !== '')
      };

      const encodedData = btoa(JSON.stringify(linkData));
      const finalLongUrl = `${currentBase}?payload=${encodedData}`;
      
      const newLink = {
        id: Math.random().toString(36).substring(2, 10),
        title: linkTitle || 'Premium Link',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        short: finalLongUrl, 
        clicks: 0,
        date: new Date().toLocaleDateString(),
        status: 'active'
      };

      const updated = [newLink, ...myLinks];
      setMyLinks(updated);
      localStorage.setItem('bx_links', JSON.stringify(updated)); 
      setLinkUrl(''); setLinkTitle(''); setLinkImage('');
      setLoading(false);
      showNotify("🚀 LINK DEPLOYED SUCCESSFULLY");
    }, 1200);
  };

  // --- LOGIC: INTERNAL SHORTENER ENGINE ---
  const handleInternalShorten = async () => {
    if (!urlToShorten) { showNotify("⚠️ PEGA UN LINK PRIMERO"); return; }
    setLoading(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
      if (response.ok) {
        const short = await response.text();
        setShortenedResult(short);
        showNotify("✨ URL OPTIMIZED");
      } else { showNotify("❌ ERROR EN SERVIDOR ACORTADOR"); }
    } catch (e) { showNotify("❌ SHORTENER OFFLINE"); }
    setLoading(false);
  };

  const showNotify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // --- UI STYLES ---
  const glassEffect = {
    background: `rgba(15, 23, 42, ${glassOpacity})`,
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
  };

  // --- RENDERIZADO DE LA PÁGINA DE DESBLOQUEO (THE FIX) ---
  if (isUnlockPage && unlockData) {
    return (
      <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div className="animate-up" style={{ ...glassEffect, padding: '50px', borderRadius: '40px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '30px' }}>
             <img src={unlockData.image} style={{ width: '130px', height: '130px', borderRadius: '30px', border: `4px solid ${themeColor}`, objectFit: 'cover' }} />
             <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: themeColor, padding: '5px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900' }}>HQ</div>
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{unlockData.title}</h1>
          <p style={{ color: '#64748b', marginBottom: '40px' }}>Sistema de verificación de seguridad activo</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {unlockData.info.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <button 
                  onClick={() => { window.open(url, '_blank'); if(currentUnlockStep === i) setCurrentUnlockStep(i+1); }}
                  style={{ width: '100%', padding: '20px', borderRadius: '18px', border: '1px solid #1e293b', background: currentUnlockStep > i ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', color: currentUnlockStep > i ? '#10b981' : 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                >
                  {currentUnlockStep > i ? `✅ PASO ${i+1} COMPLETADO` : `🔓 DESBLOQUEAR PASO ${i+1}`}
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => { if(currentUnlockStep >= unlockData.info.length) window.location.href = unlockData.target; }}
              disabled={currentUnlockStep < unlockData.info.length}
              style={{ width: '100%', padding: '22px', borderRadius: '18px', border: 'none', background: currentUnlockStep >= unlockData.info.length ? themeColor : '#1e293b', color: 'white', fontWeight: '900', fontSize: '1.1rem', marginTop: '20px', cursor: currentUnlockStep >= unlockData.info.length ? 'pointer' : 'not-allowed', boxShadow: currentUnlockStep >= unlockData.info.length ? `0 0 30px ${themeColor}` : 'none' }}
            >
              {currentUnlockStep >= unlockData.info.length ? 'DESCARGAR CONTENIDO' : 'BLOQUEADO'}
            </button>
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.7rem', color: '#475569' }}>Powered by BX-SYSTEMS Security Infrastructure</p>
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
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(0, 210, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0); } }
        .animate-up { animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hover-scale { transition: 0.3s; } .hover-scale:hover { transform: translateY(-5px); }
        input:focus { outline: 2px solid ${themeColor}; border-color: transparent !important; }
      `}} />

      {/* --- PANTALLA DE INICIO --- */}
      {step === 'start' && (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ padding: '60px', ...glassEffect, borderRadius: '50px', maxWidth: '550px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚀</div>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', letterSpacing: '-4px', margin: 0, color: 'white', textShadow: `0 0 20px ${themeColor}` }}>BX-SYSTEMS</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '50px', fontWeight: '300' }}>Cloud Link Management & Security</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setStep('reg-email')} style={{ 
                padding: '24px', borderRadius: '20px', border: 'none', background: `linear-gradient(135deg, ${themeColor}, ${accentColor})`,
                color: 'white', fontWeight: '900', fontSize: '1.3rem', cursor: 'pointer', animation: 'pulse 2s infinite'
              }}>GET STARTED FREE</button>
              
              <button onClick={() => setStep('login')} style={{ 
                padding: '24px', borderRadius: '20px', border: '1px solid #334155', background: 'rgba(255,255,255,0.03)',
                color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
              }}>CLIENT LOGIN</button>
            </div>
            <div style={{ marginTop: '50px', color: '#475569', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '30px' }}>
              <span onClick={() => setStep('owner')} style={{ cursor: 'pointer' }}>ADMIN PORTAL</span>
              <span>EST. 2024</span>
              <span>VER 4.2.0</span>
            </div>
          </div>
        </div>
      )}

      {/* --- SISTEMA DE AUTENTICACIÓN --- */}
      {(['reg-email', 'login', 'reg-code', 'reg-pass'].includes(step)) && (
        <div className="animate-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ ...glassEffect, padding: '60px', borderRadius: '40px', width: '450px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center', fontWeight: '900' }}>
              {step === 'login' ? 'Welcome' : 'Join Us'}
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Nexus Encryption Active</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', color: themeColor, fontWeight: 'bold', marginLeft: '5px' }}>EMAIL ADDRESS</label>
                <input type="email" placeholder="name@company.com" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '20px', background: '#020617', border: '1px solid #1e293b', borderRadius: '15px', color: 'white' }} />
              </div>
              
              {step === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: themeColor, fontWeight: 'bold', marginLeft: '5px' }}>SECURITY PIN</label>
                  <input type="password" placeholder="••••" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '20px', background: '#020617', border: '1px solid #1e293b', borderRadius: '15px', color: 'white', letterSpacing: '5px' }} />
                </div>
              )}

              {step === 'reg-code' && (
                <input type="text" maxLength="4" placeholder="0000" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '25px', background: '#020617', border: `2px solid ${themeColor}`, borderRadius: '15px', color: 'white', textAlign: 'center', fontSize: '2rem', letterSpacing: '15px', fontWeight: '900' }} />
              )}

              <button 
                onClick={() => {
                  if(step === 'reg-email') sendVerification('reg-code');
                  else if(step === 'reg-code') { if(inputCode === generatedCode) setStep('reg-pass'); else showNotify("❌ CODE ERROR"); }
                  else if(step === 'reg-pass') finalizeRegistration();
                  else if(step === 'login') handleLogin();
                }}
                disabled={loading}
                style={{ padding: '20px', borderRadius: '15px', border: 'none', background: themeColor, color: 'white', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', marginTop: '10px' }}
              >
                {loading ? 'SYNCHRONIZING...' : 'CONTINUE'}
              </button>
              <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.9rem' }}>Abort Mission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD PRINCIPAL --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          <div style={{ width: '320px', ...glassEffect, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '50px 25px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
              <div style={{ width: '45px', height: '45px', background: themeColor, borderRadius: '15px', boxShadow: `0 0 20px ${themeColor}` }}></div>
              <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem' }}>BX-NEXUS</h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'analytics', label: 'ANALYTICS', icon: '📈' },
                { id: 'links', label: 'LINK MANAGER', icon: '🔗' },
                { id: 'appearance', label: 'CUSTOMIZE', icon: '🎨' }
              ].map(item => (
                <div key={item.id} onClick={() => setDashView(item.id)} style={{ 
                  padding: '20px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                  background: dashView === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: `1px solid ${dashView === item.id ? themeColor : 'transparent'}`,
                  color: dashView === item.id ? 'white' : '#64748b', fontWeight: 'bold', transition: '0.3s'
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.icon}</span> {item.label}
                </div>
              ))}
            </nav>

            <div style={{ padding: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '25px' }}>
              <p style={{ fontSize: '0.7rem', color: themeColor, fontWeight: '900', marginBottom: '5px' }}>OPERATOR</p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
              <button onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }} style={{ width: '100%', marginTop: '25px', padding: '12px', borderRadius: '12px', border: 'none', background: '#f43f5e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>DISCONNECT</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '70px', overflowY: 'auto' }}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>{dashView.toUpperCase()} <span style={{ color: themeColor }}>SYSTEM</span></h1>
              <div style={{ ...glassEffect, padding: '15px 30px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>NODE-01 ACTIVE</span>
              </div>
            </header>

            {dashView === 'analytics' && (
              <div className="animate-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' }}>
                  {[
                    { l: 'TOTAL CLICKS', v: myLinks.reduce((a,b)=>a+b.clicks,0), c: themeColor },
                    { l: 'ACTIVE NODES', v: myLinks.length, c: '#a855f7' },
                    { l: 'CONVERSION', v: '12.2%', c: '#10b981' }
                  ].map((s, i) => (
                    <div key={i} style={{ ...glassEffect, padding: '40px', borderRadius: '35px', borderLeft: `6px solid ${s.c}` }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>{s.l}</p>
                      <h2 style={{ fontSize: '3.5rem', margin: '15px 0', fontWeight: '900' }}>{s.v}</h2>
                      <p style={{ color: s.c, fontSize: '0.8rem' }}>↑ 4.2% FROM LAST SESSION</p>
                    </div>
                  ))}
                </div>
                <div style={{ ...glassEffect, padding: '50px', borderRadius: '40px' }}>
                  <h3 style={{ marginBottom: '40px' }}>Traffic Distribution</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
                    {[30, 60, 45, 90, 100, 70, 85, 40, 60, 75, 50, 95].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: themeColor, height: `${h}%`, borderRadius: '8px 8px 0 0', opacity: 0.2 + (h/100) }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dashView === 'links' && (
              <div className="animate-up">
                <div style={{ ...glassEffect, padding: '45px', borderRadius: '40px', marginBottom: '50px' }}>
                  <h3 style={{ marginBottom: '35px', fontSize: '1.5rem' }}>Deploy New Smart Link</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                    <input placeholder="Visual Title" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '20px', background: '#020617', border: '1px solid #1e293b', borderRadius: '15px', color: 'white' }} />
                    <input placeholder="Image Cover URL" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '20px', background: '#020617', border: '1px solid #1e293b', borderRadius: '15px', color: 'white' }} />
                  </div>
                  <input placeholder="Target Destination (https://...)" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ width: '96%', padding: '20px', background: '#020617', border: '1px solid #1e293b', borderRadius: '15px', color: 'white', marginBottom: '25px' }} />
                  
                  <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '25px', border: '1px solid #1e293b', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontWeight: 'bold', color: themeColor }}>SECURITY LAYERS</span>
                      <select value={numSteps} onChange={(e)=>setNumSteps(parseInt(e.target.value))} style={{ padding: '10px 20px', background: '#020617', color: 'white', border: `1px solid ${themeColor}`, borderRadius: '10px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {Array.from({ length: numSteps }).map((_, i) => (
                        <input key={i} placeholder={`Layer ${i+1} Redirect`} value={stepUrls[i]} onChange={(e)=>{let s=[...stepUrls]; s[i]=e.target.value; setStepUrls(s);}} style={{ flex: 1, padding: '15px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', fontSize: '0.8rem' }} />
                      ))}
                    </div>
                  </div>
                  <button onClick={createSmartLink} style={{ width: '100%', padding: '25px', borderRadius: '20px', border: 'none', background: themeColor, color: 'white', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer' }}>GENERATE ASSET</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myLinks.map(link => (
                    <div key={link.id} className="hover-scale" style={{ ...glassEffect, padding: '30px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <img src={link.image} style={{ width: '80px', height: '80px', borderRadius: '20px', border: `2px solid ${themeColor}`, objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.3rem' }}>{link.title}</h4>
                          <p style={{ margin: 0, color: themeColor, fontSize: '0.75rem', cursor: 'pointer', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => window.open(link.short)}>{link.short}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>{link.clicks}</div>
                          <div style={{ fontSize: '0.6rem', color: '#475569' }}>HITS</div>
                        </div>
                        <button onClick={()=>{setMyLinks(myLinks.filter(l=>l.id!==link.id));}} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid #f43f5e', padding: '12px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>TERMINATE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashView === 'appearance' && (
              <div className="animate-up">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                  <div style={{ ...glassEffect, padding: '45px', borderRadius: '40px' }}>
                    <h3>Theme Engine</h3>
                    <div style={{ marginTop: '30px' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>CORE HIGHLIGHT COLOR</p>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        {['#00d2ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                          <div key={c} onClick={()=>setThemeColor(c)} style={{ width: '50px', height: '50px', borderRadius: '15px', background: c, cursor: 'pointer', border: themeColor === c ? '4px solid white' : 'none' }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ ...glassEffect, padding: '45px', borderRadius: '40px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#475569' }}>REAL-TIME PREVIEW LOCKED</p>
                  </div>
                </div>

                {/* --- ACORTADOR INTEGRADO --- */}
                <div style={{ ...glassEffect, padding: '50px', borderRadius: '40px', border: `2px dashed ${themeColor}` }}>
                  <h3 style={{ color: themeColor, marginBottom: '15px' }}>BX-SHORTENER TOOL</h3>
                  <p style={{ color: '#64748b', marginBottom: '30px' }}>Transforma tus links largos de BX en URLs compactas para redes sociales.</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input 
                      placeholder="Pega tu link largo de BX aquí..." 
                      value={urlToShorten} 
                      onChange={(e)=>setUrlToShorten(e.target.value)}
                      style={{ flex: 1, padding: '22px', background: '#020617', border: '1px solid #1e293b', borderRadius: '18px', color: 'white' }}
                    />
                    <button onClick={handleInternalShorten} style={{ padding: '0 45px', background: themeColor, color: 'white', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer' }}>OK</button>
                  </div>
                  {shortenedResult && (
                    <div className="animate-up" style={{ marginTop: '35px', padding: '25px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <code style={{ fontSize: '1.2rem', color: '#10b981' }}>{shortenedResult}</code>
                      <button onClick={()=>{navigator.clipboard.writeText(shortenedResult); showNotify("📋 COPIADO");}} style={{ padding: '12px 25px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>COPY LINK</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PANEL DE CONTROL ADMINISTRATIVO --- */}
      {step === 'owner' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ ...glassEffect, padding: '60px', borderRadius: '45px', width: '450px', textAlign: 'center' }}>
            <h1 style={{ color: '#f43f5e', fontSize: '2.5rem', fontWeight: '900' }}>SECURITY BYPASS</h1>
            <p style={{ color: '#475569', marginBottom: '40px' }}>Authorized Personnel Only</p>
            <input type="password" placeholder="MASTER KEY" onChange={(e)=>setOwnerPass(e.target.value)} style={{ width: '85%', padding: '25px', background: '#020617', border: '1px solid #f43f5e', borderRadius: '20px', color: 'white', textAlign: 'center', fontSize: '1.5rem', marginBottom: '30px' }} />
            <button onClick={()=>{if(ownerPass==="2706") setStep('owner-panel'); else showNotify("❌ KEY INVALID");}} style={{ width: '100%', padding: '20px', borderRadius: '15px', background: '#f43f5e', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer' }}>ACCESS CONSOLE</button>
            <button onClick={()=>setStep('start')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>Return</button>
          </div>
        </div>
      )}

      {step === 'owner-panel' && (
        <div className="animate-up" style={{ padding: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', color: '#f43f5e' }}>CORE OVERRIDE</h1>
            <button onClick={()=>setStep('start')} style={{ padding: '15px 40px', background: 'white', color: 'black', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>TERMINATE SESSION</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            <div style={{ ...glassEffect, padding: '40px', borderRadius: '35px' }}>
              <h3 style={{ marginBottom: '30px' }}>USER DATABASE</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ textAlign: 'left', color: '#475569' }}><th>IDENTITY</th><th>CREDENTIAL</th><th>ENROLLED</th></tr></thead>
                <tbody>
                  {userAccounts.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '20px 0' }}>{u.email}</td>
                      <td style={{ color: '#10b981' }}>{u.password}</td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...glassEffect, padding: '40px', borderRadius: '35px' }}>
              <h3 style={{ color: '#f43f5e' }}>DESTRUCTIVE ACTIONS</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '30px' }}>Estas acciones no se pueden deshacer. Se borrarán todos los registros del localStorage.</p>
              <button onClick={()=>{if(confirm("CONFIRM FULL WIPE?")){localStorage.clear(); window.location.reload();}}} style={{ width: '100%', padding: '20px', background: '#f43f5e', color: 'white', borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>WIPE CLOUD DATA</button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICACIONES --- */}
      {message && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          padding: '20px 40px', borderRadius: '100px', background: '#1e293b', border: `1px solid ${themeColor}`,
          color: 'white', fontWeight: '900', zIndex: 100000, boxShadow: `0 10px 40px rgba(0,0,0,0.5)`,
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {message}
        </div>
      )}

    </div>
  );
}
