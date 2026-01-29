import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('start'); 
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');
  
  // States para Owner y Mensajes
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]); 
  const [userMessages, setUserMessages] = useState([]); // Nueva lista de mensajes
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');

  // --- PERSISTENCIA (Cargar datos) ---
  useEffect(() => {
    const savedLogs = localStorage.getItem('bx_database');
    const savedMsgs = localStorage.getItem('bx_messages');
    if (savedLogs) setRegisteredUsers(JSON.parse(savedLogs));
    if (savedMsgs) setUserMessages(JSON.parse(savedMsgs));
  }, []);

  // --- LOGICA DE REGISTRO ---
  const saveToLogs = (mail, status) => {
    const newUser = { mail, verified: status, date: new Date().toLocaleTimeString() };
    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('bx_database', JSON.stringify(updated));
  };

  const sendEmail = async () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedCode(code.toString());
    setMessage("Connecting to BX-gmail...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'code', code })
    });
    if (res.ok) { setStep('verify'); setMessage(""); }
    else { setMessage("Error: Domain might be blocked."); }
  };

  // --- NUEVA LOGICA: ENVIAR MENSAJE AL OWNER ---
  const sendMessageToOwner = () => {
    if (!currentMessage.trim()) return;
    const newMsg = {
      text: currentMessage,
      time: new Date().toLocaleTimeString(),
      user: email || 'Anonymous'
    };
    const updatedMsgs = [newMsg, ...userMessages];
    setUserMessages(updatedMsgs);
    localStorage.setItem('bx_messages', JSON.stringify(updatedMsgs));
    setCurrentMessage('');
    setMessage("Message sent to Admin! ✅");
    setTimeout(() => setMessage(""), 3000);
  };

  const checkOwner = () => {
    if (ownerPass === "2706") { setStep('owner-panel'); setMessage(""); }
    else {
      const rem = attempts - 1;
      setAttempts(rem);
      if (rem <= 0) setIsBlocked(true);
      setMessage(`ACCESS DENIED. ${rem} ATTEMPTS LEFT.`);
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '1100px' : '450px', margin: 'auto', backgroundColor: '#0f172a', padding: '40px', borderRadius: '30px', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#38bdf8', marginBottom: '30px', fontWeight: '900', textShadow: '0 0 15px rgba(56,189,248,0.3)' }}>BX SYSTEMS</h1>

        {/* --- INTERFAZ DE USUARIO --- */}
        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('email')} style={{ background: '#2563eb', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>REGISTER USER</button>
            <button onClick={() => setStep('user-msg')} style={{ background: '#1e293b', color: '#38bdf8', padding: '15px', borderRadius: '15px', border: '1px solid #38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>MESSAGE ADMIN</button>
            <button onClick={() => setStep('owner')} style={{ color: '#64748b', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>OWNER LOGIN</button>
          </div>
        )}

        {step === 'user-msg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ textAlign: 'center', color: '#38bdf8' }}>Contact Admin</h3>
            <textarea placeholder="Type your message here..." value={currentMessage} onChange={(e)=>setCurrentMessage(e.target.value)} style={{ width: '100%', height: '120px', padding: '15px', borderRadius: '12px', background: '#020617', color: 'white', border: '1px solid #334155' }}></textarea>
            <button onClick={sendMessageToOwner} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>SEND MESSAGE</button>
            <button onClick={() => setStep('start')} style={{ color: '#64748b', background: 'none', border: 'none' }}>Back</button>
          </div>
        )}

        {/* (Aquí van los pasos de Email y Verify igual que antes...) */}
        {step === 'email' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <input type="email" placeholder="example@gmail.com" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
             <button onClick={sendEmail} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>GET CODE</button>
             <button onClick={() => setStep('start')} style={{ color: '#64748b', background: 'none', border: 'none' }}>Back</button>
           </div>
        )}

        {step === 'verify' && (
          <div style={{ textAlign: 'center' }}>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '10px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={() => {
              if (inputCode === generatedCode) { saveToLogs(email, true); setMessage("✅ SUCCESS"); }
              else { saveToLogs(email, false); setMessage("❌ FAILED"); }
            }} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '10px', border: 'none' }}>VERIFY</button>
          </div>
        )}

        {/* --- OWNER PANEL (EL FRAME TRABAJADO) --- */}
        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '20px' }}>Authentication Required</h2>
            <input type="password" placeholder="PIN" disabled={isBlocked} onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center' }} />
            <button onClick={checkOwner} disabled={isBlocked} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: isBlocked ? '#1e293b' : '#f43f5e', color: 'white', borderRadius: '10px', border: 'none' }}>ACCESS</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            
            {/* 1. USER LOGS */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #1e293b' }}>
              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>USER ACTIVITY</h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                {registeredUsers.map((u, i) => (
                  <div key={i} style={{ padding: '8px', borderLeft: u.verified ? '3px solid #10b981' : '3px solid #f43f5e', background: '#0f172a', marginBottom: '5px', borderRadius: '5px', fontSize: '0.8rem' }}>
                    {u.mail} <br/> <span style={{fontSize:'0.6rem', color:'#64748b'}}>{u.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. INCOMING MESSAGES (NUEVO SECCIÓN) */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #38bdf8' }}>
              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #38bdf8', paddingBottom: '10px' }}>USER MESSAGES</h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                {userMessages.length === 0 ? <p style={{fontSize:'0.8rem', color:'#475569'}}>No messages yet...</p> : 
                  userMessages.map((m, i) => (
                    <div key={i} style={{ padding: '10px', background: '#1e293b', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>From: {m.user} - {m.time}</div>
                      <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>{m.text}</div>
                    </div>
                  ))
                }
              </div>
              <button onClick={() => {localStorage.removeItem('bx_messages'); setUserMessages([]);}} style={{width:'100%', marginTop:'10px', fontSize:'0.7rem', color:'#f43f5e', background:'none', border:'1px solid #f43f5e', borderRadius:'5px'}}>Clear Chats</button>
            </div>

            {/* 3. BX-GMAIL MESSENGER */}
            <div style={{ background: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #10b981' }}>
              <h4 style={{ color: '#10b981', borderBottom: '1px solid #10b981', paddingBottom: '10px' }}>REPLY VIA GMAIL</h4>
              <input type="email" placeholder="To:" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }} />
              <textarea placeholder="Message..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '10px', height: '100px', padding: '10px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }}></textarea>
              <button onClick={async () => {
                const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody }) });
                if (res.ok) setMessage("Reply Sent! ✅");
              }} style={{ width: '100%', marginTop: '10px', backgroundColor: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>SEND AS BX-GMAIL</button>
            </div>

          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  );
}
