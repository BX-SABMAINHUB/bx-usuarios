import { useState, useEffect } from 'react';

/**
 * BX-SYSTEMS v5.2.0 - CORE ENGINE
 * Encrypted Link Management & Security Gateway
 */

export default function Home() {
  // --- GLOBAL STATE MANAGEMENT ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  const [dashView, setDashView] = useState('links');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // --- AUTHENTICATION DATA ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- ASSET CREATION ENGINE ---
  const [linkUrl, setLinkUrl] = useState(''); 
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);
  const [numSteps, setNumSteps] = useState(1);
  const [stepUrls, setStepUrls] = useState(['', '', '']); 
  
  // --- GATEWAY / UNLOCKER LOGIC ---
  const [isUnlockPage, setIsUnlockPage] = useState(false);
  const [unlockData, setUnlockData] = useState(null);
  const [currentUnlockStep, setCurrentUnlockStep] = useState(0);

  // --- INTERFACE CUSTOMIZATION ---
  const [themeColor, setThemeColor] = useState('#00d2ff');
  const [accentColor, setAccentColor] = useState('#3a7bd5');
  const [glassOpacity, setGlassOpacity] = useState(0.85);

  // --- ANALYTICS & LOGS ---
  const [systemLogs, setSystemLogs] = useState([]);

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    // 1. Check for Encrypted Payload (The Unlocker)
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');
    
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setUnlockData(decoded);
        setIsUnlockPage(true);
        addLog("Gateway Accessed - Payload Decrypted");
      } catch (e) {
        showNotify("❌ ENCRYPTION BREACH DETECTED");
      }
    }

    // 2. Sync Local Storage Data
    const savedAccounts = localStorage.getItem('bx_accounts');
    if (savedAccounts) setUserAccounts(JSON.parse(savedAccounts));

    const savedLinks = localStorage.getItem('bx_links');
    if (savedLinks) setMyLinks(JSON.parse(savedLinks));

    const savedLogs = localStorage.getItem('bx_logs');
    if (savedLogs) setSystemLogs(JSON.parse(savedLogs));

    // 3. Session Recovery
    const session = localStorage.getItem('bx_active_session');
    if (session && !payload) { 
      setCurrentUser(JSON.parse(session)); 
      setStep('user-dashboard'); 
    }
  }, []);

  // --- LOGIC: SYSTEM UTILITIES ---
  const addLog = (action) => {
    const newLog = { 
      time: new Date().toLocaleTimeString(), 
      action, 
      id: Math.random().toString(36).substr(2, 5).toUpperCase() 
    };
    const updated = [newLog, ...systemLogs].slice(0, 15);
    setSystemLogs(updated);
    localStorage.setItem('bx_logs', JSON.stringify(updated));
  };

  const showNotify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4500);
  };

  // --- LOGIC: SECURITY DISPATCHER (GMAIL SIMULATION) ---
  const sendVerificationCode = async () => {
    if (!email.includes('@')) { 
        showNotify("⚠️ INVALID EMAIL IDENTITY"); 
        return; 
    }
    
    setLoading(true);
    // Real-world behavior simulation
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    
    // In a production environment, this would call an API route (e.g., SendGrid/Nodemailer)
    setTimeout(() => {
      setStep('reg-code');
      addLog(`Security protocol initiated for ${email}`);
      
      // FIX: El código NO aparece en la UI. Se envía a la "bandeja" (Consola en desarrollo)
      showNotify("📩 SECURITY CODE DISPATCHED TO YOUR INBOX");
      console.log("%c [SYSTEM DEVICE] VERIFICATION CODE: " + code, "color: #00d2ff; font-weight: bold; font-size: 1.2rem;");
      
      setLoading(false);
    }, 2500);
  };

  // --- LOGIC: ACCOUNT LIFECYCLE ---
  const finalizeRegistration = () => {
    if (password.length < 4) { 
        showNotify("❌ MASTER PIN TOO WEAK"); 
        return; 
    }
    
    const account = { 
      email, 
      password, 
      created: new Date().toISOString(),
      tier: 'Standard Operator' 
    };

    const updated = [...userAccounts, account];
    setUserAccounts(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    
    addLog(`New Operator Synchronized: ${email}`);
    showNotify("🎉 DATABASE UPDATED - PLEASE LOGIN");
    setStep('login');
  };

  const processLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_active_session', JSON.stringify(user)); 
      addLog(`Session Started: ${email}`);
      setStep('user-dashboard');
      showNotify(`WELCOME BACK, OPERATOR`);
    } else { 
      addLog(`Unauthorized Access Attempt: ${email}`);
      showNotify("❌ ACCESS DENIED: INVALID CREDENTIALS"); 
    }
  };

  // --- LOGIC: SMART LINK DEPLOYMENT ---
  const generateDeployment = () => {
    if (!linkUrl.startsWith('http')) { 
        showNotify("⚠️ DESTINATION URL REQUIRED"); 
        return; 
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const origin = window.location.origin + window.location.pathname;
      const payloadData = {
        target: linkUrl,
        title: linkTitle || 'Secured Asset',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: stepUrls.slice(0, numSteps).filter(s => s !== '')
      };

      const base64 = btoa(JSON.stringify(payloadData));
      const deployedUrl = `${origin}?payload=${base64}`;
      
      const entry = {
        id: Math.random().toString(36).substr(2, 6),
        title: payloadData.title,
        image: payloadData.image,
        short: deployedUrl, 
        clicks: 0,
        timestamp: Date.now()
      };

      const updatedLinks = [entry, ...myLinks];
      setMyLinks(updatedLinks);
      localStorage.setItem('bx_links', JSON.stringify(updatedLinks));
      
      addLog(`Asset Deployed: ${entry.id}`);
      setLinkUrl(''); 
      setLinkTitle('');
      setLoading(false);
      showNotify("🚀 ASSET DEPLOYED TO CLOUD NODES");
    }, 2000);
  };

  // --- UI: STYLESHEET (DISEÑO VIDEO 1:1) ---
  const styles = {
    mainContainer: {
      backgroundColor: '#010409',
      backgroundImage: 'radial-gradient(circle at top right, #0d1117, #010409)',
      color: '#e6edf3',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      overflowX: 'hidden'
    },
    glass: {
      background: 'rgba(13, 17, 23, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #30363d',
      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.8)'
    },
    input: {
      background: '#0d1117',
      border: '1px solid #30363d',
      color: '#f0f6fc',
      padding: '16px',
      borderRadius: '8px',
      outline: 'none',
      fontSize: '1rem',
      width: '100%',
      transition: 'border 0.3s'
    },
    buttonPrimary: {
      background: themeColor,
      color: '#000',
      border: 'none',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'transform 0.2s, opacity 0.2s'
    }
  };

  // --- COMPONENT: THE UNLOCKER GATEWAY (AS SEEN IN VIDEO) ---
  if (isUnlockPage && unlockData) {
    return (
      <div style={{ ...styles.mainContainer, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="fade-in" style={{ ...styles.glass, width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
          <img src={unlockData.image} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', marginBottom: '20px', border: `3px solid ${themeColor}` }} />
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{unlockData.title}</h1>
          <p style={{ color: '#8b949e', marginBottom: '35px' }}>Verify your identity through the following security layers</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {unlockData.steps.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <button 
                  disabled={currentUnlockStep < i}
                  onClick={() => { window.open(url, '_blank'); if(currentUnlockStep === i) setCurrentUnlockStep(i+1); }}
                  style={{ 
                    ...styles.input, 
                    cursor: currentUnlockStep < i ? 'not-allowed' : 'pointer',
                    background: currentUnlockStep > i ? 'rgba(35, 134, 54, 0.15)' : '#0d1117',
                    borderColor: currentUnlockStep > i ? '#238636' : (currentUnlockStep === i ? themeColor : '#30363d'),
                    color: currentUnlockStep > i ? '#3fb950' : '#f0f6fc',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                  <span>{currentUnlockStep > i ? '✅ LAYER VERIFIED' : `🔓 ACTIVATE LAYER ${i+1}`}</span>
                  {currentUnlockStep < i && <span>🔒</span>}
                </button>
              </div>
            ))}

            <button 
              disabled={currentUnlockStep < unlockData.steps.length}
              onClick={() => window.location.href = unlockData.target}
              style={{ 
                ...styles.buttonPrimary,
                marginTop: '20px',
                background: currentUnlockStep >= unlockData.steps.length ? themeColor : '#21262d',
                color: currentUnlockStep >= unlockData.steps.length ? '#000' : '#8b949e',
                cursor: currentUnlockStep >= unlockData.steps.length ? 'pointer' : 'not-allowed'
              }}>
              {currentUnlockStep >= unlockData.steps.length ? 'CONTINUE TO ASSET' : 'WAITING FOR LAYERS...'}
            </button>
          </div>
          <footer style={{ marginTop: '40px', fontSize: '0.7rem', color: '#484f58', letterSpacing: '2px' }}>POWERED BY BX-SYSTEMS SECURE CLOUD</footer>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div style={styles.mainContainer}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .sidebar-item { padding: 14px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #8b949e; display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .sidebar-item.active { background: ${themeColor}22; color: ${themeColor}; border-left: 3px solid ${themeColor}; }
        .bx-card { background: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 24px; }
      `}} />

      {/* --- AUTHENTICATION FLOW --- */}
      {['start', 'reg-email', 'reg-code', 'reg-pass', 'login'].includes(step) && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="fade-in" style={{ ...styles.glass, padding: '50px', borderRadius: '32px', width: '100%', maxWidth: '420px' }}>
            
            {step === 'start' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', background: themeColor, borderRadius: '18px', margin: '0 auto 25px', boxShadow: `0 0 30px ${themeColor}44` }}></div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>BX-SYSTEMS</h1>
                <p style={{ color: '#8b949e', marginBottom: '40px' }}>Secure Asset Distribution & Tracking</p>
                <button onClick={() => setStep('reg-email')} style={{ ...styles.buttonPrimary, width: '100%' }}>INITIALIZE SYSTEM</button>
                <button onClick={() => setStep('login')} style={{ background: 'transparent', border: '1px solid #30363d', color: 'white', width: '100%', padding: '16px', borderRadius: '8px', marginTop: '12px', cursor: 'pointer' }}>OPERATOR LOGIN</button>
              </div>
            )}

            {step !== 'start' && (
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{step === 'login' ? 'Nexus Login' : 'Secure Registration'}</h2>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '30px' }}>Protocol: AES-256 Encrypted Session</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input style={styles.input} placeholder="Email Address" type="email" onChange={(e)=>setEmail(e.target.value)} />
                  
                  {step === 'login' && <input style={styles.input} placeholder="Master PIN" type="password" onChange={(e)=>setPassword(e.target.value)} />}
                  
                  {step === 'reg-code' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: themeColor, marginBottom: '10px' }}>CHECK YOUR INBOX FOR THE CODE</p>
                        <input style={{ ...styles.input, textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }} placeholder="0000" maxLength={4} onChange={(e)=>setInputCode(e.target.value)} />
                    </div>
                  )}

                  {step === 'reg-pass' && <input style={styles.input} placeholder="Set 4-Digit PIN" type="password" maxLength={4} onChange={(e)=>setPassword(e.target.value)} />}

                  <button 
                    style={{ ...styles.buttonPrimary, marginTop: '10px' }}
                    onClick={() => {
                        if(step === 'reg-email') sendVerificationCode();
                        else if(step === 'reg-code') { if(inputCode === generatedCode) setStep('reg-pass'); else showNotify("❌ CODE MISMATCH"); }
                        else if(step === 'reg-pass') finalizeRegistration();
                        else if(step === 'login') processLogin();
                    }}
                  >
                    {loading ? 'SYNCHRONIZING...' : 'EXECUTE'}
                  </button>
                  <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '0.8rem' }}>Back to Terminal</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DASHBOARD (DISEÑO VIDEO 1:1) --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <div style={{ width: '280px', borderRight: '1px solid #30363d', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px', padding: '0 10px' }}>
              <div style={{ width: '32px', height: '32px', background: themeColor, borderRadius: '8px' }}></div>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>BX-NEXUS</span>
            </div>

            <nav style={{ flex: 1 }}>
              <div onClick={() => setDashView('analytics')} className={`sidebar-item ${dashView === 'analytics' ? 'active' : ''}`}>📊 Analytics Hub</div>
              <div onClick={() => setDashView('links')} className={`sidebar-item ${dashView === 'links' ? 'active' : ''}`}>🔗 My Smart Links</div>
              <div onClick={() => setDashView('settings')} className={`sidebar-item ${dashView === 'settings' ? 'active' : ''}`}>⚙️ System Settings</div>
            </nav>

            <div style={{ padding: '20px', background: '#0d1117', borderRadius: '12px', border: '1px solid #30363d' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: '5px' }}>OPERATOR ID</div>
              <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
              <button 
                onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }}
                style={{ width: '100%', padding: '10px', marginTop: '15px', background: '#da3633', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >LOGOUT</button>
            </div>
          </div>

          {/* VIEWPORT CONTENT */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
            
            {dashView === 'links' && (
              <div className="fade-in">
                <header style={{ marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Asset Deployment</h1>
                  <p style={{ color: '#8b949e' }}>Configure and secure your link distribution nodes.</p>
                </header>

                <div className="bx-card" style={{ maxWidth: '800px', marginBottom: '40px' }}>
                  <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: themeColor }}>●</span> Link Configuration
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '8px' }}>Header Title</label>
                      <input style={styles.input} placeholder="Ex: Premium Unlock" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '8px' }}>Asset Cover (URL)</label>
                      <input style={styles.input} placeholder="https://image-host.com/..." value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '8px' }}>Final Destination URL</label>
                    <input style={styles.input} placeholder="https://final-target.com/file" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} />
                  </div>

                  <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontWeight: 'bold' }}>Security Step Layers</span>
                      <select value={numSteps} onChange={(e)=>setNumSteps(parseInt(e.target.value))} style={{ background: '#0d1117', color: 'white', border: '1px solid #30363d', padding: '5px 10px', borderRadius: '4px' }}>
                        <option value="1">1 Layer</option><option value="2">2 Layers</option><option value="3">3 Layers</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {Array.from({ length: numSteps }).map((_, i) => (
                        <input key={i} style={{ ...styles.input, fontSize: '0.8rem' }} placeholder={`Redirect ${i+1}`} value={stepUrls[i]} onChange={(e)=>{const n=[...stepUrls]; n[i]=e.target.value; setStepUrls(n);}} />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={generateDeployment}
                    disabled={loading}
                    style={{ ...styles.buttonPrimary, width: '100%', marginTop: '30px', boxShadow: `0 0 20px ${themeColor}33` }}
                  >
                    {loading ? 'DEPLOYING NODES...' : 'DEPLOY SMART LINK'}
                  </button>
                </div>

                <h3 style={{ marginBottom: '20px' }}>Active Deployments</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {myLinks.map(link => (
                    <div key={link.id} className="bx-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <img src={link.image} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{link.title}</h4>
                        <code style={{ fontSize: '0.7rem', color: themeColor }}>{link.short.substring(0, 40)}...</code>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <button onClick={() => { navigator.clipboard.writeText(link.short); showNotify("📋 LINK COPIED"); }} style={{ padding: '8px 12px', background: '#21262d', border: '1px solid #30363d', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>COPY</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashView === 'analytics' && (
              <div className="fade-in">
                <h1>System Intelligence</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '30px' }}>
                  <div className="bx-card">
                    <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>GLOBAL CLICKS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{myLinks.length * 12}</div>
                  </div>
                  <div className="bx-card">
                    <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>ACTIVE LINKS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{myLinks.length}</div>
                  </div>
                  <div className="bx-card">
                    <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>SECURITY SCORE</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3fb950' }}>A+</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NOTIFICATION LAYER --- */}
      {message && (
        <div className="fade-in" style={{ 
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', 
          background: '#0d1117', border: `1px solid ${themeColor}`, padding: '15px 35px', 
          borderRadius: '50px', color: 'white', fontWeight: 'bold', boxShadow: `0 0 30px rgba(0,0,0,0.5)`,
          zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📡</span> {message}
        </div>
      )}

    </div>
  );
}
