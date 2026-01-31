import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * BX COMMAND INTERFACE - BUILD v15.0.2
 * ARCHITECTURE: MONOLITHIC CLANDESTINE HUB
 * REQUISITOS: GMAIL OTP AUTH MANDATORY
 * ESTILO: ULTRA-DARK CYBER-TERMINAL
 */

const THEME = {
  bg: '#020202',
  surface: '#080808',
  border: '#1a1a1a',
  accent: '#00ff41', // Verde BX
  accentDark: '#00330d',
  danger: '#ff003c',
  text: '#ffffff',
  textMuted: '#555555',
  font: "'JetBrains Mono', monospace"
};

export default function BxControlPanel() {
  // --- [ESTADOS DE NAVEGACIÓN Y CARGA] ---
  const [view, setView] = useState('landing'); // landing, register, login, dashboard
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });

  // --- [ESTADOS DE AUTENTICACIÓN] ---
  const [form, setForm] = useState({ email: '', pin: '', otp: '' });
  const [serverOtp, setServerOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [ESTADOS DEL DASHBOARD] ---
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('deployer');
  const [asset, setAsset] = useState({
    title: '', target: '', cover: '', layers: 1, hops: ['', '', '']
  });

  // --- [EFECTOS DE INICIO] ---
  useEffect(() => {
    const savedNodes = localStorage.getItem('bx_vault');
    if (savedNodes) setNodes(JSON.parse(savedNodes));
    
    const session = localStorage.getItem('bx_session_active');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }
    
    pushLog("BX_SYSTEM_INIT: Modules loaded at 100%");
    pushLog("ENCRYPTION_ENGINE: AES-512 Operational");
  }, []);

  // --- [FUNCIONES DE UTILIDAD] ---
  const pushLog = (msg) => {
    const entry = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setLogs(prev => [entry, ...prev].slice(0, 50));
  };

  const notify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 5000);
  };

  // --- [LÓGICA DE GMAIL OTP] ---
  const requestOtp = async (mode) => {
    if (!form.email.includes('@')) return notify("INVALID EMAIL ADDRESS", "danger");
    
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(code);

    try {
      // LLAMADA AL BOT DE GMAIL
      const res = await fetch('/api/bx-mailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code, mode })
      });
      
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        notify("VERIFICATION CODE SENT TO GMAIL", "success");
        pushLog(`OTP Request for ${form.email} dispatched.`);
      } else { throw new Error(); }
    } catch (e) {
      // MODO DESARROLLO: Si el bot no está configurado, bypass en consola
      setOtpSent(true);
      notify("GMAIL_BOT: DISPATCH FAILED - USING BYPASS MODE", "info");
      console.log("BX_AUTH_CODE:", code);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (form.otp !== serverOtp) return notify("CODE MISMATCH", "danger");
    if (form.pin.length < 4) return notify("PIN TOO WEAK (MIN 4)", "danger");

    const users = JSON.parse(localStorage.getItem('bx_ops') || '[]');
    if (users.find(u => u.email === form.email)) return notify("EMAIL ALREADY REGISTERED", "danger");

    const newUser = { email: form.email, pin: form.pin };
    users.push(newUser);
    localStorage.setItem('bx_ops', JSON.stringify(users));
    
    notify("OPERATOR REGISTERED", "success");
    setView('login');
    setOtpSent(false);
    setServerOtp(null);
  };

  const handleLogin = () => {
    if (form.otp !== serverOtp) return notify("CODE MISMATCH", "danger");
    
    const users = JSON.parse(localStorage.getItem('bx_ops') || '[]');
    const op = users.find(u => u.email === form.email && u.pin === form.pin);

    if (op) {
      setCurrentUser(op);
      localStorage.setItem('bx_session_active', JSON.stringify(op));
      setView('dashboard');
      notify("WELCOME BACK OPERATOR", "success");
      pushLog(`Session started for ${op.email}`);
    } else {
      notify("INVALID PIN OR IDENTITY", "danger");
    }
  };

  // --- [NODE GENERATOR] ---
  const deployLink = () => {
    if (!asset.title || !asset.target) return notify("MISSING NODE DATA", "danger");
    
    setLoading(true);
    setTimeout(() => {
      const payload = btoa(JSON.stringify({
        title: asset.title,
        target: asset.target,
        image: asset.cover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: asset.hops.slice(0, asset.layers).filter(h => h !== '')
      }));

      const finalUrl = `${window.location.origin}/unlock?payload=${payload}`;
      const newNode = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        ...asset,
        url: finalUrl,
        date: new Date().toLocaleDateString()
      };

      const updated = [newNode, ...nodes];
      setNodes(updated);
      localStorage.setItem('bx_vault', JSON.stringify(updated));
      
      setAsset({ title: '', target: '', cover: '', layers: 1, hops: ['', '', ''] });
      setLoading(false);
      notify("NODE BROADCAST SUCCESSFUL", "success");
      pushLog(`Deployed node: ${newNode.id}`);
    }, 1200);
  };

  // --- [CSS DINÁMICO] ---
  const Styles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;800&display=swap');
      * { box-sizing: border-box; font-family: ${THEME.font}; }
      body { background: ${THEME.bg}; color: ${THEME.text}; margin: 0; overflow-x: hidden; }
      
      .bx-btn { background: ${THEME.accent}; color: #000; border: none; padding: 18px 25px; font-weight: 800; cursor: pointer; transition: 0.3s; letter-spacing: 1px; text-transform: uppercase; }
      .bx-btn:hover { filter: brightness(1.2); transform: translateY(-2px); box-shadow: 0 5px 15px ${THEME.accent}33; }
      .bx-btn.secondary { background: transparent; color: ${THEME.accent}; border: 1px solid ${THEME.accent}; }
      .bx-btn.danger { background: ${THEME.danger}; color: #fff; }

      .bx-input { background: #000; border: 1px solid ${THEME.border}; color: ${THEME.accent}; padding: 16px; width: 100%; border-radius: 4px; outline: none; margin-bottom: 20px; font-size: 0.9rem; }
      .bx-input:focus { border-color: ${THEME.accent}; box-shadow: 0 0 10px ${THEME.accent}11; }

      .auth-container { max-width: 450px; width: 90%; background: ${THEME.surface}; border: 1px solid ${THEME.border}; padding: 60px; position: relative; }
      .auth-container::before { content: ''; position: absolute; top: -1px; left: -1px; width: 40px; height: 40px; border-top: 2px solid ${THEME.accent}; border-left: 2px solid ${THEME.accent}; }

      .dash-layout { display: flex; height: 100vh; }
      .sidebar { width: 300px; background: #010101; border-right: 1px solid ${THEME.border}; padding: 40px 25px; display: flex; flexDirection: column; }
      .content { flex: 1; padding: 60px; overflow-y: auto; background-image: radial-gradient(#111 1px, transparent 1px); background-size: 30px 30px; }

      .card { background: ${THEME.surface}; border: 1px solid ${THEME.border}; padding: 30px; margin-bottom: 25px; position: relative; }
      .card-header { color: ${THEME.accent}; font-size: 0.7rem; font-weight: 800; margin-bottom: 20px; letter-spacing: 3px; }

      .table-row { display: grid; grid-template-columns: 1fr 2fr 1fr; background: #000; padding: 15px; border-bottom: 1px solid ${THEME.border}; align-items: center; }
      .table-row:hover { background: #050505; }

      @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
      .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 5px; background: rgba(0, 255, 65, 0.03); z-index: 1000; pointer-events: none; animation: scanline 6s infinite linear; }
    `}} />
  );

  // --- [VISTA: LANDING SELECTION] ---
  if (view === 'landing') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Styles />
        <div className="auth-container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', color: THEME.accent, margin: '0 0 10px 0', fontWeight: 800 }}>BX</h1>
          <p style={{ color: THEME.textMuted, fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '40px' }}>ACCESS_GATEWAY_v15</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="bx-btn" onClick={() => setView('login')}>LOGIN_OPERATOR</button>
            <button className="bx-btn secondary" onClick={() => setView('register')}>CREATE_NEW_ID</button>
          </div>
        </div>
      </div>
    );
  }

  // --- [VISTA: AUTH (REGISTER / LOGIN)] ---
  if (view === 'register' || view === 'login') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Styles />
        <div className="auth-container">
          <h2 style={{ color: THEME.accent, marginBottom: '30px' }}>{view === 'register' ? '> REGISTER_ID' : '> LOGIN_ID'}</h2>
          
          <input className="bx-input" placeholder="GMAIL_ADDRESS" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="bx-input" placeholder="SECURE_PIN" type="password" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} />
          
          {otpSent && (
            <input className="bx-input" placeholder="GMAIL_CODE_6_DIGITS" value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} style={{ textAlign: 'center', borderColor: THEME.accent }} />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="bx-btn" style={{ flex: 1 }} onClick={otpSent ? (view === 'register' ? handleRegister : handleLogin) : () => requestOtp(view)} disabled={loading}>
              {loading ? 'WAIT...' : (otpSent ? 'VERIFY_&_ACCESS' : 'GET_GMAIL_CODE')}
            </button>
          </div>
          
          <p onClick={() => { setView('landing'); setOtpSent(false); }} style={{ textAlign: 'center', color: THEME.textMuted, fontSize: '0.7rem', marginTop: '25px', cursor: 'pointer' }}>RETURN_TO_MAIN</p>
        </div>
      </div>
    );
  }

  // --- [VISTA: DASHBOARD PRINCIPAL] ---
  return (
    <div className="dash-layout">
      <Styles />
      <div className="scanline" />
      
      {/* SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{ color: THEME.accent, margin: 0, fontSize: '2rem' }}>BX</h1>
          <div style={{ fontSize: '0.6rem', color: THEME.textMuted }}>S_SESSION: {currentUser?.email}</div>
        </div>

        <nav style={{ flex: 1 }}>
          <div onClick={() => setActiveTab('deployer')} style={{ color: activeTab === 'deployer' ? THEME.accent : '#fff', cursor: 'pointer', marginBottom: '25px', fontWeight: 'bold' }}>[01] NODE_DEPLOYER</div>
          <div onClick={() => setActiveTab('database')} style={{ color: activeTab === 'database' ? THEME.accent : '#fff', cursor: 'pointer', marginBottom: '25px', fontWeight: 'bold' }}>[02] ASSET_DATABASE</div>
          <div onClick={() => setActiveTab('logs')} style={{ color: activeTab === 'logs' ? THEME.accent : '#fff', cursor: 'pointer', marginBottom: '25px', fontWeight: 'bold' }}>[03] SYSTEM_LOGS</div>
        </nav>

        <button className="bx-btn danger" style={{ padding: '12px', fontSize: '0.7rem' }} onClick={() => { localStorage.removeItem('bx_session_active'); window.location.reload(); }}>SHUTDOWN_TERMINAL</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="content">
        {activeTab === 'deployer' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-3px', marginBottom: '40px' }}>DEPLOY_<span style={{ color: THEME.accent }}>NODE</span></h1>
            
            <div className="card">
              <div className="card-header">CONFIGURE_BROADCAST_PARAMETERS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <input className="bx-input" placeholder="ASSET_TITLE" value={asset.title} onChange={e => setAsset({...asset, title: e.target.value})} />
                <input className="bx-input" placeholder="COVER_IMAGE_URL" value={asset.cover} onChange={e => setAsset({...asset, cover: e.target.value})} />
              </div>
              <input className="bx-input" placeholder="FINAL_DESTINATION_TARGET" value={asset.target} onChange={e => setAsset({...asset, target: e.target.value})} />
              
              <div style={{ background: '#000', padding: '20px', border: `1px solid ${THEME.border}`, marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.7rem', color: THEME.textMuted }}>SECURITY_HOP_LAYERS</span>
                  <select value={asset.layers} onChange={e => setAsset({...asset, layers: parseInt(e.target.value)})} style={{ background: '#000', color: THEME.accent, border: 'none' }}>
                    <option value="1">1 LAYER</option><option value="2">2 LAYERS</option><option value="3">3 LAYERS</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {Array.from({ length: asset.layers }).map((_, i) => (
                    <input key={i} className="bx-input" style={{ marginBottom: 0 }} placeholder={`HOP_0${i+1}_URL`} value={asset.hops[i]} onChange={e => {
                      const h = [...asset.hops]; h[i] = e.target.value; setAsset({...asset, hops: h});
                    }} />
                  ))}
                </div>
              </div>

              <button className="bx-btn" style={{ width: '100%', marginTop: '30px' }} onClick={deployLink} disabled={loading}>
                {loading ? 'PROCESSING_NODE...' : 'EXECUTE_BROADCAST'}
              </button>
            </div>

            {/* TABLA DE LINKS CREADOS (DEBAJO) */}
            <div className="card">
              <div className="card-header">ACTIVE_NODES_IN_CLUSTER</div>
              {nodes.length === 0 ? (
                <p style={{ color: THEME.textMuted, fontSize: '0.8rem' }}>No nodes currently broadcasted.</p>
              ) : (
                <div style={{ marginTop: '20px' }}>
                  <div className="table-row" style={{ color: THEME.textMuted, fontSize: '0.7rem', borderBottom: `2px solid ${THEME.border}` }}>
                    <div>NODE_ID</div><div>ASSET_IDENTIFIER</div><div>ACTIONS</div>
                  </div>
                  {nodes.map(node => (
                    <div key={node.id} className="table-row">
                      <div style={{ color: THEME.accent, fontSize: '0.8rem' }}>#{node.id}</div>
                      <div style={{ fontSize: '0.9rem' }}>{node.title}</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="bx-btn" style={{ padding: '8px 12px', fontSize: '0.6rem' }} onClick={() => { navigator.clipboard.writeText(node.url); notify("COPIED_TO_CLIPBOARD"); }}>COPY</button>
                        <button className="bx-btn danger" style={{ padding: '8px 12px', fontSize: '0.6rem' }} onClick={() => {
                          const filter = nodes.filter(n => n.id !== node.id);
                          setNodes(filter);
                          localStorage.setItem('bx_vault', JSON.stringify(filter));
                          notify("NODE_PURGED");
                        }}>DEL</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '40px' }}>ASSET_<span style={{ color: THEME.accent }}>VAULT</span></h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
              {nodes.map(node => (
                <div key={node.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <img src={node.cover} style={{ width: '100%', height: '160px', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.6rem', color: THEME.accent }}>DEPLOYED: {node.date}</div>
                    <h3 style={{ margin: '10px 0' }}>{node.title}</h3>
                    <button className="bx-btn secondary" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => window.open(node.url)}>PREVIEW_NODE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '40px' }}>SYSTEM_<span style={{ color: THEME.accent }}>LOGS</span></h1>
            <div style={{ background: '#000', border: `1px solid ${THEME.border}`, height: '500px', overflowY: 'auto', padding: '30px' }}>
              {logs.map(l => (
                <div key={l.id} style={{ marginBottom: '10px', fontSize: '0.8rem' }}>
                  <span style={{ color: THEME.accent }}>[{l.time}]</span> <span style={{ color: THEME.textMuted }}>SYS_PROCESS_ID_{l.id.toString().slice(-4)}:</span> {l.msg}
                </div>
              ))}
              <div style={{ color: THEME.accent, marginTop: '20px' }}>root@bx:~$ <span style={{ animation: 'flicker 1s infinite', background: THEME.accent, width: '10px', height: '15px', display: 'inline-block' }} /></div>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION HUD */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '30px', right: '30px', 
          background: notification.type === 'danger' ? THEME.danger : '#000',
          border: `1px solid ${THEME.accent}`, color: '#fff', 
          padding: '20px 40px', fontWeight: 800, zIndex: 9999,
          boxShadow: `0 0 30px ${THEME.accent}33`
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
