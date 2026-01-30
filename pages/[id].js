import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Checkpoint() {
  const router = useRouter();
  const { id } = router.query;
  const [targetUrl, setTargetUrl] = useState(null);
  const [timer, setTimer] = useState(5); // 5 segundos de espera
  const [canUnlock, setCanUnlock] = useState(false);

  useEffect(() => {
    if (id) {
      // 1. Buscamos el link en tu MongoDB
      fetch(`/api/links?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.url) setTargetUrl(data.url);
        })
        .catch(err => console.error("Error:", err));
    }
  }, [id]);

  useEffect(() => {
    // 2. Contador para activar el botón
    if (timer > 0) {
      const countdown = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setCanUnlock(true);
    }
  }, [timer]);

  const handleRedirect = () => {
    if (targetUrl) window.location.href = targetUrl;
  };

  return (
    <div style={styles.body}>
      <div style={styles.stars}></div>
      <div style={styles.card}>
        <img src="https://i.ibb.co/vzPRm9M/alexgaming.png" style={styles.avatar} alt="Avatar" />
        <h1 style={styles.title}>Alexgaming</h1>
        <p style={styles.checkpointText}>CHECKPOINT 1</p>
        
        <div style={styles.taskBox}>
          <p style={styles.instruction}>Complete the actions to unlock the link</p>
          <div style={styles.actionRow}>
            <span style={styles.actionIcon}>📁</span>
            <span style={styles.actionName}>DESCARGA EL MEJOR NAVEGADOR</span>
            <span style={styles.check}>✓</span>
          </div>
          
          <p style={styles.progress}>UNLOCK PROGRESS: {canUnlock ? '1/1' : '0/1'}</p>
          
          <button 
            onClick={handleRedirect}
            disabled={!canUnlock}
            style={canUnlock ? styles.btnActive : styles.btnDisabled}
          >
            {canUnlock ? 'UNLOCK CONTENT' : `WAIT ${timer}s...`}
          </button>
        </div>
        
        <p style={styles.footer}>Powered by Bx-Usuarios • We Monetize</p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    backgroundColor: '#0a0b10',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", sans-serif',
    overflow: 'hidden',
    position: 'relative'
  },
  stars: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(white, rgba(255,255,255,0.2) 2px, transparent 40px)',
    backgroundSize: '100px 100px',
    opacity: 0.1
  },
  card: {
    backgroundColor: 'rgba(20, 22, 31, 0.95)',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid #2d2f3a',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
    zIndex: 10,
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  },
  avatar: { width: '80px', borderRadius: '15px', marginBottom: '15px' },
  title: { color: 'white', fontSize: '22px', margin: '0' },
  checkpointText: { color: '#888', fontSize: '12px', marginBottom: '20px' },
  taskBox: {
    backgroundColor: '#161822',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid #2d2f3a'
  },
  instruction: { color: '#ccc', fontSize: '13px', marginBottom: '15px' },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    border: '1px solid #333',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  actionName: { fontSize: '11px', fontWeight: 'bold' },
  progress: { fontSize: '10px', color: '#666', marginBottom: '15px' },
  btnDisabled: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#333',
    color: '#666',
    fontWeight: 'bold'
  },
  btnActive: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(255,255,255,0.3)'
  },
  footer: { color: '#444', fontSize: '10px', marginTop: '20px' }
};
