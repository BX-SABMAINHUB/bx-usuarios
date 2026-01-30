import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function CheckpointPage() {
  const router = useRouter();
  const { id } = router.query;
  const [targetUrl, setTargetUrl] = useState(null);
  const [timer, setTimer] = useState(30); // 30 segundos de espera
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);

  useEffect(() => {
    if (id) {
      // Buscamos el link real en tu base de datos
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) setTargetUrl(data.url);
        })
        .catch((err) => console.error("Error loading link:", err));
    }
  }, [id]);

  useEffect(() => {
    // El contador solo empieza si el usuario ya hizo clic en la tarea de Opera
    if (isTaskDone && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (isTaskDone && timer === 0) {
      setCanUnlock(true);
    }
  }, [isTaskDone, timer]);

  const handleTaskClick = () => {
    // Abrir Opera en una pestaña nueva
    window.open("https://www.opera.com/es", "_blank");
    // Empezar el contador de 30 segundos
    setIsTaskDone(true);
  };

  const handleUnlock = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="https://i.ibb.co/vzPRm9M/alexgaming.png" style={styles.avatar} alt="Logo" />
        <h1 style={styles.title}>Alexgaming</h1>
        <h2 style={styles.subtitle}>CHECKPOINT 1</h2>
        
        <div style={styles.taskCard}>
          <p style={styles.taskTitle}>Complete the actions to unlock the link</p>
          
          <button style={styles.actionButton} onClick={handleTaskClick}>
            DOWNLOAD THE BEST GAMING BROWSER
          </button>

          <div style={styles.statusBox}>
            <p style={styles.progressText}>
              UNLOCK PROGRESS: {canUnlock ? '1/1' : isTaskDone ? 'WAITING...' : '0/1'}
            </p>
            {isTaskDone && !canUnlock && (
              <p style={styles.timerText}>Please wait {timer} seconds...</p>
            )}
          </div>
          
          <button 
            style={canUnlock ? styles.unlockActive : styles.unlockDisabled} 
            disabled={!canUnlock}
            onClick={handleUnlock}
          >
            {canUnlock ? 'UNLOCK CONTENT' : '🔒 UNLOCK CONTENT'}
          </button>
        </div>
        
        <p style={styles.footer}>
          Support Content Creators: The content is brought to you for FREE thanks to the ads on this page.
          <br/>Powered by Bx-Usuarios
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0b0e14',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", sans-serif',
    color: 'white',
    padding: '20px'
  },
  card: { width: '100%', maxWidth: '400px', textAlign: 'center' },
  avatar: { width: '70px', borderRadius: '12px', marginBottom: '15px' },
  title: { fontSize: '24px', fontWeight: 'bold', margin: '0' },
  subtitle: { fontSize: '12px', color: '#888', marginBottom: '25px', letterSpacing: '1px' },
  taskCard: {
    backgroundColor: '#161822',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #2d2f3a',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
  },
  taskTitle: { fontSize: '14px', color: '#ccc', marginBottom: '20px' },
  actionButton: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    color: 'white',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  statusBox: { margin: '20px 0' },
  progressText: { fontSize: '11px', color: '#666', margin: '0' },
  timerText: { fontSize: '13px', color: '#fff', marginTop: '5px', fontWeight: 'bold' },
  unlockDisabled: {
    width: '100%',
    backgroundColor: '#333',
    color: '#666',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  unlockActive: {
    width: '100%',
    backgroundColor: '#ffffff',
    color: '#000',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
  },
  footer: { fontSize: '10px', color: '#444', marginTop: '25px', lineHeight: '1.5' }
};
