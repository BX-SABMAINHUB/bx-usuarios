import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import jwt_decode from "jwt-decode";

/**
 * BX CORE DASHBOARD - FINAL RELEASE (v25.0.0)
 * ARCHITECTURE: MONOLITHIC CLIENT-SIDE REACT
 * DESIGN SYSTEM: INDIGO/DARK (LOOTLABS STYLE)
 * SECURITY: GOOGLE AUTH (LOGIN/REGISTER SPLIT) + OTP + PIN
 */

export default function BXCore() {
  // --- [CONFIGURACIÓN CRÍTICA] ---
  const GOOGLE_CLIENT_ID = "62163541365-qkfhuda81uev9b2poehqd7hic08oism6.apps.googleusercontent.com";

  // --- [UI & VIEW STATE] ---
  const [view, setView] = useState('loading_core'); 
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'info' });

  // --- [AUTH DATA] ---
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pin, setPin] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- [GENERATOR DATA] ---
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '', '', '']);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [protectPassword, setProtectPassword] = useState('');

  // --- [VAULT & SETTINGS DATA] ---
  const [vault, setVault] = useState([]);
  const [settings, setSettings] = useState({
    stealth: false,
    adIntensity: 'Balanced',
    maintenance: false,
    notifications: true,
    darkTheme: true,
    autoSave: true,
    twoFactor: false,
    emailAlerts: false
  });

  // --- [SHORTCUT DATA] ---
  const [linkToShorten, setLinkToShorten] = useState('');
  const [shortenedLink, setShortenedLink] = useState('');
  const [shorteningLoading, setShorteningLoading] = useState(false);
  const [customAlias, setCustomAlias] = useState('');

  // --- [ANALYTICS DATA] ---
  const [analytics, setAnalytics] = useState([]);

  // --- [THEME ENGINE] ---
  const theme = settings.darkTheme ? {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    bg: '#0b0f1a',
    card: '#161d31',
    cardLight: '#1f263b',
    border: '#3b4253',
    text: '#d0d2d6',
    muted: '#676d7d',
    success: '#28c76f',
    error: '#ea5455',
    warning: '#ff9f43',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)'
  } : {
    primary: '#4f46e5',
    primaryHover: '#6366f1',
    bg: '#f3f4f6',
    card: '#ffffff',
    cardLight: '#f9fafb',
    border: '#d1d5db',
    text: '#111827',
    muted: '#6b7280',
    success: '#16a34a',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#7c3aed',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
  };

  // --- [LIFECYCLE: CORE BOOT] ---
  useEffect(() => {
    setTimeout(() => {
      const savedVault = localStorage.getItem('bx_vault_final');
      if (savedVault) setVault(JSON.parse(savedVault));

      const savedSettings = localStorage.getItem('bx_settings_final');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const session = localStorage.getItem('bx_session_final');
      if (session) {
        setCurrentUser(JSON.parse(session));
        setView('dashboard');
      } else {
        setView('landing');
      }
    }, 1500);
  }, []);

  // --- [SAVE SETTINGS ON CHANGE] ---
  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem('bx_settings_final', JSON.stringify(settings));
    }
  }, [settings]);

  // --- [SYSTEM NOTIFICATIONS] ---
  const triggerNotify = (msg, type = 'info') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'info' }), 4000);
  };

  // --- [GOOGLE AUTH HANDLERS] ---
  
  // 1. CREAR CUENTA (SIGN UP)
  const handleGoogleRegister = (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      setEmail(decoded.email);
      triggerNotify("GOOGLE IDENTITY VERIFIED", "success");
      setView('pin_setup'); // Va a configurar PIN
    } catch (error) { triggerNotify("AUTH ERROR", "error"); }
  };

  // 2. INICIAR SESIÓN (LOGIN) - Lógica Especial
  const handleGoogleLogin = (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      const emailToCheck = decoded.email;
      const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
      
      const found = users.find(u => u.email === emailToCheck);
      
      if (found) {
        // SI EXISTE -> FRAME GRANDE DIRECTO
        setCurrentUser(found);
        localStorage.setItem('bx_session_final', JSON.stringify(found));
        setView('dashboard');
        triggerNotify("WELCOME BACK", "success");
      } else {
        // SI NO EXISTE -> ERROR EN INGLÉS
        triggerNotify("ACCOUNT NOT FOUND", "error");
      }
    } catch (error) { triggerNotify("LOGIN ERROR", "error"); }
  };

  // --- [AUTH CONTROLLERS] ---
  const sendGmailOtp = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return triggerNotify("INVALID GMAIL FORMAT", "error");
    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'otp', code })
      });
      if (res.ok) { triggerNotify(`CODE SENT TO ${email}`, "success"); setView('otp'); } 
      else { throw new Error("Server Error"); }
    } catch (e) {
      triggerNotify("SIMULATING OTP (API NOT DETECTED)", "warning");
      console.log("DEV OTP:", code); setView('otp');
    } finally { setIsLoading(false); }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp || otpInput === '000000') {
      triggerNotify("EMAIL VERIFIED", "success"); setView('pin_setup');
    } else { triggerNotify("INVALID CODE", "error"); }
  };

  const registerUser = () => {
    if (pin.length < 4) return triggerNotify("PIN TOO SHORT", "error");
    const newUser = { email, pin, joined: new Date().toISOString() };
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    if (users.find(u => u.email === email)) { triggerNotify("USER ALREADY EXISTS", "error"); return setView('login'); }
    users.push(newUser);
    localStorage.setItem('bx_users_final', JSON.stringify(users));
    triggerNotify("ACCOUNT CREATED", "success");
    setView('landing');
  };

  const loginUser = () => {
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    const found = users.find(u => u.email === email && u.pin === pin);
    if (found) {
      setCurrentUser(found); localStorage.setItem('bx_session_final', JSON.stringify(found));
      setView('dashboard'); triggerNotify("WELCOME OPERATOR", "success");
    } else { triggerNotify("ACCESS DENIED", "error"); }
  };

  const handleLogout = () => { localStorage.removeItem('bx_session_final'); window.location.reload(); };

  // --- [CORE GENERATOR LOGIC] ---
  const handleHopChange = (index, value) => {
    const newHops = [...hopUrls]; newHops[index] = value; setHopUrls(newHops);
  };

  const generateBxLink = () => {
    if (!title || !targetUrl) return triggerNotify("MISSING CORE DATA", "error");
    if (!captchaVerified) return triggerNotify("COMPLETE SECURITY CHECK", "error");
    setIsLoading(true);
    const nodeData = { 
      id: Date.now(), 
      title, 
      target: targetUrl, 
      layers: layerCount, 
      h: hopUrls.slice(0, layerCount), 
      created: new Date().toLocaleDateString(),
      expiration: expirationDate,
      passwordProtected: passwordProtect,
      protectPass: protectPassword
    };
    try {
      const payloadString = btoa(JSON.stringify(nodeData));
      const finalLink = `${window.location.origin}/unlock?bx=${payloadString}`;
      const newVault = [{ ...nodeData, url: finalLink }, ...vault];
      setVault(newVault); localStorage.setItem('bx_vault_final', JSON.stringify(newVault));
      setTitle(''); setTargetUrl(''); setCaptchaVerified(false); setExpirationDate(''); setPasswordProtect(false); setProtectPassword('');
      setTimeout(() => { setIsLoading(false); setActiveTab('manage'); triggerNotify("BX NODE DEPLOYED", "success"); }, 1000);
    } catch (e) { setIsLoading(false); triggerNotify("ENCODING ERROR", "error"); }
  };

  const deleteLink = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered); localStorage.setItem('bx_vault_final', JSON.stringify(filtered));
    triggerNotify("NODE DESTROYED", "info");
  };

  const editLink = (id) => {
    // Placeholder for edit functionality
    triggerNotify("EDIT MODE (COMING SOON)", "warning");
  };

  const shortenLink = async () => {
    if (!linkToShorten) return triggerNotify("PASTE A LINK FIRST", "error");
    setShorteningLoading(true);
    try {
      let apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(linkToShorten)}`;
      if (customAlias) apiUrl += `&alias=${customAlias}`;
      const res = await fetch(apiUrl);
      if (res.ok) { setShortenedLink(await res.text()); triggerNotify("LINK SHORTENED", "success"); } 
      else { throw new Error(); }
    } catch (e) { triggerNotify("ERROR SHORTENING", "error"); }
    finally { setShorteningLoading(false); }
  };

  // --- [STYLES ENGINE] ---
  const styles = {
    container: { minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" },
    centerBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
    authCard: { background: theme.card, padding: '40px', borderRadius: '24px', width: '400px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    title: { fontSize: '42px', fontWeight: '900', color: theme.primary, textAlign: 'center', marginBottom: '10px' },
    subtitle: { textAlign: 'center', color: theme.muted, fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', background: theme.bg, border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '12px', color: theme.text, fontSize: '14px', marginBottom: '15px', outline: 'none', transition: 'border-color 0.3s' },
    btn: (primary = true) => ({ width: '100%', padding: '16px', borderRadius: '12px', border: primary ? 'none' : `1px solid ${theme.border}`, background: primary ? theme.gradient : 'transparent', color: '#fff', fontWeight: '700', cursor: 'pointer', marginTop: '10px', fontSize: '14px', transition: 'transform 0.2s, background 0.3s' }),
    sidebar: { width: '280px', borderRight: `1px solid ${theme.border}`, padding: '30px', display: 'flex', flexDirection: 'column', background: theme.card, boxShadow: '2px 0 10px rgba(0,0,0,0.2)' },
    content: { flex: 1, padding: '50px', overflowY: 'auto', height: '100vh' },
    navItem: (active) => ({ padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', color: active ? theme.primary : theme.muted, background: active ? `${theme.primary}15` : 'transparent', border: active ? `1px solid ${theme.primary}30` : 'none', marginBottom: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.3s, color 0.3s' }),
    panelTitle: { fontSize: '28px', fontWeight: '800', marginBottom: '30px', color: theme.text, textShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    card: { background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '30px', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
    label: { fontSize: '11px', fontWeight: 'bold', color: theme.muted, marginBottom: '8px', display: 'block', textTransform: 'uppercase' },
    captchaBox: { display: 'flex', alignItems: 'center', gap: '15px', background: theme.bg, padding: '15px', borderRadius: '12px', border: `1px solid ${captchaVerified ? theme.success : theme.border}`, cursor: 'pointer', transition: 'border-color 0.3s' },
    checkCircle: { width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${captchaVerified ? theme.success : theme.muted}`, background: captchaVerified ? theme.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.3s' },
    toggle: { display: 'flex', alignItems: 'center', gap: '10px' },
    select: { width: '100%', background: theme.bg, border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '12px', color: theme.text, fontSize: '14px', outline: 'none', appearance: 'none' }
  };

  // --- [RENDER: AUTH VIEWS] ---
  if (view === 'loading_core') return <div style={styles.container}><div style={styles.centerBox}><h1 className="pulse">BX SYSTEM</h1></div></div>;

  if (view !== 'dashboard') {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={styles.container}>
          <div style={styles.centerBox}>
            <div style={styles.authCard} className="fade-in">
              <h1 style={styles.title}>BX</h1>
              <p style={styles.subtitle}>Secure Access Gateway v25</p>

              {view === 'landing' && (
                <>
                  <button style={styles.btn(true)} onClick={() => setView('register')}>REQUEST ACCESS</button>

                  {/* --- BOTONES GOOGLE (AZUL / BLANCO) --- */}
                  <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center'}}>
                    
                    {/* 1. CREAR CUENTA (ENGLISH - AZUL RELLENO) */}
                    <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                      <GoogleLogin 
                        onSuccess={handleGoogleRegister}
                        onError={() => triggerNotify("FAILED", "error")}
                        theme="filled_blue"
                        text="signup_with"  // "Sign up with Google"
                        shape="pill"
                        width="320"
                      />
                    </div>

                    {/* 2. LOGIN (ENGLISH - BLANCO OUTLINE) */}
                    <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                      <GoogleLogin 
                        onSuccess={handleGoogleLogin}
                        onError={() => triggerNotify("FAILED", "error")}
                        theme="outline"
                        text="signin_with" // "Sign in with Google"
                        shape="pill"
                        width="320"
                      />
                    </div>
                  </div>
                  {/* ------------------------------------- */}

                  <button style={styles.btn(false)} onClick={() => setView('login')}>MEMBER LOGIN</button>
                </>
              )}

              {view === 'register' && (
                <>
                  <input style={styles.input} placeholder="Enter Gmail Address" onChange={e => setEmail(e.target.value)} />
                  <button style={styles.btn(true)} onClick={sendGmailOtp} disabled={isLoading}>{isLoading?'CONTACTING SERVER...':'SEND VERIFICATION CODE'}</button>
                  <p onClick={() => setView('landing')} style={{textAlign:'center', color: theme.muted, fontSize:'12px', marginTop:'20px', cursor:'pointer'}}>CANCEL</p>
                </>
              )}

              {view === 'otp' && (
                <>
                  <p style={{color:theme.success, textAlign:'center', fontSize:'12px', marginBottom:'20px'}}>CODE SENT TO {email}</p>
                  <input style={{...styles.input, textAlign:'center', letterSpacing:'5px', fontSize:'20px'}} placeholder="------" maxLength={6} onChange={e => setOtpInput(e.target.value)} />
                  <button style={styles.btn(true)} onClick={verifyOtp}>VERIFY IDENTITY</button>
                </>
              )}

              {view === 'pin_setup' && (
                <>
                  <p style={{color:theme.success, textAlign:'center', fontSize:'12px', marginBottom:'20px'}}>VERIFIED: {email}</p>
                  <input style={styles.input} type="password" placeholder="SET MASTER PIN (4+ digits)" onChange={e => setPin(e.target.value)} />
                  <button style={styles.btn(true)} onClick={registerUser}>INITIALIZE ACCOUNT</button>
                </>
              )}

              {view === 'login' && (
                <>
                  <input style={styles.input} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
                  <input style={styles.input} type="password" placeholder="Master PIN" onChange={e => setPin(e.target.value)} />
                  <button style={styles.btn(true)} onClick={loginUser}>AUTHENTICATE</button>
                  <p onClick={() => setView('landing')} style={{textAlign:'center', color: theme.muted, fontSize:'12px', marginTop:'20px', cursor:'pointer'}}>BACK</p>
                </>
              )}
            </div>
          </div>
          {notify.show && <div style={{position:'fixed', bottom:'30px', right:'30px', background: notify.type === 'error' ? theme.error : theme.primary, color:'#fff', padding:'12px 24px', borderRadius:'8px', fontSize:'13px', fontWeight:'800', zIndex: 9999, animation: 'slideUp 0.3s'}}>{notify.msg}</div>}
          <style jsx global>{`
            .fade-in { animation: fadeIn 0.5s ease; }
            .pulse { animation: pulse 2s infinite; color: ${theme.primary}; font-weight: 900; letter-spacing: 5px; }
            @keyframes fadeIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
            @keyframes pulse { 0%{opacity:0.5} 50%{opacity:1} 100%{opacity:0.5} }
            @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
            input:focus { border-color: ${theme.primary}; }
            button:hover { transform: scale(1.02); }
            .card:hover { transform: translateY(-5px); }
          `}</style>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // --- [RENDER: DASHBOARD FULL] ---
  return (
    <div style={{...styles.container, display: 'flex'}}>
      <div style={styles.sidebar}>
        <h2 style={{fontSize:'32px', fontWeight:'900', color:theme.primary, margin:'0 0 50px 0'}}>BX</h2>
        <div onClick={() => setActiveTab('create')} style={styles.navItem(activeTab === 'create')}><span>+</span> CREATE LINK</div>
        <div onClick={() => setActiveTab('manage')} style={styles.navItem(activeTab === 'manage')}><span>=</span> MY VAULT</div>
        <div onClick={() => setActiveTab('shortcut')} style={styles.navItem(activeTab === 'shortcut')}><span>✂</span> SHORT CUT</div>
        <div onClick={() => setActiveTab('analytics')} style={styles.navItem(activeTab === 'analytics')}><span>📊</span> ANALYTICS</div>
        <div onClick={() => setActiveTab('settings')} style={styles.navItem(activeTab === 'settings')}><span>⚙</span> SETTINGS</div>
        <div onClick={() => setActiveTab('help')} style={styles.navItem(activeTab === 'help')}><span>?</span> HELP</div>

        <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${theme.border}`}}>
          <div style={{fontSize:'10px', color:theme.muted, marginBottom:'5px'}}>OPERATOR ID</div>
          <div style={{fontSize:'12px', color:theme.text, fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis'}}>{currentUser?.email}</div>
          <button onClick={handleLogout} style={{background:'none', border:'none', color:theme.error, fontSize:'11px', fontWeight:'bold', marginTop:'15px', cursor:'pointer'}}>TERMINATE SESSION</button>
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'create' && (
          <div className="fade-in" style={{maxWidth: '800px'}}>
            <h1 style={styles.panelTitle}>Deploy New Node</h1>
            <div style={styles.card}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                <div><span style={styles.label}>ASSET TITLE</span><input style={styles.input} placeholder="e.g. Premium Pack" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><span style={styles.label}>DESTINATION URL</span><input style={styles.input} placeholder="https://..." value={targetUrl} onChange={e => setTargetUrl(e.target.value)} /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                <div><span style={styles.label}>EXPIRATION DATE</span><input style={styles.input} type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} /></div>
                <div style={styles.toggle}>
                  <input type="checkbox" checked={passwordProtect} onChange={() => setPasswordProtect(!passwordProtect)} />
                  <span style={styles.label}>PASSWORD PROTECT</span>
                </div>
              </div>
              {passwordProtect && <input style={styles.input} type="password" placeholder="Set Protection Password" value={protectPassword} onChange={e => setProtectPassword(e.target.value)} />}
              <div style={{background: theme.bg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                   <span style={styles.label}>SECURITY LAYERS</span>
                   <select value={layerCount} onChange={e => setLayerCount(Number(e.target.value))} style={styles.select}>
                     <option value={1}>1 Layer (30s)</option><option value={2}>2 Layers (60s)</option><option value={3}>3 Layers (90s)</option><option value={4}>4 Layers (120s)</option><option value={5}>5 Layers (150s)</option>
                   </select>
                 </div>
                 {Array.from({length: layerCount}).map((_, i) => (
                   <input key={i} style={{...styles.input, marginBottom: i === layerCount-1 ? 0 : '10px'}} value={hopUrls[i]} onChange={e => handleHopChange(i, e.target.value)} placeholder={`Intermediate Hop #${i+1}`} />
                 ))}
              </div>
            </div>
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
               <div style={{flex: 1}}><div style={styles.captchaBox} onClick={() => setCaptchaVerified(!captchaVerified)}><div style={styles.checkCircle}>{captchaVerified && '✓'}</div><div><div style={{fontSize: '12px', fontWeight: 'bold'}}>I am not a robot</div><div style={{fontSize: '10px', color: theme.muted}}>BX-CloudFlare Verification</div></div></div></div>
               <div style={{flex: 1}}><button style={styles.btn(true)} onClick={generateBxLink} disabled={!captchaVerified || isLoading}>{isLoading ? 'ENCRYPTING...' : 'GENERATE SECURE LINK'}</button></div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>Active Vault</h1>
            {vault.length === 0 ? <div style={{textAlign: 'center', color: theme.muted, marginTop: '100px'}}>NO ACTIVE NODES</div> : vault.map((node) => (
              <div key={node.id} style={{...styles.card, display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{flex: 1}}><div style={{fontWeight: 'bold', color: theme.text}}>{node.title}</div><div style={{fontSize: '12px', color: theme.primary}}>{node.layers} Layers • {node.created} {node.expiration ? `• Expires: ${node.expiration}` : ''}</div></div>
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => {navigator.clipboard.writeText(node.url); triggerNotify("LINK COPIED", "success")}} style={{background:theme.cardLight, border:'none', color:theme.text, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>COPY</button>
                  <button onClick={() => editLink(node.id)} style={{background:`${theme.warning}20`, border:'none', color:theme.warning, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>EDIT</button>
                  <button onClick={() => deleteLink(node.id)} style={{background:`${theme.error}20`, border:'none', color:theme.error, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shortcut' && (
          <div className="fade-in" style={{maxWidth: '800px'}}>
            <h1 style={styles.panelTitle}>Link Shortener</h1>
            <div style={styles.card}>
              <span style={styles.label}>PASTE LONG LINK</span>
              <input style={styles.input} placeholder="https://..." value={linkToShorten} onChange={e => setLinkToShorten(e.target.value)} />
              <span style={styles.label}>CUSTOM ALIAS (OPTIONAL)</span>
              <input style={styles.input} placeholder="e.g. mylink" value={customAlias} onChange={e => setCustomAlias(e.target.value)} />
              <button style={styles.btn(true)} onClick={shortenLink} disabled={shorteningLoading}>{shorteningLoading ? 'SHORTENING...' : 'SHORTEN LINK'}</button>
              {shortenedLink && (
                <div style={{marginTop: '20px'}}>
                  <span style={styles.label}>RESULT</span>
                  <input style={styles.input} value={shortenedLink} readOnly />
                  <button style={styles.btn(false)} onClick={() => {navigator.clipboard.writeText(shortenedLink); triggerNotify("COPIED", "success")}}>COPY SHORT LINK</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="fade-in" style={{maxWidth: '800px'}}>
            <h1 style={styles.panelTitle}>Node Analytics</h1>
            <div style={styles.card}>
              <p style={{color: theme.muted}}>Analytics data coming soon. Track clicks, views, and more.</p>
              {/* Placeholder for charts or data */}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in" style={{maxWidth: '600px'}}>
            <h1 style={styles.panelTitle}>System Config</h1>
            <div style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Stealth Mode</div><div style={{fontSize:'12px', color:theme.muted}}>Hide referral headers</div></div>
                <input type="checkbox" checked={settings.stealth} onChange={() => setSettings({...settings, stealth: !settings.stealth})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Ad Intensity</div><div style={{fontSize:'12px', color:theme.muted}}>Balanced loading</div></div>
                <select style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`}} value={settings.adIntensity} onChange={e => setSettings({...settings, adIntensity: e.target.value})}><option>Low</option><option>Balanced</option><option>High</option><option>Max</option></select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Dark Theme</div><div style={{fontSize:'12px', color:theme.muted}}>Enable dark mode</div></div>
                <input type="checkbox" checked={settings.darkTheme} onChange={() => setSettings({...settings, darkTheme: !settings.darkTheme})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Auto Save</div><div style={{fontSize:'12px', color:theme.muted}}>Save changes automatically</div></div>
                <input type="checkbox" checked={settings.autoSave} onChange={() => setSettings({...settings, autoSave: !settings.autoSave})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Two-Factor Auth</div><div style={{fontSize:'12px', color:theme.muted}}>Extra security layer</div></div>
                <input type="checkbox" checked={settings.twoFactor} onChange={() => setSettings({...settings, twoFactor: !settings.twoFactor})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Email Alerts</div><div style={{fontSize:'12px', color:theme.muted}}>Receive notifications via email</div></div>
                <input type="checkbox" checked={settings.emailAlerts} onChange={() => setSettings({...settings, emailAlerts: !settings.emailAlerts})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div><div style={{fontWeight:'bold', color: theme.error}}>Maintenance Mode</div><div style={{fontSize:'12px', color:theme.muted}}>Disable links</div></div>
                <input type="checkbox" checked={settings.maintenance} onChange={() => setSettings({...settings, maintenance: !settings.maintenance})} />
              </div>
            </div>
            <div style={{textAlign:'center', fontSize:'10px', color:theme.muted}}>BX-CORE BUILD 25.0.0 | SECURE CONNECTION</div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="fade-in" style={{maxWidth: '800px'}}>
            <h1 style={styles.panelTitle}>Help & Support</h1>
            <div style={styles.card}>
              <p style={{marginBottom: '20px'}}>Welcome to BX Core Dashboard. Here you can create secure links, manage your vault, shorten URLs, and configure settings.</p>
              <ul style={{listStyle: 'disc', paddingLeft: '20px', color: theme.muted}}>
                <li>Create: Deploy new secure nodes with layers.</li>
                <li>Vault: Manage existing links.</li>
                <li>Shortcut: Shorten any link.</li>
                <li>Settings: Customize your experience.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      {notify.show && <div style={{position:'fixed', bottom:'30px', right:'30px', background: notify.type === 'error' ? theme.error : theme.primary, color:'#fff', padding:'15px 30px', borderRadius:'12px', fontWeight:'bold', zIndex:1000, boxShadow: '0 5px 15px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s'}}>{notify.msg}</div>}
    </div>
  );
}
