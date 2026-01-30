import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function UnlockPage() {
  const router = useRouter();
  const { data, t, i } = router.query;
  
  const [info, setInfo] = useState({ url: '', title: '', image: '' });
  const [timer, setTimer] = useState(30); 
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);

  useEffect(() => {
    if (data && t && i) {
      setInfo({
        url: atob(data), // Decodifica el link de destino
        title: atob(t),  // Decodifica el título
        image: atob(i)   // Decodifica la imagen
      });
    }
  }, [data, t, i]);

  useEffect(() => {
    if (isTaskDone && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (isTaskDone && timer === 0) {
      setCanUnlock(true);
    }
  }, [isTaskDone, timer]);

  const handleUnlock = () => {
    if (info.url) window.location.href = info.url;
  };

  if (!data) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Cargando configuración...</div>;

  return (
    <div style={styles.container}>
      <Head><title>{info.title} - Unlocking...</title></Head>
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          <img src={info.image} style={styles.avatar} alt="Logo" />
        </div>
        <h1 style={styles.title}>{info.title}</h1>
        <div style={styles.tag}>ESPERA EL TIEMPO PARA DESBLOQUEAR</div>
        
        <div style={styles.taskContainer}>
          <div style={styles.taskButton} onClick={() => { window.open("https://www.opera.com", "_blank"); setIsTaskDone(true); }}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <span>🚀</span>
              <div style={{textAlign:'left'}}>
                <span style={{display:'block', fontSize:'9px', color:'#aaa'}}>PASO 1</span>
                <span style={{fontWeight:'bold'}}>Haz clic para empezar</span>
              </div>
            </div>
            {isTaskDone ? <span style={{color:'#4ade80'}}>✓</span> : <span>➜</span>}
          </div>

          <div style={styles.statusArea}>
            {isTaskDone && !canUnlock ? (
              <p style={styles.timerText}>Espera {timer} segundos...</p>
            ) : (
              <p style={styles.progressText}>{canUnlock ? '¡Listo!' : 'Completa el paso de arriba'}</p>
            )}
            <div style={styles.progressBarBg}>
              <div style={{...styles.progressBarFill, width: canUnlock ? '100%' : isTaskDone ? `${((30-timer)/30)*100}%` : '0%'}}></div>
            </div>
          </div>
          
          <button 
            style={canUnlock ? styles.unlockActive : styles.unlockDisabled} 
            disabled={!canUnlock}
            onClick={handleUnlock}
          >
            {canUnlock ? 'UNLOCK CONTENT' : '🔒 LOCKED'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', color: 'white' },
  card: { width: '90%', maxWidth: '380px', backgroundColor: '#111', borderRadius: '24px', padding: '30px', textAlign: 'center', border: '1px solid #222' },
  imageContainer: { width: '80px', height: '80px', margin: '0 auto 15px', borderRadius: '50%', padding: '3px', background: 'linear-gradient(45deg, #00f2fe, #4facfe)' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
  title: { fontSize: '22px', margin: '0 0 5px 0' },
  tag: { fontSize: '10px', color: '#666', marginBottom: '20px', letterSpacing: '1px' },
  taskContainer: { backgroundColor: '#000', borderRadius: '16px', padding: '20px' },
  taskButton: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161616', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px' },
  timerText: { color: '#ffcc00', fontSize: '12px', marginBottom: '5px' },
  progressBarBg: { height: '4px', backgroundColor: '#222', borderRadius: '2px' },
  progressBarFill: { height: '100%', backgroundColor: '#00f2fe', transition: 'width 1s linear' },
  unlockDisabled: { width: '100%', backgroundColor: '#222', color: '#444', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '20px', fontWeight: 'bold' },
  unlockActive: { width: '100%', background: '#fff', color: '#000', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px #fff' }
};
