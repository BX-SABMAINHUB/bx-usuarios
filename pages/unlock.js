import React, { useState, useEffect, useRef } from 'react';

/**
 * BX GATEWAY UNLOCKER v5.0 - CLANDESTINE EDITION
 * DESIGN: UNDERGROUND SECURITY BYPASS
 * FEATURE: 30s HARD-WAIT PER SECURITY LAYER
 */

const CFG = {
  accent: '#00ff41',
  bg: '#010101',
  surface: '#050505',
  border: '#111',
  text: '#ffffff',
  muted: '#333'
};

export default function BxUnlock() {
  const [asset, setAsset] = useState(null);
  const [step, setStep] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerInterval = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('payload');
    if (p) {
      try {
        const decoded = JSON.parse(atob(p));
        setAsset(decoded);
      } catch (e) {
        console.error("DATA_CORRUPTION_DETECTED");
      }
    }
  }, []);

  const triggerStep = (url, index) => {
    window.open(url, '_blank');
    setWaiting(true);
    setTimeLeft(30);

    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          setWaiting(false);
          setStep(index + 1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!asset) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff003c' }}>
        <h1 style={{ letterSpacing: '10px' }}>403: ACCESS_DENIED</h1>
      </div>
    );
  }

  return (
    <div style={{ background: CFG.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'monospace' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker { 0% { opacity: 0.9; } 100% { opacity: 1; } }
        .bx-gateway { background: ${CFG.surface}; border: 1px solid ${CFG.border}; padding: 60px; width: 100%; max-width: 500px; position: relative; animation: flicker 0.1s infinite alternate; }
        .bx-gateway::before { content: 'BX_SECURE_GATEWAY'; position: absolute; top: -25px; left: 0; font-size: 0.6rem; color: ${CFG.accent}; letter-spacing: 5px; }
        .layer-box { border: 1px solid #111; padding: 25px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
        .layer-box.active { border-color: ${CFG.accent}; box-shadow: 0 0 20px rgba(0,255,65,0.05); }
        .layer-box.cleared { border-color: #222; opacity: 0.5; }
        .timer-text { color: ${CFG.accent}; font-weight: 800; font-size: 1.2rem; }
        .btn-action { background: ${CFG.accent}; color: #000; border: none; padding: 12px 25px; font-weight: 900; cursor: pointer; text-transform: uppercase; }
        .btn-action:disabled { background: #111; color: #333; cursor: not-allowed; }
        .progress-bar { position: absolute; bottom: 0; left: 0; height: 2px; background: ${CFG.accent}; transition: width 1s linear; }
        .final-access { width: 100%; padding: 25px; margin-top: 30px; border: 1px solid ${CFG.accent}; background: transparent; color: ${CFG.accent}; font-weight: 900; font-size: 1.2rem; cursor: pointer; transition: 0.5s; }
        .final-access:hover:not(:disabled) { background: ${CFG.accent}; color: #000; box-shadow: 0 0 40px ${CFG.accent}; }
        .final-access:disabled { border-color: #222; color: #222; cursor: not-allowed; }
      `}} />

      <div className="bx-gateway">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={asset.i} style={{ width: '120px', height: '120px', border: `1px solid ${CFG.accent}`, padding: '5px', marginBottom: '20px', objectFit: 'cover' }} />
          <h1 style={{ fontSize: '1.8rem', color: '#fff', margin: 0 }}>{asset.t}</h1>
          <p style={{ color: CFG.accent, fontSize: '0.6rem', marginTop: '10px', letterSpacing: '2px' }}>DECRYPTING_ASSET_LAYERS...</p>
        </div>

        <div style={{ marginTop: '40px' }}>
          {asset.s.map((url, i) => (
            <div key={i} className={`layer-box ${step === i ? 'active' : ''} ${step > i ? 'cleared' : ''}`}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#444' }}>SECURITY_LAYER_0{i+1}</div>
                <div style={{ color: step > i ? CFG.accent : '#fff', fontWeight: 'bold' }}>
                  {step > i ? 'LAYER_CLEARED' : (step === i ? 'WAITING_FOR_BYPASS' : 'LOCKED')}
                </div>
              </div>

              {waiting && step === i ? (
                <div className="timer-text">{timeLeft}s</div>
              ) : (
                <button 
                  className="btn-action" 
                  disabled={step !== i || waiting}
                  onClick={() => triggerStep(url, i)}
                >
                  {step > i ? 'OK' : 'BYPASS'}
                </button>
              )}
            </div>
          ))}
        </div>

        {waiting && (
          <div className="progress-bar" style={{ width: `${(timeLeft / 30) * 100}%` }} />
        )}

        <button 
          className="final-access"
          disabled={step < asset.s.length || waiting}
          onClick={() => window.location.href = asset.d}
        >
          {step === asset.s.length ? 'GET_FINAL_ASSET' : 'SYSTEM_ENCRYPTED'}
        </button>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.5rem', color: '#222', letterSpacing: '3px' }}>
          BX TRANSMISSION PROTOCOL // NO_LOG_POLICY_ACTIVE
        </div>
      </div>
    </div>
  );
}
