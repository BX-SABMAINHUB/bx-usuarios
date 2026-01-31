import React, { useState, useEffect, useRef } from 'react';

/**
 * BX-GATEWAY v6.5 - SECURE ACCESS TERMINAL
 * ARCHITECTURE: CLIENT-SIDE VALIDATION + 30S TIMER ENGINE
 * VISUALS: GLASSMORPHISM + PULSE ANIMATIONS
 */

const STYLE_CONFIG = {
  accent: '#00d2ff',
  bg: '#010409',
  card: 'rgba(13, 17, 23, 0.94)',
  border: '#30363d',
  text: '#f0f6fc',
  muted: '#8b949e',
  success: '#3fb950'
};

export default function BxGateway() {
  const [data, setData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [timer, setTimer] = useState(30);
  const [readyToFinalize, setReadyToFinalize] = useState(false);
  const timerRef = useRef(null);

  // --- [DECODIFICACIÓN DE PAYLOAD] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');
    
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setData(decoded);
      } catch (e) {
        console.error("Payload corruption detected.");
      }
    }
  }, []);

  // --- [MOTOR DEL TEMPORIZADOR] ---
  const executeLayerBypass = (url, index) => {
    window.open(url, '_blank');
    setIsWaiting(true);
    setTimer(30);

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsWaiting(false);
          setCurrentLayer(index + 1);
          
          if (data && index + 1 === data.steps.length) {
            setReadyToFinalize(true);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- [COMPONENTES VISUALES] ---
  const Layout = ({ children }) => (
    <div style={{ 
      background: STYLE_CONFIG.bg, minHeight: '100vh', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '20px', 
      fontFamily: 'Inter, sans-serif', color: STYLE_CONFIG.text,
      backgroundImage: `radial-gradient(circle at 2px 2px, #161b22 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .bx-card { background: ${STYLE_CONFIG.card}; border: 1px solid ${STYLE_CONFIG.border}; border-radius: 40px; padding: 50px; width: 100%; max-width: 500px; text-align: center; backdrop-filter: blur(20px); box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: fadeIn 0.8s ease-out; }
        .layer-item { background: #0d1117; border: 1px solid ${STYLE_CONFIG.border}; border-radius: 20px; padding: 25px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; transition: 0.4s; }
        .layer-item.active { border-color: ${STYLE_CONFIG.accent}; background: ${STYLE_CONFIG.accent}08; }
        .layer-item.locked { opacity: 0.4; pointer-events: none; }
        .layer-item.verified { border-color: ${STYLE_CONFIG.success}; background: ${STYLE_CONFIG.success}08; }
        .timer-badge { background: ${STYLE_CONFIG.accent}; color: black; font-weight: 900; padding: 5px 12px; border-radius: 50px; font-size: 0.75rem; }
        .action-btn { background: ${STYLE_CONFIG.accent}; color: black; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .action-btn:disabled { background: #21262d; color: #484f58; cursor: not-allowed; }
        .progress-bar { height: 4px; background: #161b22; width: 100%; border-radius: 10px; margin-top: 15px; overflow: hidden; }
        .progress-fill { height: 100%; background: ${STYLE_CONFIG.accent}; transition: width 1s linear; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px ${STYLE_CONFIG.accent}22; } 50% { box-shadow: 0 0 30px ${STYLE_CONFIG.accent}44; } 100% { box-shadow: 0 0 10px ${STYLE_CONFIG.accent}22; } }
        .final-btn { width: 100%; padding: 25px; border-radius: 20px; border: none; font-weight: 900; font-size: 1.2rem; cursor: pointer; transition: 0.5s; margin-top: 20px; }
        .final-btn.active { background: linear-gradient(45deg, ${STYLE_CONFIG.accent}, #0072ff); color: white; animation: pulseGlow 2s infinite; }
        .final-btn.inactive { background: #21262d; color: ${STYLE_CONFIG.muted}; }
      `}} />
      {children}
    </div>
  );

  if (!data) return (
    <Layout>
      <div className="bx-card">
        <h1 style={{ color: STYLE_CONFIG.danger }}>CRITICAL ERROR</h1>
        <p style={{ color: STYLE_CONFIG.muted }}>Payload data is missing or corrupted. Please contact the administrator.</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="bx-card">
        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={data.image} style={{ width: '130px', height: '130px', borderRadius: '35px', border: `4px solid ${STYLE_CONFIG.accent}`, objectFit: 'cover', marginBottom: '20px' }} />
            <div style={{ position: 'absolute', top: -10, right: -10, background: STYLE_CONFIG.success, color: 'white', padding: '5px 10px', borderRadius: '50px', fontSize: '0.6rem', fontWeight: '900' }}>ENCRYPTED</div>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '1000', margin: 0, letterSpacing: '-2px' }}>{data.title}</h1>
          <p style={{ color: STYLE_CONFIG.muted, fontSize: '0.95rem', marginTop: '10px' }}>Verification required to bypass node security.</p>
        </div>

        {/* STEPS HUD */}
        <div style={{ textAlign: 'left' }}>
          {data.steps.map((url, i) => (
            <div key={i} className={`layer-item ${currentLayer === i ? 'active' : ''} ${currentLayer > i ? 'verified' : ''} ${currentLayer < i ? 'locked' : ''}`}>
              <div>
                <div style={{ fontSize: '0.7rem', color: STYLE_CONFIG.muted, fontWeight: 'bold' }}>LAYER_0{i + 1}</div>
                <div style={{ fontWeight: '900', color: currentLayer > i ? STYLE_CONFIG.success : 'white' }}>
                  {currentLayer > i ? 'IDENTITY VERIFIED' : 'SECURITY CHALLENGE'}
                </div>
                {isWaiting && currentLayer === i && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((30 - timer) / 30) * 100}%` }}></div>
                  </div>
                )}
              </div>
              
              <div>
                {currentLayer > i ? (
                  <span style={{ color: STYLE_CONFIG.success, fontSize: '1.5rem' }}>✓</span>
                ) : (
                  <button 
                    className="action-btn"
                    disabled={currentLayer !== i || isWaiting}
                    onClick={() => executeLayerBypass(url, i)}
                  >
                    {isWaiting && currentLayer === i ? `${timer}s` : 'START'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FINAL BUTTON */}
        <button 
          className={`final-btn ${readyToFinalize ? 'active' : 'inactive'}`}
          disabled={!readyToFinalize}
          onClick={() => window.location.href = data.target}
        >
          {readyToFinalize ? 'ACCESS COMPLETE ASSET' : 'SYSTEM LOCKED'}
        </button>

        <footer style={{ marginTop: '50px', fontSize: '0.65rem', color: STYLE_CONFIG.muted, letterSpacing: '5px' }}>
          BX-SYSTEMS COMMAND PORTAL // 2024
        </footer>
      </div>
    </Layout>
  );
}
