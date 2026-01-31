import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

/**
 * BX SECURE GATEWAY - VERSION 23.0.1
 * [ULTRA-HIGH DETAIL EDITION]
 * FIX: Manual Step Activation (Timer won't start automatically)
 */

export default function BXUnlocker() {
  // --- [SYSTEM STATES] ---
  const [nodeData, setNodeData] = useState(null);
  const [view, setView] = useState('initializing'); 
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isLocked, setIsLocked] = useState(true);
  const [stepActivated, setStepActivated] = useState(false); // NEW: Controls if the timer should run
  const [progress, setProgress] = useState(0);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'info' });
  const [logs, setLogs] = useState([]);
  const [biometricStatus, setBiometricStatus] = useState('Idle');

  // --- [ENVIRONMENT STATES] ---
  const [sysInfo, setSysInfo] = useState({
    ip: 'Calculating...',
    region: 'Global Node',
    browser: 'Secure Browser',
    latency: '14ms'
  });

  // --- [THEME CONFIGURATION] ---
  const theme = {
    primary: '#6366f1',
    primaryGlow: 'rgba(99, 102, 241, 0.5)',
    secondary: '#a855f7',
    bg: '#05070a',
    surface: '#0f172a',
    surfaceLight: '#1e293b',
    border: 'rgba(255, 255, 255, 0.08)',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b'
  };

  // --- [INITIALIZATION LOGIC] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawData = params.get('bx');

    addLog("BX Core System v23.0.1 Initialized.");
    addLog("Establishing encrypted tunnel...");

    if (rawData) {
      try {
        const decoded = JSON.parse(atob(rawData));
        setNodeData(decoded);
        setTimeout(() => setView('welcome'), 2000);
      } catch (e) {
        setView('error');
        addLog("Error: Critical Payload Corruption detected.");
      }
    } else {
      setView('error');
    }

    setSysInfo({
      ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.19.1`,
      region: 'Verified Network',
      browser: 'BX Secure Engine',
      latency: `${Math.floor(Math.random()*40)}ms`
    });
  }, []);

  // --- [TIMER ENGINE - UPDATED] ---
  useEffect(() => {
    let interval = null;
    // The timer ONLY runs if view is unlocking AND stepActivated is true
    if (view === 'unlocking' && stepActivated && isLocked && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
        setProgress(((30 - (timer - 1)) / 30) * 100);
      }, 1000);
    } else if (timer === 0 && isLocked) {
      setIsLocked(false);
      addLog(`Layer ${currentStep + 1} Decryption Finished.`);
      showNotification("SECURITY STEP CLEARED", "success");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [view, stepActivated, isLocked, timer]);

  // --- [CORE ACTIONS] ---
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 8));
  };

  const showNotification = (msg, type = 'info') => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif({ show: false, msg: '', type: 'info' }), 4000);
  };

  const handleStart = () => {
    setView('scanning');
    setBiometricStatus('Scanning User Presence...');
    setTimeout(() => {
      setBiometricStatus('Authenticating Identity...');
      setTimeout(() => {
        setView('unlocking');
        addLog(`Ready to initiate Step 1 of ${nodeData.layers}...`);
      }, 1500);
    }, 1500);
  };

  // NEW: Manual Activation of the 30s timer
  const activateTimer = () => {
    setStepActivated(true);
    addLog(`Decryption for Layer ${currentStep + 1} started...`);
    
    // Simulate opening the Intermediate Hop Link when they click to start the timer
    if (nodeData.h && nodeData.h[currentStep]) {
      window.open(nodeData.h[currentStep], '_blank');
      addLog("Bridge Link opened in new tab.");
    }
  };

  const handleNextStep = () => {
    if (isLocked) return;

    if (currentStep + 1 < nodeData.layers) {
      setCurrentStep(s => s + 1);
      setTimer(30);
      setProgress(0);
      setIsLocked(true);
      setStepActivated(false); // Reset activation for the next step
      addLog(`Waiting for Layer ${currentStep + 2} activation...`);
    } else {
      setView('finished');
      addLog("Access Granted. Payload ready.");
    }
  };

  const finalUnlock = () => {
    showNotification("REDIRECTING...", "success");
    setTimeout(() => {
      window.location.href = nodeData.target;
    }, 1000);
  };

  // --- [STYLES - UNCHANGED] ---
  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: theme.bg, color: theme.textMain, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 999 },
    canvas: { position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle at 50% 50%, ${theme.primary}15 0%, transparent 70%)`, zIndex: 1 },
    card: { width: '100%', maxWidth: '520px', background: theme.surface, borderRadius: '32px', border: `1px solid ${theme.border}`, padding: '40px', position: 'relative', zIndex: 10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)', animation: 'slideUp 0.6s ease-out' },
    header: { textAlign: 'center', marginBottom: '30px' },
    titleLogo: { fontSize: '56px', fontWeight: '900', color: theme.primary, letterSpacing: '-4px', margin: 0, textShadow: `0 0 20px ${theme.primary}50` },
    statusBadge: { display: 'inline-block', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${theme.primary}40`, borderRadius: '50px', fontSize: '10px', fontWeight: '800', color: theme.primary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' },
    thumbnailWrapper: { width: '100%', height: '220px', borderRadius: '24px', overflow: 'hidden', marginBottom: '25px', position: 'relative', border: `1px solid ${theme.border}` },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    mainTitle: { fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' },
    description: { fontSize: '14px', color: theme.textMuted, textAlign: 'center', lineHeight: '1.6', marginBottom: '30px' },
    btn: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: '0.3s transform, 0.3s box-shadow', boxShadow: `0 10px 25px ${theme.primary}40`, textTransform: 'uppercase' },
    stepTrack: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' },
    stepDot: (active, completed) => ({ width: '40px', height: '6px', borderRadius: '10px', background: completed ? theme.success : (active ? theme.primary : theme.surfaceLight), transition: '0.4s' }),
    progressContainer: { height: '10px', width: '100%', background: '#000', borderRadius: '20px', marginBottom: '15px', overflow: 'hidden', border: `1px solid ${theme.border}` },
    progressBar: { height: '100%', background: theme.primary, transition: 'width 1s linear', boxShadow: `0 0 15px ${theme.primary}` },
    logScreen: { background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', marginTop: '25px', border: `1px solid ${theme.border}`, height: '120px', overflowY: 'hidden', display: 'flex', flexDirection: 'column-reverse' },
    logText: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: theme.primary, marginBottom: '5px', opacity: 0.8 },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }
  };

  // --- [VIEWS] ---
  const InitializingView = () => (
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: '20px', fontWeight: 'bold', color: theme.primary }}>LOADING BX SECURE NODE...</p>
    </div>
  );

  const WelcomeView = () => (
    <div className="fade-in">
      <div style={styles.thumbnailWrapper}>
        <img src={nodeData.thumb} style={styles.img} alt="preview" />
      </div>
      <h2 style={styles.mainTitle}>{nodeData.title}</h2>
      <p style={styles.description}>Identity verification required. Complete the steps to unlock.</p>
      <button style={styles.btn} onClick={handleStart}>START VERIFICATION</button>
    </div>
  );

  const ScanningView = () => (
    <div style={{ textAlign: 'center' }} className="fade-in">
      <div className="scanner-line" />
      <div style={{ width: '120px', height: '120px', border: `2px solid ${theme.primary}`, borderRadius: '50%', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: theme.primary, borderRadius: '50%', opacity: 0.2, animation: 'pulse 2s infinite' }} />
      </div>
      <h3>{biometricStatus}</h3>
    </div>
  );

  const UnlockingView = () => (
    <div className="fade-in">
      <div style={styles.stepTrack}>
        {Array.from({ length: nodeData.layers }).map((_, i) => (
          <div key={i} style={styles.stepDot(i === currentStep, i < currentStep)} />
        ))}
      </div>
      
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Step {currentStep + 1} of {nodeData.layers}</h3>
      
      {!stepActivated ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...styles.description, marginBottom: '20px' }}>Click the button below to initialize this security layer.</p>
          <button style={{ ...styles.btn, background: theme.primary }} onClick={activateTimer}>
            VERIFY STEP {currentStep + 1}
          </button>
        </div>
      ) : (
        <>
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
          {isLocked ? (
            <button style={{ ...styles.btn, background: theme.surfaceLight, cursor: 'not-allowed', boxShadow: 'none' }}>
              WAITING FOR CLEARANCE ({timer}S)
            </button>
          ) : (
            <button style={{ ...styles.btn, background: theme.success }} onClick={handleNextStep}>
              {currentStep + 1 === nodeData.layers ? 'UNLOCK FINAL ACCESS' : 'CONTINUE TO NEXT STEP'}
            </button>
          )}
        </>
      )}

      <div style={styles.logScreen}>
        {logs.map((l, i) => <div key={i} style={styles.logText}>{l}</div>)}
      </div>
    </div>
  );

  const FinishedView = () => (
    <div style={{ textAlign: 'center' }} className="fade-in">
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `${theme.success}20`, color: theme.success, fontSize: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `2px solid ${theme.success}` }}>✓</div>
      <h2 style={styles.mainTitle}>ACCESS GRANTED</h2>
      <button style={{ ...styles.btn, background: theme.success }} onClick={finalUnlock}>DOWNLOAD ASSET</button>
    </div>
  );

  if (view === 'error') return <div style={styles.overlay}><h1>404 | BX NODE NOT FOUND</h1></div>;

  return (
    <div style={styles.overlay}>
      <Head>
        <title>BX | Secure Unlocker</title>
      </Head>
      <div style={styles.canvas}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="floating-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, width: `${Math.random() * 200 + 50}px`, height: `${Math.random() * 200 + 50}px`, }} />
        ))}
      </div>
      <div style={styles.card}>
        <div style={styles.header}><div style={styles.statusBadge}>System Secured</div><h1 style={styles.titleLogo}>BX</h1></div>
        {view === 'initializing' && <InitializingView />}
        {view === 'welcome' && <WelcomeView />}
        {view === 'scanning' && <ScanningView />}
        {view === 'unlocking' && <UnlockingView />}
        {view === 'finished' && <FinishedView />}
        <div style={styles.footer}><div>IP: {sysInfo.ip}</div><div>PING: {sysInfo.latency}</div></div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono&display=swap');
        body { margin: 0; background: #05070a; color: #fff; overflow: hidden; }
        .fade-in { animation: fadeIn 0.8s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .floating-particle { position: absolute; background: radial-gradient(circle, ${theme.primary}15 0%, transparent 70%); border-radius: 50%; filter: blur(40px); animation: float 10s infinite ease-in-out; pointer-events: none; }
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -50px); } }
        .spinner { width: 50px; height: 50px; border: 4px solid ${theme.surfaceLight}; border-top: 4px solid ${theme.primary}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .scanner-line { position: absolute; width: 100%; height: 2px; background: ${theme.primary}; top: 0; left: 0; box-shadow: 0 0 15px ${theme.primary}; animation: scan 3s infinite linear; opacity: 0.5; z-index: 5; }
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
      `}</style>
      {/* LOGIC OVERFLOW: BX-GATEWAY-CORE-V23
        - Added Manual Step Activation to prevent auto-timer triggering.
        - Timer only initializes on User Click 'VERIFY STEP'.
        - Security layers preserved.
        - Designing consistent with Lootlabs premium branding.
      */}
    </div>
  );
}
