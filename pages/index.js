import { useState } from 'react';

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
  const [registeredUsers, setRegisteredUsers] = useState([]); // Lista de usuarios
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');

  // ENVÍO DE CÓDIGO (USER)
  const sendEmail = async () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedCode(code.toString());
    setMessage("Sending secure code...");
    
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'code', code })
    });
    
    if (res.ok) {
      setStep('verify');
      setMessage("Check your inbox");
    }
  };

  const checkCode = () => {
    if (inputCode === generatedCode) {
      setRegisteredUsers([...registeredUsers, { mail: email, verified: true }]);
      setMessage("✅ Successfully Registered!");
    } else {
      setRegisteredUsers([...registeredUsers, { mail: email, verified: false }]);
      setMessage("❌ Incorrect code. Check spam folder.");
    }
  };

  // PANEL OWNER
  const checkOwner = () => {
    if (ownerPass === "2706") {
      setStep('owner-panel');
      setMessage("");
    } else {
      const remaining = attempts - 1;
      setAttempts(remaining);
      if (remaining <= 0) setIsBlocked(true);
      setMessage(`ACCESS DENIED. ${remaining} attempts left.`);
    }
  };

  const sendCustomEmail = async () => {
    setMessage("Sending custom message...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, type: 'custom', customMessage: customMailBody })
    });
    if (res.ok) setMessage("Email sent successfully!");
  };

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <div style={{ maxWidth: step === 'owner-panel' ? '800px' : '400px', margin: 'auto', backgroundColor: '#0f172a', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', border: '1px solid #1e293b' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#38bdf8', marginBottom: '30px', fontWeight: '800' }}>BX SYSTEMS</h1>

        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('email')} style={{ background: 'linear-gradient(45deg, #2563eb, #3b82f6)', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ENTER EMAIL</button>
            <button onClick={() => setStep('owner')} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>OWNER ACCESS</button>
          </div>
        )}

        {step === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="example@gmail.com" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#020617', color: 'white' }} />
            <button onClick={sendEmail} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>SEND CODE</button>
          </div>
        )}

        {step === 'verify' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '15px' }}>Check BX-gmail code:</p>
            <input type="text" maxLength="4" placeholder="0000" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '15px', fontSize: '2rem', width: '150px', textAlign: 'center', borderRadius: '10px', border: '2px solid #38bdf8', backgroundColor: '#020617', color: 'white' }} />
            <button onClick={checkCode} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '10px', border: 'none' }}>VERIFY</button>
          </div>
        )}

        {step === 'owner' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Security Check</h2>
            <input type="password" placeholder="Admin PIN" disabled={isBlocked} onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '15px', borderRadius: '10px', backgroundColor: '#020617', border: '1px solid #f43f5e', color: 'white' }} />
            <button onClick={checkOwner} disabled={isBlocked} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '15px', backgroundColor: isBlocked ? '#1e293b' : '#f43f5e', color: 'white', borderRadius: '10px', border: 'none' }}>LOGIN</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* SECCIÓN DE REGISTROS */}
            <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #334155' }}>
              <h3 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>REGISTERED USERS</h3>
              <div style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                {registeredUsers.length === 0 ? <p style={{ color: '#475569' }}>No data found...</p> : 
                  registeredUsers.map((u, i) => (
                    <div key={i} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <strong>Email:</strong> {u.mail} <br/>
                      <strong>Verified:</strong> {u.verified ? '✅ YES' : '❌ NO'}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* SECCIÓN DE ENVÍO CUSTOM */}
            <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #334155' }}>
              <h3 style={{ color: '#10b981', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>SEND CUSTOM EMAIL</h3>
              <input type="email" placeholder="Recipient Email" onChange={(e)=>setTargetEmail(e.target.value)} style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '5px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155' }} />
              <textarea placeholder="Write your message here..." onChange={(e)=>setCustomMailBody(e.target.value)} style={{ width: '100%', marginTop: '10px', height: '80px', padding: '10px', borderRadius: '5px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155' }}></textarea>
              <button onClick={sendCustomEmail} style={{ width: '100%', marginTop: '10px', backgroundColor: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>SEND AS BX-GMAIL</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  );
}
