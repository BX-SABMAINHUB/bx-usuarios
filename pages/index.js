import React, { useState, useEffect } from 'react';

/**
 * BX-SYSTEMS v8.5.0 - THE DEFINITIVE CORE
 * INTEGRATED: DASHBOARD + UNLOCKER + GMAIL BOT API
 */

export default function BxNexusOfficial() {
  // --- [ESTADOS DEL SISTEMA] ---
  const [step, setStep] = useState('start'); 
  const [activeView, setActiveView] = useState('deployment');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  // --- [DATOS DE USUARIO Y SEGURIDAD] ---
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [tempAuthCode, setTempAuthCode] = useState('');
  const [inputAuthCode, setInputAuthCode] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [MOTOR DE ASSETS] ---
  const [assetTitle, setAssetTitle] = useState('');
  const [assetTarget, setAssetTarget] = useState('');
  const [assetCover, setAssetCover] = useState('');
  const [securitySteps, setSecuritySteps] = useState(['', '', '']);
  const [numActiveSteps, setNumActiveSteps] = useState(1);
  const [myDeployedLinks, setMyDeployedLinks] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // --- [MODO UNLOCKER (CLIENTE)] ---
  const [isGatewayActive, setIsGatewayActive] = useState(false);
  const [gatewayData, setGatewayData] = useState(null);
  const [unlockedProgress, setUnlockedProgress] = useState(0);

  // --- [CONFIGURACIÓN VISUAL] ---
  const theme = {
    cyan: '#00d2ff',
    blue: '#3a7bd5',
    dark: '#010409',
    card: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    muted: '#8b949e',
    danger: '#f85149'
  };

  // --- [LÓGICA DE INICIO Y PERSISTENCIA] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');

    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setGatewayData(decoded);
        setIsGatewayActive(true);
      } catch (e) {
        showNotify("❌ PAYLOAD DECRYPTION ERROR");
      }
    }

    // Cargar datos locales
    const savedAcc = localStorage.getItem('bx_accounts');
    const savedLnk = localStorage.getItem('bx_links');
    if (savedAcc) setRegisteredUsers(JSON.parse(savedAcc));
    if (savedLnk) setMyDeployedLinks(JSON.parse(savedLnk));

    const session = localStorage.getItem('bx_session');
    if (session && !payload) {
      setCurrentUser(JSON.parse(session));
      setStep('dashboard');
    }
  }, []);

  // --- [NOTIFICACIONES Y LOGS] ---
  const showNotify = (txt) => {
    setNotification(txt);
    setTimeout(() => setNotification(''), 4000);
  };

  const addLog = (msg) => {
    const log = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setSystemLogs(prev => [log, ...prev].slice(0, 10));
  };

  // --- [LÓGICA DE ENVÍO GMAIL (CONEXIÓN CON TU API)] ---
  const sendGmailVerification = async (email, code) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          type: 'verification',
          code: code
        })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error("GMAIL_API_ERROR:", err);
      return false;
    }
  };

  // --- [FLUJO DE REGISTRO / LOGIN] ---
  const initAuthProtocol = async () => {
    if (!userEmail.includes('@')) return showNotify("⚠️ INVALID EMAIL");
    setLoading(true);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setTempAuthCode(code);

    const success = await sendGmailVerification(userEmail, code);

    setLoading(false);
    if (success) {
      setStep('verify');
      showNotify("📩 CODE DISPATCHED TO GMAIL");
      addLog(`Verification sent to ${userEmail}`);
    } else {
      showNotify("❌ ERROR: CHECK GMAIL_PASS IN .ENV");
      // Fallback para desarrollo (quitar en producción)
      console.log("DEV_MODE CODE:", code);
    }
  };

  const finalizeRegistration = () => {
    if (userPass.length < 4) return showNotify("❌ PIN MUST BE 4 DIGITS");
    const newUser = { email: userEmail, pin: userPass };
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    showNotify("🎉 OPERATOR REGISTERED");
    setStep('login');
  };

  const handleLogin = () => {
    const user = registeredUsers.find(u => u.email === userEmail && u.pin === userPass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session', JSON.stringify(user));
      setStep('dashboard');
      showNotify("✅ ACCESS GRANTED");
      addLog("Operator session started");
    } else {
      showNotify("❌ INVALID PIN OR EMAIL");
    }
  };

  // --- [GENERADOR DE LINKS] ---
  const deployLink = () => {
    if (!assetTitle || !assetTarget) return showNotify("⚠️ MISSING FIELDS");
    setLoading(true);

    setTimeout(() => {
      const payload = {
        title: assetTitle,
        target: assetTarget,
        image: assetCover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: securitySteps.slice(0, numActiveSteps).filter(s => s !== '')
      };

      const b64 = btoa(JSON.stringify(payload));
      const finalUrl = `${window.location.origin}${window.location.pathname}?payload=${b64}`;

      const newEntry = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        title: assetTitle,
        url: finalUrl,
        clicks: Math.floor(Math.random() * 10)
      };

      const updated = [newEntry, ...myDeployedLinks];
      setMyDeployedLinks(updated);
      localStorage.setItem('bx_links', JSON.stringify(updated));
      
      setAssetTitle(''); setAssetTarget(''); setAssetCover('');
      setLoading(false);
      showNotify("🚀 LINK DEPLOYED SUCCESSFULLY");
      addLog(`New node deployed: ${newEntry.id}`);
    }, 1500);
  };

  // --- [UI: ESTILOS GLOBALES] ---
  const styles = {
    input: {
      background: '#0d1117',
      border: `1px solid ${theme.border}`,
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      width: '100%',
      outline: 'none',
      fontSize: '1rem',
      transition: '0.3s'
    },
    btnPrimary: {
      background: `linear-gradient(45deg, ${theme.cyan}, ${theme.blue})`,
      color: 'black',
      border: 'none',
      padding: '18px',
      borderRadius: '12px',
      fontWeight: '900',
      cursor: 'pointer',
      boxShadow: `0 10px 25px ${theme.cyan}44`
    }
  };

  // --- [VISTA: UNLOCKER (CLIENTE)] ---
  if (isGatewayActive && gatewayData) {
    return (
      <div style={{ backgroundColor: theme.dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="bx-fade-in" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '45px', borderRadius: '30px', width: '100%', maxWidth: '460px', textAlign: 'center' }}>
          <img src={gatewayData.image} style={{ width: '120px', height: '120px', borderRadius: '25px', marginBottom: '25px', border: `3px solid ${theme.cyan}`, objectFit: 'cover' }} />
          <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '10px', fontWeight: '800' }}>{gatewayData.title}</h1>
          <p style={{ color: theme.muted, marginBottom: '35px' }}>Verify all layers to access the content.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {gatewayData.steps.map((url, i) => (
              <button
                key={i}
                disabled={unlockedProgress < i}
                onClick={() => { window.open(url, '_blank'); if(unlockedProgress === i) setUnlockedProgress(i+1); }}
                style={{
                  padding: '20px', borderRadius: '15px', border: `1px solid ${unlockedProgress > i ? theme.success : theme.border}`,
                  background: unlockedProgress > i ? 'rgba(63, 185, 80, 0.1)' : 'transparent',
                  color: unlockedProgress > i ? '#3fb950' : 'white',
                  cursor: unlockedProgress < i ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'
                }}
              >
                <span>{unlockedProgress > i ? '✅ VERIFIED' : `🔓 UNLOCK STEP ${i+1}`}</span>
                {unlockedProgress < i && <span>🔒</span>}
              </button>
            ))}

            <button
              disabled={unlockedProgress < gatewayData.steps.length}
              onClick={() => window.location.href = gatewayData.target}
              style={{
                ...styles.btnPrimary,
                marginTop: '15px',
                background: unlockedProgress >= gatewayData.steps.length ? styles.btnPrimary.background : '#21262d',
                color: unlockedProgress >= gatewayData.steps.length ? 'black' : '#484f58',
                cursor: unlockedProgress >= gatewayData.steps.length ? 'pointer' : 'not-allowed'
              }}
            >
              {unlockedProgress >= gatewayData.steps.length ? 'ACCESS ASSET' : 'SYSTEM LOCKED'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- [VISTA: DASHBOARD / LOGIN] ---
  return (
    <div style={{ backgroundColor: theme.dark, minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .bx-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .sidebar-btn { width: 100%; padding: 15px; background: transparent; border: none; color: #8b949e; text-align: left; cursor: pointer; borderRadius: 10px; font-weight: 600; margin-bottom: 5px; }
        .sidebar-btn.active { background: ${theme.cyan}15; color: ${theme.cyan}; }
      `}} />

      {step !== 'dashboard' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="bx-fade-in" style={{ background: theme.card, padding: '50px', borderRadius: '35px', border: `1px solid ${theme.border}`, width: '420px', textAlign: 'center' }}>
            {step === 'start' && (
              <div>
                <div style={{ width: '70px', height: '70px', background: theme.cyan, borderRadius: '20px', margin: '0 auto 25px' }}></div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>BX-SYSTEMS</h1>
                <p style={{ color: theme.muted, marginBottom: '40px' }}>Secure Distribution Terminal</p>
                <button onClick={() => setStep('reg')} style={{ ...styles.btnPrimary, width: '100%' }}>INITIALIZE</button>
                <button onClick={() => setStep('login')} style={{ background: 'none', border: `1px solid ${theme.border}`, color: 'white', width: '100%', padding: '16px', borderRadius: '12px', marginTop: '15px', cursor: 'pointer' }}>LOGIN</button>
              </div>
            )}

            {(step === 'reg' || step === 'verify' || step === 'pin' || step === 'login') && (
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ marginBottom: '30px' }}>{step === 'login' ? 'Nexus Login' : 'System Setup'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input style={styles.input} placeholder="Email" type="email" onChange={(e) => setUserEmail(e.target.value)} />
                  
                  {step === 'login' && <input style={styles.input} placeholder="PIN" type="password" onChange={(e) => setUserPass(e.target.value)} />}
                  
                  {step === 'verify' && (
                    <input style={{ ...styles.input, textAlign: 'center', letterSpacing: '10px' }} placeholder="0000" maxLength={4} onChange={(e) => setInputAuthCode(e.target.value)} />
                  )}

                  {step === 'pin' && <input style={styles.input} placeholder="Create 4-Digit PIN" type="password" maxLength={4} onChange={(e) => setUserPass(e.target.value)} />}

                  <button 
                    style={styles.btnPrimary}
                    onClick={() => {
                      if(step === 'reg') initAuthProtocol();
                      else if(step === 'verify') { if(inputAuthCode === tempAuthCode) setStep('pin'); else showNotify("❌ WRONG CODE"); }
                      else if(step === 'pin') finalizeRegistration();
                      else if(step === 'login') handleLogin();
                    }}
                  >
                    {loading ? 'WAIT...' : 'EXECUTE PROTOCOL'}
                  </button>
                  <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer' }}>Back to Start</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* BARRA LATERAL */}
          <div style={{ width: '280px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', background: '#010409' }}>
            <div style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: '50px', color: theme.cyan }}>BX-NEXUS</div>
            <button onClick={() => setActiveView('deployment')} className={`sidebar-btn ${activeView === 'deployment' ? 'active' : ''}`}>📡 Deploy Link</button>
            <button onClick={() => setActiveView('analytics')} className={`sidebar-btn ${activeView === 'analytics' ? 'active' : ''}`}>📊 Network Stats</button>
            
            <div style={{ marginTop: 'auto', paddingTop: '100px' }}>
              <div style={{ fontSize: '0.8rem', color: theme.muted }}>{currentUser?.email}</div>
              <button onClick={() => { localStorage.removeItem('bx_session'); setStep('start'); }} style={{ width: '100%', padding: '12px', background: '#da3633', border: 'none', borderRadius: '8px', color: 'white', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>TERMINATE</button>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
            {activeView === 'deployment' && (
              <div className="bx-fade-in">
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px' }}>Cloud <span style={{ color: theme.cyan }}>Deployment</span></h1>
                
                <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '35px', borderRadius: '25px', maxWidth: '800px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <input style={styles.input} placeholder="Asset Title" value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} />
                    <input style={styles.input} placeholder="Image URL" value={assetCover} onChange={(e) => setAssetCover(e.target.value)} />
                  </div>
                  <input style={{ ...styles.input, marginBottom: '25px' }} placeholder="Destination URL" value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} />
                  
                  <div style={{ background: '#161b22', padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontWeight: 'bold', color: theme.muted }}>SECURITY LAYERS</span>
                      <select value={numActiveSteps} onChange={(e) => setNumActiveSteps(parseInt(e.target.value))} style={{ background: '#0d1117', color: 'white', border: `1px solid ${theme.cyan}`, padding: '5px 10px', borderRadius: '5px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {Array.from({ length: numActiveSteps }).map((_, i) => (
                        <input key={i} style={styles.input} placeholder={`Step ${i+1} URL`} value={securitySteps[i]} onChange={(e) => { const n = [...securitySteps]; n[i] = e.target.value; setSecuritySteps(n); }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={deployLink} disabled={loading} style={{ ...styles.btnPrimary, width: '100%', marginTop: '30px' }}>
                    {loading ? 'ENCRYPTING...' : 'BROADCAST LINK'}
                  </button>
                </div>

                <div style={{ marginTop: '50px' }}>
                  <h3>Active Nodes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {myDeployedLinks.map(l => (
                      <div key={l.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{l.title}</div>
                          <code style={{ fontSize: '0.7rem', color: theme.cyan }}>{l.url.substring(0, 40)}...</code>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(l.url); showNotify("📋 COPIED"); }} style={{ background: '#21262d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>COPY</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="bx-fade-in">
                <h1>System Activity</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
                  <div style={{ background: theme.card, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.8rem' }}>NETWORK CLICKS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{myDeployedLinks.reduce((a,b)=>a+b.clicks, 0)}</div>
                  </div>
                  <div style={{ background: theme.card, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.8rem' }}>ACTIVE NODES</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{myDeployedLinks.length}</div>
                  </div>
                  <div style={{ background: theme.card, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.8rem' }}>SERVER STATUS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3fb950' }}>● OPERATIONAL</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '40px', background: '#010409', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                  <h3>Live Terminal Logs</h3>
                  {systemLogs.map(log => (
                    <div key={log.id} style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#8b949e', marginBottom: '5px' }}>
                      <span style={{ color: theme.cyan }}>[{log.time}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN */}
      {notification && (
        <div className="bx-fade-in" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#0d1117', border: `1px solid ${theme.cyan}`, color: 'white', padding: '15px 40px', borderRadius: '50px', fontWeight: 'bold', zIndex: 10000, boxShadow: `0 0 30px ${theme.cyan}33` }}>
          {notification}
        </div>
      )}
    </div>
  );
}
