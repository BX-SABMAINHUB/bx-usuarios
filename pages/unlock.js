import React, { useState, useEffect } from 'react';
import Head from 'next/head';

/**
 * BX UNLOCKER - THE USER GATEWAY
 * DESIGN: LOOTLABS ELITE
 * LOGIC: 30s Delay per Step + Security Verification
 */

export default function UnlockGate() {
  const [targetData, setTargetData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isReady, setIsReady] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // 1. Parse the Encrypted Payload from URL
    const params = new URLSearchParams(window.location.search);
    const bx = params.get('bx');
    if (bx) {
      try {
        const decoded = JSON.parse(atob(bx));
        setTargetData(decoded);
      } catch (e) {
        console.error("Invalid Node Payload");
      }
    }
  }, []);

  useEffect(() => {
    // 2. Countdown Logic (30 Seconds)
    if (timeLeft > 0 && !isReady) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsReady(true);
    }
  }, [timeLeft, isReady]);

  const handleNextStep = () => {
    if (currentStep + 1 < targetData.layers) {
      // Reset for next layer
      setCurrentStep(currentStep + 1);
      setTimeLeft(30);
      setIsReady(false);
      // Simulate opening a hop link in a new tab if provided
      if (targetData.h && targetData.h[currentStep]) {
        window.open(targetData.h[currentStep], '_blank');
      }
    } else {
      setIsFinished(true);
    }
  };

  if (!targetData) return <div style={styles.errorContainer}><h1>404</h1><p>NODE NOT FOUND</p></div>;

  return (
    <div style={styles.main}>
      <Head>
        <title>BX | Secure Content Unlock</title>
      </Head>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.badge}>SECURE LINK</span>
          <h1 style={styles.logo}>BX</h1>
        </div>

        <div style={styles.card}>
          <div style={styles.thumbBox}>
            <img src={targetData.thumb || "https://via.placeholder.com/400x200?text=BX+ASSET"} style={styles.image} alt="Asset" />
          </div>

          <h2 style={styles.title}>{targetData.title}</h2>
          
          <div style={styles.progressContainer}>
            {Array.from({ length: targetData.layers }).map((_, i) => (
              <div key={i} style={{...styles.progressDot, backgroundColor: i <= currentStep ? '#6366f1' : '#334155'}} />
            ))}
          </div>

          <p style={styles.info}>
            Complete security verification to access your file. <br />
            <strong>Step {currentStep + 1} of {targetData.layers}</strong>
          </p>

          {!isFinished ? (
            <button 
              disabled={!isReady}
              onClick={handleNextStep}
              style={{...styles.btn, opacity: isReady ? 1 : 0.6}}
            >
              {isReady ? 'CONTINUE TO NEXT STEP' : `WAITING... ${timeLeft}s`}
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = targetData.target}
              style={{...styles.btn, backgroundColor: '#22c55e'}}
            >
              UNLOCK CONTENT NOW
            </button>
          )}
        </div>

        <footer style={styles.footer}>
          © 2026 BX Secure Systems. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}

const styles = {
  main: { background: '#0b0f1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Inter", sans-serif', color: '#f1f5f9' },
  container: { width: '100%', maxWidth: '480px', padding: '20px', textAlign: 'center' },
  header: { marginBottom: '30px' },
  logo: { fontSize: '48px', fontWeight: '800', color: '#6366f1', margin: '10px 0', letterSpacing: '-3px' },
  badge: { background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  card: { background: '#161d31', borderRadius: '28px', border: '1px solid #3b4253', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  thumbBox: { width: '100%', borderRadius: '18px', overflow: 'hidden', marginBottom: '25px', border: '1px solid #3b4253' },
  image: { width: '100%', display: 'block' },
  title: { fontSize: '22px', fontWeight: '700', marginBottom: '15px' },
  progressContainer: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' },
  progressDot: { width: '30px', height: '6px', borderRadius: '10px', transition: '0.3s' },
  info: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' },
  btn: { width: '100%', padding: '18px', borderRadius: '14px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '15px', transition: '0.2s' },
  footer: { marginTop: '40px', color: '#475569', fontSize: '12px' },
  errorContainer: { background: '#0b0f1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f1f5f9' }
};
