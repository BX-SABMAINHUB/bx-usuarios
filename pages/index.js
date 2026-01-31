import React, { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * BX - PREMIUM CONTENT LOCKING ARCHITECTURE
 * VERSION: 12.0.0
 * DESIGN: LOOTLABS ELITE (MODERN SLATE/INDIGO)
 * FLOW: GMAIL -> OTP -> PIN -> LOGIN
 * -----------------------------------------------------------------------
 */

export default function BXCore() {
  // --- [CORE STATE ENGINE] ---
  const [view, setView] = useState('landing'); // landing, register, otp_verify, pin_setup, login, dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });

  // --- [AUTH & IDENTITY] ---
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [serverOtp, setServerOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [LINK GENERATOR & DATA] ---
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [layers, setLayers] = useState(1);
  const [hops, setHops] = useState(['', '', '']);
  const [links, setLinks] = useState([]);
  
  // --- [ADVANCED CONFIGURATION] ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultExpiry, setDefaultExpiry] = useState('never');
  const [aliasEnabled, setAliasEnabled] = useState(true);
  const [customAlias, setCustomAlias] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // --- [THEME DEFINITION] ---
  const theme = {
    primary: '#6366f1', // Indigo Vibrant
    primaryDark: '#4f46e5',
    bg: '#0f172a',
    card: '#1e293b',
    cardLight: '#334155',
    border: '#334155',
    text: '#f8fafc',
    muted: '#94a3b8',
    success: '#22c55e',
    error: '#f43f5e',
    accent: '#818cf8'
  };

  // --- [SYSTEM INITIALIZATION] ---
  useEffect(() => {
    // Load persisted data
    const savedLinks = localStorage.getItem('bx_vault_links');
    if (savedLinks) setLinks(JSON.parse(savedLinks));

    const session = localStorage.getItem('bx_auth_token');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }

    // Check for incoming payloads (Unlocker Mode)
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');
    if (payload) {
      handleUnlockerMode(payload);
    }
  }, []);

  const notify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 4500);
  };

  const handleUnlockerMode = (data) => {
    try {
      const decoded = JSON.parse(atob(data));
      // Logic for customer view could go here
      console.log("Entering Gateway for:", decoded.t);
    } catch (e) {
      notify("Invalid Encrypted Payload", "error");
    }
  };

  // --- [REGISTRATION FLOW: STEP 1 - EMAIL] ---
  const initiateRegistration = async () => {
    if (!email.includes('@')) return notify("Enter a valid Gmail address", "error");
    
    setLoading(true);
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(generatedCode);

    try {
      // API CALL SIMULATION (Your Nodemailer/API logic)
      console.log(`[BX_MAILER] Sending Code ${generatedCode} to ${email}`);
      
      setTimeout(() => {
        setLoading(false);
        setView('otp_verify');
        notify("Verification code sent to Gmail", "success");
      }, 1200);
    } catch (err) {
      setLoading(false);
      notify("Failed to connect to Mail Server", "error");
    }
  };

  // --- [REGISTRATION FLOW: STEP 2 - OTP] ---
  const verifyIdentity = () => {
    if (otpInput === serverOtp) {
      setView('pin_setup');
      notify("Identity verified. Setup your PIN.");
    } else {
      notify("Invalid verification code", "error");
    }
  };

  // --- [REGISTRATION FLOW: STEP 3 - PIN] ---
  const finalizeRegistration = () => {
    if (pin.length < 4) return notify("PIN must be at least 4 digits", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    if (users.find(u => u.email === email)) {
      notify("Email already registered", "error");
      setView('landing');
      return;
    }

    users.push({ email, pin, joined: new Date().toISOString() });
    localStorage.setItem('bx_operators', JSON.stringify(users));
    
    notify("Account created successfully", "success");
    setView('landing'); // Return to Home as requested
  };

  // --- [LOGIN FLOW] ---
  const executeLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_operators') || '[]');
    const operator = users.find(u => u.email === email && u.pin === pin);

    if (operator) {
      setCurrentUser(operator);
      localStorage.setItem('bx_auth_token', JSON.stringify(operator));
      setView('dashboard');
      notify("Welcome back, Operator", "success");
    } else {
      notify("Invalid Email or PIN credentials", "error");
    }
  };

  // --- [LINK GENERATION ENGINE] ---
  const broadcastLink = () => {
    if (!title || !target) return notify("Primary fields are required", "error");
    
    setLoading(true);
    setTimeout(() => {
      const config = {
        t: title,
        d: target,
        i: thumbnail || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        s: hops.slice(0, layers).filter(h => h !== ''),
        p: isPrivate,
        exp: defaultExpiry
      };

      const encrypted = btoa(JSON.stringify(config));
      const finalUrl = `${window.location.origin}/access?payload=${encrypted}`;

      const newLink = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        title,
        url: finalUrl,
        layers,
        clicks: 0,
        status: maintenanceMode ? 'PAUSED' : 'ACTIVE',
        created: new Date().toLocaleDateString()
      };

      const updated = [newLink, ...links];
      setLinks(updated);
      localStorage.setItem('bx_vault_links', JSON.stringify(updated));
      
      // Cleanup
      setTitle(''); setTarget(''); setThumbnail(''); setHops(['', '', '']);
      setLoading(false);
      notify("Link Broadcast Successful", "success");
    }, 1500);
  };

  const deleteLink = (id) => {
    const filtered = links.filter(l => l.id !== id);
    setLinks(filtered);
    localStorage.setItem('bx_vault_links', JSON.stringify(filtered));
    notify("Node deleted from Vault");
  };

  // --- [STYLING & UI COMPONENTS] ---
  const sharedInput = {
    width: '100%',
    padding: '16px',
    background: '#0f172a',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s'
  };

  const primaryBtn = (color = theme.primary) => ({
    width: '100%',
    padding: '16px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: '0.2s'
  });

  // --- [VISTA: AUTHENTICATION INTERFACE] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          .auth-card { background: ${theme.card}; padding: 50px; border-radius: 30px; width: 100%; maxWidth: 450px; border: 1px solid ${theme.border}; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .bx-logo { font-size: 50px; font-weight: 800; color: ${theme.primary}; margin: 0; letter-spacing: -2px; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div className="auth-card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="bx-logo">BX</h1>
            <p style={{ color: theme.muted, fontSize: '14px' }}>Secure Asset Management</p>
          </div>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={primaryBtn()} onClick={() => setView('register')}>Get Started</button>
              <button style={{ ...primaryBtn('transparent'), border: `1px solid ${theme.border}` }} onClick={() => setView('login')}>Sign In</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <label style={{ color: theme.muted, fontSize: '12px', marginBottom: '8px', display: 'block' }}>GMAIL ADDRESS</label>
              <input style={sharedInput} placeholder="name@gmail.com" onChange={e => setEmail(e.target.value)} />
              <button style={{ ...primaryBtn(), marginTop: '10px' }} onClick={initiateRegistration} disabled={loading}>
                {loading ? 'Processing...' : 'Continue'}
              </button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '13px', marginTop: '20px', cursor: 'pointer' }} onClick={() => setView('landing')}>Back to Home</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Check your Email</h3>
              <p style={{ color: theme.muted, fontSize: '13px', marginBottom: '20px' }}>We sent a 6-digit code to {email}.</p>
              <input style={{ ...sharedInput, textAlign: 'center', letterSpacing: '10px', fontSize: '22px' }} maxLength={6} onChange={e => setOtpInput(e.target.value)} />
              <button style={{ ...primaryBtn(), marginTop: '20px' }} onClick={verifyIdentity}>Verify Identity</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Create Master PIN</h3>
              <input style={{ ...sharedInput, textAlign: 'center' }} type="password" placeholder="****" maxLength={4} onChange={e => setPin(e.target.value)} />
              <button style={{ ...primaryBtn(), marginTop: '20px' }} onClick={finalizeRegistration}>Complete Setup</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={sharedInput} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
              <input style={{ ...sharedInput, marginTop: '15px' }} type="password" placeholder="Master PIN" onChange={e => setPin(e.target.value)} />
              <button style={{ ...primaryBtn(), marginTop: '20px' }} onClick={executeLogin}>Authorize Access</button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '13px', marginTop: '20px', cursor: 'pointer' }} onClick={() => setView('landing')}>Back to Home</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [VISTA: DASHBOARD EXPERIENCE] ---
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .sidebar-item { padding: 14px 24px; border-radius: 12px; cursor: pointer; color: ${theme.muted}; font-weight: 600; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .sidebar-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .sidebar-item.active { background: ${theme.primary}15; color: ${theme.primary}; }
        .card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .table-row:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* LEFT NAVIGATION */}
      <div style={{ width: '300px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: theme.primary, marginBottom: '50px', paddingLeft: '20px' }}>BX</h1>
        
        <nav style={{ flex: 1 }}>
          <div className={`sidebar-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            <span>Create Node</span>
          </div>
          <div className={`sidebar-item ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}>
            <span>Asset Vault</span>
          </div>
          <div className={`sidebar-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            <span>Settings</span>
          </div>
        </nav>

        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: theme.muted, marginBottom: '4px' }}>CONNECTED_AS</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          <button 
            style={{ color: theme.error, border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', marginTop: '12px', padding: 0, fontWeight: 'bold' }}
            onClick={() => { localStorage.removeItem('bx_auth_token'); window.location.reload(); }}
          >Termine Session</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Broadcast New Node</h2>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Create high-security content locks with up to 3 redirection layers.</p>

            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: theme.muted, marginBottom: '8px', display: 'block' }}>ASSET TITLE</label>
                  <input style={sharedInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Exclusive GFX Pack" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: theme.muted, marginBottom: '8px', display: 'block' }}>THUMBNAIL URL</label>
                  <input style={sharedInput} value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://imgur.com/..." />
                </div>
              </div>

              <label style={{ fontSize: '13px', color: theme.muted, marginBottom: '8px', display: 'block' }}>FINAL DESTINATION (LOCKED)</label>
              <input style={sharedInput} value={target} onChange={e => setTarget(e.target.value)} placeholder="https://mega.nz/..." />

              {/* SECURITY LAYERS CONFIG */}
              <div style={{ background: theme.bg, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}`, marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Traffic Routing</span>
                    <p style={{ fontSize: '12px', color: theme.muted, margin: 0 }}>Add delay layers to maximize revenue.</p>
                  </div>
                  <select 
                    value={layers} 
                    onChange={e => setLayers(parseInt(e.target.value))}
                    style={{ background: theme.card, color: 'white', border: `1px solid ${theme.border}`, padding: '10px', borderRadius: '8px' }}
                  >
                    <option value="1">1 Layer</option>
                    <option value="2">2 Layers</option>
                    <option value="3">3 Layers</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layers}, 1fr)`, gap: '15px' }}>
                  {Array.from({ length: layers }).map((_, i) => (
                    <input 
                      key={i} 
                      style={{ ...sharedInput, fontSize: '13px' }} 
                      placeholder={`Hop 0${i+1} URL`} 
                      value={hops[i]} 
                      onChange={e => {
                        const h = [...hops]; h[i] = e.target.value; setHops(h);
                      }}
                    />
                  ))}
                </div>
              </div>

              <button 
                style={{ ...primaryBtn(), marginTop: '30px', height: '60px', fontSize: '16px' }}
                onClick={broadcastLink}
                disabled={loading}
              >
                {loading ? 'Encrypting and Deploying...' : 'Deploy Link Node'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Asset Vault</h2>
                <p style={{ color: theme.muted, margin: 0 }}>Manage your active distribution network.</p>
              </div>
              <div style={{ color: theme.primary, fontWeight: 'bold' }}>{links.length} Active Nodes</div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px', fontSize: '12px', color: theme.muted }}>UID</th>
                    <th style={{ padding: '20px', fontSize: '12px', color: theme.muted }}>TITLE</th>
                    <th style={{ padding: '20px', fontSize: '12px', color: theme.muted }}>LAYERS</th>
                    <th style={{ padding: '20px', fontSize: '12px', color: theme.muted }}>CLICKS</th>
                    <th style={{ padding: '20px', fontSize: '12px', color: theme.muted }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link.id} className="table-row">
                      <td style={{ padding: '20px', color: theme.primary, fontWeight: 'bold' }}>#{link.id}</td>
                      <td style={{ padding: '20px', fontWeight: '600' }}>{link.title}</td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ padding: '4px 10px', background: `${theme.primary}20', color: theme.primary, borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {link.layers} STEPS
                        </span>
                      </td>
                      <td style={{ padding: '20px', color: theme.muted }}>{link.clicks}</td>
                      <td style={{ padding: '20px', display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(link.url); notify("Link Copied!"); }}
                          style={{ padding: '10px 15px', background: theme.cardLight, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Copy URL</button>
                        <button 
                          onClick={() => deleteLink(link.id)}
                          style={{ padding: '10px 15px', background: `${theme.error}15`, border: 'none', color: theme.error, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Purge</button>
                      </td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: theme.muted }}>
                        No nodes found in this sector.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="fade-in" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>Global Settings</h2>
            
            <div className="card">
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Network Status</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bg, padding: '20px', borderRadius: '15px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>Redirect all traffic to a fallback page.</div>
                  </div>
                  <input type="checkbox" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Default Node Expiry</h4>
                <select 
                  style={sharedInput} 
                  value={defaultExpiry} 
                  onChange={e => setDefaultExpiry(e.target.value)}
                >
                  <option value="never">Never (Persistent)</option>
                  <option value="24h">24 Hours</option>
                  <option value="48h">48 Hours</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Visibility</h4>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <button 
                    style={{ ...primaryBtn(isPrivate ? theme.primary : 'transparent'), border: `1px solid ${theme.border}`, flex: 1 }}
                    onClick={() => setIsPrivate(true)}
                  >Private Vault</button>
                  <button 
                    style={{ ...primaryBtn(!isPrivate ? theme.primary : 'transparent'), border: `1px solid ${theme.border}`, flex: 1 }}
                    onClick={() => setIsPrivate(false)}
                  >Public Hub</button>
                </div>
              </div>

              <button style={{ ...primaryBtn(), height: '55px' }} onClick={() => notify("Settings Synced Successfully", "success")}>Save System Config</button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING NOTIFICATION */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: notification.type === 'error' ? theme.error : theme.primary, 
          color: 'white', padding: '18px 35px', borderRadius: '16px', 
          fontWeight: 'bold', zIndex: 9999, animation: 'fadeIn 0.3s ease-out',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}

