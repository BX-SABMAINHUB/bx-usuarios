import React, { useState, useEffect, useCallback } from 'react';

/**
 * BX - PREMIUM CONTENT LOCKING ARCHITECTURE
 * VERSION: 15.4.0
 * DESIGN: LOOTLABS ELITE (MODERN SLATE/INDIGO)
 * FLOW: GMAIL -> OTP -> PIN -> LOGIN
 */

export default function BXPlatform() {
  // --- [SYSTEM STATE ENGINE] ---
  const [view, setView] = useState('landing'); // landing, register, otp_verify, pin_setup, login, dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });

  // --- [IDENTITY MANAGEMENT] ---
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [GENERATOR CORE] ---
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [layers, setLayers] = useState(1);
  const [hops, setHops] = useState(['', '', '']);
  const [links, setLinks] = useState([]);
  
  // --- [ADVANCED CONFIGURATION] ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [defaultExpiry, setDefaultExpiry] = useState('never');
  const [stealthMode, setStealthMode] = useState(false);
  const [linkAlias, setLinkAlias] = useState('');
  const [requireCaptcha, setRequireCaptcha] = useState(true);

  // --- [DESIGN TOKENS] ---
  const theme = {
    primary: '#6366f1', // Indigo Vibrant
    primaryHover: '#4f46e5',
    bg: '#0f172a',
    card: '#1e293b',
    cardAlt: '#334155',
    border: '#334155',
    text: '#f8fafc',
    muted: '#94a3b8',
    success: '#22c55e',
    error: '#f43f5e',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  // --- [LIFECYCLE & PERSISTENCE] ---
  useEffect(() => {
    const savedLinks = localStorage.getItem('bx_vault_v15');
    if (savedLinks) setLinks(JSON.parse(savedLinks));

    const session = localStorage.getItem('bx_active_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }
  }, []);

  const notify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 4500);
  };

  // --- [REGISTRATION PROTOCOL] ---
  const handleRegisterEmail = async () => {
    if (!email.includes('@')) return notify("Invalid email format", "error");
    
    setLoading(true);
    // Simulate API Call to send Gmail OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    // LOGGING TO CONSOLE FOR DEV - In production, this goes to Gmail API
    console.log(`[BX SERVER] Sending OTP ${code} to ${email}`);

    setTimeout(() => {
      setLoading(false);
      setView('otp_verify');
      notify("Verification code dispatched to Gmail", "success");
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      notify("Identity verified. Setup your security PIN.");
    } else {
      notify("Invalid code. Check your Gmail inbox.", "error");
    }
  };

  const handlePinSetup = () => {
    if (pin.length < 4) return notify("PIN must be 4+ digits", "error");
    
    const operators = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    if (operators.find(o => o.email === email)) {
      notify("User already exists", "error");
      setView('landing');
      return;
    }

    operators.push({ email, pin });
    localStorage.setItem('bx_operators', JSON.stringify(operators));
    
    notify("Account provisioned. Please log in.", "success");
    setView('landing'); // Return to Home as requested
  };

  // --- [LOGIN PROTOCOL] ---
  const handleLogin = () => {
    const operators = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    const user = operators.find(o => o.email === email && o.pin === pin);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_active_session', JSON.stringify(user));
      setView('dashboard');
      notify("Authorized Access Granted", "success");
    } else {
      notify("Invalid Credentials", "error");
    }
  };

  // --- [DEPLOYMENT ENGINE] ---
  const deployLinkNode = () => {
    if (!title || !target) return notify("Primary fields missing", "error");
    
    setLoading(true);
    setTimeout(() => {
      const payload = {
        t: title,
        d: target,
        i: thumbnail || 'https://via.placeholder.com/300x200?text=BX+Asset',
        s: hops.slice(0, layers).filter(h => h !== ''),
        m: isMaintenance
      };

      const encrypted = btoa(JSON.stringify(payload));
      const finalUrl = `${window.location.origin}/unlock?bx_id=${encrypted}`;

      const newNode = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        title,
        url: finalUrl,
        layers,
        clicks: 0,
        created: new Date().toLocaleDateString(),
        expiry: defaultExpiry
      };

      const updated = [newNode, ...links];
      setLinks(updated);
      localStorage.setItem('bx_vault_v15', JSON.stringify(updated));
      
      // Reset Form
      setTitle(''); setTarget(''); setThumbnail(''); setHops(['', '', '']);
      setLoading(false);
      notify("Link node deployed successfully", "success");
    }, 1500);
  };

  const deleteNode = (id) => {
    const filtered = links.filter(l => l.id !== id);
    setLinks(filtered);
    localStorage.setItem('bx_vault_v15', JSON.stringify(filtered));
    notify("Node purged from vault", "info");
  };

  // --- [STYLES] ---
  const inputBase = {
    width: '100%',
    padding: '16px',
    background: '#0f172a',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    marginBottom: '16px'
  };

  const buttonBase = (bgColor = theme.primary) => ({
    width: '100%',
    padding: '16px',
    background: bgColor,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'transform 0.1s active',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  });

  // --- [VIEW: PUBLIC INTERFACES] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          .auth-card { background: ${theme.card}; padding: 48px; border-radius: 32px; width: 100%; maxWidth: 460px; border: 1px solid ${theme.border}; box-shadow: ${theme.shadow}; }
          .logo { font-size: 56px; font-weight: 800; color: ${theme.primary}; margin: 0; letter-spacing: -3px; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div className="auth-card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="logo">BX</h1>
            <p style={{ color: theme.muted, fontWeight: '600' }}>{view === 'landing' ? 'Advanced Distribution Platform' : 'Secure Authorization'}</p>
          </div>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button style={buttonBase()} onClick={() => setView('register')}>Create Account</button>
              <button style={{ ...buttonBase('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Operator Login</button>
              <p style={{ fontSize: '12px', color: theme.muted, textAlign: 'center', marginTop: '20px' }}>Protected by BX Encryption Engine v15</p>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <label style={{ fontSize: '13px', color: theme.muted, marginBottom: '8px', display: 'block' }}>GMAIL ACCOUNT</label>
              <input style={inputBase} type="email" placeholder="example@gmail.com" onChange={e => setEmail(e.target.value)} />
              <button style={buttonBase()} onClick={handleRegisterEmail} disabled={loading}>{loading ? 'Dispatched Code...' : 'Send Verification'}</button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '14px', marginTop: '24px', cursor: 'pointer' }} onClick={() => setView('landing')}>Cancel</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <h3 style={{ marginBottom: '10px' }}>Enter Code</h3>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '24px' }}>Input the 6-digit code sent to your Gmail.</p>
              <input style={{ ...inputBase, textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }} maxLength={6} onChange={e => setOtpInput(e.target.value)} />
              <button style={buttonBase()} onClick={handleVerifyOtp}>Verify Identity</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <h3 style={{ marginBottom: '10px' }}>Secure Your Account</h3>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '24px' }}>Create a Master PIN for future logins.</p>
              <input style={{ ...inputBase, textAlign: 'center' }} type="password" placeholder="****" maxLength={8} onChange={e => setPin(e.target.value)} />
              <button style={buttonBase()} onClick={handlePinSetup}>Finish Registration</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={inputBase} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
              <input style={inputBase} type="password" placeholder="Master PIN" onChange={e => setPin(e.target.value)} />
              <button style={buttonBase()} onClick={handleLogin}>Authorize</button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '14px', marginTop: '24px', cursor: 'pointer' }} onClick={() => setView('landing')}>Back</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [VIEW: DASHBOARD (LOOTLABS STYLE)] ---
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', color: theme.text, fontFamily: '"Inter", sans-serif' }}>
      <style>{`
        .sidebar-item { padding: 16px 24px; border-radius: 12px; cursor: pointer; color: ${theme.muted}; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 12px; margin-bottom: 6px; border: none; background: transparent; width: 100%; text-align: left; }
        .sidebar-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .sidebar-item.active { background: ${theme.primary}15; color: ${theme.primary}; }
        .glass-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 24px; padding: 32px; }
        .table-row { transition: background 0.2s; }
        .table-row:hover { background: rgba(255,255,255,0.02); }
        .badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
      `}</style>

      {/* NAVIGATION BAR */}
      <div style={{ width: '320px', borderRight: `1px solid ${theme.border}`, padding: '48px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: theme.primary, marginBottom: '48px', paddingLeft: '24px' }}>BX</h1>
        
        <nav style={{ flex: 1 }}>
          <button className={`sidebar-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>New Link</button>
          <button className={`sidebar-item ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>Vault</button>
          <button className={`sidebar-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Settings</button>
        </nav>

        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: theme.muted, marginBottom: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>LOGGED_IN_AS</div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          <button 
            style={{ color: theme.error, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', padding: 0 }}
            onClick={() => { localStorage.removeItem('bx_active_session'); window.location.reload(); }}
          >Terminate Session</button>
        </div>
      </div>

      {/* CONTENT ENGINE */}
      <div style={{ flex: 1, padding: '64px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div className="fade-in" style={{ maxWidth: '960px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Deploy New Link Node</h2>
            <p style={{ color: theme.muted, marginBottom: '48px' }}>Encrypt your content behind high-performance redirection layers.</p>

            <div className="glass-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: theme.muted, marginBottom: '10px', display: 'block' }}>ASSET TITLE</label>
                  <input style={inputBase} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Exclusive Lightroom Presets" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: theme.muted, marginBottom: '10px', display: 'block' }}>THUMBNAIL URL</label>
                  <input style={inputBase} value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '700', color: theme.muted, marginBottom: '10px', display: 'block' }}>DESTINATION TARGET</label>
              <input style={inputBase} value={target} onChange={e => setTarget(e.target.value)} placeholder="https://drive.google.com/..." />

              <div style={{ background: theme.bg, padding: '32px', borderRadius: '20px', border: `1px solid ${theme.border}`, marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Traffic Flow Security</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>Each layer adds a mandatory 30-second verification delay.</p>
                  </div>
                  <select 
                    value={layers} 
                    onChange={e => setLayers(parseInt(e.target.value))}
                    style={{ background: theme.card, color: 'white', border: `1px solid ${theme.border}`, padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}
                  >
                    <option value="1">1 Verification Layer</option>
                    <option value="2">2 Verification Layers</option>
                    <option value="3">3 Verification Layers</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layers}, 1fr)`, gap: '20px' }}>
                  {Array.from({ length: layers }).map((_, i) => (
                    <input 
                      key={i} 
                      style={{ ...inputBase, marginBottom: 0 }} 
                      placeholder={`Security Step 0${i+1} URL`} 
                      value={hops[i]} 
                      onChange={e => {
                        const h = [...hops]; h[i] = e.target.value; setHops(h);
                      }}
                    />
                  ))}
                </div>
              </div>

              <button 
                style={{ ...buttonBase(), marginTop: '40px', height: '64px', fontSize: '16px' }}
                onClick={deployLinkNode}
                disabled={loading}
              >
                {loading ? 'Encrypting Node...' : 'Initialize Link Deployment'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Asset Vault</h2>
            <p style={{ color: theme.muted, marginBottom: '48px' }}>Manage and monitor your active distribution nodes.</p>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '24px', fontSize: '12px', color: theme.muted }}>NODE ID</th>
                    <th style={{ padding: '24px', fontSize: '12px', color: theme.muted }}>ASSET TITLE</th>
                    <th style={{ padding: '24px', fontSize: '12px', color: theme.muted }}>SECURITY</th>
                    <th style={{ padding: '24px', fontSize: '12px', color: theme.muted }}>DATE</th>
                    <th style={{ padding: '24px', fontSize: '12px', color: theme.muted }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(node => (
                    <tr key={node.id} className="table-row">
                      <td style={{ padding: '24px', fontWeight: '800', color: theme.primary }}>#{node.id}</td>
                      <td style={{ padding: '24px', fontWeight: '600' }}>{node.title}</td>
                      <td style={{ padding: '24px' }}>
                        <span className="badge" style={{ background: `${theme.primary}20`, color: theme.primary }}>
                          {node.layers} LAYERS
                        </span>
                      </td>
                      <td style={{ padding: '24px', color: theme.muted, fontSize: '13px' }}>{node.created}</td>
                      <td style={{ padding: '24px', display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(node.url); notify("Copied to clipboard"); }}
                          style={{ padding: '10px 20px', background: theme.cardAlt, border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Copy URL</button>
                        <button 
                          onClick={() => deleteNode(node.id)}
                          style={{ padding: '10px 20px', background: `${theme.error}15`, border: 'none', color: theme.error, borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Purge</button>
                      </td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '80px', textAlign: 'center', color: theme.muted }}>No nodes active in the current sector.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="fade-in" style={{ maxWidth: '680px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '48px' }}>System Configuration</h2>
            
            <div className="glass-card">
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Platform Logic
                </h4>
                <div style={{ background: theme.bg, padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>Globally disable all active link redirects.</div>
                  </div>
                  <input type="checkbox" checked={isMaintenance} onChange={e => setIsMaintenance(e.target.checked)} style={{ width: '24px', height: '24px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ marginBottom: '16px' }}>Link Defaults</h4>
                <select style={inputBase} value={defaultExpiry} onChange={e => setDefaultExpiry(e.target.value)}>
                  <option value="never">Permanent Storage</option>
                  <option value="24h">Self-Destruct in 24h</option>
                  <option value="7d">Self-Destruct in 7 Days</option>
                </select>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                  <input type="checkbox" checked={requireCaptcha} onChange={e => setRequireCaptcha(e.target.checked)} />
                  <span style={{ fontSize: '14px' }}>Force anti-bot CAPTCHA on all nodes</span>
                </div>
              </div>

              <button style={buttonBase()} onClick={() => notify("Core configurations synced", "success")}>Save System Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION HUB */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '48px', right: '48px', 
          background: notification.type === 'error' ? theme.error : theme.primary, 
          color: 'white', padding: '20px 40px', borderRadius: '20px', 
          fontWeight: '800', zIndex: 99999, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification.msg.toUpperCase()}
        </div>
      )}
    </div>
  );
}

