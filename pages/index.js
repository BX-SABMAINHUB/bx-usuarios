import { useState, useEffect } from 'react';

export default function Home() {
  // --- CORE SYSTEM ARCHITECTURE ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  const [dashView, setDashView] = useState('analytics');
  const [loading, setLoading] = useState(false);
  
  // --- USER AUTHENTICATION & DATABASE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- LINK INFRASTRUCTURE ---
  const [linkUrl, setLinkUrl] = useState(''); 
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);
  const [numSteps, setNumSteps] = useState(1);
  const [stepUrls, setStepUrls] = useState(['', '', '']); 
  
  // --- ENGINE ROUTING (SECURITY BYPASS PREVENTION) ---
  const [isUnlockPage, setIsUnlockPage] = useState(false);
  const [unlockData, setUnlockData] = useState(null);
  const [currentUnlockStep, setCurrentUnlockStep] = useState(0);

  // --- BRANDING & GLOBAL STYLES ---
  const [themeColor, setThemeColor] = useState('#00d2ff');
  const [accentColor, setAccentColor] = useState('#3a7bd5');
  const [glassOpacity, setGlassOpacity] = useState(0.85);
  const [urlToShorten, setUrlToShorten] = useState('');
  const [shortenedResult, setShortenedResult] = useState('');

  // --- ANALYTICS & LOGGING SYSTEM ---
  const [systemLogs, setSystemLogs] = useState([]);
  const [visitorCount, setVisitorCount] = useState({ total: 5420, session: 12 });

  // --- PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');
    
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setUnlockData(decoded);
        setIsUnlockPage(true);
        addLog("External Payload Detected - Accessing Gateway");
      } catch (e) {
        showNotify("❌ DATA ENCRYPTION ERROR");
      }
    }

    const dataSync = {
      'bx_accounts': setUserAccounts,
      'bx_links': setMyLinks,
      'bx_logs': setSystemLogs
    };
    
    Object.entries(dataSync).forEach(([key, setter]) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
    });

    const session = localStorage.getItem('bx_active_session');
    if (session && !payload) { 
      setCurrentUser(JSON.parse(session)); 
      setStep('user-dashboard'); 
    }
  }, []);

  // --- UTILITY: LOGGING SYSTEM ---
  const addLog = (action) => {
    const newLog = { 
      time: new Date().toLocaleTimeString(), 
      action, 
      id: Math.random().toString(36).substr(2, 5).toUpperCase() 
    };
    const updated = [newLog, ...systemLogs].slice(0, 10);
    setSystemLogs(updated);
    localStorage.setItem('bx_logs', JSON.stringify(updated));
  };

  // --- LOGIC: SECURITY DISPATCHER ---
  const sendVerification = async (target) => {
    if (!email.includes('@')) { showNotify("❌ INVALID IDENTITY"); return; }
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    
    setTimeout(() => {
      setStep(target);
      addLog(`Security code sent to ${email}`);
      showNotify("📡 SYSTEM: CODE IS " + code);
      setLoading(false);
    }, 1200);
  };

  // --- LOGIC: ACCOUNT FINALIZATION ---
  const finalizeRegistration = () => {
    if (password.length < 4) { showNotify("❌ PIN INSECURE"); return; }
    const account = { 
      email, 
      password, 
      created: new Date().toLocaleString(),
      tier: 'Premium' 
    };
    const updated = [...userAccounts, account];
    setUserAccounts(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    addLog(`New account registered: ${email}`);
    showNotify("🎉 DATABASE SYNCHRONIZED");
    setStep('login');
  };

  const handleLogin = () => {
    const found = userAccounts.find(u => u.email === email && u.password === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('bx_active_session', JSON.stringify(found)); 
      addLog(`User session started: ${email}`);
      setStep('user-dashboard');
      showNotify(`ACCESS GRANTED: ${email.split('@')[0].toUpperCase()}`);
    } else { 
      addLog(`Failed login attempt: ${email}`);
      showNotify("❌ ACCESS DENIED"); 
    }
  };

  // --- LOGIC: SMART LINK ARCHITECT (FIXED) ---
  const deploySmartLink = () => {
    if (!linkUrl.startsWith('http')) { showNotify("⚠️ INVALID TARGET URL"); return; }
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
        id: Date.now().toString(36),
        title: payloadData.title,
        image: payloadData.image,
        short: deployedUrl, 
        clicks: 0,
        status: 'Active'
      };

      const updatedLinks = [entry, ...myLinks];
      setMyLinks(updatedLinks);
      localStorage.setItem('bx_links', JSON.stringify(updatedLinks));
      
      addLog(`Deployed link: ${entry.id}`);
      setLinkUrl(''); setLinkTitle('');
      setLoading(false);
      showNotify("🚀 ASSET BROADCASTED");
    }, 1500);
  };

  // --- LOGIC: BX GLOBAL SHORTENER (ENGLISH) ---
  const executeShorten = async () => {
    if (!urlToShorten) return;
    setLoading(true);
    addLog("Requesting external URL compression");
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
      if (response.ok) {
        const result = await response.text();
        setShortenedResult(result);
        showNotify("✨ URL OPTIMIZED");
      }
    } catch (err) {
      showNotify("❌ EXTERNAL API TIMEOUT");
    }
    setLoading(false);
  };

  const showNotify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  // --- UI THEME DEFINITION ---
  const containerStyle = {
    backgroundColor: '#020617',
    color: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 70%)'
  };

  const glassPanel = {
    background: `rgba(15, 23, 42, ${glassOpacity})`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  // --- RENDER: BX LANDING GATEWAY (THE UNLOCKER) ---
  if (isUnlockPage && unlockData) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="fade-up" style={{ ...glassPanel, padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '25px' }}>
            <img src={unlockData.image} style={{ width: '120px', height: '120px', borderRadius: '35px', objectFit: 'cover', border: `4px solid ${themeColor}` }} />
            <div style={{ position: 'absolute', top: -10, right: -10, background: themeColor, padding: '5px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.7rem' }}>SECURE</div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }}>{unlockData.title}</h2>
          <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Complete the security layers to access the destination</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {unlockData.steps.map((url, i) => (
              <button 
                key={i} 
                disabled={currentUnlockStep < i} // FIXED: Cannot click if previous step isn't done
                onClick={() => { window.open(url, '_blank'); if(currentUnlockStep === i) setCurrentUnlockStep(i+1); }} 
                style={{ 
                  padding: '20px', borderRadius: '18px', border: '1px solid #334155', 
                  background: currentUnlockStep > i ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                  color: currentUnlockStep > i ? '#10b981' : 'white', 
                  cursor: currentUnlockStep < i ? 'not-allowed' : 'pointer', 
                  fontWeight: 'bold', fontSize: '1rem',
                  opacity: currentUnlockStep < i ? 0.3 : 1 // Visual cue for locked steps
                }}
              >
                {currentUnlockStep > i ? `✅ LAYER ${i+1} VERIFIED` : `🔓 BYPASS LAYER ${i+1}`}
              </button>
            ))}

            <button 
              disabled={currentUnlockStep < unlockData.steps.length}
              onClick={() => window.location.href = unlockData.target}
              style={{ 
                padding: '22px', borderRadius: '18px', border: 'none', 
                background: currentUnlockStep >= unlockData.steps.length ? themeColor : '#1e293b',
                color: 'white', fontWeight: '900', fontSize: '1.2rem', marginTop: '15px', 
                cursor: currentUnlockStep >= unlockData.steps.length ? 'pointer' : 'not-allowed',
                boxShadow: currentUnlockStep >= unlockData.steps.length ? `0 0 30px ${themeColor}` : 'none',
                transition: '0.4s'
              }}>
              {currentUnlockStep >= unlockData.steps.length ? 'CONTINUE TO TARGET' : 'LOCKED BY SYSTEM'}
            </button>
          </div>
          <p style={{ marginTop: '40px', fontSize: '0.75rem', color: '#475569', letterSpacing: '2px' }}>ENCRYPTED BY BX-SYSTEMS CLOUD</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .bx-input-field { background: #0f172a; border: 1px solid #1e293b; color: white; padding: 18px; border-radius: 14px; width: 100%; transition: 0.3s; }
        .bx-input-field:focus { border-color: ${themeColor}; outline: none; box-shadow: 0 0 15px rgba(0, 210, 255, 0.1); }
        .sidebar-btn { padding: 16px 24px; border-radius: 14px; border: none; background: transparent; color: #64748b; cursor: pointer; text-align: left; font-weight: 600; display: flex; alignItems: center; gap: 12px; }
        .sidebar-btn.active { background: rgba(255,255,255,0.05); color: ${themeColor}; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />

      {/* --- PHASE 1: SPLASH SCREEN --- */}
      {step === 'start' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="fade-up" style={{ ...glassPanel, padding: '60px', borderRadius: '50px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: themeColor, borderRadius: '24px', margin: '0 auto 30px', boxShadow: `0 0 40px ${themeColor}66` }}></div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-3px', margin: 0 }}>BX-SYSTEMS</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '50px' }}>Next-Gen Asset Security & Distribution</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <button onClick={() => setStep('reg-email')} style={{ padding: '22px', borderRadius: '18px', border: 'none', background: themeColor, color: 'white', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer' }}>INITIALIZE CLOUD</button>
              <button onClick={() => setStep('login')} style={{ padding: '22px', borderRadius: '18px', border: '1px solid #334155', background: 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>OPERATOR LOGIN</button>
            </div>
            <p style={{ marginTop: '40px', fontSize: '0.7rem', color: '#334155', fontWeight: 'bold' }}>SYSTEM STATUS: OPTIMAL | VER 5.2.0</p>
          </div>
        </div>
      )}

      {/* --- PHASE 2: SECURE AUTHENTICATION --- */}
      {(['reg-email', 'login', 'reg-code', 'reg-pass'].includes(step)) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="fade-up" style={{ ...glassPanel, padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>{step === 'login' ? 'Nexus Login' : 'New Identity'}</h2>
            <p style={{ textAlign: 'center', color: '#475569', marginBottom: '35px', fontSize: '0.9rem' }}>End-to-End Encrypted Session</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input className="bx-input-field" type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} />
              
              {step === 'login' && <input className="bx-input-field" type="password" placeholder="Master PIN" onChange={(e)=>setPassword(e.target.value)} />}
              
              {step === 'reg-code' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: themeColor, marginBottom: '10px' }}>CHECK SYSTEM NOTIFICATIONS FOR CODE</p>
                  <input className="bx-input-field" placeholder="0000" style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '10px', fontWeight: '900' }} onChange={(e)=>setInputCode(e.target.value)} />
                </div>
              )}
              
              {step === 'reg-pass' && <input className="bx-input-field" type="password" placeholder="Create 4-Digit PIN" onChange={(e)=>setPassword(e.target.value)} />}

              <button 
                onClick={() => {
                  if(step === 'reg-email') sendVerification('reg-code');
                  else if(step === 'reg-code') { if(inputCode === generatedCode) setStep('reg-pass'); else showNotify("❌ CODE INVALID"); }
                  else if(step === 'reg-pass') finalizeRegistration();
                  else if(step === 'login') handleLogin();
                }}
                disabled={loading}
                style={{ padding: '20px', borderRadius: '15px', border: 'none', background: themeColor, color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}
              >
                {loading ? 'SYNCHRONIZING...' : 'CONTINUE'}
              </button>
              <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.85rem' }}>Abort Connection</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHASE 3: MASTER DASHBOARD --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* SIDE NAVIGATION PANEL */}
          <div style={{ width: '300px', ...glassPanel, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px', padding: '0 15px' }}>
              <div style={{ width: '40px', height: '40px', background: themeColor, borderRadius: '12px' }}></div>
              <span style={{ fontWeight: '900', fontSize: '1.3rem' }}>BX-NEXUS</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setDashView('analytics')} className={`sidebar-btn ${dashView === 'analytics' ? 'active' : ''}`}>
                <span>📊</span> ANALYTICS HUB
              </button>
              <button onClick={() => setDashView('links')} className={`sidebar-btn ${dashView === 'links' ? 'active' : ''}`}>
                <span>🔗</span> ASSET MANAGER
              </button>
              <button onClick={() => setDashView('customize')} className={`sidebar-btn ${dashView === 'customize' ? 'active' : ''}`}>
                <span>🎨</span> SYSTEM DESIGN
              </button>
            </div>

            <div style={{ padding: '25px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>SECURE SESSION</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
              <button onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: '#f43f5e', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>TERMINATE</button>
            </div>
          </div>

          {/* DYNAMIC VIEWPORT */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto', maxHeight: '100vh' }}>
            
            {dashView === 'analytics' && (
              <div className="fade-up">
                <header style={{ marginBottom: '50px' }}>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>System <span style={{ color: themeColor }}>Intelligence</span></h1>
                  <p style={{ color: '#64748b' }}>Real-time performance metrics for your distributed assets.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '50px' }}>
                  {[
                    { label: 'TOTAL ASSET HITS', val: myLinks.reduce((a,b)=>a+b.clicks, 0), color: themeColor },
                    { label: 'ACTIVE NODES', val: myLinks.length, color: '#a855f7' },
                    { label: 'GLOBAL REACH', val: '94.2%', color: '#10b981' }
                  ].map((stat, i) => (
                    <div key={i} style={{ ...glassPanel, padding: '35px', borderRadius: '30px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: '10%', width: '80%', height: '2px', background: stat.color, opacity: 0.5 }}></div>
                      <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px' }}>{stat.label}</p>
                      <h2 style={{ fontSize: '3.2rem', margin: 0 }}>{stat.val}</h2>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
                  <div style={{ ...glassPanel, padding: '40px', borderRadius: '35px' }}>
                    <h3 style={{ marginBottom: '30px' }}>Traffic Velocity (Last 24h)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
                      {[40, 70, 45, 90, 65, 80, 55, 100, 85, 40, 60, 75].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: `linear-gradient(to top, ${themeColor}, transparent)`, height: `${h}%`, borderRadius: '6px' }}></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ ...glassPanel, padding: '40px', borderRadius: '35px' }}>
                    <h3 style={{ marginBottom: '25px' }}>Latest Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {systemLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                          <span style={{ color: themeColor }}>[{log.time}]</span>
                          <span style={{ color: '#94a3b8' }}>{log.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashView === 'links' && (
              <div className="fade-up">
                <header style={{ marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>Asset <span style={{ color: themeColor }}>Deployment</span></h1>
                </header>

                <div style={{ ...glassPanel, padding: '45px', borderRadius: '40px', marginBottom: '50px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '30px' }}>Configuration Engine</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <input className="bx-input-field" placeholder="Display Title" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} />
                    <input className="bx-input-field" placeholder="Asset Cover URL (HTTPS)" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} />
                  </div>
                  <input className="bx-input-field" style={{ marginBottom: '25px' }} placeholder="Final Target Destination (e.g., https://mediafire.com/...)" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} />
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '25px', marginBottom: '30px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', color: themeColor }}>SECURITY LAYERS SELECTION</label>
                      <select value={numSteps} onChange={(e)=>setNumSteps(parseInt(e.target.value))} style={{ padding: '10px 20px', background: '#020617', border: `1px solid ${themeColor}`, borderRadius: '10px', color: 'white' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {Array.from({ length: numSteps }).map((_, i) => (
                        <input key={i} className="bx-input-field" style={{ fontSize: '0.8rem' }} placeholder={`Redirect Layer ${i+1}`} value={stepUrls[i]} onChange={(e)=>{const n=[...stepUrls]; n[i]=e.target.value; setStepUrls(n);}} />
                      ))}
                    </div>
                  </div>
                  
                  <button onClick={deploySmartLink} disabled={loading} style={{ width: '100%', padding: '22px', borderRadius: '18px', background: themeColor, color: 'white', fontWeight: '900', fontSize: '1.2rem', border: 'none', cursor: 'pointer', transition: '0.3s' }}>
                    {loading ? 'ENCRYPTING ASSET...' : 'GENERATE BX-DEPLOYMENT'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ marginBottom: '10px' }}>Live Asset Nodes</h3>
                  {myLinks.map(link => (
                    <div key={link.id} style={{ ...glassPanel, padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src={link.image} style={{ width: '65px', height: '65px', borderRadius: '18px', border: `2px solid ${themeColor}`, objectFit: 'cover' }} />
                        <div style={{ maxWidth: '350px' }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{link.title}</h4>
                          <p style={{ margin: 0, color: themeColor, fontSize: '0.75rem', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => window.open(link.short)}>{link.short}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: '900', display: 'block' }}>{link.clicks}</span>
                          <span style={{ fontSize: '0.6rem', color: '#475569' }}>CLICKS</span>
                        </div>
                        <button onClick={() => setMyLinks(myLinks.filter(l => l.id !== link.id))} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', color: '#f43f5e', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>TERMINATE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashView === 'customize' && (
              <div className="fade-up">
                <header style={{ marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>System <span style={{ color: themeColor }}>Interface</span></h1>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                  <div style={{ ...glassPanel, padding: '40px', borderRadius: '35px' }}>
                    <h3 style={{ marginBottom: '25px' }}>Identity Colors</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {['#00d2ff', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                        <div key={c} onClick={() => setThemeColor(c)} style={{ width: '50px', height: '50px', borderRadius: '15px', background: c, cursor: 'pointer', border: themeColor === c ? '4px solid white' : 'none', transition: '0.2s' }}></div>
                      ))}
                    </div>
                    <div style={{ marginTop: '30px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: '#64748b' }}>GLASS MORPHISM OPACITY</label>
                      <input type="range" min="0.1" max="1" step="0.05" value={glassOpacity} onChange={(e)=>setGlassOpacity(e.target.value)} style={{ width: '100%', accentColor: themeColor }} />
                    </div>
                  </div>
                  
                  <div style={{ ...glassPanel, padding: '40px', borderRadius: '35px', border: `1px dashed ${themeColor}` }}>
                    <h3 style={{ color: themeColor, marginTop: 0 }}>BX GLOBAL SHORTENER</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '25px' }}>Compress any BX deployment URL into a clean, social-ready link.</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <input className="bx-input-field" placeholder="Paste deployment URL..." value={urlToShorten} onChange={(e)=>setUrlToShorten(e.target.value)} />
                      <button onClick={executeShorten} style={{ padding: '0 30px', background: themeColor, color: 'white', borderRadius: '14px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SHORTEN</button>
                    </div>
                    {shortenedResult && (
                      <div className="fade-up" style={{ marginTop: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <code style={{ color: '#10b981', fontSize: '1.1rem' }}>{shortenedResult}</code>
                        <button onClick={() => { navigator.clipboard.writeText(shortenedResult); showNotify("📋 COPIED TO CLIPBOARD"); }} style={{ padding: '10px 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>COPY</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL NOTIFICATION SYSTEM */}
      {message && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          padding: '18px 40px', borderRadius: '100px', background: '#1e293b', border: `1px solid ${themeColor}`,
          color: 'white', fontWeight: '900', zIndex: 99999, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {message}
        </div>
      )}

    </div>
  );
}
