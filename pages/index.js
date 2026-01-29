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

  // LOGICA DE REGISTRO
  const sendEmail = async () => {
    setMessage("Sending code...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      setGeneratedCode(data.code);
      setStep('verify');
      setMessage("");
    }
  };

  const checkCode = () => {
    if (inputCode === generatedCode.toString()) {
      setMessage("✅ Successfully Registered!");
    } else {
      setMessage("❌ Invalid code. Check your spam folder.");
    }
  };

  // LOGICA DE OWNER
  const checkOwner = () => {
    if (isBlocked) return;
    if (ownerPass === "2706") {
      setStep('owner-panel');
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      if (newAttempts <= 0) {
        setIsBlocked(true);
        setMessage("ACCESS DENIED - SYSTEM LOCKED");
      } else {
        setMessage(`Access Denied. ${newAttempts} attempts left.`);
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '350px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#38bdf8' }}>BX Users</h1>

        {step === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setStep('email')} style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Enter Email</button>
            <button onClick={() => setStep('owner')} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', backgroundColor: 'transparent', color: '#38bdf8', cursor: 'pointer' }}>Owner Access</button>
          </div>
        )}

        {step === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="email" placeholder="Email address" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none' }} />
            <button onClick={sendEmail} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>OK</button>
          </div>
        )}

        {step === 'verify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p>Enter 4-digit code:</p>
            <input type="text" maxLength="4" onChange={(e)=>setInputCode(e.target.value)} style={{ padding: '10px', textAlign: 'center', fontSize: '1.5rem', color: 'black' }} />
            <button onClick={checkCode} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', borderRadius: '5px', border: 'none' }}>Verify</button>
          </div>
        )}

        {step === 'owner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3>Owner Login</h3>
            <input type="password" placeholder="Passcode" disabled={isBlocked} onChange={(e)=>setOwnerPass(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} />
            <button onClick={checkOwner} disabled={isBlocked} style={{ backgroundColor: isBlocked ? '#475569' : '#f43f5e', color: 'white', padding: '10px', borderRadius: '5px' }}>Login</button>
          </div>
        )}

        {step === 'owner-panel' && (
          <div>
            <h2 style={{ color: '#10b981' }}>Owner Panel</h2>
            <div style={{ textAlign: 'left', fontSize: '0.8rem', marginTop: '10px', padding: '10px', backgroundColor: '#0f172a' }}>
              <p>User: {email || "No recent registrations"}</p>
              <p>Status: Verified ✅</p>
            </div>
            <textarea placeholder="Write a Gmail from Bot..." style={{ width: '100%', marginTop: '10px', padding: '5px' }}></textarea>
            <button style={{ marginTop: '5px', width: '100%', backgroundColor: '#3b82f6' }}>Send as BX-gmail</button>
          </div>
        )}

        <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>{message}</p>
      </div>
    </div>
  );
}
