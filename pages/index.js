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
  const [linkImage, setLinkImage] = useState(''); // NUEVO: Estado para la imagen
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
    
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'code', code })
    });
    
    if (res.ok) { setStep(targetStep); setMessage("Security code sent via Gmail."); }
    else { setMessage("Connection Failed."); }
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

  // --- MODIFIED LINK GENERATOR (NO DATABASE NEEDED) ---
  const createSmartLink = () => {
    if (!linkUrl) {
        setMessage("❌ Please enter a Destination URL");
        return;
    }
    
    const domain = window.location.origin;

    // Codificamos los datos para pasarlos por la URL de forma segura
    const encodedUrl = btoa(linkUrl);
    const encodedTitle = btoa(linkTitle || 'Alexgaming');
    const encodedImg = btoa(linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png');

    // El link llevará toda la información en los parámetros
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
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'custom', customMessage: "⚠️ AGGRESSIVE WARNING: You are banned for offensive behavior." })
      });
      setTimeout(() => setStep('start'), 3000);
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
        margin: 'auto', 
        backgroundColor: '#0f172a', 
        padding: '30px', 
        borderRadius: '30px', 
        border: '1px solid #1e293b', 
        boxShadow: '0 0 80px rgba(0,0,0,0.6)',
        transition: 'all 0.5s ease'
      }}>
        
        {step !== 'user-dashboard' && (
          <h1 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#38bdf8', marginBottom: '40px', fontWeight: '900', letterSpacing: '3px', textShadow: '0 0 20px rgba(56,189,248,0.4)' }}>BX SYSTEMS</h1>
        )}

        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.5)' }}>START FREE TRIAL</button>
            <button onClick={() => setStep('login')} style={{ background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #475569', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>MEMBER LOGIN</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: 'none', border: '1px solid #38bdf8', color: '#38bdf8', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>CONTACT SALES</button>
            <button onClick={() => setStep('owner')} style={{ color: '#64748b', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>ADMINISTRATION</button>
          </div>
        )}

        {/* --- REGISTRATION & LOGIN BLOCKS (UNTOUCHED) --- */}
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
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>Set a Numeric PIN (4-8 digits)</p>
            <input type="password" maxLength="8" placeholder="PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', fontSize: '1.5rem', width: '100%', textAlign: 'center', borderRadius: '12px', border: '2px solid #10b981', background: '#020617', color: 'white' }} />
            <button onClick={finalizeRegistration} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>INITIALIZE DASHBOARD</button>
          </div>
        )}

        {step === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#fff' }}>User Login</h3>
            <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <input type="password" placeholder="PIN" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={handleLogin} style={{ backgroundColor: '#fff', color: '#000', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>ENTER SYSTEM</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Back</button>
          </div>
        )}

        {step === 'msg-auth-email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#38bdf8' }}>Support Ticket</h3>
            <input type="email" placeholder="Contact Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification('msg-auth-code')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>REQUEST TICKET</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Cancel</button>
          </div>
        )}
        {step === 'msg-auth-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px' }}>Verify Ticket</h3>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '20px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '12px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={() => { if (inputCode === generatedCode) setStep('user-msg'); else setMessage("Access Denied"); }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>OPEN CHAT</button>
          </div>
        )}
        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#10b981', textAlign: 'center' }}>Support Channel</h3>
            <textarea placeholder="Describe your issue..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '12px', background: '#020617', color: 'white', border: '1px solid #10b981' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#10b981', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SUBMIT</button>
          </div>
        )}

        {step === 'user-dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', minHeight: '650px' }}>
            
            <div style={{ borderRight: '1px solid #334155', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                  <div style={{ width: '40px', height: '40px', background: themeColor, borderRadius: '10px' }}></div>
                  <h2 style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: '800' }}>BX<span style={{color: themeColor}}>LINK</span></h2>
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'analytics', label: '📊 Analytics', desc: 'Traffic & Stats' },
                    { id: 'links', label: '🔗 Smart Links', desc: 'Manage URLs' },
                    { id: 'appearance', label: '🎨 Appearance', desc: 'Landing Pages' },
                    { id: 'dev', label: '⚡ Developers', desc: 'API & Hooks' },
                    { id: 'settings', label: '⚙️ Settings', desc: 'Account' },
                  ].map(item => (
                    <button key={item.id} onClick={()=>setDashView(item.id)} style={{ 
                      textAlign: 'left', padding: '15px', 
                      background: dashView===item.id ? '#1e293b' : 'transparent', 
                      color: dashView===item.id ? themeColor : '#94a3b8', 
                      border: dashView===item.id ? `1px solid ${themeColor}` : '1px solid transparent', 
                      borderRadius: '12px', cursor: 'pointer', transition: '0.3s' 
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{item.desc}</div>
                    </button>
                  ))}
                </nav>
              </div>
              
              <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>Logged in as: <br/><span style={{color:'white'}}>{currentUser?.email}</span></div>
                <button onClick={()=>{setStep('start'); setCurrentUser(null);}} style={{ width:'100%', padding: '12px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>SIGN OUT</button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
              
              {dashView === 'analytics' && (
                <div>
                  <h2 style={{ marginBottom: '30px', fontWeight: '300' }}>Traffic Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                    <div style={{ background: `linear-gradient(135deg, ${themeColor}, #4f46e5)`, padding: '25px', borderRadius: '20px', color: 'white', boxShadow: '0 10px 20px -10px rgba(124,58,237,0.5)' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Total Clicks</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2.5rem' }}>{myLinks.reduce((acc, l) => acc + (l.clicks || 0), 0)}</h3>
                    </div>
                    <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Impressions</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2.5rem' }}>1,204</h3>
                    </div>
                    <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Global CTR</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2.5rem' }}>8.4%</h3>
                    </div>
                  </div>
                  
                  <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155', minHeight: '300px' }}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 20px 0' }}>Engagement Statistics (Real-time)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
                      {[40, 65, 30, 80, 55, 90, 45, 70, 60, 95].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: themeColor, opacity: 0.3, height: `${h}%`, borderRadius: '5px 5px 0 0', position: 'relative' }}>
                          <div style={{ position:'absolute', bottom: 0, width: '100%', height: `${h/2}%`, background: themeColor, borderRadius: '5px 5px 0 0', opacity: 1 }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dashView === 'links' && (
                <div>
                  <h2 style={{ marginBottom: '20px', fontWeight: '300' }}>Link Management</h2>
                  
                  {/* --- MODIFIED FRAME (NOW WITH TITLE & IMAGE) --- */}
                  <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '30px' }}>
                    <h4 style={{ color: 'white', marginTop: 0 }}>Create New Smart Link</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <input type="text" placeholder="Custom Title (e.g. Alexgaming)" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                      <input type="text" placeholder="Custom Image URL (https://...)" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '15px' }}>
                      <input type="text" placeholder="Destination URL (https://...)" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                      <button onClick={createSmartLink} style={{ background: themeColor, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>CREATE</button>
                    </div>
                    <p style={{fontSize: '0.7rem', color: '#64748b', marginTop: '10px'}}>* Leave Title and Image blank to use defaults.</p>
                  </div>

                  <div>
                    <h4 style={{ color: '#94a3b8', marginBottom: '15px' }}>Active Links ({myLinks.length})</h4>
                    {myLinks.length === 0 ? <p style={{color: '#475569', textAlign: 'center', padding: '40px'}}>No links created yet.</p> : 
                      myLinks.map((l, i) => (
                        <div key={i} style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src={l.image || "https://i.ibb.co/vzPRm9M/alexgaming.png"} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{l.title}</div>
                              <a href="#" onClick={(e)=>{ e.preventDefault(); handleLinkClick(l.short); }} style={{ color: themeColor, textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginTop: '5px' }}>
                                {l.short} <span style={{fontSize: '0.7rem', color: '#64748b', marginLeft: '10px'}}>⬅ TEST REAL LINK</span>
                              </a>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{l.clicks}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CLICKS</div>
                            </div>
                            <button onClick={()=>deleteLink(l.id)} style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>DELETE</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* --- REST OF DASHVIEW BLOCKS (UNTOUCHED) --- */}
              {dashView === 'appearance' && (
                <div>
                   <h2 style={{ marginBottom: '20px', fontWeight: '300' }}>Page Design</h2>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                     <div style={{ background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' }}>
                       <h4 style={{ marginTop: 0 }}>Theme Color</h4>
                       <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                         {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                           <div key={c} onClick={()=>setThemeColor(c)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: c, cursor: 'pointer', border: themeColor === c ? '3px solid white' : 'none', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}></div>
                         ))}
                       </div>
                       
                       <h4 style={{ marginTop: 0 }}>Redirect Settings</h4>
                       <div style={{ marginBottom: '15px' }}>
                         <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>Wait Time (Seconds)</label>
                         <input type="range" min="0" max="15" value={redirectDelay} onChange={(e)=>setRedirectDelay(e.target.value)} style={{ width: '100%' }} />
                         <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{redirectDelay}s</div>
                       </div>
                       
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '10px' }}>
                         <span style={{ fontSize: '0.9rem' }}>Allow VPN Traffic</span>
                         <div onClick={()=>setAllowVpn(!allowVpn)} style={{ width: '50px', height: '26px', background: allowVpn ? '#10b981' : '#334155', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                           <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: allowVpn ? '27px' : '3px', transition: '0.3s' }}></div>
                         </div>
                       </div>
                     </div>
                     
                     <div style={{ background: '#020617', borderRadius: '30px', padding: '20px', border: '4px solid #334155', width: '280px', margin: 'auto', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <div style={{ width: '60px', height: '60px', background: themeColor, borderRadius: '15px', marginBottom: '20px' }}></div>
                       <div style={{ width: '80%', height: '15px', background: '#1e293b', borderRadius: '5px', marginBottom: '10px' }}></div>
                       <div style={{ width: '60%', height: '10px', background: '#1e293b', borderRadius: '5px', marginBottom: '40px' }}></div>
                       
                       <button style={{ width: '100%', padding: '15px', background: themeColor, color: 'white', border: 'none', borderRadius: '10px', marginBottom: '10px', fontWeight: 'bold' }}>Download File</button>
                       <button style={{ width: '100%', padding: '15px', background: 'transparent', color: 'white', border: `1px solid ${themeColor}`, borderRadius: '10px', marginBottom: '10px' }}>View Article</button>
                     </div>
                   </div>
                </div>
              )}

              {dashView === 'dev' && (
                <div>
                   <h2 style={{ marginBottom: '20px', fontWeight: '300' }}>Developer Tools</h2>
                   <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155' }}>
                     <h4 style={{ color: '#94a3b8', marginTop: 0 }}>API Key</h4>
                     <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                       <input type="text" value="bx_live_89s7d8f7s9d8f7s9d8f7" readOnly style={{ flex: 1, padding: '15px', background: '#020617', border: '1px solid #334155', color: '#64748b', borderRadius: '10px', fontFamily: 'monospace' }} />
                       <button style={{ padding: '0 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>COPY</button>
                     </div>
                     
                     <h4 style={{ color: '#94a3b8' }}>Postback / Webhook URL</h4>
                     <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>We will fire a POST request when a conversion happens.</p>
                     <div style={{ display: 'flex', gap: '10px' }}>
                       <input type="text" placeholder="https://your-server.com/callback" style={{ flex: 1, padding: '15px', background: '#020617', border: '1px solid #334155', color: 'white', borderRadius: '10px' }} />
                       <button style={{ padding: '0 20px', background: themeColor, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>SAVE</button>
                     </div>
                   </div>
                </div>
              )}

              {dashView === 'settings' && (
                <div>
                   <h2 style={{ marginBottom: '20px', fontWeight: '300' }}>Account Settings</h2>
                   <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                       <div>
                         <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Email Address</div>
                         <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.email}</div>
                       </div>
                       <button style={{ padding: '10px 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px' }}>Edit</button>
                     </div>
                     <hr style={{ borderColor: '#334155', opacity: 0.3 }} />
                     
                     <div style={{ margin: '20px 0' }}>
                        <h4 style={{ color: 'white' }}>Security</h4>
                        <button style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '10px', textAlign: 'left', cursor: 'pointer' }}>🔒 Change Password</button>
                        <button style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '10px', textAlign: 'left', marginTop: '10px', cursor: 'pointer' }}>🛡️ Two-Factor Authentication (2FA)</button>
                     </div>

                     <hr style={{ borderColor: '#334155', opacity: 0.3 }} />
                     <h4 style={{ color: '#f43f5e' }}>Danger Zone</h4>
                     <button style={{ padding: '12px 25px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Account</button>
                   </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- OWNER PANELS (UNTOUCHED) --- */}
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '25px' }}>Admin Authorization</h2>
            <input type="password" placeholder="ENTER ACCESS PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '18px', borderRadius: '15px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center', width: '100%' }} />
            <button onClick={() => { if (ownerPass === "2706") setStep('owner-panel'); else { setAttempts(attempts-1); setMessage(`INVALID. ${attempts-1} left.`); } }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#f43f5e', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>UNLOCK PANEL</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#38bdf8', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>REGISTRY LOGS</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto', fontSize: '0.8rem' }}>
                {activityLogs.map((u, i) => (
                  <div key={i} style={{ padding: '10px', background: '#0f172a', marginBottom: '8px', borderRadius: '8px', borderLeft: u.verified ? '4px solid #10b981' : '4px solid #f43f5e' }}>{u.mail}</div>
                ))}
              </div>
            </div>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #38bdf8', paddingBottom: '10px' }}>
                <h5 style={{ color: '#38bdf8', margin: 0 }}>INBOX</h5>
                <button onClick={resetMessages} style={{ background: 'none', border: '1px solid #f43f5e', color: '#f43f5e', padding: '2px 8px', borderRadius: '5px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}>RESET</button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {userMessages.length === 0 ? <p style={{color: '#475569', fontSize: '0.8rem', textAlign:'center'}}>Empty.</p> : 
                  userMessages.map((m, i) => (
                    <div key={i} style={{ padding: '12px', background: '#1e293b', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                      <div style={{ color: '#38bdf8', fontSize: '0.65rem', fontWeight: 'bold' }}>{m.user}</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '5px', color: '#f1f5f9' }}>{m.text}</div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #f43f5e' }}>
              <h5 style={{ color: '#f43f5e', marginBottom: '15px', borderBottom: '1px solid #f43f5e', paddingBottom: '10px' }}>BLACKLIST</h5>
              <input type="email" placeholder="Ban Email..." value={banInput} onChange={(e)=>setBanInput(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #f43f5e', color: 'white', fontSize: '0.8rem' }} />
              <button onClick={() => handleBan(banInput)} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>BAN</button>
              <div style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                {blacklist.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px', borderRadius: '8px', marginTop: '8px', fontSize: '0.7rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth:'80%' }}>{m}</span>
                    <button onClick={() => handleUnban(m)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>↺</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #10b981' }}>
              <h5 style={{ color: '#10b981', marginBottom: '15px', borderBottom: '1px solid #10b981', paddingBottom: '10px' }}>RESPONSE</h5>
              <input type="email" placeholder="To:" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #10b981', color: 'white' }} />
              <textarea placeholder="Message..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '10px', height: '140px', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}></textarea>
              <button onClick={async () => {
                await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody }) });
                setMessage("REPLY SENT ✅");
              }} style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#10b981', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>SEND</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b', fontWeight: 'bold', minHeight: '1.2em' }}>{message}</p>
      </div>
    </div>
  );
}
