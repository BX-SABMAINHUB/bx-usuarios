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
  const [blacklist, setBlacklist] = useState([]); // Blacklist state
  const [banInput, setBanInput] = useState(''); // Input para banear manualmente

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
      setMessage("🚫 ACCESS DENIED: YOUR ACCOUNT IS BLACKLISTED.");
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedCode(code.toString());
    setMessage("Authenticating with BX-gmail...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'code', code })
    });
    if (res.ok) { setStep(targetStep); setMessage("Code sent."); }
  };

  const sendMessageToOwner = async () => {
    if (checkProfanity(currentMessage)) {
      const updatedBlacklist = [...blacklist, email];
      setBlacklist(updatedBlacklist);
      localStorage.setItem('bx_blacklist', JSON.stringify(updatedBlacklist));
      setMessage("⚠️ VIOLATION DETECTED. YOU ARE NOW BANNED.");
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'custom', customMessage: "⚠️ AGGRESSIVE WARNING: You have been BANNED for offensive language." })
      });
      setTimeout(() => setStep('start'), 3000);
      return;
    }
    const newMsg = { text: currentMessage, time: new Date().toLocaleTimeString(), user: email };
    const updatedMsgs = [newMsg, ...userMessages];
    setUserMessages(updatedMsgs);
    localStorage.setItem('bx_messages', JSON.stringify(updatedMsgs));
    setCurrentMessage('');
    setMessage("Message sent ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  // --- FUNCIONES DE BANEO (OWNER) ---
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

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '1200px' : '450px', margin: 'auto', backgroundColor: '#0f172a', padding: '30px', borderRadius: '30px', border: '1px solid #1e293b', boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#38bdf8', marginBottom: '30px', fontWeight: '900' }}>BX SYSTEMS</h1>

        {/* --- USER INTERFACE --- */}
        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: '#2563eb', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>REGISTER USER</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: '#1e293b', color: '#38bdf8', padding: '15px', borderRadius: '15px', border: '1px solid #38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>MESSAGE ADMIN</button>
            <button onClick={() => setStep('owner')} style={{ color: '#475569', marginTop: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>OWNER LOGIN</button>
          </div>
        )}

        {/* --- AUTH FLOWS --- */}
        {(step === 'reg-email' || step === 'msg-auth-email') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center' }}>Identity Check</h3>
            <input type="email" placeholder="Enter Gmail" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification(step === 'reg-email' ? 'reg-code' : 'msg-auth-code')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>CONTINUE</button>
          </div>
        )}

        {(step === 'reg-code' || step === 'msg-auth-code') && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px' }}>Verification Code</h3>
            <input type="text" maxLength="4" placeholder="----" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '12px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) {
                if (step === 'reg-code') {
                  const newUser = { mail: email, verified: true, date: new Date().toLocaleTimeString() };
                  const updated = [newUser, ...registeredUsers];
                  setRegisteredUsers(updated);
                  localStorage.setItem('bx_database', JSON.stringify(updated));
                  setMessage("REGISTERED ✅");
                  setTimeout(() => setStep('start'), 2000);
                } else { setStep('user-msg'); setMessage(""); }
              } else { setMessage("INVALID CODE"); }
            }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>VERIFY</button>
          </div>
        )}

        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#10b981', textAlign: 'center' }}>Secure Channel Active</h3>
            <textarea placeholder="Write message..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '140px', padding: '15px', borderRadius: '12px', background: '#020617', color: 'white', border: '1px solid #10b981' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#10b981', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SEND MESSAGE</button>
          </div>
        )}

        {/* --- OWNER LOGIN --- */}
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e' }}>Admin Console</h2>
            <input type="password" placeholder="PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center', marginTop: '20px' }} />
            <button onClick={() => { if (ownerPass === "2706") setStep('owner-panel'); else setMessage("DENIED"); }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#f43f5e', color: 'white', borderRadius: '12px', border: 'none' }}>UNLOCK</button>
          </div>
        )}

        {/* --- OWNER PANEL (4 COLUMNS) --- */}
        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            
            {/* 1. DATABASE */}
            <div style={{ background: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#38bdf8', marginBottom: '10px' }}>ACTIVITY</h5>
              <div style={{ maxHeight: '350px', overflowY: 'auto', fontSize: '0.75rem' }}>
                {registeredUsers.map((u, i) => (
                  <div key={i} style={{ padding: '8px', background: '#0f172a', marginBottom: '5px', borderRadius: '5px', borderLeft: u.verified ? '3px solid #10b981' : '3px solid #f43f5e' }}>{u.mail}</div>
                ))}
              </div>
            </div>

            {/* 2. MESSAGES */}
            <div style={{ background: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #38bdf8' }}>
              <h5 style={{ color: '#38bdf8', marginBottom: '10px' }}>MESSAGES</h5>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {userMessages.map((m, i) => (
                  <div key={i} style={{ padding: '10px', background: '#1e293b', borderRadius: '8px', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <div style={{ color: '#38bdf8', fontSize: '0.6rem' }}>{m.user}</div>
                    <div>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MODERATION (NEW: BAN/UNBAN) */}
            <div style={{ background: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #f43f5e' }}>
              <h5 style={{ color: '#f43f5e', marginBottom: '10px' }}>BAN CONTROL</h5>
              <input type="email" placeholder="Gmail to ban..." value={banInput} onChange={(e)=>setBanInput(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '5px', background: '#0f172a', border: '1px solid #f43f5e', color: 'white', fontSize: '0.8rem' }} />
              <button onClick={() => handleBan(banInput)} style={{ width: '100%', marginTop: '5px', padding: '8px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 'bold' }}>BAN GMAIL</button>
              
              <div style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>BANNED USERS:</p>
                {blacklist.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '5px 10px', borderRadius: '5px', marginTop: '5px', fontSize: '0.75rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m}</span>
                    <button onClick={() => handleUnban(m)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>RECOVERY</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. REPLY MESSENGER */}
            <div style={{ background: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #10b981' }}>
              <h5 style={{ color: '#10b981', marginBottom: '10px' }}>REPLY</h5>
              <input type="email" placeholder="To:" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '5px', background: '#0f172a', border: '1px solid #10b981', color: 'white' }} />
              <textarea placeholder="Official Message..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '8px', height: '150px', padding: '8px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}></textarea>
              <button onClick={async () => {
                await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody }) });
                setMessage("OFFICIAL REPLY SENT ✅");
              }} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>SEND</button>
            </div>

          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  );
}
