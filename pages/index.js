import React, { useState, useEffect } from 'react';

/**
 * BX-NEXUS SYSTEM v7.0.0
 * COMPLETE INTEGRATED ARCHITECTURE: DASHBOARD + UNLOCKER
 * DESIGN: ULTRA-DARK GLASSMORPHISM
 */

export default function BxNexusCore() {
  // --- [ESTADOS CRÍTICOS DEL SISTEMA] ---
  const [step, setStep] = useState('start'); 
  const [activeView, setActiveView] = useState('deployment');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  // --- [BASE DE DATOS Y SESIÓN] ---
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [tempAuthCode, setTempAuthCode] = useState('');
  const [inputAuthCode, setInputAuthCode] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [MOTOR DE GENERACIÓN DE ASSETS] ---
  const [assetTitle, setAssetTitle] = useState('');
  const [assetTarget, setAssetTarget] = useState('');
  const [assetCover, setAssetCover] = useState('');
  const [securitySteps, setSecuritySteps] = useState(['', '', '']);
  const [numActiveSteps, setNumActiveSteps] = useState(1);
  const [myDeployedLinks, setMyDeployedLinks] = useState([]);

  // --- [INTERFAZ DEL DESBLOQUEADOR (CLIENT-SIDE)] ---
  const [isGatewayActive, setIsGatewayActive] = useState(false);
  const [gatewayData, setGatewayData] = useState(null);
  const [unlockedProgress, setUnlockedProgress] = useState(0);

  // --- [ESTILOS DINÁMICOS] ---
  const theme = {
    cyan: '#00d2ff',
    blue: '#3a7bd5',
    dark: '#010409',
    cardBg: 'rgba(13, 17, 23, 0.9)',
    border: '#30363d',
    textMuted: '#8b949e',
    error: '#f85149',
    success: '#3fb950'
  };

  // --- [EFEECTO DE INICIALIZACIÓN] ---
  useEffect(() => {
    // 1. Verificar si es una URL de desbloqueo (Payload)
    const urlParams = new URLSearchParams(window.location.search);
    const payload = urlParams.get('payload');

    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setGatewayData(decoded);
        setIsGatewayActive(true);
      } catch (err) {
        showGlobalNotify("❌ DATA CORRUPTION: INVALID PAYLOAD");
      }
    }

    // 2. Sincronización de LocalStorage
    const loadData = (key, setter) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
    };

    loadData('bx_accounts', setRegisteredUsers);
    loadData('bx_links', setMyDeployedLinks);

    const activeSession = localStorage.getItem('bx_active_session');
    if (activeSession && !payload) {
      setCurrentUser(JSON.parse(activeSession));
      setStep('main-dashboard');
    }
  }, []);

  // --- [LÓGICA DE NOTIFICACIONES] ---
  const showGlobalNotify = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(''), 4500);
  };

  // --- [SISTEMA DE AUTENTICACIÓN: GMAIL FLOW] ---
  const initSecurityProtocol = () => {
    if (!userEmail.includes('@')) return showGlobalNotify("⚠️ IDENTITY REJECTED: INVALID EMAIL");
    setLoading(true);

    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    setTempAuthCode(generatedCode);

    setTimeout(() => {
      setLoading(false);
      setStep('verify-identity');
      showGlobalNotify("📩 SECURITY CODE DISPATCHED TO YOUR INBOX");
      // Simulación de log de servidor
      console.log("%c [PROTOCOL-X] CODE: " + generatedCode, "color: #00d2ff; font-weight: bold; font-size: 16px;");
    }, 2200);
  };

  const verifyAndFinalizeAcc = () => {
    if (inputAuthCode !== tempAuthCode) return showGlobalNotify("❌ VERIFICATION FAILED: CODE MISMATCH");
    setStep('create-pin');
  };

  const saveOperatorAccount = () => {
    if (userPass.length < 4) return showGlobalNotify("❌ PIN SECURITY BREACH: TOO SHORT");
    const newOperator = { email: userEmail, pin: userPass, id: Date.now() };
    const updatedUsers = [...registeredUsers, newOperator];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('bx_accounts', JSON.stringify(updatedUsers));
    showGlobalNotify("🎉 OPERATOR REGISTERED SUCCESSFULLY");
    setStep('login');
  };

  const attemptAccess = () => {
    const operator = registeredUsers.find(u => u.email === userEmail && u.pin === userPass);
    if (operator) {
      setCurrentUser(operator);
      localStorage.setItem('bx_active_session', JSON.stringify(operator));
      setStep('main-dashboard');
      showGlobalNotify("✅ ACCESS GRANTED: WELCOME OPERATOR");
    } else {
      showGlobalNotify("❌ ACCESS DENIED: INVALID CREDENTIALS");
    }
  };

  // --- [LÓGICA DE DESPLIEGUE DE LINKS] ---
  const deploySmartLink = () => {
    if (!assetTitle || !assetTarget) return showGlobalNotify("⚠️ DEPLOYMENT ABORTED: MISSING DATA");
    setLoading(true);

    setTimeout(() => {
      const payloadObj = {
        title: assetTitle,
        target: assetTarget,
        image: assetCover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: securitySteps.slice(0, numActiveSteps).filter(s => s !== '')
      };

      const base64Payload = btoa(JSON.stringify(payloadObj));
      const shortUrl = `${window.location.origin}${window.location.pathname}?payload=${base64Payload}`;

      const newLinkEntry = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        title: assetTitle,
        short: shortUrl,
        date: new Date().toLocaleDateString(),
        clicks: 0
      };

      const updatedMyLinks = [newLinkEntry, ...myDeployedLinks];
      setMyDeployedLinks(updatedMyLinks);
      localStorage.setItem('bx_links', JSON.stringify(updatedMyLinks));

      // Reset fields
      setAssetTitle(''); setAssetTarget(''); setAssetCover('');
      setLoading(false);
      showGlobalNotify("🚀 ASSET BROADCASTED TO GLOBAL NETWORK");
    }, 1800);
  };

  // --- [RENDER: GATEWAY UNLOCKER (CLIENT-FACING)] ---
  if (isGatewayActive && gatewayData) {
    return (
      <div style={{ backgroundColor: theme.dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: 'white' }}>
        <div className="bx-fade-up" style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '45px', borderRadius: '35px', width: '100%', maxWidth: '480px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          <img src={gatewayData.image} style={{ width: '120px', height: '120px', borderRadius: '25px', marginBottom: '25px', border: `3px solid ${theme.cyan}`, objectFit: 'cover' }} />
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }}>{gatewayData.title}</h1>
          <p style={{ color: theme.textMuted, marginBottom: '40px', fontSize: '1rem' }}>Complete the security layers to access the file</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {gatewayData.steps.map((url, i) => (
              <button
                key={i}
                disabled={unlockedProgress < i}
                onClick={() => { window.open(url, '_blank'); if(unlockedProgress === i) setUnlockedProgress(i+1); }}
                style={{
                  padding: '20px', borderRadius: '15px', border: `1px solid ${unlockedProgress > i ? theme.success : theme.border}`,
                  background: unlockedProgress > i ? 'rgba(63, 185, 80, 0.1)' : '#0d1117',
                  color: unlockedProgress > i ? theme.success : (unlockedProgress === i ? 'white' : theme.textMuted),
                  cursor: unlockedProgress < i ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.05rem',
                  display: 'flex', justifyContent: 'space-between', transition: '0.4s'
                }}
              >
                <span>{unlockedProgress > i ? `✅ LAYER ${i+1} VERIFIED` : `🔓 BYPASS LAYER ${i+1}`}</span>
                {unlockedProgress < i && <span>🔒</span>}
              </button>
            ))}

            <button
              disabled={unlockedProgress < gatewayData.steps.length}
              onClick={() => window.location.href = gatewayData.target}
              style={{
                marginTop: '15px', padding: '22px', borderRadius: '15px', border: 'none',
                background: unlockedProgress >= gatewayData.steps.length ? `linear-gradient(90deg, ${theme.cyan}, ${theme.blue})` : '#21262d',
                color: unlockedProgress >= gatewayData.steps.length ? 'black' : theme.textMuted,
                fontWeight: '900', fontSize: '1.2rem', cursor: unlockedProgress >= gatewayData.steps.length ? 'pointer' : 'not-allowed',
                boxShadow: unlockedProgress >= gatewayData.steps.length ? `0 0 40px ${theme.cyan}55` : 'none'
              }}
            >
              {unlockedProgress >= gatewayData.steps.length ? 'PROCEED TO ASSET' : 'SYSTEM LOCKED'}
            </button>
          </div>
          <footer style={{ marginTop: '45px', fontSize: '0.7rem', color: '#484f58', letterSpacing: '3px' }}>BX-SYSTEMS SECURE CLOUD</footer>
        </div>
      </div>
    );
  }

  // --- [RENDER: MAIN APPLICATION (DASHBOARD + AUTH)] ---
  return (
    <div style={{ backgroundColor: theme.dark, minHeight: '100vh', color: 'white', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .bx-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .bx-input { background: #0d1117; border: 1px solid #30363d; color: white; padding: 18px; borderRadius: 12px; width: 100%; outline: none; transition: 0.3s; font-size: 1rem; }
        .bx-input:focus { border-color: ${theme.cyan}; box-shadow: 0 0 15px ${theme.cyan}22; }
        .sidebar-item { padding: 16px 20px; borderRadius: 12px; cursor: pointer; color: ${theme.textMuted}; font-weight: 600; display: flex; gap: 12px; transition: 0.2s; margin-bottom: 5px; }
        .sidebar-item:hover { background: #161b22; color: white; }
        .sidebar-item.active { background: ${theme.cyan}11; color: ${theme.cyan}; border-left: 4px solid ${theme.cyan}; }
      `}} />

      {/* --- FLUJO DE AUTENTICACIÓN --- */}
      {step !== 'main-dashboard' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
          <div className="bx-fade-up" style={{ background: theme.cardBg, padding: '55px', borderRadius: '40px', width: '100%', maxWidth: '440px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
            
            {step === 'start' && (
              <div>
                <div style={{ width: '80px', height: '80px', background: `linear-gradient(45deg, ${theme.cyan}, ${theme.blue})`, borderRadius: '22px', margin: '0 auto 30px', boxShadow: `0 0 40px ${theme.cyan}44` }}></div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>BX-SYSTEMS</h1>
                <p style={{ color: theme.textMuted, marginBottom: '45px' }}>Next-Gen Asset Security & Distribution</p>
                <button onClick={() => setStep('reg-identity')} style={{ width: '100%', padding: '20px', background: theme.cyan, color: 'black', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}>INITIALIZE OPERATOR</button>
                <button onClick={() => setStep('login')} style={{ width: '100%', padding: '18px', background: 'transparent', color: 'white', border: `1px solid ${theme.border}`, borderRadius: '15px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' }}>LOGIN TERMINAL</button>
              </div>
            )}

            {(['reg-identity', 'verify-identity', 'create-pin', 'login'].includes(step)) && (
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{step === 'login' ? 'Operator Login' : 'System Enrollment'}</h2>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '35px' }}>Protocol: AES-256 Cloud Synchronization</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input className="bx-input" placeholder="Operator Email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                  
                  {step === 'login' && <input className="bx-input" placeholder="Master PIN" type="password" value={userPass} onChange={(e) => setUserPass(e.target.value)} />}
                  
                  {step === 'verify-identity' && (
                    <div>
                      <p style={{ color: theme.cyan, fontSize: '0.75rem', marginBottom: '10px', textAlign: 'center' }}>CHECK YOUR EMAIL FOR SECURITY CODE</p>
                      <input className="bx-input" placeholder="0 0 0 0" style={{ textAlign: 'center', letterSpacing: '12px', fontSize: '1.8rem' }} maxLength={4} onChange={(e) => setInputAuthCode(e.target.value)} />
                    </div>
                  )}

                  {step === 'create-pin' && <input className="bx-input" placeholder="Create 4-Digit PIN" type="password" maxLength={4} onChange={(e) => setUserPass(e.target.value)} />}

                  <button 
                    onClick={() => {
                      if (step === 'reg-identity') initSecurityProtocol();
                      else if (step === 'verify-identity') verifyAndFinalizeAcc();
                      else if (step === 'create-pin') saveOperatorAccount();
                      else if (step === 'login') attemptAccess();
                    }}
                    style={{ padding: '20px', background: theme.cyan, color: 'black', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', marginTop: '10px' }}
                  >
                    {loading ? 'PROCESSING...' : 'EXECUTE'}
                  </button>
                  <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '0.85rem', alignSelf: 'center' }}>Abort Session</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DASHBOARD PRINCIPAL --- */}
      {step === 'main-dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <div style={{ width: '300px', borderRight: `1px solid ${theme.border}`, padding: '45px 25px', display: 'flex', flexDirection: 'column', background: '#020617' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
              <div style={{ width: '40px', height: '40px', background: theme.cyan, borderRadius: '10px' }}></div>
              <span style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-1px' }}>BX-NEXUS</span>
            </div>

            <nav style={{ flex: 1 }}>
              <div onClick={() => setActiveView('deployment')} className={`sidebar-item ${activeView === 'deployment' ? 'active' : ''}`}>📡 Asset Deployment</div>
              <div onClick={() => setActiveView('analytics')} className={`sidebar-item ${activeView === 'analytics' ? 'active' : ''}`}>📊 Network Analytics</div>
              <div onClick={() => setActiveView('nodes')} className={`sidebar-item ${activeView === 'nodes' ? 'active' : ''}`}>🌐 Active Nodes</div>
            </nav>

            <div style={{ background: '#0d1117', padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '0.7rem', color: theme.textMuted, marginBottom: '5px' }}>OPERATOR IDENTIFIED</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
              <button onClick={() => { localStorage.removeItem('bx_active_session'); setStep('start'); }} style={{ width: '100%', padding: '12px', marginTop: '20px', background: '#f85149', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>TERMINATE SESSION</button>
            </div>
          </div>

          {/* VIEWPORT AREA */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto', background: 'radial-gradient(circle at top right, #0d1117, #010409)' }}>
            
            {activeView === 'deployment' && (
              <div className="bx-fade-up">
                <header style={{ marginBottom: '50px' }}>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>Asset <span style={{ color: theme.cyan }}>Deployment</span></h1>
                  <p style={{ color: theme.textMuted }}>Encrypt and distribute your digital assets through the secure network.</p>
                </header>

                <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '40px', borderRadius: '30px', maxWidth: '850px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '10px', height: '10px', background: theme.cyan, borderRadius: '50%' }}></span>
                    Configuration Module
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: theme.textMuted, marginBottom: '10px', display: 'block' }}>Display Title</label>
                      <input className="bx-input" placeholder="Ex: Premium Software Bundle" value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: theme.textMuted, marginBottom: '10px', display: 'block' }}>Cover Image URL (HTTPS)</label>
                      <input className="bx-input" placeholder="Ex: https://image.com/art.jpg" value={assetCover} onChange={(e) => setAssetCover(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '35px' }}>
                    <label style={{ fontSize: '0.85rem', color: theme.textMuted, marginBottom: '10px', display: 'block' }}>Final Target Link (Destination)</label>
                    <input className="bx-input" placeholder="Ex: https://mediafire.com/file/xyz" value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} />
                  </div>

                  <div style={{ background: '#161b22', padding: '30px', borderRadius: '20px', border: `1px solid ${theme.border}`, marginBottom: '35px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontWeight: 'bold' }}>Security Protection Layers</span>
                      <select value={numActiveSteps} onChange={(e) => setNumActiveSteps(parseInt(e.target.value))} style={{ background: '#0d1117', color: 'white', border: `1px solid ${theme.cyan}`, padding: '8px 15px', borderRadius: '10px', outline: 'none' }}>
                        <option value="1">1 Layer (Basic)</option>
                        <option value="2">2 Layers (Medium)</option>
                        <option value="3">3 Layers (Maximum)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {Array.from({ length: numActiveSteps }).map((_, i) => (
                        <input key={i} className="bx-input" style={{ fontSize: '0.85rem' }} placeholder={`Redirect Layer ${i+1}`} value={securitySteps[i]} onChange={(e) => { const n = [...securitySteps]; n[i] = e.target.value; setSecuritySteps(n); }} />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={deploySmartLink} 
                    disabled={loading}
                    style={{ width: '100%', padding: '22px', background: theme.cyan, color: 'black', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', transition: '0.3s', boxShadow: `0 10px 30px ${theme.cyan}33` }}
                  >
                    {loading ? 'ENCRYPTING PAYLOAD...' : 'GENERATE SECURE BX-DEPLOYMENT'}
                  </button>
                </div>
              </div>
            )}

            {activeView === 'nodes' && (
              <div className="bx-fade-up">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Active Distribution <span style={{ color: theme.cyan }}>Nodes</span></h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myDeployedLinks.length === 0 && <p style={{ color: theme.textMuted }}>No active nodes detected in the cloud network.</p>}
                  {myDeployedLinks.map(link => (
                    <div key={link.id} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#161b22', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: theme.cyan }}>{link.id}</div>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{link.title}</h4>
                          <code style={{ fontSize: '0.8rem', color: theme.cyan }}>{link.short.substring(0, 50)}...</code>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(link.short); showGlobalNotify("📋 LINK COPIED TO CLIPBOARD"); }} style={{ padding: '12px 25px', background: '#21262d', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>COPY LINK</button>
                        <button onClick={() => { const u = myDeployedLinks.filter(l => l.id !== link.id); setMyDeployedLinks(u); localStorage.setItem('bx_links', JSON.stringify(u)); }} style={{ padding: '12px', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid #f85149', borderRadius: '10px', cursor: 'pointer' }}>TERMINATE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NOTIFICACIÓN FLOTANTE --- */}
      {notification && (
        <div className="bx-fade-up" style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          background: '#0d1117', border: `1px solid ${theme.cyan}`, color: 'white', 
          padding: '18px 40px', borderRadius: '50px', fontWeight: '900', zIndex: 100000, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>📡</span> {notification}
        </div>
      )}

    </div>
  );
}
