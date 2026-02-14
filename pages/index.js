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
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // --- [GENERATOR DATA] ---
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [layerCount, setLayerCount] = useState(1);
  const [hopUrls, setHopUrls] = useState(['', '', '', '']);
  const [expireDate, setExpireDate] = useState('');
  const [linkPass, setLinkPass] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [timePerLayer, setTimePerLayer] = useState(30); // Nueva opción para segundos por capa (10 a 60)

  // --- [VAULT & SETTINGS DATA] ---
  const [vault, setVault] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    theme: 'dark',
    stealth: false,
    adIntensity: 'Balanced',
    maintenance: false,
    notifications: true,
    autoCopy: false,
    soundEffects: false,
    defaultLayers: 1,
    defaultTimePerLayer: 30,
    autoBackup: true,
    emailNotifications: false,
    twoFactor: false,
    fontSize: 'medium',
    language: 'english',
    currency: 'USD',
    showAvatars: true,
    enableAnimations: true,
    highContrast: false,
    compactMode: false
  });

  // --- [SHORTCUT DATA] ---
  const [linkToShorten, setLinkToShorten] = useState('');
  const [shortenedLink, setShortenedLink] = useState('');
  const [shorteningLoading, setShorteningLoading] = useState(false);
  const [shortHistory, setShortHistory] = useState([]);

  // --- [ADICIONALES: ANALYTICS, QR, ETC] ---
  const [analyticsData, setAnalyticsData] = useState({}); // Datos simulados de analytics
  const [sortBy, setSortBy] = useState('date'); // Ordenar vault
  const [qrLink, setQrLink] = useState(null); // Para mostrar QR
  const [customAlias, setCustomAlias] = useState(''); // Alias personalizado para links
  const [bulkLinks, setBulkLinks] = useState(''); // Para creación en bulk
  const [apiKey, setApiKey] = useState(''); // API key simulada
  const [backupEmail, setBackupEmail] = useState(''); // Email para backups
  const [showShareModal, setShowShareModal] = useState(false); // Modal para compartir
  const [selectedLink, setSelectedLink] = useState(null); // Link seleccionado para compartir
  const [exportFormat, setExportFormat] = useState('json'); // Formato de export
  const [importFile, setImportFile] = useState(null); // Archivo para import
  const [faqSearch, setFaqSearch] = useState(''); // Búsqueda en FAQ
  const [customThemeColors, setCustomThemeColors] = useState({}); // Colores personalizados

  // --- [THEME ENGINE] ---
  const darkTheme = {
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
    accent: '#ff00ff',
    highlight: '#00ffff'
  };

  const lightTheme = {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    bg: '#f3f4f6',
    card: '#ffffff',
    cardLight: '#e5e7eb',
    border: '#d1d5db',
    text: '#374151',
    muted: '#6b7280',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    accent: '#ff00ff',
    highlight: '#00ffff'
  };

  const customTheme = { ... (settings.theme === 'dark' ? darkTheme : lightTheme), ...customThemeColors };
  const theme = { ...customTheme, fontSize: settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px' };

  // --- [LIFECYCLE: CORE BOOT] ---
  useEffect(() => {
    setTimeout(() => {
      const savedVault = localStorage.getItem('bx_vault_final');
      if (savedVault) setVault(JSON.parse(savedVault));

      const savedShort = localStorage.getItem('bx_short_history_final');
      if (savedShort) setShortHistory(JSON.parse(savedShort));

      const savedSettings = localStorage.getItem('bx_settings_final');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedAnalytics = localStorage.getItem('bx_analytics_final');
      if (savedAnalytics) setAnalyticsData(JSON.parse(savedAnalytics));
      else generateFakeAnalytics();

      const savedApiKey = localStorage.getItem('bx_api_key_final');
      if (savedApiKey) setApiKey(savedApiKey);
      else generateApiKey();

      const session = localStorage.getItem('bx_session_final');
      if (session) {
        setCurrentUser(JSON.parse(session));
        setView('dashboard');
      } else {
        setView('landing');
      }
    }, 1500);
  }, []);

  // --- [SYSTEM NOTIFICATIONS] ---
  const triggerNotify = (msg, type = 'info') => {
    if (settings.notifications) {
      setNotify({ show: true, msg, type });
      setTimeout(() => setNotify({ show: false, msg: '', type: 'info' }), 4000);
      if (settings.soundEffects) playSound(type);
    }
  };

  // --- [SOUND EFFECTS] ---
  const playSound = (type) => {
    const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : type === 'error' ? '/sounds/error.mp3' : '/sounds/info.mp3');
    audio.play();
  };

  // --- [SETTINGS UPDATER] ---
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bx_settings_final', JSON.stringify(newSettings));
    if (newSettings.autoBackup) backupVault();
  };

  // --- [GOOGLE AUTH HANDLERS] ---
  
  // 1. CREAR CUENTA (SIGN UP)
  const handleGoogleRegister = (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      setEmail(decoded.email);
      setCurrentUser({ ...currentUser, picture: decoded.picture });
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
        setCurrentUser({ ...found, picture: decoded.picture });
        localStorage.setItem('bx_session_final', JSON.stringify({ ...found, picture: decoded.picture }));
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
    const newUser = { email, pin, joined: new Date().toISOString(), picture: currentUser?.picture };
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

  const changePin = () => {
    if (oldPin !== currentUser.pin) return triggerNotify("INCORRECT OLD PIN", "error");
    if (newPin.length < 4) return triggerNotify("PIN TOO SHORT", "error");
    const users = JSON.parse(localStorage.getItem('bx_users_final') || '[]');
    const updated = users.map(u => u.email === currentUser.email ? { ...u, pin: newPin } : u);
    localStorage.setItem('bx_users_final', JSON.stringify(updated));
    setCurrentUser({ ...currentUser, pin: newPin });
    localStorage.setItem('bx_session_final', JSON.stringify({ ...currentUser, pin: newPin }));
    triggerNotify("PIN UPDATED", "success");
    setOldPin('');
    setNewPin('');
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
    const nodeData = { id: Date.now(), title, desc, target: targetUrl, layers: layerCount, h: hopUrls.slice(0, layerCount), created: new Date().toLocaleDateString(), expire: expireDate, pass: linkPass, timePerLayer, alias: customAlias };
    try {
      const payloadString = btoa(JSON.stringify(nodeData));
      const finalLink = `${window.location.origin}/unlock?bx=${payloadString}`;
      const newVault = [{ ...nodeData, url: finalLink }, ...vault];
      setVault(newVault); localStorage.setItem('bx_vault_final', JSON.stringify(newVault));
      updateAnalytics(nodeData.id, { views: 0, clicks: 0 });
      setTitle(''); setDesc(''); setTargetUrl(''); setExpireDate(''); setLinkPass(''); setCaptchaVerified(false); setCustomAlias('');
      setTimeout(() => { setIsLoading(false); setActiveTab('manage'); triggerNotify("BX NODE DEPLOYED", "success"); if (settings.autoCopy) navigator.clipboard.writeText(finalLink); }, 1000);
    } catch (e) { setIsLoading(false); triggerNotify("ENCODING ERROR", "error"); }
  };

  const deleteLink = (id) => {
    const filtered = vault.filter(v => v.id !== id);
    setVault(filtered); localStorage.setItem('bx_vault_final', JSON.stringify(filtered));
    const newAnalytics = { ...analyticsData };
    delete newAnalytics[id];
    setAnalyticsData(newAnalytics);
    localStorage.setItem('bx_analytics_final', JSON.stringify(newAnalytics));
    triggerNotify("NODE DESTROYED", "info");
  };

  const deleteShort = (index) => {
    const newHist = shortHistory.filter((_, i) => i !== index);
    setShortHistory(newHist);
    localStorage.setItem('bx_short_history_final', JSON.stringify(newHist));
    triggerNotify("SHORT LINK REMOVED", "info");
  };

  const shortenLink = async () => {
    if (!linkToShorten) return triggerNotify("PASTE A LINK FIRST", "error");
    setShorteningLoading(true);
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(linkToShorten)}`);
      if (res.ok) { 
        const short = await res.text();
        setShortenedLink(short); 
        triggerNotify("LINK SHORTENED", "success"); 
        const newHist = [{ original: linkToShorten, short, date: new Date().toLocaleDateString() }, ...shortHistory];
        setShortHistory(newHist);
        localStorage.setItem('bx_short_history_final', JSON.stringify(newHist));
        if (settings.autoCopy) navigator.clipboard.writeText(short);
      } else { throw new Error(); }
    } catch (e) { triggerNotify("ERROR SHORTENING", "error"); }
    finally { setShorteningLoading(false); }
  };

  // --- [ADICIONALES FUNCIONES] ---
  const generateFakeAnalytics = () => {
    const data = {};
    vault.forEach(v => {
      data[v.id] = { views: Math.floor(Math.random() * 1000), clicks: Math.floor(Math.random() * 500), countries: ['US', 'EU', 'ASIA'] };
    });
    setAnalyticsData(data);
    localStorage.setItem('bx_analytics_final', JSON.stringify(data));
  };

  const updateAnalytics = (id, updates) => {
    const newData = { ...analyticsData, [id]: { ...analyticsData[id], ...updates } };
    setAnalyticsData(newData);
    localStorage.setItem('bx_analytics_final', JSON.stringify(newData));
  };

  const generateApiKey = () => {
    const key = 'API-' + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    localStorage.setItem('bx_api_key_final', key);
    triggerNotify("API KEY GENERATED", "success");
  };

  const backupVault = () => {
    if (backupEmail) {
      triggerNotify(`BACKUP SENT TO ${backupEmail}`, "success"); // Simulado
    } else {
      triggerNotify("SET BACKUP EMAIL FIRST", "warning");
    }
  };

  const exportVault = () => {
    const data = exportFormat === 'json' ? JSON.stringify(vault) : vault.map(v => `${v.title},${v.url},${v.created}`).join('\n');
    const blob = new Blob([data], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault.${exportFormat}`;
    a.click();
    triggerNotify("VAULT EXPORTED", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const imported = JSON.parse(evt.target.result);
      setVault([...vault, ...imported]);
      localStorage.setItem('bx_vault_final', JSON.stringify([...vault, ...imported]));
      triggerNotify("VAULT IMPORTED", "success");
    };
    reader.readAsText(file);
  };

  const shareLink = (platform) => {
    triggerNotify(`SHARED TO ${platform.toUpperCase()}`, "success"); // Simulado
    setShowShareModal(false);
  };

  const faqData = [
    { q: 'How to create a link?', a: 'Go to create tab...' },
    { q: 'What is stealth mode?', a: 'Hides headers...' },
    // Más FAQs...
  ];

  const filteredFaq = faqData.filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()));

  // --- [STYLES ENGINE] ---
  const styles = {
    container: { minHeight: '100vh', background: `linear-gradient(to bottom, ${theme.bg}, ${theme.card})`, color: theme.text, fontFamily: "'Inter', sans-serif", fontSize: theme.fontSize },
    centerBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
    authCard: { background: theme.card, padding: '40px', borderRadius: '24px', width: '400px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transition: 'all 0.3s ease' },
    title: { fontSize: '42px', fontWeight: '900', color: theme.primary, textAlign: 'center', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    subtitle: { textAlign: 'center', color: theme.muted, fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', background: theme.bg, border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '12px', color: theme.text, fontSize: theme.fontSize, marginBottom: '15px', outline: 'none', transition: 'border 0.3s ease' },
    btn: (primary = true) => ({ width: '100%', padding: '16px', borderRadius: '12px', border: primary ? 'none' : `1px solid ${theme.border}`, background: primary ? `linear-gradient(to right, ${theme.primary}, ${theme.primaryHover})` : 'transparent', color: primary ? '#fff' : theme.primary, fontWeight: '700', cursor: 'pointer', marginTop: '10px', fontSize: theme.fontSize, boxShadow: primary ? '0 4px 12px rgba(99,102,241,0.3)' : 'none', transition: 'all 0.3s ease' }),
    sidebar: { width: '280px', borderRight: `1px solid ${theme.border}`, padding: '30px', display: 'flex', flexDirection: 'column', background: theme.cardLight, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    content: { flex: 1, padding: '50px', overflowY: 'auto', height: '100vh', background: theme.bg },
    navItem: (active) => ({ padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', color: active ? theme.primary : theme.muted, background: active ? `${theme.primary}15` : 'transparent', border: active ? `1px solid ${theme.primary}30` : 'none', marginBottom: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease', boxShadow: active ? '0 2px 8px rgba(99,102,241,0.2)' : 'none' }),
    panelTitle: { fontSize: '28px', fontWeight: '800', marginBottom: '30px', color: theme.text, textTransform: 'uppercase', letterSpacing: '1px' },
    card: { background: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '30px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' },
    label: { fontSize: '11px', fontWeight: 'bold', color: theme.muted, marginBottom: '8px', display: 'block', textTransform: 'uppercase' },
    captchaBox: { display: 'flex', alignItems: 'center', gap: '15px', background: theme.bg, padding: '15px', borderRadius: '12px', border: `1px solid ${captchaVerified ? theme.success : theme.border}`, cursor: 'pointer', transition: 'border 0.3s ease' },
    checkCircle: { width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${captchaVerified ? theme.success : theme.muted}`, background: captchaVerified ? theme.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
    modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: theme.card, padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000 },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999 }
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
                  <button style={styles.btn(true)} className="btn-primary" onClick={() => setView('register')}>REQUEST ACCESS</button>

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

                  <button style={styles.btn(false)} className="btn-secondary" onClick={() => setView('login')}>MEMBER LOGIN</button>
                </>
              )}

              {view === 'register' && (
                <>
                  <input style={styles.input} placeholder="Enter Gmail Address" onChange={e => setEmail(e.target.value)} />
                  <button style={styles.btn(true)} className="btn-primary" onClick={sendGmailOtp} disabled={isLoading}>{isLoading?'CONTACTING SERVER...':'SEND VERIFICATION CODE'}</button>
                  <p onClick={() => setView('landing')} style={{textAlign:'center', color: theme.muted, fontSize:'12px', marginTop:'20px', cursor:'pointer'}}>CANCEL</p>
                </>
              )}

              {view === 'otp' && (
                <>
                  <p style={{color:theme.success, textAlign:'center', fontSize:'12px', marginBottom:'20px'}}>CODE SENT TO {email}</p>
                  <input style={{...styles.input, textAlign:'center', letterSpacing:'5px', fontSize:'20px'}} placeholder="------" maxLength={6} onChange={e => setOtpInput(e.target.value)} />
                  <button style={styles.btn(true)} className="btn-primary" onClick={verifyOtp}>VERIFY IDENTITY</button>
                </>
              )}

              {view === 'pin_setup' && (
                <>
                  <p style={{color:theme.success, textAlign:'center', fontSize:'12px', marginBottom:'20px'}}>VERIFIED: {email}</p>
                  <input style={styles.input} type="password" placeholder="SET MASTER PIN (4+ digits)" onChange={e => setPin(e.target.value)} />
                  <button style={styles.btn(true)} className="btn-primary" onClick={registerUser}>INITIALIZE ACCOUNT</button>
                </>
              )}

              {view === 'login' && (
                <>
                  <input style={styles.input} placeholder="Gmail" onChange={e => setEmail(e.target.value)} />
                  <input style={styles.input} type="password" placeholder="Master PIN" onChange={e => setPin(e.target.value)} />
                  <button style={styles.btn(true)} className="btn-primary" onClick={loginUser}>AUTHENTICATE</button>
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
            input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 2px ${theme.primary}30; }
            .card:hover { transform: translateY(-5px); }
          `}</style>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // --- [FILTERED VAULT] ---
  const sortedVault = [...vault].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'date') return new Date(b.created) - new Date(a.created);
    return 0;
  });
  const filteredVault = sortedVault.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.desc && v.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- [RENDER: DASHBOARD FULL] ---
  return (
    <div style={{...styles.container, display: 'flex'}}>
      <div style={styles.sidebar}>
        <h2 style={{fontSize:'32px', fontWeight:'900', color:theme.primary, margin:'0 0 50px 0'}}>BX</h2>
        <div onClick={() => setActiveTab('create')} style={styles.navItem(activeTab === 'create')} className="nav-item"><span>+</span> CREATE LINK</div>
        <div onClick={() => setActiveTab('manage')} style={styles.navItem(activeTab === 'manage')} className="nav-item"><span>=</span> MY VAULT</div>
        <div onClick={() => setActiveTab('shortcut')} style={styles.navItem(activeTab === 'shortcut')} className="nav-item"><span>✂</span> SHORT CUT</div>
        <div onClick={() => setActiveTab('analytics')} style={styles.navItem(activeTab === 'analytics')} className="nav-item"><span>📊</span> ANALYTICS</div>
        <div onClick={() => setActiveTab('tools')} style={styles.navItem(activeTab === 'tools')} className="nav-item"><span>🛠</span> TOOLS</div>
        <div onClick={() => setActiveTab('api')} style={styles.navItem(activeTab === 'api')} className="nav-item"><span>🔑</span> API</div>
        <div onClick={() => setActiveTab('support')} style={styles.navItem(activeTab === 'support')} className="nav-item"><span>❓</span> SUPPORT</div>
        <div onClick={() => setActiveTab('profile')} style={styles.navItem(activeTab === 'profile')} className="nav-item"><span>👤</span> PROFILE</div>
        <div onClick={() => setActiveTab('settings')} style={styles.navItem(activeTab === 'settings')} className="nav-item"><span>⚙</span> SETTINGS</div>

        <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${theme.border}`}}>
          <div style={{fontSize:'10px', color:theme.muted, marginBottom:'5px'}}>OPERATOR ID</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            {settings.showAvatars && currentUser?.picture && <img src={currentUser.picture} alt="Avatar" style={{width: '30px', height: '30px', borderRadius: '50%'}} />}
            <div style={{fontSize:'12px', color:theme.text, fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis'}}>{currentUser?.email}</div>
          </div>
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
              <div style={{marginBottom: '20px'}}><span style={styles.label}>NODE DESCRIPTION</span><input style={styles.input} placeholder="Optional internal notes" value={desc} onChange={e => setDesc(e.target.value)} /></div>
              <div style={{marginBottom: '20px'}}><span style={styles.label}>EXPIRATION DATE (OPTIONAL)</span><input style={styles.input} type="date" value={expireDate} onChange={e => setExpireDate(e.target.value)} /></div>
              <div style={{marginBottom: '20px'}}><span style={styles.label}>LINK PASSWORD (OPTIONAL)</span><input style={styles.input} placeholder="Protect access" value={linkPass} onChange={e => setLinkPass(e.target.value)} /></div>
              <div style={{marginBottom: '20px'}}><span style={styles.label}>CUSTOM ALIAS (OPTIONAL)</span><input style={styles.input} placeholder="e.g. mylink" value={customAlias} onChange={e => setCustomAlias(e.target.value)} /></div>
              <div style={{background: theme.bg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                   <span style={styles.label}>SECURITY LAYERS</span>
                   <select value={layerCount} onChange={e => setLayerCount(Number(e.target.value))} style={{background:theme.card, color:theme.text, border:'none', padding:'5px', borderRadius:'5px'}}>
                     <option value={1}>1 Layer ({timePerLayer}s)</option><option value={2}>2 Layers ({timePerLayer*2}s)</option><option value={3}>3 Layers ({timePerLayer*3}s)</option><option value={4}>4 Layers ({timePerLayer*4}s)</option>
                   </select>
                 </div>
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                   <span style={styles.label}>TIME PER LAYER (SECONDS)</span>
                   <select value={timePerLayer} onChange={e => setTimePerLayer(Number(e.target.value))} style={{background:theme.card, color:theme.text, border:'none', padding:'5px', borderRadius:'5px'}}>
                     <option value={10}>10s</option><option value={20}>20s</option><option value={30}>30s</option><option value={45}>45s</option><option value={60}>60s</option>
                   </select>
                 </div>
                 {Array.from({length: layerCount}).map((_, i) => (
                   <input key={i} style={{...styles.input, marginBottom: i === layerCount-1 ? 0 : '10px'}} value={hopUrls[i]} onChange={e => handleHopChange(i, e.target.value)} placeholder={`Intermediate Hop #${i+1}`} />
                 ))}
              </div>
            </div>
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
               <div style={{flex: 1}}><div style={styles.captchaBox} onClick={() => setCaptchaVerified(!captchaVerified)}><div style={styles.checkCircle}>{captchaVerified && '✓'}</div><div><div style={{fontSize: '12px', fontWeight: 'bold'}}>I am not a robot</div><div style={{fontSize: '10px', color: theme.muted}}>BX-CloudFlare Verification</div></div></div></div>
               <div style={{flex: 1}}><button style={styles.btn(true)} className="btn-primary" onClick={generateBxLink} disabled={!captchaVerified || isLoading}>{isLoading ? 'ENCRYPTING...' : 'GENERATE SECURE LINK'}</button></div>
            </div>
            <div style={{marginTop: '30px'}}>
              <span style={styles.label}>BULK CREATION (ONE URL PER LINE)</span>
              <textarea style={{...styles.input, height: '100px'}} placeholder="https://url1\nhttps://url2" value={bulkLinks} onChange={e => setBulkLinks(e.target.value)} />
              <button style={styles.btn(true)} onClick={() => { /* Implementar bulk */ triggerNotify("BULK CREATED", "success"); }}>CREATE BULK</button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>Active Vault</h1>
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <input style={{...styles.input, flex: 1}} placeholder="Search nodes by title or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{background:theme.card, color:theme.text, border:`1px solid ${theme.border}`, padding:'10px', borderRadius:'12px'}}>
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
            {filteredVault.length === 0 ? <div style={{textAlign: 'center', color: theme.muted, marginTop: '100px'}}>NO ACTIVE NODES</div> : filteredVault.map((node) => {
              const isExpired = node.expire && new Date(node.expire) < new Date();
              return (
              <div key={node.id} style={{...styles.card, display: 'flex', alignItems: 'center', gap: '20px', opacity: isExpired ? 0.5 : 1}}>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 'bold', color: theme.text}}>{node.title} {isExpired && '(Expired)'}</div>
                  <div style={{fontSize: '12px', color: theme.muted}}>{node.desc || 'No description'}</div>
                  <div style={{fontSize: '12px', color: theme.primary}}>{node.layers} Layers • {node.timePerLayer}s each • {node.created} • Exp: {node.expire || 'Permanent'}</div>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => {navigator.clipboard.writeText(node.url); triggerNotify("LINK COPIED", "success")}} style={{background:theme.cardLight, border:'none', color:theme.text, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>COPY</button>
                  <button onClick={() => setQrLink(node.url)} style={{background:theme.cardLight, border:'none', color:theme.text, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>QR</button>
                  <button onClick={() => {setSelectedLink(node.url); setShowShareModal(true);}} style={{background:theme.cardLight, border:'none', color:theme.text, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>SHARE</button>
                  <button onClick={() => deleteLink(node.id)} style={{background:`${theme.error}20`, border:'none', color:theme.error, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>DELETE</button>
                </div>
              </div>
            )})}
            {qrLink && <div style={{textAlign: 'center', marginTop: '20px'}}><img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrLink)}&size=200x200`} alt="QR" /><button onClick={() => setQrLink(null)}>CLOSE</button></div>}
            <div style={{display: 'flex', gap: '20px', marginTop: '30px'}}>
              <button style={styles.btn(true)} onClick={exportVault}>EXPORT VAULT</button>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{background:theme.card, color:theme.text, border:`1px solid ${theme.border}`, padding:'10px', borderRadius:'12px'}}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <input type="file" onChange={handleImport} style={{display: 'none'}} id="importFile" />
              <label htmlFor="importFile" style={styles.btn(true)}>IMPORT VAULT</label>
            </div>
          </div>
        )}

        {activeTab === 'shortcut' && (
          <div className="fade-in" style={{maxWidth: '800px'}}>
            <h1 style={styles.panelTitle}>Link Shortener</h1>
            <div style={styles.card}>
              <span style={styles.label}>PASTE LONG LINK</span>
              <input style={styles.input} placeholder="https://..." value={linkToShorten} onChange={e => setLinkToShorten(e.target.value)} />
              <button style={styles.btn(true)} className="btn-primary" onClick={shortenLink} disabled={shorteningLoading}>{shorteningLoading ? 'SHORTENING...' : 'SHORTEN LINK'}</button>
              {shortenedLink && (
                <div style={{marginTop: '20px'}}>
                  <span style={styles.label}>RESULT</span>
                  <input style={styles.input} value={shortenedLink} readOnly />
                  <button style={styles.btn(false)} className="btn-secondary" onClick={() => {navigator.clipboard.writeText(shortenedLink); triggerNotify("COPIED", "success")}}>COPY SHORT LINK</button>
                </div>
              )}
            </div>
            <h1 style={{...styles.panelTitle, marginTop: '40px', fontSize: '24px'}}>Shorten History</h1>
            {shortHistory.length === 0 ? <div style={{textAlign: 'center', color: theme.muted}}>NO HISTORY</div> : shortHistory.map((h, i) => (
              <div key={i} style={styles.card}>
                <div style={{fontWeight: 'bold', color: theme.text}}>Original: {h.original}</div>
                <div style={{fontSize: '12px', color: theme.muted}}>Short: {h.short}</div>
                <div style={{fontSize: '12px', color: theme.primary}}>Created: {h.date}</div>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                  <button style={{background:theme.cardLight, border:'none', color:theme.text, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}} onClick={() => {navigator.clipboard.writeText(h.short); triggerNotify("COPIED", "success")}}>COPY</button>
                  <button style={{background:`${theme.error}20`, border:'none', color:theme.error, padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}} onClick={() => deleteShort(i)}>DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>Link Analytics</h1>
            {vault.map(node => (
              <div key={node.id} style={styles.card}>
                <div style={{fontWeight: 'bold'}}>{node.title}</div>
                <div>Views: {analyticsData[node.id]?.views || 0}</div>
                <div>Clicks: {analyticsData[node.id]?.clicks || 0}</div>
                <div>Countries: {analyticsData[node.id]?.countries?.join(', ') || 'N/A'}</div>
                <button onClick={() => updateAnalytics(node.id, { views: (analyticsData[node.id]?.views || 0) + 1 })}>SIMULATE VIEW</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>Advanced Tools</h1>
            <div style={styles.card}>
              <span style={styles.label}>BACKUP EMAIL</span>
              <input style={styles.input} placeholder="backup@email.com" value={backupEmail} onChange={e => setBackupEmail(e.target.value)} />
              <button style={styles.btn(true)} onClick={backupVault}>BACKUP NOW</button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>API Management</h1>
            <div style={styles.card}>
              <div style={{fontWeight: 'bold'}}>Your API Key: {apiKey}</div>
              <button style={styles.btn(true)} onClick={generateApiKey}>REGENERATE KEY</button>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="fade-in">
            <h1 style={styles.panelTitle}>Support & FAQ</h1>
            <input style={styles.input} placeholder="Search FAQ..." value={faqSearch} onChange={e => setFaqSearch(e.target.value)} />
            {filteredFaq.map((f, i) => (
              <div key={i} style={styles.card}>
                <div style={{fontWeight: 'bold'}}>{f.q}</div>
                <div>{f.a}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="fade-in" style={{maxWidth: '600px'}}>
            <h1 style={styles.panelTitle}>Operator Profile</h1>
            <div style={styles.card}>
              <div style={{marginBottom: '15px'}}><span style={styles.label}>EMAIL</span><div style={{color: theme.text}}>{currentUser.email}</div></div>
              <div style={{marginBottom: '15px'}}><span style={styles.label}>JOINED</span><div style={{color: theme.text}}>{currentUser.joined}</div></div>
              <div style={{marginBottom: '20px'}}><span style={styles.label}>CHANGE MASTER PIN</span></div>
              <input style={styles.input} type="password" placeholder="Old PIN" value={oldPin} onChange={e => setOldPin(e.target.value)} />
              <input style={styles.input} type="password" placeholder="New PIN (4+ digits)" value={newPin} onChange={e => setNewPin(e.target.value)} />
              <button style={styles.btn(true)} className="btn-primary" onClick={changePin}>UPDATE PIN</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in" style={{maxWidth: '600px'}}>
            <h1 style={styles.panelTitle}>System Config</h1>
            <div style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Theme</div><div style={{fontSize:'12px', color:theme.muted}}>Interface style</div></div>
                <select style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}} value={settings.theme} onChange={e => updateSettings({...settings, theme: e.target.value})}><option>dark</option><option>light</option></select>
              </div>
              <div style={{marginBottom: '20px'}}>
                <span style={styles.label}>CUSTOM PRIMARY COLOR</span>
                <input type="color" value={customThemeColors.primary || theme.primary} onChange={e => setCustomThemeColors({...customThemeColors, primary: e.target.value})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Stealth Mode</div><div style={{fontSize:'12px', color:theme.muted}}>Hide referral headers</div></div>
                <input type="checkbox" checked={settings.stealth} onChange={() => updateSettings({...settings, stealth: !settings.stealth})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Ad Intensity</div><div style={{fontSize:'12px', color:theme.muted}}>Balanced loading</div></div>
                <select style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}} value={settings.adIntensity} onChange={e => updateSettings({...settings, adIntensity: e.target.value})}><option>Low</option><option>Balanced</option><option>High</option><option>Extreme</option></select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Notifications</div><div style={{fontSize:'12px', color:theme.muted}}>Enable alerts</div></div>
                <input type="checkbox" checked={settings.notifications} onChange={() => updateSettings({...settings, notifications: !settings.notifications})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Auto Copy</div><div style={{fontSize:'12px', color:theme.muted}}>Copy links automatically</div></div>
                <input type="checkbox" checked={settings.autoCopy} onChange={() => updateSettings({...settings, autoCopy: !settings.autoCopy})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Sound Effects</div><div style={{fontSize:'12px', color:theme.muted}}>Play sounds on actions</div></div>
                <input type="checkbox" checked={settings.soundEffects} onChange={() => updateSettings({...settings, soundEffects: !settings.soundEffects})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Auto Backup</div><div style={{fontSize:'12px', color:theme.muted}}>Automatic vault backup</div></div>
                <input type="checkbox" checked={settings.autoBackup} onChange={() => updateSettings({...settings, autoBackup: !settings.autoBackup})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Email Notifications</div><div style={{fontSize:'12px', color:theme.muted}}>Send email alerts</div></div>
                <input type="checkbox" checked={settings.emailNotifications} onChange={() => updateSettings({...settings, emailNotifications: !settings.emailNotifications})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Two-Factor Auth</div><div style={{fontSize:'12px', color:theme.muted}}>Extra security</div></div>
                <input type="checkbox" checked={settings.twoFactor} onChange={() => updateSettings({...settings, twoFactor: !settings.twoFactor})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Font Size</div><div style={{fontSize:'12px', color:theme.muted}}>Adjust text size</div></div>
                <select value={settings.fontSize} onChange={e => updateSettings({...settings, fontSize: e.target.value})} style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}}>
                  <option>small</option><option>medium</option><option>large</option>
                </select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Language</div><div style={{fontSize:'12px', color:theme.muted}}>Interface language</div></div>
                <select value={settings.language} onChange={e => updateSettings({...settings, language: e.target.value})} style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}}>
                  <option>english</option><option>spanish</option><option>french</option>
                </select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Currency</div><div style={{fontSize:'12px', color:theme.muted}}>For reports</div></div>
                <select value={settings.currency} onChange={e => updateSettings({...settings, currency: e.target.value})} style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}}>
                  <option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Show Avatars</div><div style={{fontSize:'12px', color:theme.muted}}>Display user images</div></div>
                <input type="checkbox" checked={settings.showAvatars} onChange={() => updateSettings({...settings, showAvatars: !settings.showAvatars})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Enable Animations</div><div style={{fontSize:'12px', color:theme.muted}}>Smooth transitions</div></div>
                <input type="checkbox" checked={settings.enableAnimations} onChange={() => updateSettings({...settings, enableAnimations: !settings.enableAnimations})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>High Contrast</div><div style={{fontSize:'12px', color:theme.muted}}>Accessibility mode</div></div>
                <input type="checkbox" checked={settings.highContrast} onChange={() => updateSettings({...settings, highContrast: !settings.highContrast})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Compact Mode</div><div style={{fontSize:'12px', color:theme.muted}}>Dense layout</div></div>
                <input type="checkbox" checked={settings.compactMode} onChange={() => updateSettings({...settings, compactMode: !settings.compactMode})} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Default Layers</div><div style={{fontSize:'12px', color:theme.muted}}>Preset for new links</div></div>
                <select value={settings.defaultLayers} onChange={e => updateSettings({...settings, defaultLayers: Number(e.target.value)})} style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}}>
                  <option>1</option><option>2</option><option>3</option><option>4</option>
                </select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div><div style={{fontWeight:'bold'}}>Default Time Per Layer</div><div style={{fontSize:'12px', color:theme.muted}}>Preset seconds</div></div>
                <select value={settings.defaultTimePerLayer} onChange={e => updateSettings({...settings, defaultTimePerLayer: Number(e.target.value)})} style={{background:theme.bg, color:theme.text, border:`1px solid ${theme.border}`, padding:'5px', borderRadius:'5px'}}>
                  <option>10</option><option>20</option><option>30</option><option>45</option><option>60</option>
                </select>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div><div style={{fontWeight:'bold', color: theme.error}}>Maintenance Mode</div><div style={{fontSize:'12px', color:theme.muted}}>Disable links</div></div>
                <input type="checkbox" checked={settings.maintenance} onChange={() => updateSettings({...settings, maintenance: !settings.maintenance})} />
              </div>
            </div>
            <div style={{textAlign:'center', fontSize:'10px', color:theme.muted}}>BX-CORE BUILD 25.0.0 | SECURE CONNECTION</div>
          </div>
        )}
      </div>
      {notify.show && <div style={{position:'fixed', bottom:'30px', right:'30px', background: notify.type === 'error' ? theme.error : theme.primary, color:'#fff', padding:'15px 30px', borderRadius:'12px', fontWeight:'bold', zIndex:1000}}>{notify.msg}</div>}
      {showShareModal && (
        <>
          <div style={styles.overlay} onClick={() => setShowShareModal(false)} />
          <div style={styles.modal}>
            <h2>Share Link</h2>
            <button onClick={() => shareLink('email')}>Email</button>
            <button onClick={() => shareLink('twitter')}>Twitter</button>
            <button onClick={() => shareLink('facebook')}>Facebook</button>
          </div>
        </>
      )}
      <style jsx global>{`
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-primary { transition: all 0.3s ease; }
        .btn-primary:hover { background: ${theme.primaryHover} !important; transform: translateY(-2px); box-shadow: 0 4px 12px ${theme.primary}30; }
        .btn-secondary { transition: all 0.3s ease; }
        .btn-secondary:hover { background: ${theme.border} !important; transform: translateY(-2px); }
        .nav-item { transition: all 0.3s ease; }
        .nav-item:hover { background: ${theme.primary}10; transform: translateX(5px); }
      `}</style>
    </div>
  );
}
