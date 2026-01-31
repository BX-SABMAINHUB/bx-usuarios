import React, { useState, useEffect, useCallback } from 'react';

/**
 * BX-NEXUS COMMAND CENTER v12.0.4 - ELITE EDITION
 * ARCHITECTURE: MONOLITHIC DASHBOARD + ANALYTICS + NODE DEPLOYER
 * SCOPE: FULL CONTROL & GMAIL BOT INTEGRATION
 */

const THEME = {
  bg: '#010409',
  card: 'rgba(13, 17, 23, 0.98)',
  border: '#30363d',
  accent: '#00d2ff',
  success: '#238636',
  danger: '#da3633',
  text: '#f0f6fc',
  muted: '#8b949e',
  glass: 'backdrop-filter: blur(25px);'
};

export default function BxNexusDashboard() {
  // --- [SISTEMA DE ESTADOS DINÁMICOS] ---
  const [view, setView] = useState('deployment');
  const [authStep, setAuthStep] = useState('gateway');
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });
  
  // --- [BASE DE DATOS Y USUARIOS] ---
  const [operator, setOperator] = useState({ email: '', pin: '' });
  const [dbLinks, setDbLinks] = useState([]);
  const [dbOperators, setDbOperators] = useState([]);
  const [logs, setLogs] = useState([]);

  // --- [MOTOR DE CREACIÓN DE ASSETS] ---
  const [asset, setAsset] = useState({
    title: '',
    target: '',
    cover: '',
    layers: 1,
    redirects: ['', '', ''],
    category: 'General'
  });

  // --- [ANALÍTICAS EN VIVO] ---
  const [stats, setStats] = useState({ clicks: 0, nodes: 0, uptime: '99.9%' });

  // --- [EFECTOS DE INICIALIZACIÓN] ---
  useEffect(() => {
    const rawLinks = localStorage.getItem('bx_db_links');
    const rawOps = localStorage.getItem('bx_db_ops');
    const session = localStorage.getItem('bx_active_session');

    if (rawLinks) setDbLinks(JSON.parse(rawLinks));
    if (rawOps) setDbOperators(JSON.parse(rawOps));
    if (session) {
      setOperator(JSON.parse(session));
      setIsLogged(true);
    }
    
    pushLog("System kernel initialized...");
    pushLog("Network handshake successful.");
  }, []);

  // --- [LÓGICA DE NOTIFICACIONES] ---
  const notify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 5000);
  };

  const pushLog = (msg) => {
    const entry = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setLogs(prev => [entry, ...prev].slice(0, 50));
  };

  // --- [COMUNICACIÓN CON GMAIL API] ---
  const triggerGmailBot = async (target, code) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target, type: 'verification', code })
      });
      const result = await response.json();
      return result.success;
    } catch (e) {
      pushLog("CRITICAL: Gmail Bot connection failed.");
      return false;
    }
  };

  // --- [GESTIÓN DE DESPLIEGUE] ---
  const handleDeploy = useCallback(() => {
    if (!asset.title || !asset.target) {
      notify("ERROR: FIELD VALIDATION FAILED", "danger");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      const payload = {
        title: asset.title,
        target: asset.target,
        image: asset.cover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        steps: asset.redirects.slice(0, asset.layers).filter(u => u !== '')
      };

      const hash = btoa(JSON.stringify(payload));
      const nodeUrl = `${window.location.origin}/unlock?payload=${hash}`;

      const newNode = {
        id: Math.random().toString(36).substr(2, 8).toUpperCase(),
        ...asset,
        url: nodeUrl,
        date: new Date().toLocaleString(),
        clicks: 0
      };

      const updated = [newNode, ...dbLinks];
      setDbLinks(updated);
      localStorage.setItem('bx_db_links', JSON.stringify(updated));
      
      setAsset({ ...asset, title: '', target: '', cover: '' });
      setLoading(false);
      notify("NODE DEPLOYED SUCCESSFULLY", "success");
      pushLog(`Node ${newNode.id} broadcasted to global CDN.`);
    }, 2000);
  }, [asset, dbLinks]);

  // --- [ESTILOS GLOBALES] ---
  const globalStyles = (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;800&family=Inter:wght@300;400;900&display=swap');
      * { box-sizing: border-box; font-family: 'Inter', sans-serif; transition: all 0.25s ease; }
      body { background: ${THEME.bg}; color: ${THEME.text}; margin: 0; overflow-x: hidden; }
      .glass { background: ${THEME.card}; border: 1px solid ${THEME.border}; border-radius: 24px; }
      .btn-primary { background: ${THEME.accent}; color: black; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
      .btn-primary:hover { transform: scale(1.02); box-shadow: 0 0 30px ${THEME.accent}66; }
      .bx-input { background: #0d1117; border: 1px solid ${THEME.border}; color: white; padding: 16px; border-radius: 12px; width: 100%; outline: none; font-size: 0.95rem; }
      .bx-input:focus { border-color: ${THEME.accent}; box-shadow: 0 0 15px ${THEME.accent}22; }
      .sidebar-btn { width: 100%; padding: 18px; border: none; background: transparent; color: ${THEME.muted}; text-align: left; cursor: pointer; font-weight: 700; border-radius: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
      .sidebar-btn.active { background: ${THEME.accent}15; color: ${THEME.accent}; }
      .stat-card { padding: 30px; text-align: center; border-right: 1px solid ${THEME.border}; }
      .stat-card:last-child { border: none; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      .live-indicator { width: 10px; height: 10px; background: #3fb950; border-radius: 50%; animation: pulse 2s infinite; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 10px; }
    `}} />
  );

  // --- [INTERFAZ DE LOGIN] ---
  if (!isLogged) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {globalStyles}
        <div className="glass" style={{ width: '450px', padding: '60px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '60px', height: '60px', background: THEME.accent, borderRadius: '18px', margin: '0 auto 20px', boxShadow: `0 0 40px ${THEME.accent}55` }}></div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>BX-NEXUS</h1>
            <p style={{ color: THEME.muted, fontSize: '0.9rem' }}>SECURITY_PROTOCOL_VERSION_12.0</p>
          </div>

          {authStep === 'gateway' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button className="btn-primary" onClick={() => setAuthStep('login')}>ACCESS SYSTEM</button>
              <button className="btn-primary" style={{ background: 'transparent', color: 'white', border: `1px solid ${THEME.border}` }} onClick={() => setAuthStep('reg')}>REGISTER NODE</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input className="bx-input" placeholder="Operator Email" onChange={(e) => setOperator({ ...operator, email: e.target.value })} />
              <input className="bx-input" placeholder="Secure PIN" type="password" onChange={(e) => setOperator({ ...operator, pin: e.target.value })} />
              <button className="btn-primary" onClick={() => {
                if (authStep === 'reg') {
                  const news = [...dbOperators, operator];
                  setDbOperators(news);
                  localStorage.setItem('bx_db_ops', JSON.stringify(news));
                  setAuthStep('login');
                  notify("OPERATOR REGISTERED", "success");
                } else {
                  const exist = dbOperators.find(o => o.email === operator.email && o.pin === operator.pin);
                  if (exist) {
                    setIsLogged(true);
                    localStorage.setItem('bx_active_session', JSON.stringify(operator));
                    notify("WELCOME BACK OPERATOR", "success");
                  } else {
                    notify("INVALID CREDENTIALS", "danger");
                  }
                }
              }}>{authStep === 'reg' ? 'CREATE IDENTITY' : 'START SESSION'}</button>
              <span onClick={() => setAuthStep('gateway')} style={{ textAlign: 'center', color: THEME.muted, fontSize: '0.8rem', cursor: 'pointer' }}>Return to Gateway</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [INTERFAZ DEL DASHBOARD] ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {globalStyles}
      {/* NAVEGACIÓN LATERAL */}
      <div style={{ width: '300px', background: '#020617', borderRight: `1px solid ${THEME.border}`, padding: '50px 25px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
          <div style={{ width: '35px', height: '35px', background: THEME.accent, borderRadius: '8px' }}></div>
          <span style={{ fontWeight: '900', fontSize: '1.4rem' }}>BX-CORE</span>
        </div>

        <button onClick={() => setView('deployment')} className={`sidebar-btn ${view === 'deployment' ? 'active' : ''}`}><span>📡</span> Link Deployer</button>
        <button onClick={() => setView('database')} className={`sidebar-btn ${view === 'database' ? 'active' : ''}`}><span>📂</span> Asset Database</button>
        <button onClick={() => setView('terminal')} className={`sidebar-btn ${view === 'terminal' ? 'active' : ''}`}><span>💻</span> Root Terminal</button>
        
        <div style={{ marginTop: 'auto', padding: '20px', background: '#0d1117', borderRadius: '15px', border: `1px solid ${THEME.border}` }}>
          <div style={{ fontSize: '0.7rem', color: THEME.muted }}>SESSION_ACTIVE</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '15px' }}>{operator.email}</div>
          <button onClick={() => { localStorage.removeItem('bx_active_session'); window.location.reload(); }} style={{ width: '100%', padding: '10px', background: THEME.danger, border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {view === 'deployment' && (
            <div style={{ animation: 'open 0.6s ease' }}>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '1000', marginBottom: '10px', letterSpacing: '-2px' }}>Cloud <span style={{ color: THEME.accent }}>Deployment</span></h1>
              <p style={{ color: THEME.muted, marginBottom: '50px' }}>Securely package and distribute assets through our global CDN nodes.</p>

              <div className="glass" style={{ padding: '45px', marginBottom: '50px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: THEME.muted, marginBottom: '10px', display: 'block' }}>ASSET_LABEL</label>
                    <input className="bx-input" placeholder="e.g. Premium Graphics Pack" value={asset.title} onChange={(e) => setAsset({...asset, title: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: THEME.muted, marginBottom: '10px', display: 'block' }}>THUMBNAIL_URL</label>
                    <input className="bx-input" placeholder="https://image.host/img.jpg" value={asset.cover} onChange={(e) => setAsset({...asset, cover: e.target.value})} />
                  </div>
                </div>

                <label style={{ fontSize: '0.8rem', color: THEME.muted, marginBottom: '10px', display: 'block' }}>DESTINATION_TARGET (THE ASSET)</label>
                <input className="bx-input" style={{ marginBottom: '40px' }} placeholder="https://mediafire.com/file_id" value={asset.target} onChange={(e) => setAsset({...asset, target: e.target.value})} />

                <div style={{ background: '#020617', padding: '35px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>GATEWAY ARCHITECTURE</span>
                    <select value={asset.layers} onChange={(e) => setAsset({...asset, layers: parseInt(e.target.value)})} style={{ background: '#0d1117', color: 'white', border: `1px solid ${THEME.accent}`, padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold' }}>
                      <option value="1">1 SECURITY LAYER</option>
                      <option value="2">2 SECURITY LAYERS</option>
                      <option value="3">3 SECURITY LAYERS</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    {Array.from({ length: asset.layers }).map((_, i) => (
                      <input key={i} className="bx-input" placeholder={`Redirect URL ${i+1}`} value={asset.redirects[i]} onChange={(e) => {
                        const r = [...asset.redirects];
                        r[i] = e.target.value;
                        setAsset({...asset, redirects: r});
                      }} />
                    ))}
                  </div>
                </div>

                <button className="btn-primary" onClick={handleDeploy} disabled={loading} style={{ width: '100%', marginTop: '40px', padding: '25px', fontSize: '1.2rem' }}>
                  {loading ? 'CALCULATING NODE HASH...' : 'EXECUTE BROADCAST'}
                </button>
              </div>

              {/* TABLA DE NODOS RECIENTES */}
              <div className="glass" style={{ padding: '40px' }}>
                <h2 style={{ margin: '0 0 30px 0' }}>Active Node Cluster</h2>
                {dbLinks.length === 0 ? (
                  <p style={{ color: THEME.muted }}>No nodes active in the current session.</p>
                ) : (
                  dbLinks.slice(0, 5).map(link => (
                    <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#0d1117', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${THEME.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: THEME.accent, color: 'black', fontWeight: '900', padding: '10px', borderRadius: '8px', fontSize: '0.7rem' }}>{link.id}</div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{link.title}</div>
                          <div style={{ fontSize: '0.75rem', color: THEME.muted }}>{link.date}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(link.url); notify("COPIED TO CLIPBOARD"); }} style={{ padding: '10px 20px', background: '#21262d', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>COPY_URL</button>
                        <button onClick={() => {
                          const n = dbLinks.filter(x => x.id !== link.id);
                          setDbLinks(n);
                          localStorage.setItem('bx_db_links', JSON.stringify(n));
                        }} style={{ padding: '10px', background: 'rgba(218, 54, 51, 0.1)', border: '1px solid #da3633', color: '#da3633', borderRadius: '8px', cursor: 'pointer' }}>DEL</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === 'database' && (
            <div style={{ animation: 'open 0.6s ease' }}>
              <h1>Asset <span style={{ color: THEME.accent }}>Inventory</span></h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginTop: '40px' }}>
                {dbLinks.map(link => (
                  <div key={link.id} className="glass" style={{ padding: '25px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 15px', background: THEME.accent, color: 'black', fontSize: '0.7rem', fontWeight: '900' }}>ACTIVE</div>
                    <img src={link.cover} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '15px', marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0' }}>{link.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: THEME.muted, marginBottom: '20px' }}>Deployed on {link.date}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }} onClick={() => { navigator.clipboard.writeText(link.url); notify("COPIED"); }}>GET LINK</button>
                      <button className="btn-primary" style={{ background: '#21262d', color: 'white', flex: 1, padding: '12px', fontSize: '0.8rem' }} onClick={() => window.open(link.target, '_blank')}>TEST TARGET</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'terminal' && (
            <div style={{ animation: 'open 0.6s ease' }}>
              <h1>Root <span style={{ color: THEME.accent }}>Terminal</span></h1>
              <div className="glass" style={{ background: 'black', padding: '30px', marginTop: '40px', height: '500px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: THEME.accent }}>[{log.time}]</span> <span style={{ color: '#555' }}>root@nexus:~#</span> <span style={{ color: '#e6edf3' }}>{log.msg}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <span style={{ color: THEME.accent }}>root@nexus:~#</span>
                  <input style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', flex: 1, fontFamily: 'JetBrains Mono' }} autoFocus onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      pushLog(e.target.value);
                      if (e.target.value === 'clear') setLogs([]);
                      e.target.value = '';
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SISTEMA DE NOTIFICACIONES */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: notification.type === 'danger' ? THEME.danger : '#0d1117',
          border: `1px solid ${notification.type === 'danger' ? '#f85149' : THEME.accent}`,
          padding: '20px 40px', borderRadius: '15px', fontWeight: 'bold', color: 'white', 
          zIndex: 10000, boxShadow: `0 10px 40px rgba(0,0,0,0.5)`, animation: 'open 0.3s ease'
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
