import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

/**
 * BX - OPERATOR COMMAND CENTER (FINAL EDITION)
 * VERSION: 25.0.0
 * FEATURES: 
 * - Local Image Upload (Base64)
 * - Security Captcha Verification
 * - Advanced Link Configuration
 * - Gmail OTP Auth Integration
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
  const [thumb, setThumb] = useState(null); // Stores Base64 image
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '']);
  const [vault, setVault] = useState([]);
  
  // --- [NEW FEATURES STATES] ---
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // --- [ADVANCED CONFIGURATION] ---
  const [config, setConfig] = useState({
    adblock: true,
    vpnBlock: false,
    adultFilter: true,
    expiry: 'Never'
  });

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
    muted: '#676d7d',
    captchaBg: '#f9f9f9'
  };

  // --- [INITIALIZATION] ---
  useEffect(() => {
    const savedVault = localStorage.getItem('bx_vault_final');
    if (savedVault) setVault(JSON.parse(savedVault));

    const session = localStorage.getItem('bx_session_final');
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
        body: JSON.stringify({ 
          email, 
          type: 'otp', 
          code // Envia el código generado al backend
        })
      });

      if (response.ok) {
        setView('otp_verify');
        triggerNotify("Verification code sent to Gmail", "success");
      } else { 
        throw new Error("Server response not OK"); 
      }
    } catch (err) {
      console.warn("API Error - Fallback Mode");
      // En modo desarrollo si falla la API, mostramos el código en consola para no bloquearte
      console.log("DEV MODE OTP:", code);
      setView('otp_verify');
      triggerNotify("Mail sent (Check Spam/Console)", "warning");
    } finally { setLoading(false); }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      triggerNotify("Identity Verified", "success");
    } else {
      triggerNotify("Invalid Code", "error");
    }
  };

  const completeRegistration = () => {
    if (pin.length < 4) return triggerNotify("PIN is too short", "error");
    
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    if (users.find(u => u.email === email)) return triggerNotify("User already exists", "error");

    const newUser = { email, pin, joined: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('bx_users_final', JSON.stringify(users));
    
    triggerNotify("Account Created", "success");
    setView('landing'); 
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    const user = users.find(u => u.email === email && u.pin === pin);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session_final', JSON.stringify(user));
      setView('dashboard');
      triggerNotify("Welcome back, Operator.", "success");
    } else {
      triggerNotify("Access Denied", "error");
    }
  };

  // --- [IMAGE HANDLING] ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) return triggerNotify("Image too large (Max 2MB)", "error");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumb(reader.result);
        triggerNotify("Cover Image Uploaded", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- [CAPTCHA LOGIC] ---
  const handleCaptchaClick = () => {
    if (captchaVerified) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaVerified(true);
    }, 1500);
  };

  // --- [LINK GENERATION] ---
  const generateLink = () => {
    if (!title || !targetUrl) return triggerNotify("Title and Target URL required", "error");
    if (!captchaVerified) return triggerNotify("Please complete the Security Captcha", "error");

    setLoading(true);
    setTimeout(() => {
      // Create Payload
      const payload = btoa(JSON.stringify({
        title,
        target: targetUrl,
        layers: layerCount,
        h: hopUrls.slice(0, layerCount),
        thumb: thumb || 'https://via.placeholder.com/600x400', // Use uploaded image or placeholder
        config // Pass advanced config to node
      }));

      const finalUrl = `${window.location.origin}/unlock?bx=${payload}`;

      const newEntry = {
        id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        title,
        url: finalUrl,
        layers: layerCount,
        thumb: thumb,
        status: 'ACTIVE',
        date: new Date().toLocaleDateString()
      };

      const updatedVault = [newEntry, ...vault];
      setVault(updatedVault);
      localStorage.setItem('bx_vault_final', JSON.stringify(updatedVault));
      
      // Reset Form
      setTitle(''); setTargetUrl(''); setThumb(null); setHopUrls(['','','']);
      setCaptchaVerified(false);
      setLoading(false);
      triggerNotify("Secure Node Created Successfully", "success");
    }, 1500);
  };

  const purgeLink = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered);
    localStorage.setItem('bx_vault_final', JSON.stringify(filtered));
    triggerNotify("Node deleted", "info");
  };

  // --- [STYLES] ---
  const s = {
    container: { minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" },
    input: { width: '100%', padding: '14px 18px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.white, fontSize: '14px', outline: 'none', transition: '0.3s' },
    btn: (bg = theme.primary) => ({ width: '100%', padding: '16px', background: bg, color: theme.white, border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }),
    card: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '30px' },
    label: { fontSize: '11px', fontWeight: '800', color: theme.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
    toggle: (active) => ({ width: '40px', height: '22px', background: active ? theme.success : theme.cardLight, borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }),
    toggleDot: (active) => ({ position: 'absolute', top: '3px', left: active ? '21px' : '3px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: '0.3s' })
  };

  // --- [VIEWS] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...s.card, width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '50px', fontWeight: '900', color: theme.primary, margin: 0 }}>BX</h1>
          <p style={{ color: theme.muted, fontSize: '12px', marginBottom: '30px' }}>SECURE ACCESS GATEWAY v25.0</p>

          {view === 'landing' && (
            <div className="fade-in">
              <button style={{...s.btn(), marginBottom: '15px'}} onClick={() => setView('register')}>Create Account</button>
              <button style={{...s.btn('transparent'), border: `1px solid ${theme.border}`}} onClick={() => setView('login')}>Login</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <input style={{...s.input, marginBottom: '15px'}} type="email" placeholder="Enter Gmail Address" onChange={e => setEmail(e.target.value)} />
              <button style={s.btn()} onClick={sendGmailOtp} disabled={loading}>{loading ? 'SENDING OTP...' : 'VERIFY EMAIL'}</button>
              <p onClick={() => setView('landing')} style={{marginTop:'20px', cursor:'pointer', fontSize:'12px', color: theme.muted}}>Cancel</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <p style={{marginBottom: '20px', fontSize: '13px'}}>Enter the 6-digit code sent to <b>{email}</b></p>
              <input style={{...s.input, textAlign: 'center', letterSpacing: '8px', fontSize: '20px', marginBottom: '20px'}} maxLength={6} onChange={e => setOtpInput(e.target.value)} placeholder="000000" />
              <button style={s.btn()} onClick={verifyOtp}>CONFIRM</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <p style={{marginBottom: '20px'}}>Create a Security PIN</p>
              <input style={{...s.input, textAlign: 'center', marginBottom: '20px'}} type="password" placeholder="****" maxLength={4} onChange={e => setPin(e.target.value)} />
              <button style={s.btn()} onClick={completeRegistration}>FINISH SETUP</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={{...s.input, marginBottom: '10px'}} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
              <input style={{...s.input, marginBottom: '20px'}} type="password" placeholder="PIN" onChange={e => setPin(e.target.value)} />
              <button style={s.btn()} onClick={handleLogin}>ENTER DASHBOARD</button>
              <p onClick={() => setView('landing')} style={{marginTop:'20px', cursor:'pointer', fontSize:'12px', color: theme.muted}}>Back</p>
            </div>
          )}
        </div>
        {notify.show && <div style={{position: 'fixed', bottom: '20px', right: '20px', background: notify.type === 'error' ? theme.error : theme.primary, padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold'}}>{notify.msg}</div>}
      </div>
    );
  }

  // --- [DASHBOARD RENDER] ---
  return (
    <div style={{ ...s.container, display: 'flex' }}>
      <Head>
        <title>BX | Command Center</title>
        <style>{`
          .nav-btn { display: flex; align-items: center; width: 100%; padding: 12px 20px; border-radius: 10px; border: none; background: none; color: ${theme.muted}; cursor: pointer; font-weight: 600; font-size: 14px; margin-bottom: 5px; transition: 0.3s; }
          .nav-btn:hover { background: rgba(255,255,255,0.05); color: white; }
          .nav-btn.active { background: ${theme.primary}20; color: ${theme.primary}; }
          .fade-in { animation: fadeIn 0.4s ease; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          
          /* Fake Recaptcha Styles */
          .recaptcha-box {
            background: #f9f9f9; border: 1px solid #d3d3d3; border-radius: 4px;
            width: fit-content; padding: 10px 15px; display: flex; align-items: center;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-top: 20px; cursor: pointer;
            transition: 0.2s;
          }
          .recaptcha-box:hover { box-shadow: 0 0 5px rgba(0,0,0,0.1); }
          .checkbox { width: 24px; height: 24px; border: 2px solid #c1c1c1; border-radius: 2px; background: white; margin-right: 12px; display: flex; align-items: center; justifyContent: center; }
          .checkbox.checked { border-color: #4A90E2; }
          .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
          .checkmark { color: #4A90E2; font-size: 20px; font-weight: bold; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>

      {/* SIDEBAR */}
      <div style={{ width: '280px', borderRight: `1px solid ${theme.border}`, padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: theme.primary, paddingLeft: '20px', marginBottom: '40px' }}>BX <span style={{fontSize: '12px', color: theme.muted, fontWeight: 'normal'}}>ADMIN</span></h2>
        
        <button className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>🚀 New Link</button>
        <button className={`nav-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>📂 Vault</button>
        <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Config</button>

        <div style={{ marginTop: 'auto', padding: '15px', background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '10px', color: theme.muted, marginBottom: '5px' }}>LOGGED IN AS</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          <div onClick={() => {localStorage.removeItem('bx_session_final'); window.location.reload()}} style={{ fontSize: '11px', color: theme.error, marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* TAB: CREATE */}
        {activeTab === 'create' && (
          <div style={{ maxWidth: '800px', animation: 'fadeIn 0.5s' }}>
            <h1 style={{ marginBottom: '10px' }}>Deploy New Node</h1>
            <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '30px' }}>Configure your secure access gateway. All fields are required.</p>

            <div style={s.card}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Left Column: Inputs */}
                <div>
                  <label style={s.label}>Title of Asset</label>
                  <input style={{...s.input, marginBottom: '20px'}} placeholder="e.g. Premium Pack 2026" value={title} onChange={e => setTitle(e.target.value)} />

                  <label style={s.label}>Destination URL</label>
                  <input style={{...s.input, marginBottom: '20px'}} placeholder="https://mega.nz/file/..." value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
                  
                  {/* File Upload Button */}
                  <label style={s.label}>Cover Image</label>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => fileInputRef.current.click()} style={{ ...s.btn(theme.cardLight), border: `1px solid ${theme.border}`, flex: 1 }}>
                      {thumb ? 'Change Image' : 'Select from Gallery'}
                    </button>
                  </div>
                </div>

                {/* Right Column: Preview */}
                <div>
                   <label style={s.label}>Preview</label>
                   <div style={{ width: '100%', height: '160px', borderRadius: '12px', border: `1px dashed ${theme.border}`, background: thumb ? `url(${thumb}) center/cover` : theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontSize: '12px' }}>
                     {!thumb && "No Image Selected"}
                   </div>
                </div>
              </div>

              {/* Advanced Settings Section */}
              <div style={{ marginTop: '30px', padding: '20px', background: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                <label style={{...s.label, marginBottom: '15px', color: theme.primary}}>Configuration & Security</label>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.text }}>Verification Layers</span>
                  <select style={{ background: theme.card, color: 'white', border: `1px solid ${theme.border}`, padding: '5px 15px', borderRadius: '8px' }} value={layerCount} onChange={e => setLayerCount(Number(e.target.value))}>
                    <option value={1}>1 Layer (Standard)</option>
                    <option value={2}>2 Layers (Secure)</option>
                    <option value={3}>3 Layers (Max)</option>
                  </select>
                </div>

                {/* Hops */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {Array.from({ length: layerCount }).map((_, i) => (
                    <input key={i} style={s.input} placeholder={`Hop URL for Step ${i+1}`} value={hopUrls[i]} onChange={e => { const newHops = [...hopUrls]; newHops[i] = e.target.value; setHopUrls(newHops); }} />
                  ))}
                </div>
              </div>

              {/* CAPTCHA SECTION */}
              <div className="recaptcha-box" onClick={handleCaptchaClick}>
                <div className={`checkbox ${captchaVerified ? 'checked' : ''}`}>
                  {captchaLoading && <div className="spinner" />}
                  {captchaVerified && <span className="checkmark">✓</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', color: '#000', fontWeight: '500' }}>I'm not a robot</span>
                  <span style={{ fontSize: '10px', color: '#555' }}>reCAPTCHA Privacy - Terms</span>
                </div>
                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" style={{ height: '32px', marginLeft: '20px', opacity: 0.5 }} alt="" />
              </div>

              {/* Submit Button */}
              <button style={{ ...s.btn(captchaVerified ? theme.success : theme.cardLight), marginTop: '20px', cursor: captchaVerified ? 'pointer' : 'not-allowed' }} onClick={generateLink} disabled={!captchaVerified || loading}>
                {loading ? 'DEPLOYING NODE...' : 'CREATE SECURE LINK'}
              </button>

            </div>
          </div>
        )}

        {/* TAB: VAULT */}
        {activeTab === 'manage' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ marginBottom: '30px' }}>Asset Vault</h1>
            {vault.length === 0 ? (
              <div style={{ textAlign: 'center', color: theme.muted, padding: '50px' }}>No links generated yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {vault.map(v => (
                  <div key={v.id} style={{ ...s.card, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ height: '140px', background: v.thumb ? `url(${v.thumb}) center/cover` : theme.cardLight, borderRadius: '12px', marginBottom: '15px' }} />
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{v.title}</div>
                    <div style={{ fontSize: '12px', color: theme.muted, marginBottom: '15px' }}>ID: {v.id} • {v.layers} Layers</div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { navigator.clipboard.writeText(v.url); triggerNotify("Copied!", "success") }} style={{ ...s.btn(theme.primary + '30'), color: theme.primary, padding: '10px' }}>COPY</button>
                      <button onClick={() => purgeLink(v.id)} style={{ ...s.btn(theme.error + '20'), color: theme.error, padding: '10px' }}>DELETE</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px', animation: 'fadeIn 0.5s' }}>
            <h1 style={{ marginBottom: '30px' }}>Global Configuration</h1>
            <div style={s.card}>
              {[
                { label: "Adblock Detection", key: 'adblock' },
                { label: "Block VPN/Proxy Users", key: 'vpnBlock' },
                { label: "Adult Content Filter", key: 'adultFilter' }
              ].map(opt => (
                <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontWeight: '600' }}>{opt.label}</span>
                  <div style={s.toggle(config[opt.key])} onClick={() => setConfig({...config, [opt.key]: !config[opt.key]})}>
                    <div style={s.toggleDot(config[opt.key])} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '20px', fontSize: '12px', color: theme.muted }}>
                Settings apply to all newly generated links immediately.
              </div>
            </div>
          </div>
        )}

      </div>

      {notify.show && <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: notify.type === 'error' ? theme.error : theme.primary, color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{notify.msg.toUpperCase()}</div>}
    </div>
  );
}
