import React, { useState, useEffect, useMemo } from 'react';

/**
 * BX - ELITE CONTENT LOCKING & DISTRIBUTION ARCHITECTURE
 * VERSION: 18.0.0
 * STYLE: LOOTLABS PREMIUM (SLATE / INDIGO / GLASSMORTPHISM)
 * FLOW: GMAIL -> OTP -> PIN -> LOGIN -> DASHBOARD
 */

export default function BXApplication() {
  // --- [SYSTEM NAVIGATION] ---
  const [view, setView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'info' });

  // --- [IDENTITY & SECURITY] ---
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [serverOtp, setServerOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [GENERATOR DATA] ---
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [layers, setLayers] = useState(1);
  const [hops, setHops] = useState(['', '', '']);
  const [links, setLinks] = useState([]);
  
  // --- [SYSTEM CONFIGURATION] ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultExpiry, setDefaultExpiry] = useState('never');
  const [antiBotLevel, setAntiBotLevel] = useState('Standard');
  const [monetizationType, setMonetizationType] = useState('Mixed');
  const [customDomain, setCustomDomain] = useState('bx.link');

  // --- [DESIGN SPECIFICATIONS] ---
  const theme = {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    bg: '#0f172a',
    card: '#1e293b',
    cardAlt: '#334155',
    border: '#334155',
    text: '#f8fafc',
    muted: '#94a3b8',
    success: '#22c55e',
    error: '#f43f5e',
    accent: '#818cf8',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)'
  };

  // --- [CORE ENGINE INITIALIZATION] ---
  useEffect(() => {
    const savedLinks = localStorage.getItem('bx_vault_data');
    if (savedLinks) setLinks(JSON.parse(savedLinks));

    const activeSession = localStorage.getItem('bx_session_token');
    if (activeSession) {
      setCurrentUser(JSON.parse(activeSession));
      setView('dashboard');
    }
  }, []);

  const notify = (msg, type = 'info') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'info' }), 4500);
  };

  // --- [REGISTRATION PROTOCOL: EMAIL PHASE] ---
  const initiateRegistration = async () => {
    if (!email.includes('@')) return notify("Invalid email format", "error");
    
    setLoading(true);
    // Simulation of SMTP dispatch (This would be your backend call)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(mockOtp);

    console.log(`%c [BX MAIL ENGINE] Code ${mockOtp} dispatched to ${email}`, `color: ${theme.primary}; font-weight: bold`);
    
    setTimeout(() => {
      setLoading(false);
      setView('otp_verify');
      notify("OTP sent to your Gmail inbox", "success");
    }, 1500);
  };

  // --- [REGISTRATION PROTOCOL: OTP PHASE] ---
  const verifySecurityCode = () => {
    if (otpInput === serverOtp) {
      setView('pin_setup');
      notify("Identity verified. Setup your Master PIN.");
    } else {
      notify("Invalid security code", "error");
    }
  };

  // --- [REGISTRATION PROTOCOL: PIN PHASE] ---
  const finalizeRegistration = () => {
    if (pin.length < 4) return notify("PIN must be at least 4 digits", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_database_users') || '[]');
    if (users.find(u => u.email === email)) {
      notify("Email already exists", "error");
      setView('landing');
      return;
    }

    users.push({ email, pin, created: new Date().toISOString() });
    localStorage.setItem('bx_database_users', JSON.stringify(users));
    
    notify("Account ready. Please login.", "success");
    setView('landing'); // Return to Home
  };

  // --- [LOGIN SYSTEM] ---
  const executeLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_database_users') || '[]');
    const sessionUser = users.find(u => u.email === email && u.pin === pin);

    if (sessionUser) {
      setCurrentUser(sessionUser);
      localStorage.setItem('bx_session_token', JSON.stringify(sessionUser));
      setView('dashboard');
      notify("Welcome back, Operator", "success");
    } else {
      notify("Invalid credentials", "error");
    }
  };

  // --- [LINK GENERATOR LOGIC] ---
  const deployNode = () => {
    if (!title || !target) return notify("Missing required fields", "error");
    
    setLoading(true);
    setTimeout(() => {
      const config = {
        title,
        target,
        thumb: thumbnail || 'https://via.placeholder.com/300',
        steps: hops.slice(0, layers).filter(h => h !== ''),
        maintenance: maintenanceMode,
        domain: customDomain
      };

      const hash = btoa(JSON.stringify(config));
      const generatedLink = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        title,
        url: `${window.location.origin}/access?node=${hash}`,
        layers,
        clicks: Math.floor(Math.random() * 5), // Simulating initial data
        status: 'ACTIVE',
        date: new Date().toLocaleDateString()
      };

      const updatedVault = [generatedLink, ...links];
      setLinks(updatedVault);
      localStorage.setItem('bx_vault_data', JSON.stringify(updatedVault));
      
      setTitle(''); setTarget(''); setThumbnail(''); setHops(['', '', '']);
      setLoading(false);
      notify("Link node deployed to the grid", "success");
    }, 1800);
  };

  const purgeNode = (id) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    localStorage.setItem('bx_vault_data', JSON.stringify(updated));
    notify("Node purged successfully");
  };

  // --- [STYLING COMPONENTS] ---
  const inputStyle = {
    width: '100%',
    padding: '16px',
    background: '#0f172a',
    border: `1px solid ${theme.border}`,
    borderRadius: '14px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '20px'
  };

  const primaryButtonStyle = (bg = theme.primary) => ({
    width: '100%',
    padding: '16px',
    background: bg,
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '800',
    fontSize: '15px',
    cursor: 'pointer',
    transition: '0.2s ease',
    boxShadow: bg === theme.primary ? theme.glow : 'none'
  });

  // --- [VIEW: AUTHENTICATION INTERFACES] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Inter", sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
          .auth-card { background: ${theme.card}; padding: 50px; border-radius: 35px; width: 100%; maxWidth: 480px; border: 1px solid ${theme.border}; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
          .logo-text { font-size: 64px; font-weight: 900; color: ${theme.primary}; margin: 0; letter-spacing: -4px; text-shadow: ${theme.glow}; }
          .fade-up { animation: fadeUp 0.5s ease-out forwards; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div className="auth-card fade-up">
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h1 className="logo-text">BX</h1>
            <p style={{ color: theme.muted, fontWeight: '600', fontSize: '14px' }}>ENTERPRISE ASSET PROTECTION</p>
          </div>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={primaryButtonStyle()} onClick={() => setView('register')}>Create New Account</button>
              <button style={{ ...primaryButtonStyle('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Existing Operator Login</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-up">
              <label style={{ fontSize: '12px', color: theme.muted, marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>GMAIL ADDRESS</label>
              <input style={inputStyle} type="email" placeholder="operator@gmail.com" onChange={e => setEmail(e.target.value)} />
              <button style={primaryButtonStyle()} onClick={initiateRegistration} disabled={loading}>{loading ? 'Verifying Gmail...' : 'Send Verification Code'}</button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '14px', marginTop: '30px', cursor: 'pointer' }} onClick={() => setView('landing')}>Abort Registration</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-up">
              <h3 style={{ marginBottom: '10px' }}>Verify Identity</h3>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '25px' }}>Check your Gmail. We've sent a 6-digit verification code.</p>
              <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: '10px', fontSize: '28px' }} maxLength={6} onChange={e => setOtpInput(e.target.value)} />
              <button style={primaryButtonStyle()} onClick={verifySecurityCode}>Confirm Identity</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-up">
              <h3 style={{ marginBottom: '10px' }}>Setup Master PIN</h3>
              <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '25px' }}>Choose a secure 4-8 digit PIN for access.</p>
              <input style={{ ...inputStyle, textAlign: 'center' }} type="password" placeholder="****" onChange={e => setPin(e.target.value)} />
              <button style={primaryButtonStyle()} onClick={finalizeRegistration}>Deploy Account</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-up">
              <input style={inputStyle} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Master PIN" onChange={e => setPin(e.target.value)} />
              <button style={primaryButtonStyle()} onClick={executeLogin}>Authorize Entry</button>
              <p style={{ textAlign: 'center', color: theme.muted, fontSize: '14px', marginTop: '30px', cursor: 'pointer' }} onClick={() => setView('landing')}>Return to Home</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- [VIEW: DASHBOARD (LOOTLABS ELITE)] ---
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', color: theme.text, fontFamily: '"Inter", sans-serif' }}>
      <style>{`
        .nav-link { padding: 18px 25px; border-radius: 15px; cursor: pointer; color: ${theme.muted}; font-weight: 700; display: flex; align-items: center; gap: 15px; transition: 0.2s; border: none; background: transparent; width: 100%; text-align: left; }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.04); }
        .nav-link.active { background: ${theme.primary}15; color: ${theme.primary}; border-left: 4px solid ${theme.primary}; }
        .content-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 25px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .data-table tr { transition: background 0.2s; }
        .data-table tr:hover { background: rgba(255,255,255,0.01); }
      `}</style>

      {/* SIDEBAR NAVIGATION */}
      <div style={{ width: '340px', borderRight: `1px solid ${theme.border}`, padding: '50px 30px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: theme.primary, marginBottom: '60px', paddingLeft: '25px', letterSpacing: '-2px' }}>BX</h1>
        
        <nav style={{ flex: 1 }}>
          <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Generate Link</button>
          <button className={`nav-link ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}>Asset Vault</button>
          <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Control Panel</button>
        </nav>

        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '25px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '10px', color: theme.muted, fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>AUTHORIZED_OPERATOR</div>
          <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          <button 
            style={{ color: theme.error, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '12px', marginTop: '15px', padding: 0 }}
            onClick={() => { localStorage.removeItem('bx_session_token'); window.location.reload(); }}
          >Terminate Session</button>
        </div>
      </div>

      {/* MAIN ENGINE CONTENT */}
      <div style={{ flex: 1, padding: '70px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div className="fade-up" style={{ maxWidth: '1000px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>New Asset Node</h2>
            <p style={{ color: theme.muted, marginBottom: '50px', fontSize: '16px' }}>Configure security parameters and redirect protocols.</p>

            <div className="content-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '35px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: theme.muted, marginBottom: '10px', display: 'block' }}>ASSET FILENAME</label>
                  <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Premium VFX Pack 2026" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: theme.muted, marginBottom: '10px', display: 'block' }}>COVER ART URL</label>
                  <input style={inputStyle} value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://imgur.com/v1.png" />
                </div>
              </div>

              <label style={{ fontSize: '12px', fontWeight: '800', color: theme.muted, marginBottom: '10px', display: 'block' }}>LOCKED DESTINATION</label>
              <input style={inputStyle} value={target} onChange={e => setTarget(e.target.value)} placeholder="https://mega.nz/file/..." />

              <div style={{ background: theme.bg, padding: '35px', borderRadius: '25px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>Security Redirects</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: theme.muted }}>Verification layers between user and asset.</p>
                  </div>
                  <select 
                    value={layers} 
                    onChange={e => setLayers(parseInt(e.target.value))}
                    style={{ background: theme.card, color: 'white', border: `1px solid ${theme.border}`, padding: '12px 20px', borderRadius: '14px', fontWeight: 'bold' }}
                  >
                    <option value="1">1 Security Tier</option>
                    <option value="2">2 Security Tiers</option>
                    <option value="3">3 Security Tiers</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layers}, 1fr)`, gap: '20px' }}>
                  {Array.from({ length: layers }).map((_, i) => (
                    <input 
                      key={i} 
                      style={{ ...inputStyle, marginBottom: 0 }} 
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
                style={{ ...primaryButtonStyle(), marginTop: '45px', height: '65px', fontSize: '17px' }}
                onClick={deployNode}
                disabled={loading}
              >
                {loading ? 'Initializing Encryption...' : 'Deploy Asset Node'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="fade-up">
            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '15px' }}>Asset Vault</h2>
            <p style={{ color: theme.muted, marginBottom: '50px' }}>Live monitoring of your distribution network.</p>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '25px', fontSize: '11px', color: theme.muted, letterSpacing: '1px' }}>NODE_ID</th>
                    <th style={{ padding: '25px', fontSize: '11px', color: theme.muted, letterSpacing: '1px' }}>ASSET_NAME</th>
                    <th style={{ padding: '25px', fontSize: '11px', color: theme.muted, letterSpacing: '1px' }}>SECURITY</th>
                    <th style={{ padding: '25px', fontSize: '11px', color: theme.muted, letterSpacing: '1px' }}>TRAFFIC</th>
                    <th style={{ padding: '25px', fontSize: '11px', color: theme.muted, letterSpacing: '1px' }}>CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(node => (
                    <tr key={node.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '25px', fontWeight: '900', color: theme.primary }}>#{node.id}</td>
                      <td style={{ padding: '25px', fontWeight: '700' }}>{node.title}</td>
                      <td style={{ padding: '25px' }}>
                        <span style={{ padding: '5px 12px', background: `${theme.primary}15`, color: theme.primary, borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}>
                          TIER {node.layers}
                        </span>
                      </td>
                      <td style={{ padding: '25px', color: theme.muted, fontSize: '14px' }}>{node.clicks} total clicks</td>
                      <td style={{ padding: '25px', display: 'flex', gap: '15px' }}>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(node.url); notify("Node URL Copied"); }}
                          style={{ padding: '12px 20px', background: theme.cardAlt, border: 'none', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                        >Copy</button>
                        <button 
                          onClick={() => purgeNode(node.id)}
                          style={{ padding: '12px 20px', background: `${theme.error}15`, border: 'none', color: theme.error, borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                        >Purge</button>
                      </td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: theme.muted }}>No nodes currently deployed.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-up" style={{ maxWidth: '750px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '50px' }}>Control Panel</h2>
            
            <div className="content-card">
              <div style={{ marginBottom: '45px' }}>
                <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Global Protocols</h4>
                <div style={{ background: theme.bg, padding: '25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '800' }}>Global Maintenance</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>Pause all link redirection instantly.</div>
                  </div>
                  <input type="checkbox" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} style={{ width: '25px', height: '25px', cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ marginBottom: '45px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>Advanced Optimization</h4>
                <label style={{ fontSize: '12px', color: theme.muted, marginBottom: '8px', display: 'block' }}>ANTI-BOT SENSITIVITY</label>
                <select style={inputStyle} value={antiBotLevel} onChange={e => setAntiBotLevel(e.target.value)}>
                  <option>Standard protection</option>
                  <option>Aggressive detection</option>
                  <option>Maximum (CAPTCHA Required)</option>
                </select>

                <label style={{ fontSize: '12px', color: theme.muted, marginBottom: '8px', display: 'block' }}>VANITY DOMAIN</label>
                <input style={inputStyle} value={customDomain} onChange={e => setCustomDomain(e.target.value)} />
              </div>

              <button style={primaryButtonStyle()} onClick={() => notify("System parameters updated", "success")}>Sync System Config</button>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL NOTIFICATION SYSTEM */}
      {notification.show && (
        <div style={{ 
          position: 'fixed', bottom: '50px', right: '50px', 
          background: notification.type === 'error' ? theme.error : theme.primary, 
          color: 'white', padding: '22px 45px', borderRadius: '25px', 
          fontWeight: '900', zIndex: 100000, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          {notification.msg.toUpperCase()}
        </div>
      )}
    </div>
  );
}
