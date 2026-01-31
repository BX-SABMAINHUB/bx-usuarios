import React, { useState, useEffect } from 'react';

/**
 * BX - OPERATOR COMMAND CENTER
 * VERSION: 19.0.0
 * DESIGN: LOOTLABS ELITE (INDIGO/DARK)
 * AUTH: GMAIL OTP -> PIN -> LOGIN
 * ROLE: Management & Link Generation only.
 */

export default function BXCore() {
  // --- [SYSTEM STATES] ---
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'info' });

  // --- [AUTH STATES] ---
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [GENERATOR & VAULT] ---
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [thumb, setThumb] = useState('');
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '']);
  const [vault, setVault] = useState([]);

  // --- [GLOBAL CONFIGURATION] ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [expiry, setExpiry] = useState('Permanent');
  const [adIntensity, setAdIntensity] = useState('Standard');
  const [stealthMode, setStealthMode] = useState(false);

  const theme = {
    primary: '#6366f1',
    bg: '#0b0f1a',
    card: '#161d31',
    cardLight: '#283046',
    border: '#3b4253',
    text: '#d0d2d6',
    white: '#ffffff',
    error: '#ea5455',
    success: '#28c76f',
    muted: '#676d7d'
  };

  // --- [INITIALIZATION] ---
  useEffect(() => {
    const savedVault = localStorage.getItem('bx_vault_v3');
    if (savedVault) setVault(JSON.parse(savedVault));

    const session = localStorage.getItem('bx_session_v3');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }
  }, []);

  const triggerNotify = (msg, type = 'info') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'info' }), 4000);
  };

  // --- [AUTHENTICATION PROTOCOL] ---

  const sendGmailOtp = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return triggerNotify("Please enter a valid Gmail address", "error");
    }

    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'otp', code })
      });

      if (response.ok) {
        setView('otp_verify');
        triggerNotify("Verification code sent to Gmail", "success");
      } else { throw new Error(); }
    } catch (err) {
      console.warn("API Offline - Code:", code);
      setView('otp_verify');
      triggerNotify("Mail server error. Check console for code.", "warning");
    } finally { setLoading(false); }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      triggerNotify("Email verified successfully", "success");
    } else {
      triggerNotify("Invalid verification code", "error");
    }
  };

  const completeRegistration = () => {
    if (pin.length < 4) return triggerNotify("PIN must be at least 4 digits", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_users_v3') || '[]');
    if (users.find(u => u.email === email)) return triggerNotify("User already exists", "error");

    users.push({ email, pin });
    localStorage.setItem('bx_users_v3', JSON.stringify(users));
    
    triggerNotify("Account created successfully!", "success");
    setView('landing'); 
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_users_v3') || '[]');
    const user = users.find(u => u.email === email && u.pin === pin);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session_v3', JSON.stringify(user));
      setView('dashboard');
      triggerNotify("Access authorized. Welcome back.", "success");
    } else {
      triggerNotify("Invalid Gmail or PIN", "error");
    }
  };

  // --- [LINK GENERATION LOGIC] ---

  const generateLink = () => {
    if (!title || !targetUrl) return triggerNotify("Title and Target are required", "error");
    
    setLoading(true);
    setTimeout(() => {
      const payload = btoa(JSON.stringify({
        title,
        target: targetUrl,
        layers: layerCount,
        h: hopUrls.slice(0, layerCount),
        thumb: thumb || 'https://via.placeholder.com/600x400'
      }));

      // Direct pointer to unlock.js
      const finalUrl = `${window.location.origin}/unlock?bx=${payload}`;

      const newEntry = {
        id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        title,
        url: finalUrl,
        layers: layerCount,
        status: isMaintenance ? 'PAUSED' : 'ACTIVE',
        date: new Date().toLocaleDateString()
      };

      const updatedVault = [newEntry, ...vault];
      setVault(updatedVault);
      localStorage.setItem('bx_vault_v3', JSON.stringify(updatedVault));
      
      setTitle(''); setTargetUrl(''); setThumb(''); setHopUrls(['','','']);
      setLoading(false);
      triggerNotify("BX Node deployed successfully!", "success");
    }, 1200);
  };

  const purgeLink = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered);
    localStorage.setItem('bx_vault_v3', JSON.stringify(filtered));
    triggerNotify("Node purged from database", "info");
  };

  // --- [STYLING] ---
  const inputStyle = { width: '100%', padding: '14px 18px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.white, fontSize: '15px', marginBottom: '16px', outline: 'none' };
  const btnPrimary = (color = theme.primary) => ({ width: '100%', padding: '16px', backgroundColor: color, color: theme.white, border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: '0.2s' });

  // --- [VIEWS] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: theme.card, padding: '50px', borderRadius: '30px', width: '100%', maxWidth: '420px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <h1 style={{ fontSize: '64px', fontWeight: '900', color: theme.primary, margin: 0, letterSpacing: '-4px' }}>BX</h1>
          <p style={{ color: theme.muted, marginBottom: '40px', fontWeight: '600' }}>Operator Command Panel</p>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={btnPrimary()} onClick={() => setView('register')}>Create Account</button>
              <button style={{ ...btnPrimary('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Sign In</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <input style={inputStyle} type="email" placeholder="Gmail Address" onChange={(e) => setEmail(e.target.value)} />
              <button style={btnPrimary()} onClick={sendGmailOtp} disabled={loading}>{loading ? 'Sending...' : 'Verify Gmail'}</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', color: theme.muted, fontSize: '14px' }}>Go Back</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <p style={{ color: theme.text, fontSize: '14px', marginBottom: '20px' }}>Enter the 6-digit code sent to your Gmail</p>
              <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: '10px', fontSize: '24px' }} maxLength={6} onChange={(e) => setOtpInput(e.target.value)} />
              <button style={btnPrimary()} onClick={verifyOtp}>Confirm Code</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <p style={{ color: theme.text, fontSize: '14px', marginBottom: '20px' }}>Setup your Master PIN</p>
              <input style={{ ...inputStyle, textAlign: 'center' }} type="password" placeholder="****" maxLength={8} onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={completeRegistration}>Finalize Registration</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={inputStyle} placeholder="Gmail" onChange={(e) => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="PIN" onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={handleLogin}>Authorize</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', color: theme.muted, fontSize: '14px' }}>Back to Home</p>
            </div>
          )}
        </div>
        {notify.show && <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: notify.type === 'error' ? theme.error : theme.primary, color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000 }}>{notify.msg.toUpperCase()}</div>}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', color: theme.text, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .sidebar-btn { padding: 15px 25px; border-radius: 12px; cursor: pointer; color: ${theme.muted}; transition: 0.3s; font-weight: 600; display: flex; align-items: center; margin-bottom: 5px; border: none; background: transparent; width: 100%; text-align: left; }
        .sidebar-btn:hover { background: rgba(255,255,255,0.05); color: ${theme.white}; }
        .sidebar-btn.active { background: ${theme.primary}15; color: ${theme.primary}; border-left: 4px solid ${theme.primary}; }
        .panel-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 24px; padding: 35px; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: '300px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: theme.primary, marginBottom: '50px', paddingLeft: '20px' }}>BX</h2>
        <nav style={{ flex: 1 }}>
          <button className={`sidebar-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Create Link</button>
          <button className={`sidebar-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>My Vault</button>
          <button className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Config</button>
        </nav>
        <div style={{ padding: '20px', background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: theme.muted }}>OPERATOR</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden' }}>{currentUser.email}</div>
          <button onClick={() => { localStorage.removeItem('bx_session_v3'); window.location.reload(); }} style={{ color: theme.error, fontSize: '11px', marginTop: '12px', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' }}>LOGOUT</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div style={{ maxWidth: '850px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Deploy New Node</h1>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Your links will be accessible via the /unlock gateway.</p>
            <div className="panel-card">
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.muted }}>ASSET TITLE</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photoshop Elite Pack" />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.muted }}>FINAL DESTINATION URL</label>
              <input style={inputStyle} value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://mega.nz/..." />

              <div style={{ background: theme.bg, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>Security Layers (30s delay each)</span>
                  <select style={{ background: theme.card, color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }} value={layerCount} onChange={(e) => setLayerCount(parseInt(e.target.value))}>
                    <option value={1}>1 Layer</option><option value={2}>2 Layers</option><option value={3}>3 Layers</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {Array.from({ length: layerCount }).map((_, i) => (
                    <input key={i} style={{ ...inputStyle, marginBottom: 0 }} placeholder={`Intermediate Hop ${i+1}`} value={hopUrls[i]} onChange={(e) => { const n = [...hopUrls]; n[i] = e.target.value; setHopUrls(n); }} />
                  ))}
                </div>
              </div>
              <button style={{ ...btnPrimary(), marginTop: '30px' }} onClick={generateLink} disabled={loading}>{loading ? 'DEPLOYING...' : 'GENERATE BX LINK'}</button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>Asset Vault</h1>
            <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: theme.cardLight }}>
                  <tr style={{ color: theme.muted, fontSize: '12px', textAlign: 'left' }}>
                    <th style={{ padding: '20px' }}>ID</th><th style={{ padding: '20px' }}>ASSET</th><th style={{ padding: '20px' }}>LAYERS</th><th style={{ padding: '20px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.map(v => (
                    <tr key={v.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '20px', color: theme.primary, fontWeight: 'bold' }}>#{v.id}</td>
                      <td style={{ padding: '20px' }}>{v.title}</td>
                      <td style={{ padding: '20px' }}><span style={{ background: theme.primary + '20', color: theme.primary, padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>{v.layers} STEPS</span></td>
                      <td style={{ padding: '20px' }}>
                        <button onClick={() => { navigator.clipboard.writeText(v.url); triggerNotify("Link copied to clipboard!", "success"); }} style={{ background: theme.cardLight, border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>Copy</button>
                        <button onClick={() => purgeLink(v.id)} style={{ background: theme.error + '20', border: 'none', color: theme.error, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {notify.show && <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: notify.type === 'error' ? theme.error : theme.primary, color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{notify.msg.toUpperCase()}</div>}
    </div>
  );
}
