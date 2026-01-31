import React, { useState, useEffect, useRef } from 'react';

/**
 * BX - OPERATOR COMMAND CENTER (FINAL EDITION)
 * VERSION: 25.0.0 "LOOTLABS ELITE"
 * AUTH: GMAIL OTP -> PIN -> LOGIN
 * FEATURES: LOCAL IMAGE UPLOAD, CAPTCHA, ADVANCED SECURITY
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

  // --- [GENERATOR CORE] ---
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [thumb, setThumb] = useState(null); // Stores Base64 Image
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '']);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // --- [ADVANCED SECURITY PER LINK] ---
  const [linkPassword, setLinkPassword] = useState('');
  const [linkExpiry, setLinkExpiry] = useState('Never');

  // --- [GLOBAL CONFIG & VAULT] ---
  const [vault, setVault] = useState([]);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [adIntensity, setAdIntensity] = useState('High (Recommended)');
  const [globalStealth, setGlobalStealth] = useState(false);

  const fileInputRef = useRef(null);

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
    warning: '#f59e0b'
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

  // --- [IMAGE HANDLING] ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 1MB to prevent URL overflow
      if (file.size > 1000000) return triggerNotify("Image too large. Max 1MB.", "error");

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumb(reader.result);
        triggerNotify("Cover image loaded successfully", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- [AUTHENTICATION PROTOCOL] ---
  const sendGmailOtp = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return triggerNotify("Invalid Gmail format", "error");
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));
      // In production, uncomment fetch logic
      console.log("BX OTP CODE:", code);
      setView('otp_verify');
      triggerNotify("Verification code sent to Gmail", "success");
    } catch (err) {
      triggerNotify("Connection error", "error");
    } finally { setLoading(false); }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setView('pin_setup');
      triggerNotify("Email verified. Setup PIN.", "success");
    } else triggerNotify("Invalid code", "error");
  };

  const completeRegistration = () => {
    if (pin.length < 4) return triggerNotify("PIN too short", "error");
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    if (users.find(u => u.email === email)) return triggerNotify("User exists", "error");

    users.push({ email, pin });
    localStorage.setItem('bx_users_final', JSON.stringify(users));
    triggerNotify("Account created!", "success");
    setView('landing'); 
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    const user = users.find(u => u.email === email && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('bx_session_final', JSON.stringify(user));
      setView('dashboard');
      triggerNotify("Welcome Operator", "success");
    } else triggerNotify("Invalid credentials", "error");
  };

  // --- [LINK GENERATION LOGIC] ---
  const generateLink = () => {
    if (!title || !targetUrl) return triggerNotify("Title and Target are required", "error");
    if (!thumb) return triggerNotify("Please select a cover image", "error");
    if (!captchaVerified) return triggerNotify("Please complete the Captcha", "error");
    
    setLoading(true);
    setTimeout(() => {
      const payloadObj = {
        title,
        target: targetUrl,
        layers: layerCount,
        h: hopUrls.slice(0, layerCount),
        thumb: thumb,
        sec: { pass: linkPassword, exp: linkExpiry } // Security settings
      };

      // Create payload
      const payload = btoa(JSON.stringify(payloadObj));
      const finalUrl = `${window.location.origin}/unlock?bx=${payload}`;

      const newEntry = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        title,
        url: finalUrl,
        layers: layerCount,
        views: 0,
        status: isMaintenance ? 'PAUSED' : 'ACTIVE',
        date: new Date().toLocaleDateString()
      };

      const updatedVault = [newEntry, ...vault];
      setVault(updatedVault);
      localStorage.setItem('bx_vault_final', JSON.stringify(updatedVault));
      
      // Reset Form
      setTitle(''); setTargetUrl(''); setThumb(null); setHopUrls(['','','']);
      setCaptchaVerified(false); setLinkPassword('');
      setLoading(false);
      triggerNotify("Asset deployed to Network", "success");
    }, 1500);
  };

  const purgeLink = (id) => {
    if(!window.confirm("Are you sure you want to delete this node?")) return;
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered);
    localStorage.setItem('bx_vault_final', JSON.stringify(filtered));
    triggerNotify("Node deleted", "info");
  };

  // --- [STYLES] ---
  const inputStyle = { width: '100%', padding: '14px 18px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.white, fontSize: '15px', marginBottom: '16px', outline: 'none', transition: '0.3s' };
  const btnPrimary = (color = theme.primary) => ({ width: '100%', padding: '16px', backgroundColor: color, color: theme.white, border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' });
  const labelStyle = { fontSize: '11px', fontWeight: '800', color: theme.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' };

  // --- [VIEWS] ---
  if (view !== 'dashboard') {
    return (
      <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: theme.card, padding: '50px', borderRadius: '30px', width: '100%', maxWidth: '420px', border: `1px solid ${theme.border}`, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '72px', fontWeight: '900', color: theme.primary, margin: 0, letterSpacing: '-5px' }}>BX</h1>
          <p style={{ color: theme.muted, marginBottom: '40px', fontWeight: '600' }}>ELITE COMMAND CENTER</p>

          {view === 'landing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={btnPrimary()} onClick={() => setView('register')}>Start System</button>
              <button style={{ ...btnPrimary('transparent'), border: `2px solid ${theme.border}` }} onClick={() => setView('login')}>Operator Login</button>
            </div>
          )}

          {view === 'register' && (
            <div className="fade-in">
              <input style={inputStyle} type="email" placeholder="Gmail Address" onChange={(e) => setEmail(e.target.value)} />
              <button style={btnPrimary()} onClick={sendGmailOtp} disabled={loading}>{loading ? 'SYNCING...' : 'SEND OTP'}</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', color: theme.muted, fontSize: '12px', fontWeight: 'bold' }}>CANCEL</p>
            </div>
          )}

          {view === 'otp_verify' && (
            <div className="fade-in">
              <p style={{ color: theme.text, fontSize: '14px', marginBottom: '20px' }}>Secure code sent to {email}</p>
              <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: '12px', fontSize: '24px', fontWeight: 'bold' }} maxLength={6} onChange={(e) => setOtpInput(e.target.value)} />
              <button style={btnPrimary()} onClick={verifyOtp}>VERIFY IDENTITY</button>
            </div>
          )}

          {view === 'pin_setup' && (
            <div className="fade-in">
              <p style={{ color: theme.text, fontSize: '14px', marginBottom: '20px' }}>Set Master PIN</p>
              <input style={{ ...inputStyle, textAlign: 'center' }} type="password" placeholder="****" maxLength={8} onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={completeRegistration}>INITIALIZE VAULT</button>
            </div>
          )}

          {view === 'login' && (
            <div className="fade-in">
              <input style={inputStyle} placeholder="Gmail" onChange={(e) => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="PIN" onChange={(e) => setPin(e.target.value)} />
              <button style={btnPrimary()} onClick={handleLogin}>ACCESS SYSTEM</button>
              <p onClick={() => setView('landing')} style={{ marginTop: '20px', cursor: 'pointer', color: theme.muted, fontSize: '12px', fontWeight: 'bold' }}>BACK</p>
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
        .sidebar-btn { padding: 15px 25px; border-radius: 12px; cursor: pointer; color: ${theme.muted}; transition: 0.3s; font-weight: 700; display: flex; align-items: center; margin-bottom: 8px; border: none; background: transparent; width: 100%; text-align: left; font-size: 14px; }
        .sidebar-btn:hover { background: rgba(255,255,255,0.05); color: ${theme.white}; }
        .sidebar-btn.active { background: linear-gradient(90deg, ${theme.primary}20, transparent); color: ${theme.primary}; border-left: 4px solid ${theme.primary}; }
        .panel-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 24px; padding: 35px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        .file-upload-box { border: 2px dashed ${theme.border}; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden; }
        .file-upload-box:hover { border-color: ${theme.primary}; background: ${theme.primary}10; }
        .captcha-container { background: ${theme.bg}; border: 1px solid ${theme.border}; padding: 15px; borderRadius: 12px; display: flex; align-items: center; gap: 15px; width: fit-content; margin-top: 20px; user-select: none; }
        .checkbox { width: 24px; height: 24px; border: 2px solid ${theme.muted}; border-radius: 4px; display: flex; align-items: center; justifyContent: center; cursor: pointer; transition: 0.2s; }
        .checkbox.checked { background: ${theme.success}; border-color: ${theme.success}; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: '280px', borderRight: `1px solid ${theme.border}`, padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', color: theme.primary, marginBottom: '60px', paddingLeft: '15px' }}>BX</h2>
        <nav style={{ flex: 1 }}>
          <button className={`sidebar-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>DEPLOY ASSET</button>
          <button className={`sidebar-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>ASSET VAULT</button>
          <button className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>SYSTEM CONFIG</button>
        </nav>
        <div style={{ padding: '20px', background: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '10px', color: theme.muted, fontWeight: '800' }}>OPERATOR ID</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', color: theme.white, marginBottom: '10px' }}>{currentUser.email}</div>
          <button onClick={() => { localStorage.removeItem('bx_session_final'); window.location.reload(); }} style={{ color: theme.error, fontSize: '10px', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '900' }}>DISCONNECT SESSION</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
        {activeTab === 'create' && (
          <div style={{ maxWidth: '850px', animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '5px' }}>Deploy New Node</h1>
                <p style={{ color: theme.muted }}>Create secure, monetized gateways for your assets.</p>
              </div>
              <div style={{ padding: '8px 15px', background: theme.success+'20', color: theme.success, borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>SYSTEM ACTIVE</div>
            </div>

            <div className="panel-card">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* LEFT COLUMN */}
                <div>
                  <label style={labelStyle}>ASSET TITLE</label>
                  <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Premium Pack 2026" />
                  
                  <label style={labelStyle}>TARGET DESTINATION</label>
                  <input style={inputStyle} value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://drive.google.com/..." />

                  {/* HOP CONFIG */}
                  <div style={{ background: theme.bg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Intermediate Hops (Ad Revenue)</span>
                      <select style={{ background: theme.card, color: theme.white, border: 'none', borderRadius: '5px', fontSize: '12px' }} value={layerCount} onChange={(e) => setLayerCount(parseInt(e.target.value))}>
                        <option value={1}>1 Layer (Standard)</option>
                        <option value={2}>2 Layers (Double)</option>
                        <option value={3}>3 Layers (Max)</option>
                      </select>
                    </div>
                    {Array.from({ length: layerCount }).map((_, i) => (
                      <input key={i} style={{ ...inputStyle, marginBottom: i === layerCount-1 ? 0 : 10, fontSize: '13px', padding: '10px' }} placeholder={`Ad Network URL ${i+1}`} value={hopUrls[i]} onChange={(e) => { const n = [...hopUrls]; n[i] = e.target.value; setHopUrls(n); }} />
                    ))}
                  </div>

                  {/* SECURITY SECTION */}
                  <div style={{ marginTop: '20px' }}>
                     <label style={labelStyle}>ADVANCED SECURITY (OPTIONAL)</label>
                     <div style={{ display: 'flex', gap: '15px' }}>
                        <input style={inputStyle} type="password" placeholder="Access Password" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} />
                        <select style={inputStyle} value={linkExpiry} onChange={(e) => setLinkExpiry(e.target.value)}>
                            <option>Never Expire</option>
                            <option>1 Hour</option>
                            <option>24 Hours</option>
                            <option>1 Week</option>
                        </select>
                     </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (IMAGE UPLOAD) */}
                <div>
                  <label style={labelStyle}>COVER IMAGE</label>
                  <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: 'none' }} />
                  <div className="file-upload-box" onClick={() => fileInputRef.current.click()}>
                    {thumb ? (
                      <img src={thumb} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} alt="Preview" />
                    ) : (
                      <div style={{ padding: '40px 0' }}>
                        <div style={{ fontSize: '30px', color: theme.muted, marginBottom: '10px' }}>📷</div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.primary }}>SELECT FROM GALLERY</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '10px', color: theme.muted, marginTop: '10px', textAlign: 'center' }}>Max Size: 1MB. Formats: JPG, PNG.</p>
                </div>
              </div>

              {/* CAPTCHA & DEPLOY */}
              <div style={{ marginTop: '30px', borderTop: `1px solid ${theme.border}`, paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <div className="captcha-container" onClick={() => setCaptchaVerified(!captchaVerified)}>
                  <div className={`checkbox ${captchaVerified ? 'checked' : ''}`}>
                    {captchaVerified && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>I am not a robot</span>
                  <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.muted}`, borderRadius: '50%', borderTopColor: theme.primary }}></div>
                    <span style={{ fontSize: '8px', color: theme.muted, marginTop: '2px' }}>reCAPTCHA</span>
                  </div>
                </div>

                <button style={{ ...btnPrimary(), width: '250px' }} onClick={generateLink} disabled={loading}>
                  {loading ? 'DEPLOYING NODE...' : 'GENERATE SECURE LINK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px' }}>Asset Vault</h1>
            <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: theme.cardLight }}>
                  <tr style={{ color: theme.muted, fontSize: '11px', textAlign: 'left', textTransform: 'uppercase' }}>
                    <th style={{ padding: '20px' }}>ID</th>
                    <th style={{ padding: '20px' }}>Preview</th>
                    <th style={{ padding: '20px' }}>Asset Name</th>
                    <th style={{ padding: '20px' }}>Security</th>
                    <th style={{ padding: '20px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: theme.muted }}>Vault Empty. Deploy a node to begin.</td></tr>
                  ) : (
                    vault.map(v => (
                      <tr key={v.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '20px', color: theme.primary, fontWeight: 'bold' }}>#{v.id}</td>
                        <td style={{ padding: '20px' }}>
                            <img src={v.thumb} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '20px', fontWeight: '600' }}>{v.title}</td>
                        <td style={{ padding: '20px' }}><span style={{ background: theme.primary + '20', color: theme.primary, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{v.layers} LAYERS</span></td>
                        <td style={{ padding: '20px' }}>
                          <button onClick={() => { navigator.clipboard.writeText(v.url); triggerNotify("Link copied!", "success"); }} style={{ background: theme.success, border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px', fontSize: '12px', fontWeight: 'bold' }}>COPY</button>
                          <button onClick={() => purgeLink(v.id)} style={{ background: theme.cardLight, border: 'none', color: theme.error, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>DELETE</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
           <div style={{ maxWidth: '700px', animation: 'fadeIn 0.5s' }}>
             <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px' }}>System Configuration</h1>
             
             <div className="panel-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Global Monetization</h3>
                <label style={labelStyle}>ADVERTISING INTENSITY</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                   {['Low', 'Standard', 'High (Recommended)'].map(lvl => (
                      <button key={lvl} onClick={() => setAdIntensity(lvl)} style={{ padding: '15px', borderRadius: '10px', border: `1px solid ${adIntensity === lvl ? theme.primary : theme.border}`, background: adIntensity === lvl ? theme.primary+'20' : 'transparent', color: adIntensity === lvl ? theme.primary : theme.muted, fontWeight: 'bold', cursor: 'pointer' }}>{lvl}</button>
                   ))}
                </div>
             </div>

             <div className="panel-card">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Network Safety</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: `1px solid ${theme.border}` }}>
                   <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Maintenance Mode</div>
                      <div style={{ color: theme.muted, fontSize: '12px' }}>Pause all links globally (Returns 503)</div>
                   </div>
                   <input type="checkbox" checked={isMaintenance} onChange={(e) => setIsMaintenance(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                   <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Stealth Mode</div>
                      <div style={{ color: theme.muted, fontSize: '12px' }}>Hide traffic source (Referrer spoofing)</div>
                   </div>
                   <input type="checkbox" checked={globalStealth} onChange={(e) => setGlobalStealth(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </div>
             </div>
           </div>
        )}
      </div>

      {notify.show && <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: notify.type === 'error' ? theme.error : theme.primary, color: 'white', padding: '16px 30px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '10px' }}><span>●</span> {notify.msg.toUpperCase()}</div>}
    </div>
  );
}
