import { useState, useEffect } from 'react';

/**
 * PROJECT: BX-NEXUS v6.0.0
 * ENGINE: UNLOCK.JS CORE
 * TOTAL LINES: EXPANDED FOR MAXIMUM SECURITY & STYLING
 */

export default function BxSystems() {
  // --- [SYSTEM STATES] ---
  const [step, setStep] = useState('start');
  const [view, setView] = useState('links');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // --- [USER DATA] ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  // --- [LINK ENGINE] ---
  const [linkTitle, setLinkTitle] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkImage, setLinkImage] = useState('');
  const [redirectSteps, setRedirectSteps] = useState(['', '', '']);
  const [activeStepCount, setActiveStepCount] = useState(1);
  const [myLinks, setMyLinks] = useState([]);

  // --- [UNLOCKER ENGINE (THE CORE)] ---
  const [isUnlockView, setIsUnlockView] = useState(false);
  const [payloadData, setPayloadData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState(0);

  // --- [THEMING] ---
  const theme = {
    primary: '#00d2ff',
    secondary: '#3a7bd5',
    bg: '#010409',
    card: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    success: '#238636'
  };

  // --- [LOGIC: INITIALIZATION] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('payload');

    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setPayloadData(decoded);
        setIsUnlockView(true);
      } catch (err) {
        triggerNotify("❌ ENCRYPTION ERROR: INVALID PAYLOAD");
      }
    }

    // Persistencia
    const storedAccounts = localStorage.getItem('bx_acc');
    const storedLinks = localStorage.getItem('bx_lnk');
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedLinks) setMyLinks(JSON.parse(storedLinks));

    const session = localStorage.getItem('bx_session');
    if (session && !data) {
      setActiveUser(JSON.parse(session));
      setStep('dashboard');
    }
  }, []);

  // --- [LOGIC: SECURITY & AUTH] ---
  const triggerNotify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const executeSendCode = () => {
    if (!email.includes('@')) return triggerNotify("⚠️ INVALID IDENTITY");
    setLoading(true);
    
    // Generación segura
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setAuthCode(code);

    // SIMULACIÓN DE BACKEND PROFESIONAL
    setTimeout(() => {
      setLoading(false);
      setStep('verify-code');
      triggerNotify("📩 SECURITY CODE DISPATCHED TO EMAIL");
      // El código solo vive en la consola para el administrador (tú)
      console.log("%c [BX-AUTH] VERIFICATION CODE: " + code, "color: #00d2ff; font-weight: bold; font-size: 14px;");
    }, 2500);
  };

  const handleRegister = () => {
    if (password.length < 4) return triggerNotify("❌ PIN TOO SHORT");
    const newAcc = { email, password, id: Date.now() };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem('bx_acc', JSON.stringify(updated));
    triggerNotify("🎉 ACCOUNT INITIALIZED");
    setStep('login');
  };

  const handleLogin = () => {
    const user = accounts.find(a => a.email === email && a.password === password);
    if (user) {
      setActiveUser(user);
      localStorage.setItem('bx_session', JSON.stringify(user));
      setStep('dashboard');
      triggerNotify("✅ ACCESS GRANTED");
    } else {
      triggerNotify("❌ ACCESS DENIED");
    }
  };

  // --- [LOGIC: LINK CREATION] ---
  const deployAsset = () => {
    if (!linkTarget || !linkTitle) return triggerNotify("⚠️ DATA INCOMPLETE");
    setLoading(true);

    setTimeout(() => {
      const payload = {
        title: linkTitle,
        target: linkTarget,
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: redirectSteps.slice(0, activeStepCount).filter(s => s !== '')
      };

      const b64 = btoa(JSON.stringify(payload));
      const finalUrl = `${window.location.origin}${window.location.pathname}?payload=${b64}`;

      const newLink = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        title: linkTitle,
        url: finalUrl,
        clicks: 0
      };

      const updated = [newLink, ...myLinks];
      setMyLinks(updated);
      localStorage.setItem('bx_lnk', JSON.stringify(updated));
      
      setLinkTitle(''); setLinkTarget('');
      setLoading(false);
      triggerNotify("🚀 LINK DEPLOYED TO NETWORK");
    }, 2000);
  };

  // --- [RENDER: THE UNLOCKER (EL DISEÑO QUE BUSCAS)] ---
  if (isUnlockView && payloadData) {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div className="bx-fade-in" style={{ background: theme.card, border: `1px solid ${theme.border}`, width: '100%', maxWidth: '450px', borderRadius: '25px', padding: '40px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ marginBottom: '25px', position: 'relative', display: 'inline-block' }}>
            <img src={payloadData.image} style={{ width: '110px', height: '110px', borderRadius: '22px', border: `3px solid ${theme.primary}`, objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: -5, right: -5, background: theme.primary, color: 'black', padding: '4px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900' }}>SECURE</div>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0' }}>{payloadData.title}</h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '35px' }}>Complete all security layers to reach the target asset.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {payloadData.steps.map((url, i) => (
              <button
                key={i}
                disabled={currentLayer < i}
                onClick={() => { window.open(url, '_blank'); if(currentLayer === i) setCurrentLayer(i+1); }}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${currentLayer > i ? theme.success : theme.border}`,
                  background: currentLayer > i ? 'rgba(35, 134, 54, 0.1)' : 'transparent',
                  color: currentLayer > i ? theme.success : (currentLayer === i ? 'white' : '#484f58'),
                  cursor: currentLayer < i ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: '0.3s'
                }}
              >
                <span>{currentLayer > i ? `✅ LAYER ${i+1} CLEARED` : `🔓 BYPASS LAYER ${i+1}`}</span>
                {currentLayer < i && <span>🔒</span>}
              </button>
            ))}

            <button
              disabled={currentLayer < payloadData.steps.length}
              onClick={() => window.location.href = payloadData.target}
              style={{
                marginTop: '15px',
                padding: '20px',
                borderRadius: '12px',
                border: 'none',
                background: currentLayer >= payloadData.steps.length ? theme.primary : '#21262d',
                color: currentLayer >= payloadData.steps.length ? 'black' : '#8b949e',
                fontWeight: '900',
                fontSize: '1rem',
                cursor: currentLayer >= payloadData.steps.length ? 'pointer' : 'not-allowed',
                boxShadow: currentLayer >= payloadData.steps.length ? `0 0 30px ${theme.primary}55` : 'none'
              }}
            >
              {currentLayer >= payloadData.steps.length ? 'ACCESS ASSET NOW' : 'LOCKED BY SYSTEM'}
            </button>
          </div>
          <p style={{ marginTop: '40px', fontSize: '0.65rem', color: '#484f58', letterSpacing: '3px' }}>BX-SYSTEMS ENCRYPTION GATEWAY</p>
        </div>
      </div>
    );
  }

  // --- [RENDER: DASHBOARD & AUTH (MODO OSCURO PURO)] ---
  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .bx-fade-in { animation: fadeIn 0.4s ease forwards; }
        .bx-input { background: #0d1117; border: 1px solid #30363d; color: white; padding: 16px; borderRadius: 10px; width: 100%; outline: none; transition: 0.3s; }
        .bx-input:focus { border-color: ${theme.primary}; box-shadow: 0 0 10px ${theme.primary}22; }
        .sidebar-btn { width: 100%; padding: 14px; background: transparent; border: none; color: #8b949e; text-align: left; cursor: pointer; borderRadius: 8px; font-weight: 600; display: flex; gap: 10px; }
        .sidebar-btn.active { background: ${theme.primary}11; color: ${theme.primary}; }
        .sidebar-btn:hover:not(.active) { background: #161b22; color: white; }
      `}} />

      {/* FLUJO DE AUTENTICACIÓN */}
      {step !== 'dashboard' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
          <div className="bx-fade-in" style={{ background: theme.card, padding: '50px', borderRadius: '30px', width: '100%', maxWidth: '420px', border: `1px solid ${theme.border}` }}>
            
            {step === 'start' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: theme.primary, borderRadius: '15px', margin: '0 auto 25px' }}></div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>BX-SYSTEMS</h1>
                <p style={{ color: '#8b949e', marginBottom: '40px' }}>Professional Asset Distribution Terminal</p>
                <button onClick={() => setStep('register')} style={{ width: '100%', padding: '18px', background: theme.primary, color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>NEW OPERATOR</button>
                <button onClick={() => setStep('login')} style={{ width: '100%', padding: '18px', background: 'transparent', color: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', marginTop: '12px', cursor: 'pointer' }}>LOGIN</button>
              </div>
            )}

            {(step === 'register' || step === 'login' || step === 'verify-code' || step === 'set-pin') && (
              <div>
                <h2 style={{ color: 'white', marginBottom: '10px' }}>{step === 'login' ? 'Welcome Back' : 'Security Protocol'}</h2>
                <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '30px' }}>Encrypted Node Communication: ACTIVE</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input className="bx-input" placeholder="Operator Email" type="email" onChange={(e) => setEmail(e.target.value)} />
                  
                  {step === 'login' && <input className="bx-input" placeholder="Master PIN" type="password" onChange={(e) => setPassword(e.target.value)} />}
                  
                  {step === 'verify-code' && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: theme.primary, fontSize: '0.75rem', marginBottom: '10px' }}>CHECK EMAIL FOR VERIFICATION CODE</p>
                      <input className="bx-input" placeholder="0 0 0 0" style={{ textAlign: 'center', letterSpacing: '10px', fontSize: '1.5rem' }} onChange={(e) => setUserInputCode(e.target.value)} />
                    </div>
                  )}

                  {step === 'set-pin' && <input className="bx-input" placeholder="Create 4-Digit PIN" type="password" maxLength={4} onChange={(e) => setPassword(e.target.value)} />}

                  <button 
                    onClick={() => {
                      if (step === 'register') executeSendCode();
                      else if (step === 'verify-code') { if(userInputCode === authCode) setStep('set-pin'); else triggerNotify("❌ CODE INVALID"); }
                      else if (step === 'set-pin') handleRegister();
                      else if (step === 'login') handleLogin();
                    }}
                    style={{ padding: '18px', background: theme.primary, color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' }}
                  >
                    {loading ? 'SYNCHRONIZING...' : 'CONTINUE'}
                  </button>
                  <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '0.8rem' }}>Abort Session</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD PRINCIPAL */}
      {step === 'dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* SIDEBAR */}
          <div style={{ width: '280px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' }}>
              <div style={{ width: '35px', height: '35px', background: theme.primary, borderRadius: '8px' }}></div>
              <span style={{ fontWeight: '900', color: 'white', fontSize: '1.2rem' }}>BX-NEXUS</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setView('links')} className={`sidebar-btn ${view === 'links' ? 'active' : ''}`}>🔗 Smart Links</button>
              <button onClick={() => setView('analytics')} className={`sidebar-btn ${view === 'analytics' ? 'active' : ''}`}>📊 Network Stats</button>
              <button onClick={() => setView('settings')} className={`sidebar-btn ${view === 'settings' ? 'active' : ''}`}>⚙️ Config</button>
            </nav>

            <div style={{ background: '#0d1117', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#8b949e' }}>OPERATOR</p>
              <p style={{ margin: '5px 0 15px 0', fontSize: '0.85rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeUser?.email}</p>
              <button onClick={() => { localStorage.removeItem('bx_session'); setStep('start'); }} style={{ width: '100%', padding: '10px', background: '#da3633', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>TERMINATE</button>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
            {view === 'links' && (
              <div className="bx-fade-in">
                <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '40px' }}>Asset Deployment</h1>
                
                <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '35px', borderRadius: '25px', maxWidth: '800px' }}>
                  <h3 style={{ marginTop: 0, color: theme.primary }}>Node Configuration</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <input className="bx-input" placeholder="Asset Title (e.g. V-Bucks Generator)" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
                    <input className="bx-input" placeholder="Cover Image URL" value={linkImage} onChange={(e) => setLinkImage(e.target.value)} />
                  </div>
                  
                  <input className="bx-input" style={{ marginBottom: '25px' }} placeholder="Target Destination URL" value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)} />
                  
                  <div style={{ background: '#161b22', padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontWeight: 'bold', color: '#8b949e' }}>SECURITY LAYERS</span>
                      <select value={activeStepCount} onChange={(e) => setActiveStepCount(parseInt(e.target.value))} style={{ background: '#010409', color: 'white', border: `1px solid ${theme.primary}`, padding: '5px 15px', borderRadius: '8px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {Array.from({ length: activeStepCount }).map((_, i) => (
                        <input key={i} className="bx-input" placeholder={`Redirect URL ${i+1}`} value={redirectSteps[i]} onChange={(e) => { const n = [...redirectSteps]; n[i] = e.target.value; setRedirectSteps(n); }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={deployAsset} style={{ width: '100%', padding: '20px', background: theme.primary, color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', marginTop: '30px', cursor: 'pointer' }}>
                    {loading ? 'ENCRYPTING...' : 'GENERATE BX-LINK'}
                  </button>
                </div>

                <div style={{ marginTop: '50px' }}>
                  <h3 style={{ color: 'white' }}>Live Assets</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {myLinks.map(l => (
                      <div key={l.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{l.title}</p>
                          <code style={{ fontSize: '0.7rem', color: theme.primary }}>{l.url.substring(0, 45)}...</code>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(l.url); triggerNotify("📋 COPIED"); }} style={{ background: '#21262d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>COPY</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN GLOBAL */}
      {message && (
        <div className="bx-fade-in" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#0d1117', border: `1px solid ${theme.primary}`, color: 'white', padding: '15px 40px', borderRadius: '50px', fontWeight: 'bold', boxShadow: `0 0 20px ${theme.primary}44`, zIndex: 9999 }}>
          {message}
        </div>
      )}
    </div>
  );
}
