import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('start'); 
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');
  
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]); 
  const [userMessages, setUserMessages] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');
  const [blacklist, setBlacklist] = useState([]);
  const [banInput, setBanInput] = useState('');

  useEffect(() => {
    const savedLogs = localStorage.getItem('bx_database');
    const savedMsgs = localStorage.getItem('bx_messages');
    const savedBlacklist = localStorage.getItem('bx_blacklist');
    if (savedLogs) setRegisteredUsers(JSON.parse(savedLogs));
    if (savedMsgs) setUserMessages(JSON.parse(savedMsgs));
    if (savedBlacklist) setBlacklist(JSON.parse(savedBlacklist));
  }, []);

  const checkProfanity = (text) => {
    const badPatterns = [/fuck/i, /shit/i, /bitch/i, /mierda/i, /puta/i, /idiot/i, /asshole/i, /stupid/i, /bastard/i];
    return badPatterns.some(pattern => pattern.test(text));
  };

  const sendVerification = async (targetStep) => {
    if (blacklist.includes(email)) {
      setMessage("🚫 ACCESS DENIED: BLACKLISTED ACCOUNT.");
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedCode(code.toString());
    setMessage("Connecting to BX-gmail...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'code', code })
    });
    if (res.ok) { setStep(targetStep); setMessage("Security code dispatched."); }
  };

  const sendMessageToOwner = async () => {
    if (checkProfanity(currentMessage)) {
      const updatedBlacklist = [...blacklist, email];
      setBlacklist(updatedBlacklist);
      localStorage.setItem('bx_blacklist', JSON.stringify(updatedBlacklist));
      setMessage("⚠️ SECURITY BREACH: YOU ARE BANNED.");
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'custom', customMessage: "⚠️ AGGRESSIVE WARNING: Illegal content detected. Your ID has been BANNED." })
      });
      setTimeout(() => setStep('start'), 3000);
      return;
    }
    const newMsg = { text: currentMessage, time: new Date().toLocaleTimeString(), user: email };
    const updatedMsgs = [newMsg, ...userMessages];
    setUserMessages(updatedMsgs);
    localStorage.setItem('bx_messages', JSON.stringify(updatedMsgs));
    setCurrentMessage('');
    setMessage("BX-Message Delivered ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  // --- OWNER ACTIONS ---
  const handleBan = (mailToBan) => {
    if (!mailToBan || blacklist.includes(mailToBan)) return;
    const updated = [...blacklist, mailToBan];
    setBlacklist(updated);
    localStorage.setItem('bx_blacklist', JSON.stringify(updated));
    setBanInput('');
  };

  const handleUnban = (mailToUnban) => {
    const updated = blacklist.filter(m => m !== mailToUnban);
    setBlacklist(updated);
    localStorage.setItem('bx_blacklist', JSON.stringify(updated));
  };

  const resetMessages = () => {
    if(confirm("Are you sure you want to PERMANENTLY DELETE all messages?")) {
      setUserMessages([]);
      localStorage.removeItem('bx_messages');
      setMessage("Inbox Cleared 🗑️");
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '1250px' : '450px', margin: 'auto', backgroundColor: '#0f172a', padding: '35px', borderRadius: '35px', border: '1px solid #1e293b', boxShadow: '0 0 60px rgba(56, 189, 248, 0.12)' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.6rem', color: '#38bdf8', marginBottom: '35px', fontWeight: '900', letterSpacing: '2px' }}>BX SYSTEMS</h1>

        {/* --- INTERFACE --- */}
        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: '#2563eb', color: 'white', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>REGISTER USER</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: '#1e293b', color: '#38bdf8', padding: '15px', borderRadius: '18px', border: '1px solid #38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>MESSAGE ADMIN</button>
            <button onClick={() => setStep('owner')} style={{ color: '#475569', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>OWNER CONSOLE</button>
          </div>
        )}

        {/* --- AUTH FLOWS --- */}
        {(step === 'reg-email' || step === 'msg-auth-email') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#38bdf8' }}>Identity Protocol</h3>
            <input type="email" placeholder="Verification Email" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '18px', borderRadius: '15px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification(step === 'reg-email' ? 'reg-code' : 'msg-auth-code')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '900' }}>REQUEST CODE</button>
            <button onClick={() => setStep('start')} style={{ color: '#475569', background: 'none', border: 'none', fontSize: '0.9rem' }}>Back to home</button>
          </div>
        )}

        {(step === 'reg-code' || step === 'msg-auth-code') && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#38bdf8' }}>BX-Code Required</h3>
            <input type="text" maxLength="4" placeholder="0000" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '18px', fontSize: '2.5rem', width: '180px', textAlign: 'center', borderRadius: '15px', border: '2px solid #38bdf8', background: '#020617', color: 'white', letterSpacing: '5px' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) {
                if (step === 'reg-code') {
                  const newUser = { mail: email, verified: true, date: new Date().toLocaleTimeString() };
                  const updated = [newUser, ...registeredUsers];
                  setRegisteredUsers(updated);
                  localStorage.setItem('bx_database', JSON.stringify(updated));
                  setMessage("USER VERIFIED ✅");
                  setTimeout(() => setStep('start'), 2000);
                } else { setStep('user-msg'); setMessage(""); }
              } else { setMessage("CODE INVALID - ACCESS DENIED"); }
            }} style={{ display: 'block', width: '100%', marginTop: '25px', padding: '18px', backgroundColor: '#10b981', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>VERIFY IDENTITY</button>
          </div>
        )}

        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#10b981', textAlign: 'center' }}>Secure Connection Active</h3>
            <textarea placeholder="Enter your confidential message..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '160px', padding: '18px', borderRadius: '15px', background: '#020617', color: 'white', border: '2px solid #10b981' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#10b981', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '900' }}>TRANSMIT DATA</button>
          </div>
        )}

        {/* --- OWNER ACCESS --- */}
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '25px' }}>Admin Authorization</h2>
            <input type="password" placeholder="ENTER ACCESS PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '18px', borderRadius: '15px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center', width: '100%' }} />
            <button onClick={() => { if (ownerPass === "2706") setStep('owner-panel'); else setMessage("AUTHORIZATION FAILED"); }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '18px', backgroundColor: '#f43f5e', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>UNLOCK PANEL</button>
          </div>
        )}

        {/* --- OWNER DASHBOARD --- */}
        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            
            {/* 1. DATA LOGS */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#38bdf8', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>LOGS</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto', fontSize: '0.8rem' }}>
                {registeredUsers.map((u, i) => (
                  <div key={i} style={{ padding: '10px', background: '#0f172a', marginBottom: '8px', borderRadius: '8px', borderLeft: u.verified ? '4px solid #10b981' : '4px solid #f43f5e' }}>{u.mail}</div>
                ))}
              </div>
            </div>

            {/* 2. INBOX + RESET (NUEVO BOTÓN) */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #38bdf8', paddingBottom: '10px' }}>
                <h5 style={{ color: '#38bdf8', margin: 0 }}>INBOX</h5>
                <button onClick={resetMessages} style={{ background: 'none', border: '1px solid #f43f5e', color: '#f43f5e', padding: '2px 8px', borderRadius: '5px', fontSize: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}>RESET</button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {userMessages.length === 0 ? <p style={{color: '#475569', fontSize: '0.8rem', textAlign:'center'}}>Inbox empty.</p> : 
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
              <input type="email" placeholder="Ban User..." value={banInput} onChange={(e)=>setBanInput(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #f43f5e', color: 'white', fontSize: '0.8rem' }} />
              <button onClick={() => handleBan(banInput)} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>BAN PERMANENTLY</button>
              
              <div style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                {blacklist.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px', borderRadius: '8px', marginTop: '8px', fontSize: '0.7rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m}</span>
                    <button onClick={() => handleUnban(m)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>REVIVE</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. MESSENGER */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #10b981' }}>
              <h5 style={{ color: '#10b981', marginBottom: '15px', borderBottom: '1px solid #10b981', paddingBottom: '10px' }}>RESPONSE</h5>
              <input type="email" placeholder="Target Email" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #10b981', color: 'white' }} />
              <textarea placeholder="Official BX-Mail Message..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '10px', height: '140px', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}></textarea>
              <button onClick={async () => {
                await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody }) });
                setMessage("OFFICIAL DATA SENT ✅");
              }} style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#10b981', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>TRANSMIT REPLY</button>
            </div>

          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#475569', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '1px' }}>{message}</p>
      </div>
    </div>
  );
}
