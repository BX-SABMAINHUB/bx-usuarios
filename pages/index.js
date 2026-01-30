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
        addLog("EXTERNAL_PAYLOAD_DETECTED");
      } catch (e) {
        showNotify("❌ DATA_ENCRYPTION_ERROR");
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
    if (!email.includes('@')) { showNotify("❌ INVALID_IDENTITY"); return; }
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    
    setTimeout(() => {
      setStep(target);
      addLog(`SECURITY_CODE_DISPATCHED_TO_${email.toUpperCase()}`);
      showNotify("📡 SYSTEM: CODE IS " + code);
      setLoading(false);
    }, 1200);
  };

  // --- LOGIC: ACCOUNT FINALIZATION ---
  const finalizeRegistration = () => {
    if (password.length < 4) { showNotify("❌ PIN_INSECURE"); return; }
    const account = { 
      email, 
      password, 
      created: new Date().toLocaleString(),
      tier: 'Premium' 
    };
    const updated = [...userAccounts, account];
    setUserAccounts(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    addLog(`NEW_IDENTITY_REGISTERED: ${email}`);
    showNotify("🎉 DATABASE_SYNCHRONIZED");
    setStep('login');
  };

  const handleLogin = () => {
    const found = userAccounts.find(u => u.email === email && u.password === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('bx_active_session', JSON.stringify(found)); 
      addLog(`SESSION_ESTABLISHED: ${email}`);
      setStep('user-dashboard');
      showNotify(`ACCESS_GRANTED: ${email.split('@')[0].toUpperCase()}`);
    } else { 
      addLog(`UNAUTHORIZED_ACCESS_ATTEMPT: ${email}`);
      showNotify("❌ ACCESS_DENIED"); 
    }
  };

  // --- LOGIC: SMART LINK ARCHITECT (FIXED) ---
  const deploySmartLink = () => {
    if (!linkUrl.startsWith('http')) { showNotify("⚠️ INVALID_TARGET_URL"); return; }
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
      
      addLog(`ASSET_DEPLOYED: ${entry.id}`);
      setLinkUrl(''); setLinkTitle('');
      setLoading(false);
      showNotify("🚀 ASSET_BROADCASTED");
    }, 1500);
  };

  // --- LOGIC: BX GLOBAL SHORTENER ---
  const executeShorten = async () => {
    if (!urlToShorten) return;
    setLoading(true);
    addLog("COMPRESSING_EXTERNAL_URL");
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
      if (response.ok) {
        const result = await response.text();
        setShortenedResult(result);
        showNotify("✨ URL_OPTIMIZED");
      }
    } catch (err) {
      showNotify("❌ API_TIMEOUT");
    }
    setLoading(false);
  };

  const showNotify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  // --- LOGIC: SECURE UNLOCK HANDLER (FIXED FOR STEPS) ---
  const handleStepUnlock = (index, url) => {
    window.open(url, '_blank');
    if (currentUnlockStep === index) {
      setCurrentUnlockStep(index + 1);
      addLog(`SECURITY_LAYER_${index + 1}_BYPASSED`);
    }
  };

  // --- UI THEME DEFINITION ---
  const containerStyle = {
    backgroundColor: '#020617',
    color: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
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
            <div style={{ position: 'absolute', top: -10, right: -10, background: themeColor, padding: '5px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.7rem', color: 'black' }}>SECURE</div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }}>{unlockData.title}</h2>
          <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Complete security layers to synchronize data</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {unlockData.steps.map((url, i) => (
              <button 
                key={i} 
                onClick={() => handleStepUnlock(i, url)} 
                disabled={currentUnlockStep < i}
                style={{ 
                  padding: '20px', borderRadius: '18px', border: '1px solid #334155', 
                  background: currentUnlockStep > i ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                  color: currentUnlockStep > i ? '#10b981' : 'white', 
                  cursor: currentUnlockStep === i ? 'pointer' : 'default',
                  fontWeight: 'bold', fontSize: '1rem',
                  opacity: currentUnlockStep < i ? 0.4 : 1,
                  transition: '0.3s'
                }}>
                {currentUnlockStep > i ? `✅ LAYER ${i+1} VERIFIED` : `🔓 BYPASS LAYER ${i+1}`}
              </button>
            ))}

            <button 
              disabled={currentUnlockStep < unlockData.steps.length}
              onClick={() => window.location.href = unlockData.target}
              style={{ 
                padding: '22px', borderRadius: '18px', border: 'none', 
                background: currentUnlockStep >= unlockData.steps.length ? themeColor : '#1e293b',
                color: currentUnlockStep >= unlockData.steps.length ? 'black' : '#475569', 
                fontWeight: '900', fontSize: '1.2rem', marginTop: '15px', cursor: 'pointer',
                boxShadow: currentUnlockStep >= unlockData.steps.length ? `0 0 30px ${themeColor}` : 'none',
                transition: '0.4s'
              }}>
              {currentUnlockStep >= unlockData.steps.length ? 'CONTINUE TO TARGET' : 'NODE_LOCKED'}
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
        .sidebar-btn { padding: 16px 24px; border-radius: 14px; border: none; background: transparent; color: #64748b; cursor: pointer; text-align: left; font-weight: 600; display: flex; alignItems: center; gap: 12px; width: 100%; }
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
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '50px' }}>Global Asset Security & Distribution</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <button onClick={() => setStep('reg-email')} style={{ padding: '22px', borderRadius: '18px', border: 'none', background: themeColor, color: 'black', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer' }}>INITIALIZE CLOUD</button>
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
                  else if(step === 'reg-code') { if(inputCode === generatedCode) setStep('reg-pass'); else showNotify("❌ CODE_INVALID"); }
                  else if(step === 'reg-pass') finalizeRegistration();
                  else if(step === 'login') handleLogin();
                }}
                disabled={loading}
                style={{ padding: '20px', borderRadius: '15px', border: 'none', background: themeColor, color: 'black', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}
              >
                {loading ? 'SYNCHRONIZING...' : 'CONFIRM'}
              </button>
              <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.85rem' }}>Abort Connection</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHASE 3: MASTER DASHBOARD --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          <div style={{ width: '300px', ...glassPanel, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px', padding: '0 15px' }}>
              <div style={{ width: '40px', height: '40px', background: themeColor, borderRadius: '12px' }}></div>
              <span style={{ fontWeight: '900', fontSize: '1.3rem' }}>BX-NEXUS</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setDashView('analytics')} className={`sidebar-btn ${dashView === 'analytics' ? 'active' : ''}`}>📊 ANALYTICS HUB</button>
              <button onClick={() => setDashView('links')} className={`sidebar-btn ${dashView === 'links' ? 'active' : ''}`}>🔗 ASSET MANAGER</button>
              <button onClick={() => setDashView('customize')} className={`sidebar-btn ${dashView === 'customize' ? 'active' : ''}`}>🎨 SYSTEM DESIGN</button>
            </div>

            <div style={{ padding: '25px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>● SECURE_SESSION</span>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
              <button onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: '#f43f5e', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>TERMINATE</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
            {dashView === 'analytics' && (
              <div className="fade-up">
                <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>System <span style={{ color: themeColor }}>Intelligence</span></h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '40px' }}>
                  {[
                    { label: 'TOTAL ASSET HITS', val: myLinks.reduce((a,b)=>a+b.clicks, 0), color: themeColor },
                    { label: 'ACTIVE NODES', val: myLinks.length, color: '#a855f7' },
                    { label: 'GLOBAL REACH', val: '94.2%', color: '#10b981' }
                  ].map((stat, i) => (
                    <div key={i} style={{ ...glassPanel, padding: '35px', borderRadius: '30px' }}>
                      <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>{stat.label}</p>
                      <h2 style={{ fontSize: '3.2rem', margin: 0 }}>{stat.val}</h2>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashView === 'links' && (
              <div className="fade-up">
                <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>Asset <span style={{ color: themeColor }}>Deployment</span></h1>
                <div style={{ ...glassPanel, padding: '45px', borderRadius: '40px', marginTop: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <input className="bx-input-field" placeholder="Asset Title" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} />
                    <input className="bx-input-field" placeholder="Cover Image URL" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} />
                  </div>
                  <input className="bx-input-field" style={{ marginBottom: '25px' }} placeholder="Final Destination URL" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} />
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '25px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', color: themeColor }}>SECURITY LAYERS</label>
                      <select value={numSteps} onChange={(e)=>setNumSteps(parseInt(e.target.value))} style={{ background: '#020617', border: `1px solid ${themeColor}`, color: 'white', borderRadius: '8px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {Array.from({ length: numSteps }).map((_, i) => (
                        <input key={i} className="bx-input-field" placeholder={`Layer ${i+1} URL`} value={stepUrls[i]} onChange={(e)=>{const n=[...stepUrls]; n[i]=e.target.value; setStepUrls(n);}} />
                      ))}
                    </div>
                  </div>
                  
                  <button onClick={deploySmartLink} disabled={loading} style={{ width: '100%', padding: '22px', borderRadius: '18px', background: themeColor, color: 'black', fontWeight: '900', fontSize: '1.2rem', border: 'none', cursor: 'pointer' }}>
                    {loading ? 'ENCRYPTING...' : 'EXECUTE DEPLOYMENT'}
                  </button>
                </div>
              </div>
            )}

            {dashView === 'customize' && (
              <div className="fade-up">
                <h1 style={{ fontSize: '2.8rem', fontWeight: '900' }}>System <span style={{ color: themeColor }}>Interface</span></h1>
                <div style={{ ...glassPanel, padding: '40px', borderRadius: '35px', marginTop: '40px' }}>
                  <h3 style={{ color: themeColor }}>BX GLOBAL SHORTENER</h3>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <input className="bx-input-field" placeholder="Paste deployment URL..." value={urlToShorten} onChange={(e)=>setUrlToShorten(e.target.value)} />
                    <button onClick={executeShorten} style={{ padding: '0 30px', background: themeColor, color: 'black', borderRadius: '14px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SHORTEN</button>
                  </div>
                  {shortenedResult && <p style={{ marginTop: '20px', color: '#10b981' }}>{shortenedResult}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          padding: '18px 40px', borderRadius: '100px', background: '#1e293b', border: `1px solid ${themeColor}`,
          color: 'white', fontWeight: '900', zIndex: 99999, animation: 'fadeUp 0.4s ease'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
