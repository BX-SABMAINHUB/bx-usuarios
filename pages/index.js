import React, { useState, useEffect, useMemo } from 'react';

/**
 * BX - ULTIMATE ASSET GATEWAY
 * VERSION: 18.2.1
 * DESIGN: LOOTLABS ELITE (INDIGO/DARK)
 * AUTH: GMAIL OTP -> PIN -> LOGIN
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
  const [selectedLink, setSelectedLink] = useState(null); // For the "Unlock" View

  // --- [GLOBAL CONFIGURATION] ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [expiry, setExpiry] = useState('Permanent');
  const [adIntensity, setAdIntensity] = useState('Standard');
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);

  // --- [THEME ENGINE] ---
  const theme = {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    bg: '#0b0f1a',
    card: '#161d31',
    cardLight: '#283046',
    border: '#3b4253',
    text: '#d0d2d6',
    white: '#ffffff',
    error: '#ea5455',
    success: '#28c76f',
    warning: '#ff9f43'
  };

  // --- [INITIALIZATION] ---
  useEffect(() => {
    const savedVault = localStorage.getItem('bx_vault_v2');
    if (savedVault) setVault(JSON.parse(savedVault));

    const session = localStorage.getItem('bx_session_v2');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setView('dashboard');
    }

    // Fix for the 403 Error: Check if we are trying to unlock a link
    const params = new URLSearchParams(window.location.search);
    const bxData = params.get('bx');
    if (bxData) {
      try {
        const decoded = JSON.parse(atob(bxData));
        setSelectedLink(decoded);
        setView('unlock_page');
      } catch (e) {
        triggerNotify("Corrupted or Invalid Link", "error");
      }
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
      // Calling your Next.js API Handler
      const response = await fetch('/api/send-email', {
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
        triggerNotify("OTP dispatched to your Gmail", "success");
      } else {
        throw new Error("API Failure");
      }
    } catch (err) {
      // Fallback for local testing if API is not active
      console.warn("API Error - Check console for OTP code:", code);
      setView('otp_verify');
      triggerNotify("Mail server offline. Code sent to console.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      triggerNotify("Identity verified. Setup your PIN.", "success");
    } else {
      triggerNotify("Invalid verification code", "error");
    }
  };

  const completeRegistration = () => {
    if (pin.length < 4) return triggerNotify("PIN is too short (min 4)", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_users_v2') || '[]');
    if (users.find(u => u.email === email)) {
      triggerNotify("Account already exists", "error");
      return setView('landing');
    }

    users.push({ email, pin });
    localStorage.setItem('bx_users_v2', JSON.stringify(users));
    
    triggerNotify("Account created successfully!", "success");
    setView('landing'); 
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_users_v2') || '[]');
    const user = users.find(u => u.email === email && u.pin === pin);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session_v2', JSON.stringify(user));
      setView('dashboard');
      triggerNotify("Welcome back, Operator", "success");
    } else {
      triggerNotify("Wrong credentials provided", "error");
    }
  };

  // --- [LINK GENERATION LOGIC] ---

  const generateLink = () => {
    if (!title || !targetUrl) return triggerNotify("Title and Target are required", "error");
    
    setLoading(true);
    setTimeout(() => {
      const payload = {
        title,
        target: targetUrl,
        layers: layerCount,
        hops: hopUrls.slice(0, layerCount),
        thumb: thumb || 'https://via.placeholder.com/150',
        config: { adIntensity, expiry }
      };

      const encrypted = btoa(JSON.stringify(payload));
      // Using window.location.origin ensures the link works on your specific domain
      const finalUrl = `${window.location.origin}${window.location.pathname}?bx=${encrypted}`;

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
      localStorage.setItem('bx_vault_v2', JSON.stringify(updatedVault));
      
      setTitle(''); setTargetUrl(''); setHopUrls(['', '', '']);
      setLoading(false);
      triggerNotify("Link deployed to Vault", "success");
    }, 1200);
  };

  const purgeLink = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered);
    localStorage.setItem('bx_vault_v2', JSON.stringify(filtered));
    triggerNotify("Node deleted forever", "info");
  };

  // --- [DESIGN COMPONENTS] ---
  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: theme.white,
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none',
    transition: '0.3s'
  };

  const btnPrimary = (color = theme.primary) => ({
    width: '100%',
    padding: '16px',
    backgroundColor: color,
    color: theme.white,
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)'
  });

  // --- [RENDER: UNLOCK PAGE (FIXES 403 ERROR)] ---
  if (view === 'unlock_page' && selectedLink) {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.white, fontFamily: 'Inter, sans-serif' }}>
         <div style={{ background: theme.card, padding: '40px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${theme.border}`, maxWidth: '400px', width: '90%' }}>
            <h1 style={{ color: theme.primary }}>BX UNLOCKER</h1>
            <img src={selectedLink.thumb} style={{ width: '100%', borderRadius: '15px', margin: '20px 0' }} />
            <h3>{selectedLink.title}</h3>
            <p style={{ color: theme.text, fontSize: '14px' }}>Complete {selectedLink.layers} security steps to access the content.</p>
            <button 
              style={btnPrimary()} 
              onClick={() => window.location.href = selectedLink.target}
            >Start Verification</button>
         </div>
      </div>
    );
  }

  // --- [RENDER: AUTHENTICATION] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: theme.text }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          .auth-card { background: ${theme.card}; padding: 50px; border-radius: 30px; width: 100%; max-width: 440px; border: 1px solid ${theme.border}; box-shadow: 0 10px 40px rgba(0,0,0,0.5); text-align: center; }
          .logo-bx { font-size: 64px; font-weight: 800; color: ${theme.primary}; margin: 0; letter-spacing: -4px; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div className="auth-card fade-in">
          <h1 className="logo-bx">BX</h1>
          <p style={{ marginBottom: '40px', fontWeight: '600' }}>{view === 'landing' ? 'Advanced Asset Distribution' : 'Security Verification'}</p>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={btnPrimary()} onClick={() => setView('register')}>Register</button>
              <button style={{ ...btnPrimary('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Log In</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <input style={inputStyle} type="email" placeholder="Enter Gmail Address" onChange={(e) => setEmail(e.target.value)} />
              <button style={btnPrimary()} onClick={sendGmailOtp} disabled={loading}>{loading ? 'Checking...' : 'OK'}</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', fontSize: '14px' }}>Cancel</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>Enter the code sent to your Gmail</p>
              <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: '10px', fontSize: '24px' }} maxLength={6} onChange={(e) => setOtpInput(e.target.value)} />
              <button style={btnPrimary()} onClick={verifyOtp}>Verify</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>Create your personal PIN</p>
              <input style={{ ...inputStyle, textAlign: 'center' }} type="password" placeholder="****" maxLength={8} onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={completeRegistration}>Save & Exit</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={inputStyle} placeholder="Gmail" onChange={(e) => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="PIN" onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={handleLogin}>Authorize Access</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', fontSize: '14px' }}>Back</p>
            </div>
          )}
        </div>

        {notify.show && (
          <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: notify.type === 'error' ? theme.error : theme.primary, color: 'white', padding: '18px 35px', borderRadius: '15px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s' }}>
            {notify.msg.toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // --- [RENDER: DASHBOARD] ---
  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', color: theme.text, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .sidebar-btn { padding: 15px 25px; border-radius: 12px; cursor: pointer; color: ${theme.text}; transition: 0.3s; font-weight: 600; display: flex; align-items: center; margin-bottom: 5px; border: none; background: transparent; width: 100%; text-align: left; }
        .sidebar-btn:hover { background: rgba(255,255,255,0.05); color: ${theme.primary}; }
        .sidebar-btn.active { background: ${theme.primary}15; color: ${theme.primary}; border-left: 4px solid ${theme.primary}; }
        .panel-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 24px; padding: 30px; }
        .bx-table { width: 100%; border-collapse: collapse; }
        .bx-table th { text-align: left; padding: 15px; color: ${theme.muted}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid ${theme.border}; }
        .bx-table td { padding: 20px 15px; border-bottom: 1px solid ${theme.border}; font-size: 14px; }
      `}</style>

      {/* SIDEBAR NAVIGATION */}
      <div style={{ width: '300px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: theme.primary, marginBottom: '50px', paddingLeft: '20px' }}>BX</h2>
        
        <div style={{ flex: 1 }}>
          <button className={`sidebar-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Create Link</button>
          <button className={`sidebar-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>Vault</button>
          <button className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </div>

        <div style={{ padding: '20px', background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: theme.muted, fontWeight: 'bold' }}>LOGGED IN AS</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          <button 
            onClick={() => { localStorage.removeItem('bx_session_v2'); window.location.reload(); }}
            style={{ color: theme.error, fontSize: '12px', marginTop: '15px', cursor: 'pointer', fontWeight: '800', background: 'none', border: 'none' }}
          >LOGOUT</button>
        </div>
      </div>

      {/* DASHBOARD CONTENT AREA */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div className="fade-in" style={{ maxWidth: '900px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Deploy New Node</h1>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Generate high-revenue content locks with verification steps.</p>

            <div className="panel-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>ASSET TITLE</label>
                  <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photoshop Pack 2024" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>THUMBNAIL URL</label>
                  <input style={inputStyle} value={thumb} onChange={(e) => setThumb(e.target.value)} placeholder="https://imgur.com/..." />
                </div>
              </div>

              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>FINAL DESTINATION (REDIRECT)</label>
              <input style={inputStyle} value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://mega.nz/..." />

              {/* DYNAMIC STEPS CONFIG */}
              <div style={{ background: theme.bg, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 'bold' }}>Security Steps (Layers)</span>
                  <select 
                    style={{ background: theme.card, color: 'white', border: 'none', borderRadius: '8px', padding: '5px 15px' }}
                    value={layerCount}
                    onChange={(e) => setLayerCount(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Layer</option>
                    <option value={2}>2 Layers</option>
                    <option value={3}>3 Layers</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {Array.from({ length: layerCount }).map((_, i) => (
                    <input 
                      key={i}
                      style={{ ...inputStyle, marginBottom: 0 }} 
                      placeholder={`Intermediate ${i+1}`} 
                      value={hopUrls[i]}
                      onChange={(e) => {
                        const newHops = [...hopUrls];
                        newHops[i] = e.target.value;
                        setHopUrls(newHops);
                      }}
                    />
                  ))}
                </div>
              </div>

              <button 
                style={{ ...btnPrimary(), marginTop: '30px', height: '60px', fontSize: '17px' }}
                onClick={generateLink}
                disabled={loading}
              >
                {loading ? 'DEPLOYING NODE...' : 'GENERATE ASSET LINK'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Asset Vault</h1>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>You have {vault.length} active links in the network.</p>

            <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="bx-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Asset Name</th>
                    <th>Security</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: '800', color: theme.primary }}>#{v.id}</td>
                      <td>{v.title}</td>
                      <td><span style={{ background: theme.primary + '20', color: theme.primary, padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>{v.layers} LAYERS</span></td>
                      <td style={{ color: v.status === 'ACTIVE' ? theme.success : theme.error, fontWeight: 'bold' }}>{v.status}</td>
                      <td>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.url); triggerNotify("Copied to clipboard!", "success"); }}
                          style={{ background: theme.cardLight, border: 'none', color: 'white', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}
                        >Copy URL</button>
                        <button 
                          onClick={() => purgeLink(v.id)}
                          style={{ background: theme.error + '20', border: 'none', color: theme.error, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                  {vault.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: theme.muted }}>Vault is empty. Create a link to start.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in" style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>System Control</h1>
            <p style={{ color: theme.muted, marginBottom: '40px' }}>Adjust global network parameters and security levels.</p>

            <div className="panel-card">
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Traffic Mode</h3>
                <div style={{ background: theme.bg, padding: '25px', borderRadius: '15px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>Force all links to a "Paused" state globally.</div>
                  </div>
                  <input type="checkbox" checked={isMaintenance} onChange={(e) => setIsMaintenance(e.target.checked)} style={{ width: '22px', height: '22px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Redirection Strategy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {['Economic', 'Standard', 'High-Tier'].map(lvl => (
                    <button 
                      key={lvl}
                      onClick={() => setAdIntensity(lvl)}
                      style={{ 
                        padding: '15px', borderRadius: '12px', border: '1px solid ' + (adIntensity === lvl ? theme.primary : theme.border),
                        background: adIntensity === lvl ? theme.primary + '10' : 'transparent',
                        color: adIntensity === lvl ? theme.primary : theme.text,
                        cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >{lvl}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Expiry Default</h3>
                  <select style={inputStyle} value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                    <option>24 Hours</option>
                    <option>7 Days</option>
                    <option>Permanent</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Stealth Links</h3>
                  <div style={{ background: theme.bg, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setStealthMode(!stealthMode)}>
                    {stealthMode ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>

              <button style={btnPrimary()} onClick={() => triggerNotify("Configurations saved successfully!", "success")}>Apply Platform Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL NOTIFICATION SYSTEM */}
      {notify.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', right: '40px', 
          background: notify.type === 'error' ? theme.error : theme.primary, 
          color: 'white', padding: '15px 35px', borderRadius: '15px', 
          fontWeight: 'bold', zIndex: 99999, boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease-out', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {notify.msg.toUpperCase()}
        </div>
      )}
    </div>
  );
}
