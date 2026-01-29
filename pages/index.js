import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('start'); 
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');
  
  // Estados de Owner
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]); 
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');

  // --- CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const saved = localStorage.getItem('bx_database');
    if (saved) setRegisteredUsers(JSON.parse(saved));
  }, []);

  // --- GUARDAR USUARIO EN LA "AGENDA" ---
  const saveToLogs = (mail, status) => {
    const newUser = { 
      mail: mail, 
      verified: status, 
      date: new Date().toLocaleTimeString() 
    };
    const updatedList = [newUser, ...registeredUsers];
    setRegisteredUsers(updatedList);
    localStorage.setItem('bx_database', JSON.stringify(updatedList));
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
  };

  const checkCode = () => {
    if (inputCode === generatedCode) {
      saveToLogs(email, true);
      setMessage("✅ REGISTERED SUCCESSFULLY");
    } else {
      saveToLogs(email, false);
      setMessage("❌ INVALID CODE - LOGGED AS FAILED");
    }
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

  const sendCustomEmail = async () => {
    setMessage("Sending custom BX-mail...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody })
    });
    if (res.ok) setMessage("BX-mail sent successfully!");
  };

  const clearData = () => {
    localStorage.removeItem('bx_database');
    setRegisteredUsers([]);
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '900px' : '400px', margin: 'auto', backgroundColor: '#0f172a', padding: '40px', borderRadius: '25px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#38bdf8', marginBottom: '30px', fontWeight: '900', letterSpacing: '2px' }}>BX SYSTEMS</h1>

        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('email')} style={{ background: '#2563eb', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>REGISTER USER</button>
            <button onClick={() => setStep('owner')} style={{ border: '1px solid #334155', color: '#94a3b8', padding: '15px', borderRadius: '12px', cursor: 'pointer', background: 'none' }}>OWNER ACCESS</button>
          </div>
        )}

        {step === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #334155', color: 'white' }} />
            <button onClick={sendEmail} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>GET CODE</button>
          </div>
        )}

        {step === 'verify' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '15px', color: '#94a3b8' }}>Check your BX-gmail inbox:</p>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '10px', border: '2px solid #38bdf8', background: '#020617', color: 'white' }} />
            <button onClick={checkCode} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>VERIFY</button>
          </div>
        )}

        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px', color: '#f43f5e' }}>Admin Authentication</h2>
            <input type="password" placeholder="Passcode" disabled={isBlocked} onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '15px', borderRadius: '10px', background: '#020617', border: '1px solid #f43f5e', color: 'white', textAlign: 'center' }} />
            <button onClick={checkOwner} disabled={isBlocked} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: isBlocked ? '#1e293b' : '#f43f5e', color: 'white', borderRadius: '10px', border: 'none' }}>UNLOCK PANEL</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* PANEL IZQUIERDO: LOGS */}
            <div style={{ background: '#020617', padding: '25px', borderRadius: '15px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ color: '#38bdf8', margin: 0 }}>LIVE LOGS</h3>
                <button onClick={clearData} style={{ background: 'none', border: '1px solid #f43f5e', color: '#f43f5e', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '5px' }}>CLEAR</button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {registeredUsers.length === 0 ? <p style={{ color: '#475569', fontSize: '0.9rem' }}>No data captured yet...</p> : 
                  registeredUsers.map((u, i) => (
                    <div key={i} style={{ marginBottom: '10px', padding: '10px', background: '#0f172a', borderRadius: '10px', borderLeft: u.verified ? '4px solid #10b981' : '4px solid #f43f5e' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.date} - {u.verified ? 'VERIFIED' : 'FAILED'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 'bold' }}>{u.mail}</div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* PANEL DERECHO: ENVÍO MANUAL */}
            <div style={{ background: '#020617', padding: '25px', borderRadius: '15px', border: '1px solid #334155' }}>
              <h3 style={{ color: '#10b981', marginBottom: '15px' }}>BX-GMAIL MESSENGER</h3>
              <input type="email" placeholder="Recipient Email" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px' }} />
              <textarea placeholder="Message Content..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }}></textarea>
              <button onClick={sendCustomEmail} style={{ width: '100%', marginTop: '15px', backgroundColor: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SEND OFFICIAL MAIL</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontWeight: 'bold', fontSize: '0.8rem' }}>{message}</p>
      </div>
    </div>
  );
}
