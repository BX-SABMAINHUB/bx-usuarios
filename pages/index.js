import { useState, useEffect } from 'react';

export default function Home() {
  // --- GLOBAL STATES ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  
  // --- AUTH DATA ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  
  // --- DATABASES (LOCALSTORAGE) ---
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- OWNER STATES ---
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]); 
  const [userMessages, setUserMessages] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');
  const [blacklist, setBlacklist] = useState([]);
  const [banInput, setBanInput] = useState('');

  // --- LOOT-SYSTEMS STATES (USER DASHBOARD) ---
  const [dashView, setDashView] = useState('analytics');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);
  
  const [themeColor, setThemeColor] = useState('#8b5cf6');
  const [redirectDelay, setRedirectDelay] = useState(5);
  const [allowVpn, setAllowVpn] = useState(false);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('bx_accounts');
    const savedLogs = localStorage.getItem('bx_logs');
    const savedMsgs = localStorage.getItem('bx_messages');
    const savedBlacklist = localStorage.getItem('bx_blacklist');
    const savedLinks = localStorage.getItem('bx_links');

    if (savedAccounts) setUserAccounts(JSON.parse(savedAccounts));
    if (savedLogs) setActivityLogs(JSON.parse(savedLogs));
    if (savedMsgs) setUserMessages(JSON.parse(savedMsgs));
    if (savedBlacklist) setBlacklist(JSON.parse(savedBlacklist));
    if (savedLinks) setMyLinks(JSON.parse(savedLinks));
  }, []);

  const saveLog = (mail, status) => {
    const newLog = { mail, verified: status, date: new Date().toLocaleTimeString() };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem('bx_logs', JSON.stringify(updated));
  };

  const checkProfanity = (text) => {
    const badPatterns = [/fuck/i, /shit/i, /bitch/i, /mierda/i, /puta/i, /idiot/i, /asshole/i, /stupid/i, /bastard/i];
    return badPatterns.some(pattern => pattern.test(text));
  };

  const sendVerification = async (targetStep, type = 'code') => {
    if (blacklist.includes(email)) {
      setMessage("🚫 PERMANENT BAN: ACCESS DENIED.");
      return;
    }
    if (targetStep === 'reg-code' && userAccounts.find(u => u.email === email)) {
      setMessage("Account already exists. Please Login.");
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedCode(code.toString());
    setMessage("Connecting to BX-Server...");
    
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'code', code })
      });
      
      if (res.ok) { setStep(targetStep); setMessage("Security code sent via Gmail."); }
      else { setMessage("Connection Failed."); }
    } catch (e) {
      setMessage("Error: Check your API Route.");
    }
  };

  const finalizeRegistration = () => {
    if (password.length < 4 || password.length > 8) {
      setMessage("Password must be 4-8 digits.");
      return;
    }
    const newAccount = { email, password, joined: new Date().toLocaleDateString() };
    const updatedAccounts = [...userAccounts, newAccount];
    setUserAccounts(updatedAccounts);
    localStorage.setItem('bx_accounts', JSON.stringify(updatedAccounts));
    saveLog(email, true);
    setMessage("ACCOUNT CREATED SUCCESSFULLY ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  const handleLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      if (blacklist.includes(email)) { setMessage("🚫 ACCOUNT BANNED BY ADMIN."); return; }
      setCurrentUser(user);
      setStep('user-dashboard');
      setMessage("");
    } else {
      setMessage("❌ WRONG CREDENTIALS");
      saveLog(email || 'Unknown', false);
    }
  };

  // --- CORRECCIÓN: GENERADOR SIN FETCH (ESTO ELIMINA EL "DATABASE ERROR") ---
  const createSmartLink = () => {
    if (!linkUrl) {
        setMessage("❌ Please enter a Destination URL");
        return;
    }
    
    const domain = window.location.origin;

    // Codificamos los datos en Base64 para pasarlos de forma segura por URL
    const encodedUrl = btoa(linkUrl);
    const encodedTitle = btoa(linkTitle || 'Alexgaming');
    const encodedImg = btoa(linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png');

    // Construimos la URL que llevará los datos a la página de unlock
    const shortUrl = `${domain}/unlock?data=${encodedUrl}&t=${encodedTitle}&i=${encodedImg}`;

    const newLink = {
      id: Math.random().toString(36).substr(2, 6),
      title: linkTitle || 'Alexgaming',
      image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
      url: linkUrl,
      short: shortUrl, 
      clicks: 0,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newLink, ...myLinks];
    setMyLinks(updated);
    localStorage.setItem('bx_links', JSON.stringify(updated));
    
    setLinkUrl('');
    setLinkTitle('');
    setLinkImage('');
    setMessage("¡Link Creado con Éxito! ✅");
  };

  const deleteLink = (id) => {
    const updated = myLinks.filter(l => l.id !== id);
    setMyLinks(updated);
    localStorage.setItem('bx_links', JSON.stringify(updated));
  };

  const handleLinkClick = (shortUrl) => {
    window.open(shortUrl, '_blank');
  };

  const sendMessageToOwner = async () => {
    if (checkProfanity(currentMessage)) {
      const updatedBlacklist = [...blacklist, email];
      setBlacklist(updatedBlacklist);
      localStorage.setItem('bx_blacklist', JSON.stringify(updatedBlacklist));
      setMessage("⚠️ VIOLATION: ACCOUNT BANNED.");
      return;
    }
    const newMsg = { text: currentMessage, time: new Date().toLocaleTimeString(), user: email };
    const updatedMsgs = [newMsg, ...userMessages];
    setUserMessages(updatedMsgs);
    localStorage.setItem('bx_messages', JSON.stringify(updatedMsgs));
    setCurrentMessage('');
    setMessage("Message Sent to Admin ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  const handleBan = (mail) => {
    if (!mail || blacklist.includes(mail)) return;
    const updated = [...blacklist, mail];
    setBlacklist(updated);
    localStorage.setItem('bx_blacklist', JSON.stringify(updated));
    setBanInput('');
  };

  const handleUnban = (mail) => {
    const updated = blacklist.filter(m => m !== mail);
    setBlacklist(updated);
    localStorage.setItem('bx_blacklist', JSON.stringify(updated));
  };

  const resetMessages = () => {
    if(confirm("Delete all messages?")) {
      setUserMessages([]);
      localStorage.removeItem('bx_messages');
      setMessage("Inbox Cleared 🗑️");
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ 
        maxWidth: (step === 'owner-panel' || step === 'user-dashboard') ? '1400px' : '480px', 
        margin: 'auto', backgroundColor: '#0f172a', padding: '30px', borderRadius: '30px', border: '1px solid #1e293b', boxShadow: '0 0 80px rgba(0,0,0,0.6)', transition: 'all 0.5s ease'
      }}>
        
        {step !== 'user-dashboard' && (
          <h1 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#38bdf8', marginBottom: '40px', fontWeight: '900', letterSpacing: '3px', textShadow: '0 0 20px rgba(56,189,248,0.4)' }}>BX SYSTEMS</h1>
        )}

        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>START FREE TRIAL</button>
            <button onClick={() => setStep('login')} style={{ background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #475569', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>MEMBER LOGIN</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: 'none', border: '1px solid #38bdf8', color: '#38bdf8', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>CONTACT SALES</button>
            <button onClick={() => setStep('owner')} style={{ color: '#64748b', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>ADMINISTRATION</button>
          </div>
        )}

        {step === 'reg-email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#3b82f6' }}>Create Account</h3>
            <input type="email" placeholder="Business Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification('reg-code')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>CONTINUE</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Cancel</button>
          </div>
        )}

        {step === 'reg-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>Verify Identity</h3>
            <input type="text" maxLength="4" placeholder="0000" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '20px', fontSize: '2.5rem', width: '180px', textAlign: 'center', borderRadius: '15px', border: '2px solid #3b82f6', background: '#020617', color: 'white' }} />
            <button onClick={() => { if (inputCode === generatedCode) { setStep('reg-pass'); setMessage(""); } else { setMessage("❌ Invalid Code"); } }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>CONFIRM</button>
          </div>
        )}

        {step === 'reg-pass' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: '#10b981' }}>Secure Access</h3>
            <input type="password" maxLength="8" placeholder="PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', fontSize: '1.5rem', width: '100%', textAlign: 'center', borderRadius: '12px', border: '2px solid #10b981', background: '#020617', color: 'white' }} />
            <button onClick={finalizeRegistration} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>INITIALIZE DASHBOARD</button>
          </div>
        )}

        {step === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#fff' }}>User Login</h3>
            <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <input type="password" placeholder="PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={handleLogin} style={{ backgroundColor: '#fff', color: '#000', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>ENTER SYSTEM</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Back</button>
          </div>
        )}

        {step === 'user-dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', minHeight: '650px' }}>
            <div style={{ borderRight: '1px solid #334155', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '40px', fontWeight: '800' }}>BX<span style={{color: themeColor}}>LINK</span></h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['analytics', 'links', 'appearance', 'dev', 'settings'].map(id => (
                    <button key={id} onClick={()=>setDashView(id)} style={{ textAlign: 'left', padding: '15px', background: dashView===id ? '#1e293b' : 'transparent', color: dashView===id ? themeColor : '#94a3b8', border: '1px solid transparent', borderRadius: '12px', cursor: 'pointer' }}>
                      {id.toUpperCase()}
                    </button>
                  ))}
                </nav>
              </div>
              <button onClick={()=>{setStep('start'); setCurrentUser(null);}} style={{ width:'100%', padding: '12px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>SIGN OUT</button>
            </div>

            <div style={{ overflowY: 'auto' }}>
              {dashView === 'analytics' && (
                <div>
                  <h2 style={{ marginBottom: '30px' }}>Traffic Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div style={{ background: themeColor, padding: '20px', borderRadius: '20px' }}>
                      <p>Total Clicks</p>
                      <h3>{myLinks.reduce((acc, l) => acc + (l.clicks || 0), 0)}</h3>
                    </div>
                  </div>
                </div>
              )}

              {dashView === 'links' && (
                <div>
                  <h2 style={{ marginBottom: '20px' }}>Link Management</h2>
                  <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <input type="text" placeholder="Title" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                      <input type="text" placeholder="Image URL" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '15px' }}>
                      <input type="text" placeholder="Destination URL" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                      <button onClick={createSmartLink} style={{ background: themeColor, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>CREATE</button>
                    </div>
                  </div>
                  {myLinks.map((l, i) => (
                    <div key={i} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{l.title}</div>
                        <div style={{ color: themeColor, fontSize: '0.8rem' }}>{l.short}</div>
                      </div>
                      <button onClick={()=>deleteLink(l.id)} style={{ background: '#f43f5e', border: 'none', padding: '8px', borderRadius: '5px', color: 'white' }}>DEL</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e' }}>Admin</h2>
            <input type="password" placeholder="PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '18px', borderRadius: '15px', background: '#020617', border: '1px solid #f43f5e', color: 'white', width: '100%' }} />
            <button onClick={() => { if (ownerPass === "2706") setStep('owner-panel'); else setMessage("INVALID"); }} style={{ width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#f43f5e', color: 'white', borderRadius: '15px' }}>UNLOCK</button>
          </div>
        )}

        {/* --- PANEL DE DUEÑO (REDUCIDO PARA EL INDEX) --- */}
        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#38bdf8' }}>LOGS</h5>
              {activityLogs.slice(0,10).map((u, i) => <div key={i} style={{fontSize:'0.7rem'}}>{u.mail}</div>)}
            </div>
            <button onClick={()=>setStep('start')} style={{background:'#334155', color:'white', borderRadius:'10px'}}>EXIT</button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  );
}
