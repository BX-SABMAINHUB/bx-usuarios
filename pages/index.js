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
  const [blacklist, setBlacklist] = useState([]); // Sistema de Baneo

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

  // --- CORRECCIÓN: FUNCIÓN DE ENVÍO CON SALTO DE PASO ---
  const sendVerification = async (targetStep) => {
    if (blacklist.includes(email)) {
      setMessage("🚫 PERMANENT BAN: YOUR EMAIL IS BLACKLISTED.");
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
    
    if (res.ok) {
      setStep(targetStep); // Ahora sí salta al paso correcto
      setMessage("Check your inbox for the BX code.");
    } else {
      setMessage("System Error: Try again later.");
    }
  };

  const sendMessageToOwner = async () => {
    if (!currentMessage.trim()) return;

    if (checkProfanity(currentMessage)) {
      const updatedBlacklist = [...blacklist, email];
      setBlacklist(updatedBlacklist);
      localStorage.setItem('bx_blacklist', JSON.stringify(updatedBlacklist));
      
      setMessage("⚠️ VIOLATION! SYSTEM ALERT SENT.");
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          type: 'custom', 
          customMessage: "⚠️ AGGRESSIVE WARNING: Offensive content detected. You have been BLACKLISTED from BX Systems. Further attempts will be reported." 
        })
      });
      setTimeout(() => setStep('start'), 3000);
      return;
    }

    const newMsg = { text: currentMessage, time: new Date().toLocaleTimeString(), user: email };
    const updatedMsgs = [newMsg, ...userMessages];
    setUserMessages(updatedMsgs);
    localStorage.setItem('bx_messages', JSON.stringify(updatedMsgs));
    setCurrentMessage('');
    setMessage("Message delivered successfully ✅");
    setTimeout(() => setStep('start'), 2000);
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '1100px' : '450px', margin: 'auto', backgroundColor: '#0f172a', padding: '40px', borderRadius: '30px', border: '1px solid #1e293b', boxShadow: '0 0 50px rgba(56, 189, 248, 0.15)' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#38bdf8', marginBottom: '30px', fontWeight: '900', textShadow: '0 0 20px rgba(56,189,248,0.4)' }}>BX SYSTEMS</h1>

        {/* --- MAIN MENU --- */}
        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('reg-email')} style={{ background: '#2563eb', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>REGISTER USER</button>
            <button onClick={() => setStep('msg-auth-email')} style={{ background: '#1e293b', color: '#38bdf8', padding: '15px', borderRadius: '15px', border: '1px solid #38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>MESSAGE ADMIN</button>
            <button onClick={() => setStep('owner')} style={{ color: '#64748b', marginTop: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>OWNER CONSOLE</button>
          </div>
        )}

        {/* --- FLOW: MESSAGE ADMIN (CORREGIDO) --- */}
        {step === 'msg-auth-email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#38bdf8' }}>Identity Check</h3>
            <input type="email" placeholder="Email for verification" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={() => sendVerification('msg-auth-code')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>CONTINUE</button>
          </div>
        )}

        {step === 'msg-auth-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>Input BX Code</h3>
            <input type="text" maxLength="4" placeholder="----" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2.2rem', width: '160px', textAlign: 'center', borderRadius: '12px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) { setStep('user-msg'); setMessage(""); }
              else { setMessage("ACCESS DENIED"); }
            }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>UNLOCK CHANNEL</button>
          </div>
        )}

        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#10b981' }}>Secure Session Active</h3>
            <textarea placeholder="Write your message..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '140px', padding: '15px', borderRadius: '12px', background: '#020617', color: 'white', border: '2px solid #10b981' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#10b981', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SEND TO OWNER</button>
          </div>
        )}

        {/* --- FLOW: REGISTER (CORREGIDO) --- */}
        {step === 'reg-email' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <h3 style={{ textAlign: 'center', color: '#3b82f6' }}>New Registration</h3>
             <input type="email" placeholder="example@gmail.com" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
             <button onClick={() => sendVerification('reg-code')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>GET CODE</button>
           </div>
        )}

        {step === 'reg-code' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Verification</h3>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2.2rem', width: '160px', textAlign: 'center', borderRadius: '12px', border: '2px solid #3b82f6', background: '#020617', color: 'white' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) { 
                const newUser = { mail: email, verified: true, date: new Date().toLocaleTimeString() };
                const updated = [newUser, ...registeredUsers];
                setRegisteredUsers(updated);
                localStorage.setItem('bx_database', JSON.stringify(updated));
                setMessage("✅ REGISTERED IN SYSTEM");
                setTimeout(() => setStep('start'), 2000);
              } else { setMessage("❌ INVALID CODE"); }
            }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>COMPLETE REGISTRATION</button>
          </div>
        )}

        {/* --- OWNER CONSOLE --- */}
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '20px' }}>Admin Login</h2>
            <input type="password" placeholder="PIN CODE" disabled={isBlocked} onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '15px', borderRadius: '12px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center' }} />
            <button onClick={() => {
              if (ownerPass === "2706") { setStep('owner-panel'); setMessage(""); }
              else { 
                const r = attempts - 1; setAttempts(r); 
                if (r <= 0) setIsBlocked(true);
                setMessage(`DENIED. ${r} ATTEMPTS LEFT.`);
              }
            }} disabled={isBlocked} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: isBlocked ? '#1e293b' : '#f43f5e', color: 'white', borderRadius: '12px', border: 'none' }}>ENTER PANEL</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>DATABASE</h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                {registeredUsers.map((u, i) => (
                  <div key={i} style={{ padding: '10px', borderLeft: u.verified ? '4px solid #10b981' : '4px solid #f43f5e', background: '#0f172a', marginBottom: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {u.mail} <br/> <span style={{fontSize:'0.65rem', color:'#475569'}}>{u.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #38bdf8' }}>
              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #38bdf8', paddingBottom: '10px' }}>SECURE INBOX</h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                {userMessages.map((m, i) => (
                  <div key={i} style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', marginBottom: '10px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 'bold' }}>{m.user}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '6px', color: '#f1f5f9' }}>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid #10b981' }}>
              <h4 style={{ color: '#10b981', borderBottom: '1px solid #10b981', paddingBottom: '10px' }}>BX MESSENGER</h4>
              <input type="email" placeholder="To:" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #334155' }} />
              <textarea placeholder="Message..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '10px', height: '120px', padding: '12px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #334155' }}></textarea>
              <button onClick={async () => {
                const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody }) });
                if (res.ok) setMessage("BX-MAIL SENT ✅");
              }} style={{ width: '100%', marginTop: '15px', backgroundColor: '#10b981', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SEND OFFICIAL</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#f43f5e', fontWeight: 'bold', minHeight: '1.2em' }}>{message}</p>
      </div>
    </div>
  );
}
