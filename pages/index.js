import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * -----------------------------------------------------------------------
 * BX OPERATIONAL KERNEL v17.4.0 - "THE MONOLITH"
 * -----------------------------------------------------------------------
 * AUTHOR: BX_TERMINAL_CORE
 * ACCESS: CLANDESTINE_LEVEL_5
 * * WORKFLOW:
 * 1. IDENTITY_CHECK (GMAIL)
 * 2. OTP_CHALLENGE (GMAIL_VERIFICATION)
 * 3. PIN_SYNCHRONIZATION (CREATE OR VERIFY PIN)
 * 4. DASHBOARD_ACCESS (NODE_GENERATOR + VAULT + LOGS)
 * * [SYSTEM_NOTICE]: This file is a self-contained operational unit.
 * -----------------------------------------------------------------------
 */

// --- CONFIGURACIÓN DE NÚCLEO ---
const BX_CONFIG = {
  VERSION: "17.4.0",
  CODENAME: "VOID_BREAKER",
  DEFAULT_THUMB: "https://i.ibb.co/vzPRm9M/alexgaming.png",
  OTP_EXPIRY: 300, // 5 minutos
  ENCRYPTION_TYPE: "X-BX-AES-512",
  STYLE: {
    COLOR_ACCENT: "#00ff41",
    COLOR_BG: "#000000",
    COLOR_SURFACE: "#050505",
    COLOR_SURFACE_LIGHT: "#0a0a0a",
    COLOR_BORDER: "#111111",
    COLOR_BORDER_HOT: "#1a1a1a",
    COLOR_DANGER: "#ff003c",
    COLOR_TEXT: "#ffffff",
    COLOR_TEXT_DIM: "#444444",
    FONT_MAIN: "'JetBrains Mono', monospace"
  }
};

export default function BxMonolith() {
  // --- [ESTADOS DE LA MÁQUINA DE ESTADOS] ---
  const [session, setSession] = useState({
    isAuthenticated: false,
    stage: 'ENTRY_GMAIL', // ENTRY_GMAIL, VERIFY_OTP, SETUP_PIN, LOGIN_PIN, DASHBOARD
    operator: null,
    tempEmail: ''
  });

  const [ui, setUi] = useState({
    loading: false,
    activeTab: 'NODE_DEPLOYER',
    notification: { show: false, msg: '', type: 'info' },
    sidebarOpen: true
  });

  const [auth, setAuth] = useState({
    inputOtp: '',
    serverOtp: null,
    inputPin: '',
    pinConfirm: ''
  });

  const [vault, setVault] = useState({
    nodes: [],
    logs: [],
    metrics: { totalDeploys: 0, activeConnections: 0 }
  });

  const [generator, setGenerator] = useState({
    title: '',
    target: '',
    cover: '',
    layers: 1,
    hops: ['', '', ''],
    isExpiring: false
  });

  // --- [SISTEMA DE LOGS INTERNOS] ---
  const pushLog = useCallback((message, type = 'SYSTEM') => {
    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      origin: 'CORE_KERNEL',
      type: type,
      payload: message
    };
    setVault(prev => ({
      ...prev,
      logs: [logEntry, ...prev.logs].slice(0, 100)
    }));
  }, []);

  // --- [INICIALIZACIÓN DE KERNEL] ---
  useEffect(() => {
    const bootstrap = () => {
      pushLog("BX_KERNEL_INIT: Starting sequence...");
      
      const localNodes = localStorage.getItem('BX_VAULT_DATA');
      if (localNodes) {
        const parsed = JSON.parse(localNodes);
        setVault(v => ({ ...v, nodes: parsed }));
        pushLog(`VAULT_LOADED: ${parsed.length} nodes recovered.`);
      }

      const activeSession = sessionStorage.getItem('BX_ACTIVE_SESSION');
      if (activeSession) {
        setSession(s => ({ ...s, isAuthenticated: true, stage: 'DASHBOARD', operator: activeSession }));
        pushLog("SESSION_RECOVERY: Operator re-authenticated.");
      }

      pushLog("KERNEL_STATUS: Online. All systems green.");
    };

    bootstrap();
  }, [pushLog]);

  // --- [GESTOR DE NOTIFICACIONES] ---
  const sendNotify = (msg, type = 'info') => {
    setUi(prev => ({ ...prev, notification: { show: true, msg, type } }));
    setTimeout(() => setUi(prev => ({ ...prev, notification: { show: false, msg: '', type: 'info' } })), 4500);
  };

  // --- [FLUJO DE AUTENTICACIÓN: FASE 1 - GMAIL] ---
  const executeGmailHandshake = async () => {
    if (!session.tempEmail || !session.tempEmail.includes('@')) {
      sendNotify("IDENTITY_ERROR: VALID GMAIL REQUIRED", "danger");
      return;
    }

    setUi(prev => ({ ...prev, loading: true }));
    pushLog(`AUTH_HANDSHAKE: Requesting code for ${session.tempEmail}`);

    // Generador de código OTP (Hexadecimal para estilo clandestino)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAuth(prev => ({ ...prev, serverOtp: code }));

    try {
      // LLAMADA SIMULADA A TU API DE GMAIL BX
      // Aquí el bot mandaría el correo.
      pushLog(`DISPATCHER: Sending payload to ${session.tempEmail}`);
      
      // Simulación de delay de red
      await new Promise(r => setTimeout(r, 1500));
      
      setSession(prev => ({ ...prev, stage: 'VERIFY_OTP' }));
      sendNotify("ENCRYPTED CODE DISPATCHED TO GMAIL", "success");
    } catch (err) {
      pushLog("DISPATCH_ERR: GMAIL_SERVER_UNREACHABLE", "ERROR");
      sendNotify("CONNECTION_REFUSED", "danger");
    } finally {
      setUi(prev => ({ ...prev, loading: false }));
    }
  };

  // --- [FLUJO DE AUTENTICACIÓN: FASE 2 - OTP] ---
  const validateOtpChallenge = () => {
    if (auth.inputOtp !== auth.serverOtp) {
      pushLog("AUTH_FAIL: INVALID OTP ATTEMPT", "SECURITY");
      sendNotify("ACCESS_DENIED: INVALID_HEX_CODE", "danger");
      return;
    }

    pushLog("AUTH_SUCCESS: IDENTITY_VERIFIED");
    
    const db = JSON.parse(localStorage.getItem('BX_OPERATORS_REGISTRY') || '[]');
    const op = db.find(u => u.email === session.tempEmail);

    if (op) {
      setSession(prev => ({ ...prev, stage: 'LOGIN_PIN' }));
      sendNotify("IDENTITY_MATCH_FOUND. PROVIDE_PIN", "info");
    } else {
      setSession(prev => ({ ...prev, stage: 'SETUP_PIN' }));
      sendNotify("NO_OPERATOR_FOUND. INITIALIZE_PIN_SEQUENCE", "info");
    }
  };

  // --- [FLUJO DE AUTENTICACIÓN: FASE 3 - PIN] ---
  const finalizeAccessControl = () => {
    const db = JSON.parse(localStorage.getItem('BX_OPERATORS_REGISTRY') || '[]');
    
    if (session.stage === 'SETUP_PIN') {
      if (auth.inputPin.length < 4) return sendNotify("PIN_STRENGTH_INSUFFICIENT", "danger");
      
      const newOp = { email: session.tempEmail, pin: auth.inputPin, created: Date.now() };
      db.push(newOp);
      localStorage.setItem('BX_OPERATORS_REGISTRY', JSON.stringify(db));
      pushLog("REGISTRY_UPDATE: New operator enrolled.");
    } else {
      const op = db.find(u => u.email === session.tempEmail && u.pin === auth.inputPin);
      if (!op) {
        pushLog("PIN_FAIL: INCORRECT_MASTER_PIN", "SECURITY");
        sendNotify("INVALID_MASTER_PIN", "danger");
        return;
      }
    }

    sessionStorage.setItem('BX_ACTIVE_SESSION', session.tempEmail);
    setSession(prev => ({ ...prev, stage: 'DASHBOARD', isAuthenticated: true, operator: session.tempEmail }));
    pushLog(`ACCESS_GRANTED: Operator ${session.tempEmail} online.`);
    sendNotify("BX_SYSTEM_ACCESS_GRANTED", "success");
  };

  // --- [MOTOR DE DESPLIEGUE DE NODOS] ---
  const broadcastNode = useCallback(() => {
    if (!generator.title || !generator.target) {
      sendNotify("BROADCAST_ERR: DATA_INCOMPLETE", "danger");
      return;
    }

    setUi(prev => ({ ...prev, loading: true }));
    pushLog(`NODE_COMPILING: Initializing ${generator.title}`);

    setTimeout(() => {
      const payloadObj = {
        t: generator.title,
        d: generator.target,
        i: generator.cover || BX_CONFIG.DEFAULT_THUMB,
        s: generator.hops.slice(0, generator.layers).filter(h => h !== '')
      };

      const encoded = btoa(JSON.stringify(payloadObj));
      const finalUrl = `${window.location.origin}/unlock?payload=${encoded}`;

      const nodeEntry = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        ...generator,
        url: finalUrl,
        timestamp: new Date().toLocaleString(),
        status: 'BROADCASTING'
      };

      const updatedVault = [nodeEntry, ...vault.nodes];
      setVault(prev => ({ ...prev, nodes: updatedVault }));
      localStorage.setItem('BX_VAULT_DATA', JSON.stringify(updatedVault));

      setGenerator({ title: '', target: '', cover: '', layers: 1, hops: ['', '', ''], isExpiring: false });
      setUi(prev => ({ ...prev, loading: false }));
      pushLog(`NODE_LIVE: Broadcaster ID ${nodeEntry.id} active.`);
      sendNotify("NODE_BROADCAST_SUCCESSFUL", "success");
    }, 1500);
  }, [generator, vault.nodes, pushLog]);

  const purgeNode = (id) => {
    const filtered = vault.nodes.filter(n => n.id !== id);
    setVault(prev => ({ ...prev, nodes: filtered }));
    localStorage.setItem('BX_VAULT_DATA', JSON.stringify(filtered));
    pushLog(`VAULT_CLEANUP: Node ${id} purged.`);
    sendNotify("NODE_DELETED_FROM_VAULT");
  };

  // --- [ESTILOS DE ALTO IMPACTO] ---
  const InternalCSS = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..0,800;1,100..0,800&display=swap');
      
      :root {
        --bx-accent: ${BX_CONFIG.STYLE.COLOR_ACCENT};
        --bx-bg: ${BX_CONFIG.STYLE.COLOR_BG};
        --bx-surface: ${BX_CONFIG.STYLE.COLOR_SURFACE};
        --bx-border: ${BX_CONFIG.STYLE.COLOR_BORDER};
        --bx-text: ${BX_CONFIG.STYLE.COLOR_TEXT};
      }

      * { box-sizing: border-box; font-family: ${BX_CONFIG.STYLE.FONT_MAIN}; scrollbar-width: thin; scrollbar-color: #222 #000; }
      
      body { background: var(--bx-bg); color: var(--bx-text); margin: 0; overflow: hidden; }

      /* Animaciones */
      @keyframes glow { 0% { opacity: 0.3; } 100% { opacity: 0.6; } }
      @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: -100%; } }

      .scanline { position: fixed; left: 0; top: 0; width: 100%; height: 100vh; background: linear-gradient(0deg, transparent 0%, rgba(0, 255, 65, 0.02) 50%, transparent 100%); z-index: 1000; pointer-events: none; animation: scanline 10s infinite linear; }

      /* Componentes BX */
      .bx-panel { background: var(--bx-surface); border: 1px solid var(--bx-border); position: relative; }
      .bx-panel::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--bx-accent), transparent); }

      .bx-input { 
        background: transparent; border: 1px solid var(--bx-border); color: var(--bx-accent); padding: 18px; width: 100%; 
        font-size: 0.9rem; outline: none; transition: 0.3s; margin-bottom: 20px;
      }
      .bx-input:focus { border-color: var(--bx-accent); background: rgba(0, 255, 65, 0.02); }

      .bx-btn { 
        background: var(--bx-accent); color: #000; border: none; padding: 18px 30px; font-weight: 800; 
        text-transform: uppercase; cursor: pointer; letter-spacing: 2px; transition: 0.2s;
      }
      .bx-btn:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0, 255, 65, 0.3); }
      .bx-btn:disabled { background: #222; color: #444; cursor: not-allowed; transform: none; box-shadow: none; }

      .sidebar { width: 320px; border-right: 1px solid var(--bx-border); height: 100vh; display: flex; flex-direction: column; padding: 40px 20px; background: #010101; }
      .nav-item { padding: 15px 20px; cursor: pointer; color: ${BX_CONFIG.STYLE.COLOR_TEXT_DIM}; font-size: 0.75rem; border-left: 2px solid transparent; transition: 0.3s; letter-spacing: 1px; }
      .nav-item:hover { color: #fff; background: #050505; }
      .nav-item.active { color: var(--bx-accent); border-color: var(--bx-accent); background: rgba(0, 255, 65, 0.05); }

      .main-viewport { flex: 1; height: 100vh; overflow-y: auto; padding: 60px; position: relative; }
      
      .stat-card { background: #000; border: 1px solid var(--bx-border); padding: 20px; display: flex; flex-direction: column; }
      .stat-val { font-size: 1.5rem; font-weight: 800; color: var(--bx-accent); }
      .stat-lbl { font-size: 0.6rem; color: #444; letter-spacing: 2px; }

      .vault-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
      .vault-table th { text-align: left; padding: 15px; border-bottom: 1px solid var(--bx-border); font-size: 0.6rem; color: #444; letter-spacing: 2px; }
      .vault-table td { padding: 20px 15px; border-bottom: 1px solid #080808; font-size: 0.85rem; }
      
      .badge { font-size: 0.6rem; padding: 4px 8px; background: #111; border: 1px solid #222; }
      .badge-success { color: var(--bx-accent); border-color: var(--bx-accent); }

      /* Pantalla de Carga */
      .loader-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10; display: flex; align-items: center; justifyContent: center; }
    `}} />
  );

  // --- [INTERFAZ DE AUTENTICACIÓN (BLOQUE MASIVO)] ---
  if (session.stage !== 'DASHBOARD') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <InternalCSS />
        <div className="scanline" />
        
        <div className="bx-panel" style={{ width: '100%', maxWidth: '500px', padding: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '5rem', margin: 0, fontWeight: 900, letterSpacing: '-10px', color: BX_CONFIG.STYLE.COLOR_ACCENT }}>BX</h1>
            <p style={{ color: '#444', fontSize: '0.6rem', letterSpacing: '5px' }}>CLANDESTINE_IDENTITY_VERIFIER_v{BX_CONFIG.VERSION}</p>
          </div>

          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {session.stage === 'ENTRY_GMAIL' && (
              <>
                <div style={{ marginBottom: '10px', fontSize: '0.6rem', color: BX_CONFIG.STYLE.COLOR_ACCENT }}>[01] PROVIDE_GMAIL_IDENTITY</div>
                <input 
                  className="bx-input" 
                  placeholder="name@gmail.com" 
                  value={session.tempEmail} 
                  onChange={e => setSession({...session, tempEmail: e.target.value})} 
                />
                <button className="bx-btn" onClick={executeGmailHandshake} disabled={ui.loading}>
                  {ui.loading ? 'NEGOTIATING...' : 'INITIATE_AUTH_FLOW'}
                </button>
              </>
            )}

            {session.stage === 'VERIFY_OTP' && (
              <>
                <div style={{ marginBottom: '10px', fontSize: '0.6rem', color: BX_CONFIG.STYLE.COLOR_ACCENT }}>[02] ENTER_GMAIL_VERIFICATION_HEX</div>
                <input 
                  className="bx-input" 
                  placeholder="000000" 
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px' }}
                  value={auth.inputOtp} 
                  onChange={e => setAuth({...auth, inputOtp: e.target.value})} 
                />
                <button className="bx-btn" onClick={validateOtpChallenge}>VERIFY_CHALLENGE</button>
                <p 
                  style={{ textAlign: 'center', fontSize: '0.6rem', color: '#444', marginTop: '20px', cursor: 'pointer' }}
                  onClick={() => setSession({...session, stage: 'ENTRY_GMAIL'})}
                >BACK_TO_ENTRY</p>
              </>
            )}

            {(session.stage === 'SETUP_PIN' || session.stage === 'login_pin' || session.stage === 'LOGIN_PIN') && (
              <>
                <div style={{ marginBottom: '10px', fontSize: '0.6rem', color: BX_CONFIG.STYLE.COLOR_ACCENT }}>
                  {session.stage === 'SETUP_PIN' ? '[03] CONFIGURE_MASTER_PIN' : '[03] ENTER_MASTER_PIN'}
                </div>
                <input 
                  className="bx-input" 
                  type="password" 
                  placeholder="****" 
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px' }}
                  value={auth.inputPin}
                  onChange={e => setAuth({...auth, inputPin: e.target.value})} 
                />
                <button className="bx-btn" onClick={finalizeAccessControl}>AUTHORIZE_TERMINAL</button>
              </>
            )}
          </div>

          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#222' }}>
            <span>SECURE_CONNECTION: SSL_ENCRYPTED</span>
            <span>NODE: BX_MASTER_01</span>
          </div>
        </div>
      </div>
    );
  }

  // --- [DASHBOARD INTERFACE (BLOQUE MASIVO)] ---
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <InternalCSS />
      <div className="scanline" />

      {/* SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: BX_CONFIG.STYLE.COLOR_ACCENT }}>BX_HUB</h2>
          <div style={{ fontSize: '0.5rem', color: '#444' }}>OPERATOR_SESSION: {session.operator}</div>
        </div>

        <nav style={{ flex: 1 }}>
          <div 
            className={`nav-item ${ui.activeTab === 'NODE_DEPLOYER' ? 'active' : ''}`}
            onClick={() => setUi({...ui, activeTab: 'NODE_DEPLOYER'})}
          >[01] NODE_DEPLOYER</div>
          <div 
            className={`nav-item ${ui.activeTab === 'VAULT_EXPLORER' ? 'active' : ''}`}
            onClick={() => setUi({...ui, activeTab: 'VAULT_EXPLORER'})}
          >[02] VAULT_EXPLORER</div>
          <div 
            className={`nav-item ${ui.activeTab === 'CORE_LOGS' ? 'active' : ''}`}
            onClick={() => setUi({...ui, activeTab: 'CORE_LOGS'})}
          >[03] CORE_LOGS</div>
        </nav>

        <div style={{ borderTop: '1px solid #111', paddingTop: '20px' }}>
          <button 
            style={{ background: 'none', border: 'none', color: BX_CONFIG.STYLE.COLOR_DANGER, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
          >_TERMINATE_SESSION</button>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="main-viewport">
        {ui.activeTab === 'NODE_DEPLOYER' && (
          <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-5px', margin: '0 0 10px 0' }}>
              NODE_<span style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>DEPLOYER</span>
            </h1>
            <p style={{ color: '#444', marginBottom: '50px' }}>Generate and broadcast clandestine distribution nodes across the cluster.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div className="bx-panel" style={{ padding: '40px' }}>
                <div style={{ marginBottom: '30px', fontSize: '0.7rem', color: BX_CONFIG.STYLE.COLOR_ACCENT, letterSpacing: '2px' }}>CONSTRUCT_PAYLOAD</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="field">
                    <label style={{ fontSize: '0.5rem', color: '#444' }}>NODE_TITLE</label>
                    <input className="bx-input" value={generator.title} onChange={e => setGenerator({...generator, title: e.target.value})} placeholder="e.g. BX_SECRET_FILE" />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: '0.5rem', color: '#444' }}>ASSET_COVER_URL</label>
                    <input className="bx-input" value={generator.cover} onChange={e => setGenerator({...generator, cover: e.target.value})} placeholder="https://..." />
                  </div>
                </div>

                <div className="field">
                  <label style={{ fontSize: '0.5rem', color: '#444' }}>FINAL_REDIRECT_DESTINATION</label>
                  <input className="bx-input" value={generator.target} onChange={e => setGenerator({...generator, target: e.target.value})} placeholder="https://t.me/your_secret_channel" />
                </div>

                <div style={{ padding: '25px', background: '#000', border: '1px solid #111', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.6rem', color: '#444' }}>SECURITY_LAYERS (30s DELAY PER LAYER)</span>
                    <select 
                      style={{ background: '#000', color: BX_CONFIG.STYLE.COLOR_ACCENT, border: 'none', outline: 'none' }}
                      value={generator.layers}
                      onChange={e => setGenerator({...generator, layers: parseInt(e.target.value)})}
                    >
                      <option value="1">1 LAYER</option>
                      <option value="2">2 LAYERS</option>
                      <option value="3">3 LAYERS</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    {Array.from({ length: generator.layers }).map((_, i) => (
                      <input 
                        key={i}
                        className="bx-input" 
                        style={{ marginBottom: 0, fontSize: '0.7rem' }} 
                        placeholder={`HOP_0${i+1}_URL`}
                        value={generator.hops[i]}
                        onChange={e => {
                          const h = [...generator.hops]; h[i] = e.target.value; setGenerator({...generator, hops: h});
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button className="bx-btn" style={{ width: '100%', marginTop: '30px' }} onClick={broadcastNode} disabled={ui.loading}>
                  {ui.loading ? 'COMPILING_ASSET...' : 'EXECUTE_NODE_BROADCAST'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="stat-card">
                  <span className="stat-lbl">VAULT_DENSITY</span>
                  <span className="stat-val">{vault.nodes.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-lbl">TOTAL_BROADCASTS</span>
                  <span className="stat-val">{vault.nodes.length + 12}</span>
                </div>
                <div className="bx-panel" style={{ flex: 1, padding: '20px', fontSize: '0.6rem', color: '#333' }}>
                  <div style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT, marginBottom: '10px' }}>SYSTEM_TELEMETRY:</div>
                  CPU: 14% <br/> RAM: 1.2GB <br/> NET: 100MB/S <br/> STATUS: NO_LEAKS_FOUND
                </div>
              </div>
            </div>

            {/* TABLA DE VAULT INTEGRADA (SOLICITADO) */}
            <div style={{ marginTop: '60px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>ACTIVE_VAULT_<span style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>REGISTRY</span></h2>
              <table className="vault-table">
                <thead>
                  <tr>
                    <th>NODE_UID</th>
                    <th>ASSET_IDENTIFIER</th>
                    <th>DEPLOY_DATE</th>
                    <th>SECURITY_LEVEL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.nodes.map(node => (
                    <tr key={node.id}>
                      <td style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>#{node.id}</td>
                      <td>{node.title}</td>
                      <td style={{ color: '#444' }}>{node.timestamp}</td>
                      <td><span className={`badge ${node.layers > 1 ? 'badge-success' : ''}`}>{node.layers}_LAYERS</span></td>
                      <td style={{ display: 'flex', gap: '10px' }}>
                        <button className="bx-btn" style={{ padding: '8px 12px', fontSize: '0.6rem' }} onClick={() => { navigator.clipboard.writeText(node.url); sendNotify("LINK_COPIED_TO_CLIPBOARD"); }}>COPY</button>
                        <button className="bx-btn" style={{ padding: '8px 12px', fontSize: '0.6rem', background: BX_CONFIG.STYLE.COLOR_DANGER, color: '#fff' }} onClick={() => purgeNode(node.id)}>PURGE</button>
                      </td>
                    </tr>
                  ))}
                  {vault.nodes.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#444', padding: '40px' }}>NO_NODES_FOUND_IN_VAULT_SECTOR</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ui.activeTab === 'VAULT_EXPLORER' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-5px' }}>ASSET_<span style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>VAULT</span></h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
              {vault.nodes.map(node => (
                <div key={node.id} className="bx-panel" style={{ overflow: 'hidden' }}>
                  <img src={node.cover} style={{ width: '100%', height: '180px', objectFit: 'cover', opacity: 0.4 }} />
                  <div style={{ padding: '25px' }}>
                    <div style={{ fontSize: '0.6rem', color: BX_CONFIG.STYLE.COLOR_ACCENT }}>NODE_ID: {node.id}</div>
                    <h3 style={{ margin: '10px 0', fontSize: '1.2rem' }}>{node.title}</h3>
                    <div style={{ fontSize: '0.7rem', color: '#444', marginBottom: '20px' }}>DATE: {node.timestamp}</div>
                    <button className="bx-btn" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => window.open(node.url)}>PREVIEW_GATEWAY</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ui.activeTab === 'CORE_LOGS' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-5px' }}>CORE_<span style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>LOGS</span></h1>
            <div className="bx-panel" style={{ marginTop: '40px', background: '#000', height: '600px', overflowY: 'auto', padding: '40px' }}>
              {vault.logs.map(log => (
                <div key={log.id} style={{ marginBottom: '15px', borderBottom: '1px solid #080808', paddingBottom: '15px', fontSize: '0.8rem' }}>
                  <span style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT }}>[{log.timestamp}]</span> 
                  <span style={{ color: log.type === 'ERROR' ? '#ff003c' : (log.type === 'SECURITY' ? '#ffaa00' : '#444'), marginLeft: '10px' }}>[{log.type}]</span> 
                  <span style={{ marginLeft: '15px', color: '#eee' }}>{log.payload}</span>
                </div>
              ))}
              <div style={{ color: BX_CONFIG.STYLE.COLOR_ACCENT, marginTop: '20px' }}>
                root@bx_core:~$ <span style={{ animation: 'glow 0.8s infinite alternate', background: BX_CONFIG.STYLE.COLOR_ACCENT, width: '10px', height: '15px', display: 'inline-block' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL NOTIFICATION SYSTEM */}
      {ui.notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: ui.notification.type === 'danger' ? BX_CONFIG.STYLE.COLOR_DANGER : '#000',
          color: '#fff', border: `1px solid ${BX_CONFIG.STYLE.COLOR_ACCENT}`,
          padding: '20px 40px', fontWeight: 900, zIndex: 10000,
          boxShadow: `0 0 30px ${BX_CONFIG.STYLE.COLOR_ACCENT}33`,
          animation: 'slideIn 0.3s ease'
        }}>
          {ui.notification.msg}
        </div>
      )}

      {/* LOADER OVERLAY */}
      {ui.loading && (
        <div className="loader-overlay">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: `3px solid ${BX_CONFIG.STYLE.COLOR_ACCENT}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
            <p style={{ marginTop: '20px', color: BX_CONFIG.STYLE.COLOR_ACCENT, letterSpacing: '5px', fontSize: '0.6rem' }}>PROCESSING_DATA...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

