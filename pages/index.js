import React, { useState, useEffect } from 'react';

/**
 * BX - PREMIUM CONTENT GATEWAY & ANALYTICS
 * DESIGN: LOOTLABS ELITE (INDIGO/DARK)
 * AUTH: GMAIL OTP -> PIN -> LOGIN
 * EMAIL: INTEGRATED VIA NODEMAILER API ROUTE
 */

export default function BXPlatform() {
  // --- [SYSTEM STATES] ---
  const [view, setView] = useState('landing'); // landing, register, otp_verify, pin_setup, login, dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'info' });

  // --- [AUTH STATES] ---
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [GENERATOR STATES] ---
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [thumb, setThumb] = useState('');
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '']);
  const [vault, setVault] = useState([]);

  // --- [ADVANCED CONFIGURATION] ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [expiry, setExpiry] = useState('Never');
  const [adIntensity, setAdIntensity] = useState('Standard');
  const [stealthMode, setStealthMode] = useState(false);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [customSuffix, setCustomSuffix] = useState('');

  // --- [DESIGN TOKENS] ---
  const theme = {
    primary: '#6366f1', // Indigo Lootlabs
    primaryHover: '#4f46e5',
    bg: '#0f172a',
    card: '#1e293b',
    cardLight: '#334155',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    success: '#22c55e',
    error: '#ef4444',
    accent: '#818cf8'
  };

  // --- [INITIALIZATION] ---
  useEffect(() => {
    const savedVault = localStorage.getItem('bx_vault_storage');
    if (savedVault) setVault(JSON.parse(savedVault));

    const session = localStorage.getItem('bx_auth_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }
  }, []);

  const triggerNotify = (msg, type = 'info') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'info' }), 4500);
  };

  // --- [AUTHENTICATION FLOW WITH NODEMAILER] ---

  // STEP 1: Send the Gmail OTP using your API
  const sendEmailOtp = async () => {
    if (!email.includes('@')) return triggerNotify("Invalid email address", "error");
    
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      const response = await fetch('/api/send-email', { // Adjust path to your handler
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          type: 'otp',
          code: code
        })
      });

      if (response.ok) {
        setView('otp_verify');
        triggerNotify("Verification code sent to Gmail", "success");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (err) {
      triggerNotify("Mail Server Error. Try again.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      triggerNotify("Email verified successfully");
    } else {
      triggerNotify("Verification code is incorrect", "error");
    }
  };

  // STEP 3: Setup PIN and Finish
  const handlePinSetup = () => {
    if (pin.length < 4) return triggerNotify("PIN must be 4+ digits", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_database') || '[]');
    if (users.find(u => u.email === email)) {
      triggerNotify("User already registered", "error");
      setView('landing');
      return;
    }

    users.push({ email, pin, registered: new Date().toISOString() });
    localStorage.setItem('bx_database', JSON.stringify(users));
    
    triggerNotify("Account created! Please login", "success");
    setView('landing'); // Return to Home
  };

  // LOGIN: Email + PIN
  const executeLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_database') || '[]');
    const user = users.find(u => u.email === email && u.pin === pin);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_auth_session', JSON.stringify(user));
      setView('dashboard');
      triggerNotify("Authorized Access Granted", "success");
    } else {
      triggerNotify("Invalid Email or PIN", "error");
    }
  };

  // --- [CORE ENGINE: CREATE LINK] ---
  const deployNode = () => {
    if (!title || !targetUrl) return triggerNotify("Missing required fields", "error");
    
    setLoading(true);
    setTimeout(() => {
      const payload = btoa(JSON.stringify({
        t: title,
        d: targetUrl,
        l: layerCount,
        h: hopUrls.slice(0, layerCount),
        m: isMaintenance,
        s: stealthMode
      }));

      const newNode = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        title,
        url: `${window.location.origin}/unlock?bx=${payload}`,
        layers: layerCount,
        clicks: 0,
        status: isMaintenance ? 'PAUSED' : 'ACTIVE',
        created: new Date().toLocaleDateString(),
        exp: expiry
      };

      const updated = [newNode, ...vault];
      setVault(updated);
      localStorage.setItem('bx_vault_storage', JSON.stringify(updated));
      
      // Cleanup
      setTitle(''); setTargetUrl(''); setHopUrls(['', '', '']);
      setLoading(false);
      triggerNotify("Link Node Deployed Successfully", "success");
    }, 1200);
  };

  const deleteNode = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered);
    localStorage.setItem('bx_vault_storage', JSON.stringify(filtered));
    triggerNotify("Node purged from Vault");
  };

  // --- [STYLES] ---
  const sharedInput = {
    width: '100%',
    padding: '16px',
    background: '#0f172a',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    transition: '0.3s'
  };

  const primaryBtn = (bg = theme.primary) => ({
    width: '100%',
    padding: '16px',
    background: bg,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  });

  // --- [VIEW: AUTHENTICATION SCREENS] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          .auth-box { background: ${theme.card}; padding: 50px; border-radius: 32px; width: 100%; maxWidth: 450px; border: 1px solid ${theme.border}; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; }
          .bx-logo { font-size: 64px; font-weight: 800; color: ${theme.primary}; margin: 0; letter-spacing: -4px; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        <div className="auth-box fade-in">
          <h1 className="bx-logo">BX</h1>
          <p style={{ color: theme.muted, marginBottom: '40px', fontWeight: '600' }}>Secure Asset Distribution</p>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={primaryBtn()} onClick={() => setView('register')}>Register Account</button>
              <button style={{ ...primaryBtn('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Sign In</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <input style={sharedInput} placeholder="Your Gmail" onChange={e => setEmail(e.target.value)} />
              <button style={primaryBtn()} onClick={sendEmailOtp} disabled={loading}>{loading ? 'Sending Code...' : 'Get Code'}</button>
              <p onClick={() => setView('landing')} style={{ color: theme.muted, fontSize: '14px', marginTop: '25px', cursor: 'pointer' }}>Go Back</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <p style={{ color: theme.muted, marginBottom: '20px' }}>Enter 6-digit code sent to Gmail</p>
              <input style={{ ...sharedInput, textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }} maxLength={6} onChange={e => setOtpInput(e.target.value)} />
              <button style={primaryBtn()} onClick={handleVerifyOtp}>Verify Identity</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <p style={{ color: theme.muted, marginBottom: '20px' }}>Setup your Master PIN</p>
              <input style={{ ...sharedInput, textAlign: 'center' }} type="password" placeholder="****" maxLength={8} onChange={e => setPin(e.target.value)} />
              <button style={primaryBtn()} onClick={handlePinSetup}>Finalize Setup</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={sharedInput} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
              <input style={sharedInput} type="password" placeholder="PIN" onChange={e => setPin(e.target.value)} />
              <button style={primaryBtn()} onClick={executeLogin}>Authorize Access</button>
              <p onClick={() => setView('landing')} style={{ color: theme.muted, fontSize: '14px', marginTop: '25px', cursor: 'pointer' }}>Back Home</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [VIEW: DASHBOARD (LOOTLABS INSPIRED)] ---
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', color: theme.text, fontFamily: '"Inter", sans-serif' }}>
      <style>{`
        .sidebar-item { padding: 16px 24px; border-radius: 12px; cursor: pointer; color: ${theme.muted}; font-weight: 600; display: flex; align-items: center; transition: 0.2s; border: none; background: transparent; width: 100%; text-align: left; }
        .sidebar-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .sidebar-item.active { background: ${theme.primary}15; color: ${theme.primary}; border-left: 4px solid ${theme.primary}; border-radius: 0 12px 12px 0; }
        .main-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 24px; padding: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .bx-table { width: 100%; border-collapse: collapse; }
        .bx-table th { text-align: left; padding: 20px; color: ${theme.muted}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid ${theme.border}; }
        .bx-table td { padding: 20px; border-bottom: 1px solid ${theme.border}; font-size: 14px; }
      `}</style>

      {/* LEFT NAVIGATION */}
      <div style={{ width: '300px', borderRight: `1px solid ${theme.border}`, padding: '50px 20px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: theme.primary, marginBottom: '50px', paddingLeft: '24px' }}>BX</h1>
        
        <nav style={{ flex: 1 }}>
          <button className={`sidebar-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>New Link</button>
          <button className={`sidebar-item ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>My Vault</button>
          <button className={`sidebar-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Settings</button>
        </nav>

        <div style={{ background: theme.card, padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: theme.muted, marginBottom: '5px' }}>OPERATOR</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', overflow: 'hidden' }}>{currentUser.email}</div>
          <button 
            onClick={() => { localStorage.removeItem('bx_auth_session'); window.location.reload(); }}
            style={{ color: theme.error, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '15px', padding: 0 }}
          >SIGN OUT</button>
        </div>
      </div>

      {/* MAIN CONTENT ENGINE */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div className="fade-in" style={{ maxWidth: '950px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Deploy New Node</h2>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Configure high-security traffic routing for your files.</p>

            <div className="main-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.muted, marginBottom: '8px', display: 'block' }}>TITLE</label>
                  <input style={sharedInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Premium Assets Pack" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.muted, marginBottom: '8px', display: 'block' }}>THUMBNAIL (URL)</label>
                  <input style={sharedInput} value={thumb} onChange={e => setThumb(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.muted, marginBottom: '8px', display: 'block' }}>LOCKED DESTINATION</label>
              <input style={sharedInput} value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://mega.nz/..." />

              {/* SECURITY LAYERS */}
              <div style={{ background: theme.bg, padding: '30px', borderRadius: '20px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>Security Hopping Layers</span>
                  <select 
                    style={{ background: theme.card, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px' }}
                    value={layerCount}
                    onChange={e => setLayerCount(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Layer</option>
                    <option value={2}>2 Layers</option>
                    <option value={3}>3 Layers</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  {Array.from({ length: layerCount }).map((_, i) => (
                    <input 
                      key={i} 
                      style={{ ...sharedInput, marginBottom: 0 }} 
                      placeholder={`Hop ${i+1} Link`} 
                      value={hopUrls[i]}
                      onChange={e => { const h = [...hopUrls]; h[i] = e.target.value; setHopUrls(h); }}
                    />
                  ))}
                </div>
              </div>

              <button 
                style={{ ...primaryBtn(), marginTop: '40px', height: '64px', fontSize: '17px' }}
                onClick={deployNode}
                disabled={loading}
              >
                {loading ? 'DEPLOYING...' : 'BROADCAST LINK NODE'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Asset Vault</h2>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Managing {vault.length} active distribution nodes.</p>

            <div className="main-card" style={{ padding: 0 }}>
              <table className="bx-table">
                <thead>
                  <tr>
                    <th>Node ID</th>
                    <th>Asset Title</th>
                    <th>Layers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: '800', color: theme.primary }}>#{v.id}</td>
                      <td style={{ fontWeight: '600' }}>{v.title}</td>
                      <td><span style={{ background: theme.primary + '20', color: theme.primary, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{v.layers} HOPS</span></td>
                      <td style={{ color: v.status === 'ACTIVE' ? theme.success : theme.error, fontWeight: 'bold' }}>{v.status}</td>
                      <td style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.url); triggerNotify("Link Copied!"); }}
                          style={{ padding: '8px 18px', background: theme.cardLight, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Copy</button>
                        <button 
                          onClick={() => deleteNode(v.id)}
                          style={{ padding: '8px 18px', background: theme.error + '15', border: 'none', color: theme.error, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Purge</button>
                      </td>
                    </tr>
                  ))}
                  {vault.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: theme.muted }}>Vault is currently empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="fade-in" style={{ maxWidth: '750px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>Platform Control</h2>
            
            <div className="main-card">
              <div style={{ marginBottom: '35px' }}>
                <h4 style={{ marginBottom: '15px', color: theme.muted }}>Traffic Status</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bg, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>All links will redirect to a pause screen.</div>
                  </div>
                  <input type="checkbox" checked={isMaintenance} onChange={e => setIsMaintenance(e.target.checked)} style={{ width: '22px', height: '22px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '35px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ marginBottom: '12px', color: theme.muted }}>Ad Intensity</h4>
                  <select style={sharedInput} value={adIntensity} onChange={e => setAdIntensity(e.target.value)}>
                    <option>Standard</option>
                    <option>High Revenue</option>
                    <option>Extreme (3+ ads)</option>
                  </select>
                </div>
                <div>
                  <h4 style={{ marginBottom: '12px', color: theme.muted }}>Node Expiry</h4>
                  <select style={sharedInput} value={expiry} onChange={e => setExpiry(e.target.value)}>
                    <option>Never</option>
                    <option>24 Hours</option>
                    <option>7 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, background: theme.bg, padding: '20px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '11px', color: theme.muted }}>Stealth Mode</div>
                  <div style={{ fontWeight: 'bold', cursor: 'pointer', color: stealthMode ? theme.primary : 'white' }} onClick={() => setStealthMode(!stealthMode)}>
                    {stealthMode ? 'ENABLED' : 'DISABLED'}
                  </div>
                </div>
                <div style={{ flex: 1, background: theme.bg, padding: '20px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '11px', color: theme.muted }}>Password Protection</div>
                  <div style={{ fontWeight: 'bold', cursor: 'pointer', color: passwordProtect ? theme.primary : 'white' }} onClick={() => setPasswordProtect(!passwordProtect)}>
                    {passwordProtect ? 'ENABLED' : 'DISABLED'}
                  </div>
                </div>
              </div>

              <button style={{ ...primaryBtn(), marginTop: '40px' }} onClick={() => triggerNotify("Configurations Synced", "success")}>Save Global Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION HUB */}
      {notify.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: notify.type === 'error' ? theme.error : theme.primary, 
          color: 'white', padding: '18px 38px', borderRadius: '18px', 
          fontWeight: 'bold', zIndex: 99999, boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notify.msg.toUpperCase()}
        </div>
      )}
    </div>
  );
}
