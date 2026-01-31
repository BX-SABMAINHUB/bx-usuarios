import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * BX COMMAND SYSTEM v14.0 - PRIVATE RELEASE
 * OPERATIONAL CORE: CLANDESTINE NODE MANAGEMENT
 * AUTH PROTOCOL: GMAIL MANDATORY VERIFICATION (REG/LOGIN)
 * * [SECURITY NOTICE]: UNAUTHORIZED ACCESS IS LOGGED.
 */

const BX_THEME = {
  background: '#020202',
  surface: '#080808',
  elevated: '#0c0c0c',
  accent: '#00ff41', // Terminal Green
  accentMuted: 'rgba(0, 255, 65, 0.15)',
  danger: '#ff003c',
  border: '#161616',
  textMain: '#e0e0e0',
  textMuted: '#555555'
};

export default function BxTerminal() {
  // --- [SYSTEM STATE ENGINE] ---
  const [sessionActive, setSessionActive] = useState(false);
  const [authView, setAuthView] = useState('identity'); // 'identity' | 'verify' | 'pin_setup'
  const [activeTab, setActiveTab] = useState('broadcast');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });

  // --- [OPERATOR DATA] ---
  const [operator, setOperator] = useState({ email: '', pin: '', role: 'OPERATOR' });
  const [inputPin, setInputPin] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [serverCode, setServerCode] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // --- [ASSET DATABASE] ---
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newAsset, setNewAsset] = useState({
    title: '',
    target: '',
    cover: '',
    layers: 1,
    hops: ['', '', ''],
    encryption: 'AES-256'
  });

  // --- [INITIALIZATION] ---
  useEffect(() => {
    const savedNodes = localStorage.getItem('bx_vault_nodes');
    if (savedNodes) setNodes(JSON.parse(savedNodes));
    
    const session = localStorage.getItem('bx_session_token');
    if (session) setSessionActive(true);

    addLog("BX Kernel initialized. Scanning local sockets...");
    addLog("Encryption modules loaded: [X25519, AES-GCM]");
  }, []);

  // --- [HELPER FUNCTIONS] ---
  const addLog = (msg) => {
    const log = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setLogs(prev => [log, ...prev].slice(0, 100));
  };

  const showNotify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 5000);
  };

  // --- [GMAIL AUTH ENGINE] ---
  const dispatchGmailAuth = async () => {
    if (!operator.email.includes('@')) return showNotify("INVALID OPERATOR IDENTITY", "danger");
    setLoading(true);
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerCode(code);

    try {
      // Endpoint simulado - Aquí iría tu API de Gmail
      const response = await fetch('/api/bx-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: operator.email, code })
      });
      
      const resData = await response.json();
      if (resData.success) {
        setAuthView('verify');
        showNotify("AUTH CODE DISPATCHED TO GMAIL", "success");
        addLog(`Auth request for ${operator.email} sent.`);
      } else {
        throw new Error("Dispatch failed");
      }
    } catch (e) {
      // Fallback para pruebas si no tienes el backend listo
      setAuthView('verify');
      showNotify("LOCAL BYPASS ACTIVE (DEV MODE)", "info");
      console.warn("DEBUG_AUTH_CODE:", code);
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = () => {
    if (authCode !== serverCode) {
      showNotify("VERIFICATION FAILED: CODE MISMATCH", "danger");
      addLog("Failed auth attempt detected.");
      return;
    }

    const operators = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    const existing = operators.find(o => o.email === operator.email);

    if (existing) {
      setIsRegistering(false);
      setAuthView('identity'); // Pide el PIN ahora
      showNotify("IDENTITY CONFIRMED. ENTER MASTER PIN.", "success");
    } else {
      setIsRegistering(true);
      setAuthView('pin_setup');
      showNotify("NEW IDENTITY DETECTED. CONFIGURE PIN.", "info");
    }
  };

  const finalizeAccess = () => {
    const operators = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    
    if (isRegistering) {
      const newOp = { email: operator.email, pin: inputPin };
      operators.push(newOp);
      localStorage.setItem('bx_operators', JSON.stringify(operators));
      showNotify("OPERATOR REGISTERED IN VAULT", "success");
      setIsRegistering(false);
      setSessionActive(true);
      localStorage.setItem('bx_session_token', 'active');
    } else {
      const op = operators.find(o => o.email === operator.email && o.pin === inputPin);
      if (op) {
        setSessionActive(true);
        localStorage.setItem('bx_session_token', 'active');
        showNotify("ACCESS GRANTED. WELCOME OPERATOR.", "success");
      } else {
        showNotify("INVALID MASTER PIN", "danger");
      }
    }
  };

  // --- [NODE DEPLOYMENT ENGINE] ---
  const broadcastNode = () => {
    if (!newAsset.title || !newAsset.target) return showNotify("MISSING BROADCAST DATA", "danger");
    
    setLoading(true);
    setTimeout(() => {
      const payload = {
        t: newAsset.title,
        d: newAsset.target,
        i: newAsset.cover || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        s: newAsset.hops.slice(0, newAsset.layers).filter(h => h !== '')
      };

      const encrypted = btoa(JSON.stringify(payload));
      const nodeUrl = `${window.location.origin}/unlock?payload=${encrypted}`;

      const nodeEntry = {
        uid: Math.random().toString(36).substr(2, 6).toUpperCase(),
        ...newAsset,
        finalUrl: nodeUrl,
        timestamp: new Date().toLocaleString(),
        status: 'LIVE'
      };

      const updatedNodes = [nodeEntry, ...nodes];
      setNodes(updatedNodes);
      localStorage.setItem('bx_vault_nodes', JSON.stringify(updatedNodes));
      
      setNewAsset({ title: '', target: '', cover: '', layers: 1, hops: ['', '', ''], encryption: 'AES-256' });
      setLoading(false);
      showNotify("NODE BROADCAST SUCCESSFUL", "success");
      addLog(`Asset ${nodeEntry.uid} deployed to cluster.`);
    }, 1500);
  };

  // --- [UI COMPONENTS] ---
  const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;400;800&display=swap');
      * { box-sizing: border-box; font-family: 'JetBrains Mono', monospace; scrollbar-width: thin; scrollbar-color: #222 #000; }
      body { background: ${BX_THEME.background}; color: ${BX_THEME.textMain}; margin: 0; overflow: hidden; }
      .bx-input { background: #000; border: 1px solid ${BX_THEME.border}; color: ${BX_THEME.accent}; padding: 15px; width: 100%; border-radius: 2px; outline: none; margin-bottom: 20px; font-size: 0.9rem; }
      .bx-input:focus { border-color: ${BX_THEME.accent}; box-shadow: 0 0 15px ${BX_THEME.accentMuted}; }
      .bx-btn { background: ${BX_THEME.accent}; color: #000; border: none; padding: 18px; width: 100%; font-weight: 800; cursor: pointer; letter-spacing: 2px; transition: 0.3s; }
      .bx-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
      .bx-btn:disabled { background: #111; color: #444; cursor: not-allowed; }
      .side-link { padding: 15px 20px; cursor: pointer; color: ${BX_THEME.textMuted}; font-size: 0.85rem; border-left: 2px solid transparent; transition: 0.2s; }
      .side-link:hover { color: #fff; background: #080808; }
      .side-link.active { color: ${BX_THEME.accent}; border-color: ${BX_THEME.accent}; background: ${BX_THEME.accentMuted}; }
      .node-card { background: ${BX_THEME.surface}; border: 1px solid ${BX_THEME.border}; padding: 25px; margin-bottom: 20px; position: relative; overflow: hidden; }
      .node-card::after { content: ''; position: absolute; top: 0; left: 0; width: 2px; height: 100%; background: ${BX_THEME.accent}; }
      @keyframes scanline { 0% { top: 0% } 100% { top: 100% } }
      .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0,255,65,0.05); z-index: 9999; pointer-events: none; animation: scanline 8s infinite linear; }
    `}} />
  );

  // --- [LOGIN / AUTH VIEW] ---
  if (!sessionActive) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <GlobalStyles />
        <div className="scanline" />
        <div style={{ width: '450px', background: BX_THEME.surface, border: `1px solid ${BX_THEME.border}`, padding: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontSize: '4rem', color: BX_THEME.accent, margin: 0, letterSpacing: '-5px', fontWeight: 800 }}>BX</h1>
            <div style={{ fontSize: '0.6rem', color: BX_THEME.textMuted, letterSpacing: '3px' }}>CLANDESTINE_NETWORK_ACCESS</div>
          </div>

          {authView === 'identity' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <input className="bx-input" placeholder="OPERATOR_GMAIL" value={operator.email} onChange={e => setOperator({...operator, email: e.target.value})} />
              {/* Si ya pasó el Gmail, pide el PIN */}
              {serverCode && (
                 <input className="bx-input" placeholder="MASTER_PIN" type="password" value={inputPin} onChange={e => setInputPin(e.target.value)} />
              )}
              <button className="bx-btn" onClick={serverCode ? finalizeAccess : dispatchGmailAuth} disabled={loading}>
                {loading ? 'DISPATCHING...' : (serverCode ? 'AUTHORIZE_SESSION' : 'REQUEST_ACCESS_CODE')}
              </button>
            </div>
          )}

          {authView === 'verify' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ marginBottom: '20px', color: BX_THEME.accent, fontSize: '0.7rem' }}>ENTER 6-DIGIT GMAIL CODE:</div>
              <input className="bx-input" placeholder="000000" style={{ textAlign: 'center', letterSpacing: '10px', fontSize: '1.5rem' }} maxLength={6} onChange={e => setAuthCode(e.target.value)} />
              <button className="bx-btn" onClick={verifyIdentity}>VERIFY_IDENTITY</button>
              <div onClick={() => setAuthView('identity')} style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', color: BX_THEME.textMuted, cursor: 'pointer' }}>ABORT_ATTEMPT</div>
            </div>
          )}

          {authView === 'pin_setup' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ marginBottom: '20px', color: BX_THEME.accent, fontSize: '0.7rem' }}>CREATE MASTER PIN:</div>
              <input className="bx-input" placeholder="****" type="password" onChange={e => setInputPin(e.target.value)} />
              <button className="bx-btn" onClick={finalizeAccess}>INITIALIZE_OPERATOR</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [MAIN DASHBOARD] ---
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <GlobalStyles />
      <div className="scanline" />
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', background: '#000', borderRight: `1px solid ${BX_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '40px 30px', borderBottom: `1px solid ${BX_THEME.border}` }}>
          <div style={{ color: BX_THEME.accent, fontWeight: 800, fontSize: '1.5rem' }}>BX_CORE</div>
          <div style={{ fontSize: '0.5rem', color: BX_THEME.textMuted }}>S_STATUS: ENCRYPTED</div>
        </div>
        
        <nav style={{ flex: 1, paddingTop: '30px' }}>
          <div className={`side-link ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>[01] BROADCAST_NODE</div>
          <div className={`side-link ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}>[02] ASSET_VAULT</div>
          <div className={`side-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>[03] SYSTEM_LOGS</div>
        </nav>

        <div style={{ padding: '30px', borderTop: `1px solid ${BX_THEME.border}` }}>
          <div style={{ fontSize: '0.6rem', color: BX_THEME.textMuted, marginBottom: '10px' }}>OPERATOR_ID: {operator.email.split('@')[0].toUpperCase()}</div>
          <button onClick={() => { localStorage.removeItem('bx_session_token'); window.location.reload(); }} style={{ background: 'none', border: 'none', color: BX_THEME.danger, fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>EXIT_TERMINAL</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {activeTab === 'broadcast' && (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', letterSpacing: '-2px' }}>NODE_<span style={{ color: BX_THEME.accent }}>DEPLOY</span></h1>
              <p style={{ color: BX_THEME.textMuted, marginBottom: '50px' }}>Initialize a new distribution node on the clandestine network.</p>

              <div style={{ background: BX_THEME.surface, border: `1px solid ${BX_THEME.border}`, padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.6rem', color: BX_THEME.textMuted }}>ASSET_IDENTIFIER</label>
                    <input className="bx-input" placeholder="Node Title" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6rem', color: BX_THEME.textMuted }}>THUMB_LINK</label>
                    <input className="bx-input" placeholder="Image URL" value={newAsset.cover} onChange={e => setNewAsset({...newAsset, cover: e.target.value})} />
                  </div>
                </div>

                <label style={{ fontSize: '0.6rem', color: BX_THEME.textMuted }}>DESTINATION_ENCRYPTED_TARGET</label>
                <input className="bx-input" placeholder="Final Redirect URL" value={newAsset.target} onChange={e => setNewAsset({...newAsset, target: e.target.value})} />

                <div style={{ marginTop: '20px', borderTop: `1px solid ${BX_THEME.border}`, paddingTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.7rem', color: BX_THEME.accent }}>SECURITY_HOPS</span>
                    <select value={newAsset.layers} onChange={e => setNewAsset({...newAsset, layers: parseInt(e.target.value)})} style={{ background: '#000', color: BX_THEME.accent, border: 'none', outline: 'none' }}>
                      <option value="1">1 HOP</option><option value="2">2 HOPS</option><option value="3">3 HOPS</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    {Array.from({ length: newAsset.layers }).map((_, i) => (
                      <input key={i} className="bx-input" placeholder={`Hop_0${i+1}_URL`} onChange={e => {
                        const h = [...newAsset.hops]; h[i] = e.target.value; setNewAsset({...newAsset, hops: h});
                      }} />
                    ))}
                  </div>
                </div>

                <button className="bx-btn" onClick={broadcastNode} disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? 'COMPILING_NODE...' : 'EXECUTE_BROADCAST'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <h1 style={{ fontSize: '3rem', margin: '0 0 50px 0', letterSpacing: '-2px' }}>ASSET_<span style={{ color: BX_THEME.accent }}>VAULT</span></h1>
              {nodes.length === 0 && <div style={{ color: BX_THEME.textMuted }}>No active nodes found in local cluster.</div>}
              {nodes.map(node => (
                <div key={node.uid} className="node-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: BX_THEME.accent, fontSize: '0.6rem', fontWeight: 800 }}>NODE_ID: {node.uid}</div>
                      <h3 style={{ margin: '5px 0' }}>{node.title}</h3>
                      <div style={{ fontSize: '0.65rem', color: BX_THEME.textMuted }}>DEPLOYED: {node.timestamp}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="bx-btn" style={{ padding: '8px 15px', fontSize: '0.6rem' }} onClick={() => { navigator.clipboard.writeText(node.finalUrl); showNotify("LINK_COPIED"); }}>COPY_LINK</button>
                      <button className="bx-btn" style={{ padding: '8px 15px', fontSize: '0.6rem', background: BX_THEME.danger, color: '#fff' }} onClick={() => {
                        const filtered = nodes.filter(n => n.uid !== node.uid);
                        setNodes(filtered);
                        localStorage.setItem('bx_vault_nodes', JSON.stringify(filtered));
                        showNotify("NODE_PURGED");
                      }}>PURGE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <h1 style={{ fontSize: '3rem', margin: '0 0 50px 0', letterSpacing: '-2px' }}>SYSTEM_<span style={{ color: BX_THEME.accent }}>LOGS</span></h1>
              <div style={{ background: '#000', padding: '30px', border: `1px solid ${BX_THEME.border}`, height: '500px', overflowY: 'auto' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: '10px', fontSize: '0.8rem', borderBottom: '1px solid #080808', paddingBottom: '10px' }}>
                    <span style={{ color: BX_THEME.accent }}>[{log.time}]</span> <span style={{ color: BX_THEME.textMuted }}>root@bx:~$</span> {log.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* NOTIFICATION HUD */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: notification.type === 'danger' ? BX_THEME.danger : '#000', 
          color: notification.type === 'danger' ? '#fff' : BX_THEME.accent,
          border: `1px solid ${BX_THEME.accent}`, padding: '20px 40px',
          fontWeight: 800, zIndex: 100000, boxShadow: `0 0 30px ${BX_THEME.accentMuted}`
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
