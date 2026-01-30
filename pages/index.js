import { useState, useEffect } from 'react';

export default function Home() {
  // --- ESTADOS GLOBALES ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  
  // --- DATOS DE SESIÓN/REGISTRO ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Para registro y login
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  
  // --- BASES DE DATOS (LocalStorage) ---
  const [userAccounts, setUserAccounts] = useState([]); // Usuarios registrados con password
  const [currentUser, setCurrentUser] = useState(null); // Usuario logueado actualmente
  
  // --- ESTADOS DEL OWNER ---
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]); // Logs para el admin
  const [userMessages, setUserMessages] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');
  const [blacklist, setBlacklist] = useState([]);
  const [banInput, setBanInput] = useState('');

  // --- ESTADOS DEL USER DASHBOARD (LOOTLABS) ---
  const [dashView, setDashView] = useState('overview'); // overview, links, settings
  const [linkInput, setLinkInput] = useState('');
  const [monetizedLinks, setMonetizedLinks] = useState([]);

  // --- CARGAR DATOS ---
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
    if (savedLinks) setMonetizedLinks(JSON.parse(savedLinks));
  }, []);

  // --- UTILIDADES ---
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

  // --- ENVÍO DE CORREOS ---
  const sendVerification = async (targetStep, type = 'code') => {
    if (blacklist.includes(email)) {
      setMessage("🚫 PERMANENT BAN: ACCESS DENIED.");
      return;
    }
    
    // Si es registro, verificar que no exista ya
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

  // --- LÓGICA DE REGISTRO Y LOGIN ---
  const finalizeRegistration = () => {
    if (password.length < 4 || password.length > 8) {
      setMessage("Password must be 4-8 digits.");
      return;
    }
    
    const newAccount = { 
      email: email, 
      password: password, 
      joined: new Date().toLocaleDateString(),
      balance: 0.00
    };
    
    const updatedAccounts = [...userAccounts, newAccount];
    setUserAccounts(updatedAccounts);
    localStorage.setItem('bx_accounts', JSON.stringify(updatedAccounts));
    
    saveLog(email, true); // Log para el admin
    setMessage("ACCOUNT CREATED SUCCESSFULLY ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  const handleLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      if (blacklist.includes(email)) {
        setMessage("🚫 ACCOUNT BANNED BY ADMIN.");
        return;
      }
      setCurrentUser(user);
      setStep('user-dashboard');
      setMessage("");
    } else {
      setMessage("❌ WRONG CREDENTIALS");
      saveLog(email || 'Unknown', false);
    }
  };

  // --- LÓGICA DASHBOARD USUARIO (LOOTLABS) ---
  const createMonetizedLink = () => {
    if (!linkInput) return;
    const newLink = {
      original: linkInput,
      short: `bx.lk/${Math.random().toString(36).substr(2, 5)}`,
      clicks: 0,
      revenue: 0,
      date: new Date().toLocaleDateString()
    };
    const updatedLinks = [newLink, ...monetizedLinks];
    setMonetizedLinks(updatedLinks);
    localStorage.setItem('bx_links', JSON.stringify(updatedLinks));
    setLinkInput('');
  };

  // --- LÓGICA OWNER ---
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
      
      {/* CONTENEDOR PRINCIPAL: CAMBIA DE TAMAÑO SEGÚN LA VISTA */}
      <div style={{ 
        maxWidth: (step === 'owner-panel' || step === 'user-dashboard') ? '1400px' : '480px', 
        margin: 'auto', 
        backgroundColor: '#0f172a', 
        padding: '40px', 
        borderRadius: '30px', 
        border: '1px solid #1e293b', 
        boxShadow: '0 0 60px rgba(0,0,0,0.5)',
        transition: 'all 0.5s ease'
      }}>
        
        {/* HEADER */}
        {step !== 'user-dashboard' && (
          <h1 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#38bdf8', marginBottom: '40px', fontWeight: '900', letterSpacing: '3px', textShadow: '0 0 20px rgba(56,189,248,0.4)' }}>BX SYSTEMS</h1>
        )}

        {/* --- PANTALLA DE INICIO --- */}
        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: 'linear-gradient(45deg, #2563eb, #3b82f6)', color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(37,99,235,0.4)' }}>REGISTER ACCOUNT</button>
            <button onClick={() => setStep('login')} style={{ background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #475569', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>LOGIN</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: 'none', border: '1px solid #38bdf8', color: '#38bdf8', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>CONTACT SUPPORT</button>
            <button onClick={() => setStep('owner')} style={{ color: '#64748b', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>OWNER ACCESS</button>
          </div>
        )}

        {/* --- FLUJO DE REGISTRO --- */}
        {step === 'reg-email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#3b82f6' }}>Create Account</h3>
            <input type="email" placeholder="Enter your Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification('reg-code')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SEND CODE</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Cancel</button>
          </div>
        )}

        {step === 'reg-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>Verify Email</h3>
            <input type="text" maxLength="4" placeholder="0000" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '20px', fontSize: '2.5rem', width: '180px', textAlign: 'center', borderRadius: '15px', border: '2px solid #3b82f6', background: '#020617', color: 'white' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) { setStep('reg-pass'); setMessage(""); } 
              else { setMessage("❌ Invalid Code"); }
            }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>VERIFY</button>
          </div>
        )}

        {step === 'reg-pass' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: '#10b981' }}>Set Password</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>Choose a secure PIN (4-8 digits)</p>
            <input type="password" maxLength="8" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', fontSize: '1.5rem', width: '100%', textAlign: 'center', borderRadius: '12px', border: '2px solid #10b981', background: '#020617', color: 'white' }} />
            <button onClick={finalizeRegistration} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>COMPLETE REGISTRATION</button>
          </div>
        )}

        {/* --- FLUJO DE LOGIN --- */}
        {step === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#fff' }}>Welcome Back</h3>
            <input type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '18px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={handleLogin} style={{ backgroundColor: '#fff', color: '#000', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>LOGIN</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Back</button>
          </div>
        )}

        {/* --- FLUJO CONTACT SUPPORT (Existente) --- */}
        {step === 'msg-auth-email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#38bdf8' }}>Support Verification</h3>
            <input type="email" placeholder="Your Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification('msg-auth-code')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>GET ACCESS CODE</button>
            <button onClick={() => setStep('start')} style={{ background:'none', border:'none', color:'#64748b' }}>Cancel</button>
          </div>
        )}

        {step === 'msg-auth-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px' }}>Enter Code</h3>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '20px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '12px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={() => { if (inputCode === generatedCode) setStep('user-msg'); else setMessage("Access Denied"); }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>UNLOCK CHAT</button>
          </div>
        )}

        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#10b981', textAlign: 'center' }}>Direct Line to Admin</h3>
            <textarea placeholder="Type message here..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '12px', background: '#020617', color: 'white', border: '1px solid #10b981' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#10b981', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SEND</button>
          </div>
        )}

        {/* ================================================================================= */}
        {/* --- USER DASHBOARD (ESTILO LOOTLABS) --- */}
        {/* ================================================================================= */}
        {step === 'user-dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px', height: '600px' }}>
            
            {/* SIDEBAR */}
            <div style={{ borderRight: '1px solid #334155', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ color: '#c084fc', marginBottom: '40px', fontSize: '1.8rem', letterSpacing: '2px' }}>LOOT<span style={{color: 'white'}}>SYSTEMS</span></h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={()=>setDashView('overview')} style={{ textAlign: 'left', padding: '12px', background: dashView==='overview' ? '#1e293b' : 'transparent', color: dashView==='overview' ? '#c084fc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📊 Overview</button>
                  <button onClick={()=>setDashView('links')} style={{ textAlign: 'left', padding: '12px', background: dashView==='links' ? '#1e293b' : 'transparent', color: dashView==='links' ? '#c084fc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Monetize Links</button>
                  <button onClick={()=>setDashView('payouts')} style={{ textAlign: 'left', padding: '12px', background: dashView==='payouts' ? '#1e293b' : 'transparent', color: dashView==='payouts' ? '#c084fc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💰 Payouts</button>
                  <button onClick={()=>setDashView('settings')} style={{ textAlign: 'left', padding: '12px', background: dashView==='settings' ? '#1e293b' : 'transparent', color: dashView==='settings' ? '#c084fc' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⚙️ Settings</button>
                </div>
              </div>
              <button onClick={()=>{setStep('start'); setCurrentUser(null);}} style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ overflowY: 'auto', padding: '10px' }}>
              {dashView === 'overview' && (
                <div>
                  <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'linear-gradient(45deg, #7c3aed, #4f46e5)', padding: '20px', borderRadius: '15px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Total Revenue</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2rem' }}>$0.00</h3>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Active Links</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2rem' }}>{monetizedLinks.length}</h3>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Avg. RPM</p>
                      <h3 style={{ margin: '10px 0 0', fontSize: '2rem' }}>$4.50</h3>
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                    <p style={{ color: '#64748b' }}>[Chart Visualization Placeholder - No Data]</p>
                  </div>
                </div>
              )}

              {dashView === 'links' && (
                <div>
                  <h2 style={{ marginBottom: '20px' }}>Link Monetizer</h2>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input type="text" placeholder="Paste URL to monetize (e.g., https://mega.nz/...)" value={linkInput} onChange={(e)=>setLinkInput(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
                    <button onClick={createMonetizedLink} style={{ padding: '15px 30px', background: '#c084fc', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>SHORTEN</button>
                  </div>
                  <div>
                    <h4 style={{ color: '#94a3b8', marginBottom: '10px' }}>Your Active Links</h4>
                    {monetizedLinks.map((l, i) => (
                      <div key={i} style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                        <div>
                          <p style={{ margin: 0, color: '#c084fc', fontWeight: 'bold' }}>{l.short}</p>
                          <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{l.original}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#10b981' }}>${l.revenue}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{l.clicks} clicks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dashView === 'settings' && (
                <div>
                  <h2 style={{ marginBottom: '20px' }}>Account Settings</h2>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' }}>
                    <p style={{ color: '#94a3b8' }}>Email Address</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentUser?.email}</p>
                    <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
                    <p style={{ color: '#94a3b8' }}>Password</p>
                    <button style={{ padding: '10px 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Change Password</button>
                    <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
                    <p style={{ color: '#f43f5e' }}>Danger Zone</p>
                    <button style={{ padding: '10px 20px', background: 'none', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '8px', cursor: 'pointer' }}>Delete Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================================= */}
        {/* --- OWNER CONSOLE (MANTENIDA INTACTA) --- */}
        {/* ================================================================================= */}
        
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '25px' }}>Admin Authorization</h2>
            <input type="password" placeholder="ENTER ACCESS PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '18px', borderRadius: '15px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center', width: '100%' }} />
            <button onClick={() => { if (ownerPass === "2706") setStep('owner-panel'); else { setAttempts(attempts-1); setMessage(`INVALID. ${attempts-1} left.`); } }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#f43f5e', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>UNLOCK PANEL</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            {/* 1. DATA LOGS */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#38bdf8', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>REGISTRY LOGS</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto', fontSize: '0.8rem' }}>
                {activityLogs.map((u, i) => (
                  <div key={i} style={{ padding: '10px', background: '#0f172a', marginBottom: '8px', borderRadius: '8px', borderLeft: u.verified ? '4px solid #10b981' : '4px solid #f43f5e' }}>{u.mail}</div>
                ))}
              </div>
            </div>
            {/* 2. INBOX */}
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
            {/* 3. MODERATION */}
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
            {/* 4. MESSENGER */}
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
