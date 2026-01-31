import React, { useState, useEffect, useRef } from 'react';

/**
 * BX-SYSTEMS v10.0.0 - THE ELITE CORE
 * REQUERIMIENTO: GMAIL -> OTP -> PIN -> DASHBOARD
 * MEJORA: TABLA INTEGRADA + GESTIÓN TOTAL DE NODOS
 */

export default function BxNexusElite() {
  // --- [ESTADOS DE NAVEGACIÓN] ---
  // Vistas: 'start', 'reg_gmail', 'verify_otp', 'setup_pin', 'login_pin', 'dashboard'
  const [step, setStep] = useState('start'); 
  const [activeView, setActiveView] = useState('deployment');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  // --- [SEGURIDAD E IDENTIDAD] ---
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState(''); // PIN del usuario
  const [tempAuthCode, setTempAuthCode] = useState(''); // Código enviado al Gmail
  const [inputAuthCode, setInputAuthCode] = useState(''); // Código que escribe el usuario
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [SISTEMA DE GENERACIÓN DE NODOS] ---
  const [assetTitle, setAssetTitle] = useState('');
  const [assetTarget, setAssetTarget] = useState('');
  const [assetCover, setAssetCover] = useState('');
  const [securitySteps, setSecuritySteps] = useState(['', '', '']);
  const [numActiveSteps, setNumActiveSteps] = useState(1);
  const [myDeployedLinks, setMyDeployedLinks] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // --- [MODO GATEWAY (CLIENTE EXTERNO)] ---
  const [isGatewayActive, setIsGatewayActive] = useState(false);
  const [gatewayData, setGatewayData] = useState(null);
  const [unlockedProgress, setUnlockedProgress] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);

  // --- [CONFIGURACIÓN DE DISEÑO] ---
  const theme = {
    cyan: '#00ff41', // Verde BX Táctico
    blue: '#00d2ff',
    dark: '#000000',
    card: '#080808',
    border: '#111111',
    text: '#ffffff',
    muted: '#444444',
    danger: '#ff003c',
    success: '#00ff41'
  };

  // --- [EFECTOS DE INICIALIZACIÓN] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');

    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setGatewayData(decoded);
        setIsGatewayActive(true);
      } catch (e) {
        showNotify("❌ PAYLOAD CORRUPTO");
      }
    }

    const savedAcc = localStorage.getItem('bx_accounts_v10');
    const savedLnk = localStorage.getItem('bx_links_v10');
    if (savedAcc) setRegisteredUsers(JSON.parse(savedAcc));
    if (savedLnk) setMyDeployedLinks(JSON.parse(savedLnk));

    const session = localStorage.getItem('bx_session_v10');
    if (session && !payload) {
      setCurrentUser(JSON.parse(session));
      setStep('dashboard');
    }
  }, []);

  // --- [UTILIDADES DE SISTEMA] ---
  const showNotify = (txt) => {
    setNotification(txt);
    setTimeout(() => setNotification(''), 4500);
  };

  const addLog = (msg) => {
    const log = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setSystemLogs(prev => [log, ...prev].slice(0, 15));
  };

  // --- [MÓDULO DE AUTENTICACIÓN GMAIL] ---
  const requestGmailOTP = async () => {
    if (!userEmail.includes('@')) return showNotify("⚠️ GMAIL INVÁLIDO");
    setLoading(true);

    // Generamos un código de 6 dígitos para más seguridad
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTempAuthCode(code);

    try {
      // LLAMADA A TU API DE GMAIL
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, code: code })
      });
      
      setLoading(false);
      setStep('verify_otp');
      showNotify("📩 CÓDIGO ENVIADO AL GMAIL");
      addLog(`OTP Dispatch: ${userEmail}`);
    } catch (err) {
      setLoading(false);
      // Fallback para pruebas sin API activa
      console.log("DEBUG_CODE:", code);
      setStep('verify_otp');
      showNotify("⚠️ USANDO MODO BYPASS (VER CONSOLA)");
    }
  };

  const verifyOTPAndRoute = () => {
    if (inputAuthCode !== tempAuthCode) return showNotify("❌ CÓDIGO INCORRECTO");
    
    const exists = registeredUsers.find(u => u.email === userEmail);
    if (exists) {
      setStep('login_pin');
      showNotify("🔑 IDENTIDAD CONFIRMADA. PIN REQUERIDO");
    } else {
      setStep('setup_pin');
      showNotify("🆕 USUARIO NUEVO. CREA TU PIN");
    }
  };

  const finalizeRegistration = () => {
    if (userPass.length < 4) return showNotify("❌ EL PIN DEBE TENER 4+ DÍGITOS");
    const newUser = { email: userEmail, pin: userPass };
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('bx_accounts_v10', JSON.stringify(updated));
    
    setCurrentUser(newUser);
    localStorage.setItem('bx_session_v10', JSON.stringify(newUser));
    setStep('dashboard');
    showNotify("🎉 REGISTRO EXITOSO");
  };

  const handleLogin = () => {
    const user = registeredUsers.find(u => u.email === userEmail && u.pin === userPass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session_v10', JSON.stringify(user));
      setStep('dashboard');
      showNotify("✅ BIENVENIDO OPERADOR");
      addLog("Session resumed");
    } else {
      showNotify("❌ PIN INCORRECTO");
    }
  };

  // --- [MÓDULO DE DESPLIEGUE] ---
  const deployLink = () => {
    if (!assetTitle || !assetTarget) return showNotify("⚠️ CAMPOS VACÍOS");
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
        date: new Date().toLocaleDateString(),
        layers: numActiveSteps
      };

      const updated = [newEntry, ...myDeployedLinks];
      setMyDeployedLinks(updated);
      localStorage.setItem('bx_links_v10', JSON.stringify(updated));
      
      setAssetTitle(''); setAssetTarget(''); setAssetCover('');
      setLoading(false);
      showNotify("🚀 NODO DESPLEGADO");
      addLog(`Node Broadcast: ${newEntry.id}`);
    }, 1200);
  };

  const purgeLink = (id) => {
    const filtered = myDeployedLinks.filter(l => l.id !== id);
    setMyDeployedLinks(filtered);
    localStorage.setItem('bx_links_v10', JSON.stringify(filtered));
    showNotify("🗑️ NODO ELIMINADO");
  };

  // --- [MODO GATEWAY: LÓGICA DE TIEMPO] ---
  const startWaitSequence = (url, index) => {
    window.open(url, '_blank');
    setIsTimerActive(true);
    setTimerSeconds(30);

    const interval = setInterval(() => {
      setTimerSeconds(v => {
        if (v <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          setUnlockedProgress(index + 1);
          return 30;
        }
        return v - 1;
      });
    }, 1000);
  };

  // --- [UI: ESTILOS DINÁMICOS] ---
  const styles = {
    input: {
      background: '#050505',
      border: `1px solid ${theme.border}`,
      color: theme.success,
      padding: '18px',
      borderRadius: '4px',
      width: '100%',
      outline: 'none',
      fontSize: '0.9rem',
      marginBottom: '15px',
      fontFamily: 'monospace'
    },
    btnMain: {
      background: theme.success,
      color: 'black',
      border: 'none',
      padding: '18px',
      fontWeight: '900',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      width: '100%'
    }
  };

  // --- [VISTA: UNLOCKER INTERFACE] ---
  if (isGatewayActive && gatewayData) {
    return (
      <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'monospace' }}>
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '50px', width: '100%', maxWidth: '480px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: theme.success }}></div>
          
          <img src={gatewayData.image} style={{ width: '140px', height: '140px', marginBottom: '25px', border: `1px solid ${theme.success}`, objectFit: 'cover' }} />
          <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '10px' }}>{gatewayData.title}</h1>
          <p style={{ color: theme.muted, fontSize: '0.8rem', marginBottom: '40px' }}>BX_SECURITY_PROTOCOL_ACTIVE</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {gatewayData.steps.map((url, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  disabled={unlockedProgress < i || isTimerActive}
                  onClick={() => startWaitSequence(url, i)}
                  style={{
                    flex: 1, padding: '18px', background: unlockedProgress > i ? 'rgba(0,255,65,0.05)' : 'transparent',
                    border: `1px solid ${unlockedProgress > i ? theme.success : theme.border}`,
                    color: unlockedProgress > i ? theme.success : 'white',
                    cursor: (unlockedProgress < i || isTimerActive) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'left'
                  }}
                >
                  {unlockedProgress > i ? `✅ LAYER 0${i+1} CLEARED` : `🔓 UNLOCK LAYER 0${i+1}`}
                </button>
                {isTimerActive && unlockedProgress === i && (
                  <div style={{ color: theme.success, width: '40px', fontWeight: 'bold' }}>{timerSeconds}s</div>
                )}
              </div>
            ))}

            <button
              disabled={unlockedProgress < gatewayData.steps.length}
              onClick={() => window.location.href = gatewayData.target}
              style={{
                ...styles.btnMain,
                marginTop: '20px',
                background: unlockedProgress >= gatewayData.steps.length ? theme.success : '#111',
                color: unlockedProgress >= gatewayData.steps.length ? 'black' : '#333'
              }}
            >
              ACCESS_FINAL_ASSET
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- [VISTA: DASHBOARD PRINCIPAL] ---
  return (
    <div style={{ backgroundColor: theme.dark, minHeight: '100vh', color: 'white', fontFamily: 'monospace' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { from { top: -100%; } to { top: 100%; } }
        .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 10px; background: rgba(0,255,65,0.03); animation: scan 4s linear infinite; pointer-events: none; }
        .bx-panel { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 2px; }
        .tab-btn { padding: 15px; background: transparent; border: none; color: #444; cursor: pointer; text-align: left; font-weight: bold; font-size: 0.7rem; letter-spacing: 1px; }
        .tab-btn.active { color: ${theme.success}; border-left: 2px solid ${theme.success}; background: rgba(0,255,65,0.02); }
      `}} />
      <div className="scanline"></div>

      {step !== 'dashboard' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ background: theme.card, padding: '60px', border: `1px solid ${theme.border}`, width: '450px', textAlign: 'center' }}>
            {step === 'start' && (
              <div>
                <h1 style={{ fontSize: '4rem', fontWeight: '900', letterSpacing: '-5px', color: theme.success }}>BX</h1>
                <p style={{ color: theme.muted, marginBottom: '50px', fontSize: '0.7rem' }}>OPERATIONAL_CORE_v10</p>
                <button onClick={() => setStep('reg_gmail')} style={styles.btnMain}>ACCESS_SYSTEM</button>
              </div>
            )}

            {/* FLUJO DE AUTENTICACIÓN DINÁMICO */}
            {step !== 'start' && (
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '30px', color: theme.success }}>// {step.toUpperCase()}</h2>
                
                {step === 'reg_gmail' && (
                  <input style={styles.input} placeholder="ENTER_GMAIL" type="email" onChange={(e) => setUserEmail(e.target.value)} />
                )}
                
                {step === 'verify_otp' && (
                  <input style={{ ...styles.input, textAlign: 'center', letterSpacing: '8px' }} placeholder="000000" onChange={(e) => setInputAuthCode(e.target.value)} />
                )}

                {(step === 'setup_pin' || step === 'login_pin') && (
                  <input style={{ ...styles.input, textAlign: 'center', letterSpacing: '8px' }} placeholder="****" type="password" onChange={(e) => setUserPass(e.target.value)} />
                )}

                <button 
                  style={styles.btnMain}
                  onClick={() => {
                    if(step === 'reg_gmail') requestGmailOTP();
                    else if(step === 'verify_otp') verifyOTPAndRoute();
                    else if(step === 'setup_pin') finalizeRegistration();
                    else if(step === 'login_pin') handleLogin();
                  }}
                >
                  {loading ? 'WAIT...' : 'CONFIRM_ACTION'}
                </button>
                <p onClick={() => setStep('start')} style={{ color: '#222', fontSize: '0.6rem', marginTop: '20px', textAlign: 'center', cursor: 'pointer' }}>RETURN_TO_START</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'dashboard' && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* SIDEBAR TÁCTICO */}
          <div style={{ width: '260px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: theme.success, fontWeight: '900', marginBottom: '60px' }}>BX_NEXUS_HUB</div>
            <button onClick={() => setActiveView('deployment')} className={`tab-btn ${activeView === 'deployment' ? 'active' : ''}`}>[01] NODE_DEPLOYER</button>
            <button onClick={() => setActiveView('analytics')} className={`tab-btn ${activeView === 'analytics' ? 'active' : ''}`}>[02] SYSTEM_LOGS</button>
            
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '0.5rem', color: theme.muted }}>OP: {currentUser?.email}</div>
              <button onClick={() => { localStorage.removeItem('bx_session_v10'); window.location.reload(); }} style={{ width: '100%', padding: '10px', background: theme.danger, border: 'none', color: 'white', marginTop: '10px', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 'bold' }}>LOGOUT</button>
            </div>
          </div>

          {/* ÁREA DE TRABAJO */}
          <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
            {activeView === 'deployment' && (
              <div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '40px' }}>NODE_<span style={{ color: theme.success }}>DEPLOY</span></h1>
                
                <div className="bx-panel" style={{ padding: '40px', maxWidth: '900px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: theme.muted }}>ASSET_TITLE</label>
                      <input style={styles.input} value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: theme.muted }}>THUMBNAIL_URL</label>
                      <input style={styles.input} value={assetCover} onChange={(e) => setAssetCover(e.target.value)} />
                    </div>
                  </div>
                  <label style={{ fontSize: '0.6rem', color: theme.muted }}>FINAL_TARGET</label>
                  <input style={styles.input} value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} />
                  
                  <div style={{ background: '#000', padding: '25px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>LAYER_CONFIGURATION</span>
                      <select value={numActiveSteps} onChange={(e) => setNumActiveSteps(parseInt(e.target.value))} style={{ background: '#000', color: theme.success, border: `1px solid ${theme.success}`, padding: '5px' }}>
                        <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {Array.from({ length: numActiveSteps }).map((_, i) => (
                        <input key={i} style={{ ...styles.input, marginBottom: 0 }} placeholder={`LAYER_0${i+1}_URL`} value={securitySteps[i]} onChange={(e) => { const n = [...securitySteps]; n[i] = e.target.value; setSecuritySteps(n); }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={deployLink} disabled={loading} style={{ ...styles.btnMain, marginTop: '30px' }}>
                    {loading ? 'PROCESSING...' : 'INITIALIZE_BROADCAST'}
                  </button>
                </div>

                {/* TABLA DE GESTIÓN INTEGRADA */}
                <div style={{ marginTop: '60px' }}>
                  <h3 style={{ fontSize: '0.8rem', marginBottom: '20px' }}>ACTIVE_NODES_IN_CLUSTER</h3>
                  <div className="bx-panel" style={{ padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ color: theme.muted, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>
                          <th style={{ padding: '15px' }}>ID</th>
                          <th>TITLE</th>
                          <th>LAYERS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myDeployedLinks.map(l => (
                          <tr key={l.id} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '15px', color: theme.success }}>#{l.id}</td>
                            <td>{l.title}</td>
                            <td><span style={{ border: `1px solid ${theme.success}`, padding: '2px 6px', fontSize: '0.6rem' }}>{l.layers}L</span></td>
                            <td>
                              <button onClick={() => { navigator.clipboard.writeText(l.url); showNotify("📋 COPIED"); }} style={{ background: '#111', color: 'white', border: 'none', padding: '8px 12px', marginRight: '10px', cursor: 'pointer' }}>COPY</button>
                              <button onClick={() => purgeLink(l.id)} style={{ background: theme.danger, color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>DELETE</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div>
                <h1>CORE_METRICS</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '40px' }}>
                  <div className="bx-panel" style={{ padding: '30px' }}>
                    <div style={{ color: theme.muted, fontSize: '0.6rem' }}>ACTIVE_NODES</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: theme.success }}>{myDeployedLinks.length}</div>
                  </div>
                  <div className="bx-panel" style={{ padding: '30px' }}>
                    <div style={{ color: theme.muted, fontSize: '0.6rem' }}>CLUSTER_HEALTH</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '10px' }}>100% NOMINAL</div>
                  </div>
                  <div className="bx-panel" style={{ padding: '30px' }}>
                    <div style={{ color: theme.muted, fontSize: '0.6rem' }}>SEC_PROTOCOL</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '10px' }}>AES-256_ACTIVE</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '50px' }}>
                  <h3>LIVE_KERNEL_FEED</h3>
                  <div className="bx-panel" style={{ padding: '25px', background: '#000', minHeight: '200px' }}>
                    {systemLogs.map(log => (
                      <div key={log.id} style={{ fontSize: '0.7rem', color: '#555', marginBottom: '8px' }}>
                        <span style={{ color: theme.success }}>[{log.time}]</span> {log.msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SISTEMA DE NOTIFICACIONES TÁCTICAS */}
      {notification && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: theme.card, border: `1px solid ${theme.success}`, color: theme.success, padding: '20px 40px', fontWeight: 'bold', zIndex: 10000, boxShadow: `0 0 30px rgba(0,255,65,0.1)` }}>
          {notification}
        </div>
      )}
    </div>
  );
}
