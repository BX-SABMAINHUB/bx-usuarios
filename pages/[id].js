import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function CheckpointPage() {
  const router = useRouter();
  const { id } = router.query;
  const [linkData, setLinkData] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((data) => setLinkData(data))
        .catch((err) => console.error("Error cargando el link", err));
    }
  }, [id]);

  const handleUnlock = () => {
    if (linkData && linkData.url) {
      window.location.href = linkData.url;
    }
  };

  if (!linkData) return <div style={styles.container}><p style={{color: 'white'}}>Cargando Checkpoint...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Alexgaming</h1>
        <h2 style={styles.subtitle}>CHECKPOINT 1</h2>
        
        <div style={styles.iconBox}>
          <div style={styles.youtubeIcon}>▶</div>
        </div>

        <div style={styles.taskCard}>
          <p style={styles.taskTitle}>CHECKPOINT 1</p>
          <p style={styles.taskDesc}>Complete the actions and unlock the link</p>
          
          <button style={styles.actionButton} onClick={() => setUnlocked(true)}>
            DESCARGA EL MEJOR NAVEGADOR DE JUEGOS
          </button>

          <p style={styles.progressText}>UNLOCK PROGRESS: {unlocked ? '1/1' : '0/1'}</p>
          
          <button 
            style={unlocked ? styles.unlockActive : styles.unlockDisabled} 
            disabled={!unlocked}
            onClick={handleUnlock}
          >
            {unlocked ? 'UNLOCK CONTENT' : '🔒 UNLOCK CONTENT'}
          </button>
        </div>
        
        <p style={styles.footer}>Support Content Creators: The content is brought to you for FREE thanks to the ads on this page.</p>
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
    fontFamily: 'sans-serif',
    color: 'white',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: '#ccc', marginBottom: '20px' },
  iconBox: { marginBottom: '20px' },
  youtubeIcon: {
    backgroundColor: '#3e314d',
    width: '60px',
    height: '40px',
    margin: '0 auto',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  taskTitle: { fontWeight: 'bold', marginBottom: '5px' },
  taskDesc: { fontSize: '12px', color: '#aaa', marginBottom: '20px' },
  actionButton: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '15px'
  },
  progressText: { fontSize: '11px', marginBottom: '15px' },
  unlockDisabled: {
    width: '100%',
    backgroundColor: '#555',
    color: '#888',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold'
  },
  unlockActive: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  footer: { fontSize: '10px', color: '#666', marginTop: '20px', lineHeight: '1.4' }
};
