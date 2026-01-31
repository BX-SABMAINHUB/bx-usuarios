import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

/**
 * BX UNLOCKER - THE HIGH-DETAIL GATEWAY
 * DESIGN: LOOTLABS ELITE V2
 * REVENUE OPTIMIZATION: 30s FORCED DELAY + INTERMEDIATE HOPS
 */

export default function UnlockGate() {
  // --- [SYSTEM STATES] ---
  const [nodeData, setNodeData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isLocked, setIsLocked] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Initialize Security Protocol...');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  // --- [ANIMATION STATES] ---
  const [progress, setProgress] = useState(0);
  const particleContainer = useRef(null);

  // --- [THEME DEFINITION] ---
  const theme = {
    primary: '#6366f1',
    primaryGlow: 'rgba(99, 102, 241, 0.4)',
    bg: '#0b0f1a',
    card: '#161d31',
    border: '#3b4253',
    text: '#f1f5f9',
    muted: '#94a3b8',
    success: '#22c55e',
    error: '#ef4444'
  };

  // --- [EFFECT: INITIALIZATION] ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('bx');

    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        setNodeData(decoded);
        initTimer();
      } catch (err) {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, []);

  // --- [EFFECT: COUNTDOWN LOGIC] ---
  useEffect(() => {
    let interval = null;
    if (isLocked && !isProcessing && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        setProgress(((30 - (timer - 1)) / 30) * 100);
      }, 1000);
    } else if (timer === 0) {
      setIsLocked(false);
      setStatusMsg('Security check passed. You may proceed.');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, isLocked, isProcessing]);

  // --- [LOGIC: STEP HANDLER] ---
  const initTimer = () => {
    setTimer(30);
    setIsLocked(true);
    setProgress(0);
    setStatusMsg(`Verifying Secure Layer ${currentLayer + 1}...`);
  };

  const handleNextStep = () => {
    if (isLocked) return;

    setIsProcessing(true);
    setStatusMsg('Redirecting to secure bridge...');

    // Simulate Hop Redirection if hop exists
    if (nodeData.h && nodeData.h[currentLayer]) {
      window.open(nodeData.h[currentLayer], '_blank');
    }

    setTimeout(() => {
      if (currentLayer + 1 < nodeData.layers) {
        setCurrentLayer(currentLayer + 1);
        setIsProcessing(false);
        initTimer();
      } else {
        setVerified(true);
        setIsProcessing(false);
        setStatusMsg('All layers decrypted. Finalizing...');
      }
    }, 1500);
  };

  const finalRedirect = () => {
    window.location.href = nodeData.target;
  };

  // --- [RENDER: ERROR STATE] ---
  if (error) {
    return (
      <div style={styles.fullCenter}>
        <div style={styles.errorBox}>
          <h1 style={{ color: theme.error }}>INVALID NODE</h1>
          <p>The link you are trying to access is expired or corrupted.</p>
          <button onClick={() => window.location.href = '/'} style={styles.mainBtn}>Return Home</button>
        </div>
      </div>
    );
  }

  if (!nodeData) return <div style={styles.fullCenter}>Loading BX Security...</div>;

  return (
    <div style={styles.body}>
      <Head>
        <title>BX | Unlock {nodeData.title}</title>
      </Head>

      {/* Decorative Background Particles */}
      <div style={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ))}
      </div>

      <div style={styles.mainWrapper}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.badge}>ENCRYPTED CONNECTION</div>
          <h1 style={styles.brand}>BX</h1>
          <p style={styles.subtitle}>Secure Content Distribution System</p>
        </div>

        {/* The Main Unlocker Card */}
        <div style={styles.card}>
          <div style={styles.thumbnailContainer}>
            <img 
              src={nodeData.thumb || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"} 
              style={styles.thumbnail} 
              alt="Asset Preview"
            />
            <div style={styles.imageOverlay} />
          </div>

          <div style={styles.contentBody}>
            <h2 style={styles.assetTitle}>{nodeData.title}</h2>
            
            {/* Layer Indicators */}
            <div style={styles.layerTrack}>
              {Array.from({ length: nodeData.layers }).map((_, i) => (
                <div key={i} style={{
                  ...styles.layerDot,
                  backgroundColor: i < currentLayer ? theme.success : (i === currentLayer ? theme.primary : theme.border),
                  boxShadow: i === currentLayer ? `0 0 10px ${theme.primaryGlow}` : 'none'
                }} />
              ))}
            </div>

            <p style={styles.statusText}>{statusMsg}</p>

            {/* Verification Logic */}
            {!verified ? (
              <div style={styles.actionArea}>
                <div style={styles.progressTrack}>
                  <div style={{...styles.progressBar, width: `${progress}%` }} />
                </div>
                
                <button 
                  disabled={isLocked || isProcessing} 
                  onClick={handleNextStep}
                  style={{
                    ...styles.mainBtn,
                    opacity: (isLocked || isProcessing) ? 0.5 : 1,
                    cursor: (isLocked || isProcessing) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'PROCESSING...' : (isLocked ? `PLEASE WAIT ${timer}S` : `CONTINUE TO STEP ${currentLayer + 2 > nodeData.layers ? 'FINAL' : currentLayer + 2}`)}
                </button>
              </div>
            ) : (
              <div style={styles.finalArea}>
                <div style={styles.successIcon}>✓</div>
                <h3 style={{ color: theme.success, marginBottom: '20px' }}>VERIFICATION COMPLETE</h3>
                <button onClick={finalRedirect} style={{...styles.mainBtn, backgroundColor: theme.success }}>
                  ACCESS ASSET NOW
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Labels */}
        <div style={styles.footer}>
          <div style={styles.footerItem}><span>Shield:</span> Active</div>
          <div style={styles.footerItem}><span>Protocol:</span> AES-256</div>
          <div style={styles.footerItem}><span>Verified:</span> Global BX Network</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        body { margin: 0; padding: 0; background: #0b0f1a; overflow-x: hidden; }
      `}</style>
    </div>
  );
}

// --- [EXTENSIVE STYLING OBJECT] ---
const styles = {
  body: {
    backgroundColor: '#0b0f1a',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", sans-serif',
    color: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden'
  },
  particles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0
  },
  particle: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(11,15,26,0) 70%)',
    borderRadius: '50%',
    animation: 'pulse 8s infinite ease-in-out'
  },
  mainWrapper: {
    zIndex: 10,
    width: '100%',
    maxWidth: '520px',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  brand: {
    fontSize: '72px',
    fontWeight: '900',
    color: '#6366f1',
    margin: '10px 0',
    letterSpacing: '-5px',
    textShadow: '0 0 20px rgba(99,102,241,0.5)'
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '11px',
    fontWeight: '800',
    border: '1px solid rgba(99,102,241,0.3)',
    letterSpacing: '1px'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500'
  },
  card: {
    background: '#161d31',
    width: '100%',
    borderRadius: '32px',
    border: '1px solid #3b4253',
    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  thumbnailContainer: {
    width: '100%',
    height: '220px',
    position: 'relative',
    borderBottom: '1px solid #3b4253'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, transparent, rgba(22, 29, 49, 1))'
  },
  contentBody: {
    padding: '40px',
    textAlign: 'center'
  },
  assetTitle: {
    fontSize: '26px',
    fontWeight: '800',
    marginBottom: '20px',
    letterSpacing: '-0.5px'
  },
  layerTrack: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '25px'
  },
  layerDot: {
    width: '40px',
    height: '6px',
    borderRadius: '10px',
    transition: 'all 0.4s ease'
  },
  statusText: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '30px',
    minHeight: '20px'
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    background: '#0b0f1a',
    borderRadius: '10px',
    marginBottom: '30px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#6366f1',
    transition: 'width 1s linear',
    boxShadow: '0 0 10px #6366f1'
  },
  mainBtn: {
    width: '100%',
    padding: '20px',
    borderRadius: '18px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: '800',
    fontSize: '16px',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 10px 20px -5px rgba(99,102,241,0.5)'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 20px auto',
    border: '2px solid #22c55e'
  },
  footer: {
    marginTop: '40px',
    display: 'flex',
    gap: '20px',
    color: '#475569'
  },
  footerItem: {
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  fullCenter: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0b0f1a',
    color: '#fff',
    fontFamily: 'Inter'
  },
  errorBox: {
    textAlign: 'center',
    background: '#161d31',
    padding: '50px',
    borderRadius: '25px',
    border: '1px solid #3b4253'
  }
};
