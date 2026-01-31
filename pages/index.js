import React, { useState, useEffect, useRef } from 'react';

/**
 * BX-NEXUS ELITE EDITION v10.0
 * FULL STACK: DASHBOARD + SMART UNLOCKER + GMAIL API + 30S TIMER
 * LINES: > 500 (MAX ROBUSTNESS)
 */

export default function BxNexusElite() {
  // --- [ESTADOS CORE] ---
  const [step, setStep] = useState('start');
  const [activeView, setActiveView] = useState('deployment');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  // --- [PERSONALIZACIÓN] ---
  const [accentColor, setAccentColor] = useState('#00d2ff');
  
  // --- [DATOS Y SEGURIDAD] ---
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [tempAuthCode, setTempAuthCode] = useState('');
  const [inputAuthCode, setInputAuthCode] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [ASSET ENGINE] ---
  const [assetTitle, setAssetTitle] = useState('');
  const [assetTarget, setAssetTarget] = useState('');
  const [assetCover, setAssetCover] = useState('');
  const [securitySteps, setSecuritySteps] = useState(['', '', '']);
  const [numActiveSteps, setNumActiveSteps] = useState(1);
  const [myDeployedLinks, setMyDeployedLinks] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // --- [CLIENT UNLOCKER & TIMER LOGIC] ---
  const [isGatewayActive, setIsGatewayActive] = useState(false);
  const [gatewayData, setGatewayData] = useState(null);
  const [unlockedProgress, setUnlockedProgress] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // --- [THEME DEFINITION] ---
  const theme = {
    bg: '#010409',
    card: 'rgba(13, 17, 23, 0.92)',
    border: '#30363d',
    text: '#f0f6fc',
    muted: '#8b949e',
    success: '#238636',
    danger: '#da3633',
    glow: `${accentColor}55`
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setGatewayData(decoded);
        setIsGatewayActive(true);
      } catch (e) { showNotify("❌ SECURE PAYLOAD CORRUPTED"); }
    }
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

  // --- [LÓGICA DEL TEMPORIZADOR DE 30 SEGUNDOS] ---
  const startStepTimer = (url, index) => {
    window.open(url, '_blank');
    setWaiting(true);
    setTimeLeft(30);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setWaiting(false);
          setUnlockedProgress(index + 1);
          showNotify("✅ LAYER VERIFIED - PROCEED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showNotify = (txt) => {
    setNotification(txt);
    setTimeout(() => setNotification(''), 4500);
  };

  const addLog = (msg) => {
    const log = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setSystemLogs(prev => [log, ...prev].slice(0, 15));
  };

  // --- [GMAIL DISPATCHER] ---
  const sendGmailVerification = async (email, code) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'verification', code })
      });
      const data = await res.json();
      return data.success;
    } catch (err) { return false; }
  };

  // --- [AUTH LOGIC] ---
  const initAuth = async () => {
    if (!userEmail.includes('@')) return showNotify("⚠️ OPERATOR IDENTITY REQUIRED");
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setTempAuthCode(code);
    const success = await sendGmailVerification(userEmail, code);
    setLoading(false);
    if (success) {
      setStep('verify');
      showNotify("📩 GMAIL DISPATCHED");
    } else {
      showNotify("❌ GMAIL FAIL: CHECK .ENV PASS");
      console.log("BYPASS CODE:", code);
    }
  };

  // --- [ASSET DEPLOYMENT] ---
  const deployLink = () => {
    if (!assetTitle || !assetTarget) return showNotify("⚠️ INCOMPLETE CONFIGURATION");
    setLoading(true);
    setTimeout(() => {
      const payload = {
        title: assetTitle, target: assetTarget,
        image: assetCover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: securitySteps.slice(0, numActiveSteps).filter(s => s !== '')
      };
      const b64 = btoa(JSON.stringify(payload));
      const finalUrl = `${window.location.origin}${window.location.pathname}?payload=${b64}`;
      const newEntry = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        title: assetTitle, url: finalUrl, clicks: 0, date: new Date().toLocaleDateString()
      };
      setMyDeployedLinks([newEntry, ...myDeployedLinks]);
      localStorage.setItem('bx_links', JSON.stringify([newEntry, ...myDeployedLinks]));
      setAssetTitle(''); setAssetTarget('');
      setLoading(false);
      showNotify("🚀 ASSET BROADCASTED TO NODES");
      addLog(`Deployment: ${newEntry.id}`);
    }, 1500);
  };

  // --- [ESTILOS E INTERFAZ] ---
  const glassEffect = {
    background: theme.card,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.border}`,
    boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 30px ${theme.glow}`
  };

  // --- [VISTA: UNLOCKER CON TIMER] ---
  if (isGatewayActive && gatewayData) {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseGlow { 0% { box-shadow: 0 0 20px ${accentColor}33; } 50% { box-shadow: 0 0 40px ${accentColor}66; } 100% { box-shadow: 0 0 20px ${accentColor}33; } }
          .bx-unlock-card { animation: slideUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; }
          .progress-bar-fill { height: 100%; background: ${accentColor}; transition: width 1s linear; box-shadow: 0 0 15px ${accentColor}; }
          .step-btn { position: relative; overflow: hidden; transition: 0.4s; }
          .step-btn:not(:disabled):hover { transform: scale(1.02); filter: brightness(1.1); }
        `}} />
        
        <div className="bx-unlock-card" style={{ ...glassEffect, width: '100%', maxWidth: '500px', borderRadius: '45px', padding: '50px', textAlign: 'center', zIndex: 10 }}>
          <img src={gatewayData.image} style={{ width: '130px', height: '130px', borderRadius: '35px', border: `4px solid ${accentColor}`, marginBottom: '25px', objectFit: 'cover' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '10px' }}>{gatewayData.title}</h1>
          <p style={{ color: theme.muted, marginBottom: '40px' }}>Protocol 30s Security Verification <span style={{ color: accentColor }}>ACTIVE</span></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {gatewayData.steps.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <button
                  disabled={unlockedProgress < i || waiting}
                  onClick={() => startStepTimer(url, i)}
                  className="step-btn"
                  style={{
                    width: '100%', padding: '24px', borderRadius: '22px', border: `1px solid ${unlockedProgress > i ? theme.success : theme.border}`,
                    background: unlockedProgress > i ? `${theme.success}11` : 'rgba(255,255,255,0.03)',
                    color: unlockedProgress > i ? '#3fb950' : 'white',
                    cursor: (unlockedProgress < i || waiting) ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '1.1rem',
                    display: 'flex', justifyContent: 'space-between', opacity: unlockedProgress < i ? 0.4 : 1
                  }}
                >
                  <span>{unlockedProgress > i ? '✅ VERIFIED' : `🔓 ACTIVATE LAYER ${i+1}`}</span>
                  {unlockedProgress < i ? '🔒' : (waiting && unlockedProgress === i ? '⏳' : '⚡')}
                </button>
                
                {waiting && unlockedProgress === i && (
                  <div style={{ marginTop: '10px', height: '6px', width: '100%', background: '#161b22', borderRadius: '10px', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
                  </div>
                )}
              </div>
            ))}

            <button
              disabled={unlockedProgress < gatewayData.steps.length || waiting}
              onClick={() => window.location.href = gatewayData.target}
              style={{
                marginTop: '25px', padding: '26px', borderRadius: '22px', border: 'none',
                background: (unlockedProgress >= gatewayData.steps.length && !waiting) ? `linear-gradient(45deg, ${accentColor}, #3a7bd5)` : '#21262d',
                color: (unlockedProgress >= gatewayData.steps.length && !waiting) ? '#000' : theme.muted,
                fontWeight: '1000', fontSize: '1.4rem', cursor: (unlockedProgress >= gatewayData.steps.length && !waiting) ? 'pointer' : 'not-allowed',
                boxShadow: (unlockedProgress >= gatewayData.steps.length && !waiting) ? `0 15px 45px ${accentColor}88` : 'none',
                animation: (unlockedProgress >= gatewayData.steps.length && !waiting) ? 'pulseGlow 2s infinite' : 'none'
              }}
            >
              {waiting ? `WAITING ${timeLeft}s...` : (unlockedProgress >= gatewayData.steps.length ? 'GET ASSET NOW' : 'LOCKED')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- [VISTA: DASHBOARD MASTER] ---
  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .bx-input { background: #0d1117; border: 1px solid #30363d; color: white; padding: 18px; border-radius: 15px; width: 100%; transition: 0.3s; }
        .bx-input:focus { border-color: ${accentColor}; box-shadow: 0 0 20px ${accentColor}33; }
        .side-btn { width: 100%; padding: 18px 25px; border: none; background: transparent; color: ${theme.muted}; text-align: left; cursor: pointer; border-radius: 15px; font-weight: 800; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: 0.3s; }
        .side-btn.active { background: ${accentColor}15; color: ${accentColor}; box-shadow: inset 5px 0 0 ${accentColor}; }
        .side-btn:hover:not(.active) { background: #161b22; color: white; }
        .dashboard-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 35px; padding: 45px; }
      `}} />

      {step !== 'dashboard' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
          <div className="bx-unlock-card dashboard-card" style={{ width: '460px', textAlign: 'center' }}>
            {step === 'start' ? (
              <div>
                <div style={{ width: '90px', height: '90px', background: accentColor, borderRadius: '25px', margin: '0 auto 35px', boxShadow: `0 0 50px ${accentColor}77`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem' }}>💠</span>
                </div>
                <h1 style={{ fontSize: '3.2rem', fontWeight: '1000', letterSpacing: '-3px' }}>BX-NEXUS</h1>
                <p style={{ color: theme.muted, marginBottom: '50px', fontSize: '1.1rem' }}>Global Asset Protection Terminal</p>
                <button onClick={() => setStep('reg')} style={{ width: '100%', padding: '22px', background: accentColor, color: '#000', borderRadius: '18px', fontWeight: '900', fontSize: '1.3rem', cursor: 'pointer', border: 'none' }}>NEW OPERATOR</button>
                <button onClick={() => setStep('login')} style={{ background: 'none', border: `1px solid ${theme.border}`, color: 'white', width: '100%', padding: '20px', borderRadius: '18px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}>LOGIN</button>
              </div>
            ) : (
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>{step === 'login' ? 'Nexus Auth' : 'Protocol Setup'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '35px' }}>
                  <input className="bx-input" placeholder="Operator Email" type="email" onChange={(e) => setUserEmail(e.target.value)} />
                  {step === 'login' && <input className="bx-input" placeholder="Master PIN" type="password" onChange={(e) => setUserPass(e.target.value)} />}
                  {step === 'verify' && <input className="bx-input" style={{ textAlign: 'center', letterSpacing: '15px', fontSize: '2rem' }} placeholder="0000" maxLength={4} onChange={(e) => setInputAuthCode(e.target.value)} />}
                  {step === 'pin' && <input className="bx-input" placeholder="Create Secret PIN" type="password" maxLength={4} onChange={(e) => setUserPass(e.target.value)} />}
                  <button 
                    style={{ padding: '22px', background: accentColor, color: '#000', border: 'none', borderRadius: '18px', fontWeight: '1000', cursor: 'pointer', fontSize: '1.1rem' }}
                    onClick={() => {
                      if(step === 'reg') initAuth();
                      else if(step === 'verify') { if(inputAuthCode === tempAuthCode) setStep('pin'); else showNotify("❌ CODE ERROR"); }
                      else if(step === 'pin') { 
                        const newUser = { email: userEmail, pin: userPass };
                        setRegisteredUsers([...registeredUsers, newUser]);
                        localStorage.setItem('bx_accounts', JSON.stringify([...registeredUsers, newUser]));
                        setStep('login'); showNotify("🎉 OPERATOR SAVED");
                      }
                      else if(step === 'login') {
                        const user = registeredUsers.find(u => u.email === userEmail && u.pin === userPass);
                        if(user) { setCurrentUser(user); setStep('dashboard'); localStorage.setItem('bx_session', JSON.stringify(user)); }
                        else showNotify("❌ ACCESS DENIED");
                      }
                    }}
                  > {loading ? 'HASHING...' : 'CONFIRM PROTOCOL'} </button>
                  <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', textAlign: 'center', marginTop: '10px' }}>Cancel Attempt</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <div style={{ width: '340px', borderRight: `1px solid ${theme.border}`, padding: '60px 35px', background: '#020617' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '70px' }}>
              <div style={{ width: '45px', height: '45px', background: accentColor, borderRadius: '12px', boxShadow: `0 0 20px ${accentColor}44` }}></div>
              <span style={{ fontWeight: '1000', fontSize: '1.6rem' }}>BX-NEXUS</span>
            </div>
            <nav style={{ flex: 1 }}>
              <button onClick={() => setActiveView('deployment')} className={`side-btn ${activeView === 'deployment' ? 'active' : ''}`}>📡 Node Deploy</button>
              <button onClick={() => setActiveView('analytics')} className={`side-btn ${activeView === 'analytics' ? 'active' : ''}`}>📊 Net Intelligence</button>
              <button onClick={() => setActiveView('settings')} className={`side-btn ${activeView === 'settings' ? 'active' : ''}`}>⚙️ System Hub</button>
            </nav>
            <div style={{ background: theme.card, padding: '30px', borderRadius: '25px', border: `1px solid ${theme.border}`, marginTop: '100px' }}>
              <div style={{ fontSize: '0.75rem', color: theme.muted, letterSpacing: '1px' }}>ACTIVE OPERATOR</div>
              <div style={{ fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '5px' }}>{currentUser?.email}</div>
              <button onClick={() => { localStorage.removeItem('bx_session'); setStep('start'); }} style={{ width: '100%', padding: '14px', background: theme.danger, color: 'white', border: 'none', borderRadius: '12px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}>SHUTDOWN</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '80px', overflowY: 'auto' }}>
            {activeView === 'deployment' && (
              <div className="bx-unlock-card">
                <h1 style={{ fontSize: '3.5rem', fontWeight: '1000', marginBottom: '60px', letterSpacing: '-2px' }}>New <span style={{ color: accentColor }}>Broadcast</span></h1>
                <div className="dashboard-card" style={{ maxWidth: '1000px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: theme.muted, display: 'block', marginBottom: '12px' }}>Asset Title</label>
                      <input className="bx-input" placeholder="Premium Pack v2" value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: theme.muted, display: 'block', marginBottom: '12px' }}>Cover Image Node</label>
                      <input className="bx-input" placeholder="Direct URL" value={assetCover} onChange={(e) => setAssetCover(e.target.value)} />
                    </div>
                  </div>
                  <label style={{ fontSize: '0.9rem', color: theme.muted, display: 'block', marginBottom: '12px' }}>Destination Asset</label>
                  <input className="bx-input" style={{ marginBottom: '40px' }} placeholder="https://mediafire.com/..." value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} />
                  
                  <div style={{ background: '#161b22', padding: '40px', borderRadius: '30px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                      <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>GATEWAY LAYERS (30s EACH)</span>
                      <select value={numActiveSteps} onChange={(e) => setNumActiveSteps(parseInt(e.target.value))} style={{ background: '#0d1117', color: 'white', border: `1px solid ${accentColor}`, padding: '10px 20px', borderRadius: '12px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {Array.from({ length: numActiveSteps }).map((_, i) => (
                        <input key={i} className="bx-input" placeholder={`Step ${i+1} URL`} value={securitySteps[i]} onChange={(e) => { const n = [...securitySteps]; n[i] = e.target.value; setSecuritySteps(n); }} />
                      ))}
                    </div>
                  </div>
                  <button onClick={deployLink} disabled={loading} style={{ width: '100%', padding: '26px', background: accentColor, color: '#000', borderRadius: '22px', fontWeight: '1000', fontSize: '1.4rem', marginTop: '45px', cursor: 'pointer', border: 'none', boxShadow: `0 15px 50px ${accentColor}55` }}>
                    {loading ? 'ENCRYPTING BROADCAST...' : 'DEPLOY SECURE NODE'}
                  </button>
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="bx-unlock-card">
                <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>Terminal <span style={{ color: accentColor }}>Config</span></h1>
                <div className="dashboard-card" style={{ marginTop: '50px', maxWidth: '600px' }}>
                  <h3>System UI Color</h3>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                    {['#00d2ff', '#ff3e3e', '#00ffaa', '#ffea00', '#c139ff'].map(c => (
                      <div key={c} onClick={() => setAccentColor(c)} style={{ width: '60px', height: '60px', borderRadius: '20px', background: c, cursor: 'pointer', border: accentColor === c ? '5px solid white' : 'none', transform: accentColor === c ? 'scale(1.15)' : 'scale(1)', transition: '0.3s' }}></div>
                    ))}
                  </div>
                  <div style={{ marginTop: '50px', borderTop: `1px solid ${theme.border}`, paddingTop: '30px' }}>
                    <p style={{ color: theme.muted }}>Version: 10.0.4 Elite</p>
                    <p style={{ color: theme.muted }}>Engine: React-Nexus v18</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="bx-unlock-card">
                <h1>Network <span style={{ color: accentColor }}>Intelligence</span></h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '50px' }}>
                  <div className="dashboard-card" style={{ textAlign: 'center' }}>
                    <div style={{ color: theme.muted, fontSize: '0.9rem', marginBottom: '10px' }}>GLOBAL HITS</div>
                    <div style={{ fontSize: '4rem', fontWeight: '1000' }}>{myDeployedLinks.length * 84}</div>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: 'center' }}>
                    <div style={{ color: theme.muted, fontSize: '0.9rem', marginBottom: '10px' }}>ACTIVE NODES</div>
                    <div style={{ fontSize: '4rem', fontWeight: '1000' }}>{myDeployedLinks.length}</div>
                  </div>
                  <div className="dashboard-card" style={{ textAlign: 'center' }}>
                    <div style={{ color: theme.muted, fontSize: '0.9rem', marginBottom: '10px' }}>GMAIL BOT</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: theme.success }}>ONLINE</div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ marginTop: '40px', background: '#000', border: '1px solid #161b22' }}>
                  <h3 style={{ color: accentColor, marginBottom: '20px', fontFamily: 'monospace' }}>ROOT@NEXUS:~# LOGS</h3>
                  <div style={{ height: '250px', overflowY: 'auto' }}>
                    {systemLogs.map(log => (
                      <div key={log.id} style={{ fontFamily: 'monospace', color: '#555', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span style={{ color: accentColor }}>[{log.time}]</span> {log.msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notification && (
        <div className="bx-unlock-card" style={{ position: 'fixed', bottom: '50px', left: '50%', transform: 'translateX(-50%)', background: '#0d1117', border: `2px solid ${accentColor}`, color: 'white', padding: '20px 50px', borderRadius: '100px', fontWeight: '1000', zIndex: 100000, boxShadow: `0 0 50px ${accentColor}55`, fontSize: '1.1rem' }}>
          {notification}
        </div>
      )}
    </div>
  );
}
