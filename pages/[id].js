import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function CheckpointPage() {
  const router = useRouter();
  const { id } = router.query;
  
  // Estados para datos y lógica
  const [data, setData] = useState({
    title: 'Alexgaming', // Título por defecto
    image: 'https://i.ibb.co/vzPRm9M/alexgaming.png', // Imagen por defecto
    url: '' 
  });
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(30); 
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);

  // 1. Cargar datos desde MongoDB
  useEffect(() => {
    if (id) {
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((dbData) => {
          if (dbData) {
            // Si en la base de datos guardaste título o imagen, los usa. Si no, usa los de por defecto.
            setData({
              title: dbData.title || 'Alexgaming', 
              image: dbData.image || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
              url: dbData.url || ''
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error cargando:", err);
          setLoading(false);
        });
    }
  }, [id]);

  // 2. Lógica del Temporizador
  useEffect(() => {
    if (isTaskDone && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (isTaskDone && timer === 0) {
      setCanUnlock(true);
    }
  }, [isTaskDone, timer]);

  // 3. Abrir Opera (Tarea)
  const handleTaskClick = () => {
    window.open("https://www.opera.com/es", "_blank");
    setIsTaskDone(true);
  };

  // 4. Desbloquear Link Final
  const handleUnlock = () => {
    if (!data.url) {
      alert("Error: Este Checkpoint no tiene un link de destino configurado en la base de datos.");
      return;
    }
    // Redirigir al usuario
    window.location.href = data.url;
  };

  if (loading) return <div style={styles.loading}>Cargando entorno...</div>;

  return (
    <div style={styles.container}>
      <Head>
        <title>{data.title} - Checkpoint</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.backgroundEffect}></div>

      <div style={styles.card}>
        {/* Imagen dinámica (redonda y con brillo) */}
        <div style={styles.imageContainer}>
          <img src={data.image} style={styles.avatar} alt="Logo" />
        </div>

        {/* Título dinámico */}
        <h1 style={styles.title}>{data.title}</h1>
        <div style={styles.tag}>CHECKPOINT 1</div>
        
        <div style={styles.taskContainer}>
          <p style={styles.instruction}>Complete the steps to proceed</p>
          
          {/* Botón de Tarea (Opera) */}
          <div 
            style={styles.taskButton} 
            onClick={handleTaskClick}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{fontSize: '18px'}}>⬇️</span>
              <div style={{textAlign: 'left'}}>
                <span style={{display: 'block', fontSize: '10px', color: '#aaa'}}>REQUIRED ACTION</span>
                <span style={{fontWeight: 'bold'}}>Download Best Gaming Browser</span>
              </div>
            </div>
            {isTaskDone ? <span style={{color: '#4ade80'}}>✓</span> : <span style={{color: 'white'}}>➜</span>}
          </div>

          {/* Barra de Progreso / Timer */}
          <div style={styles.statusArea}>
            {isTaskDone && !canUnlock ? (
              <p style={styles.timerText}>Wait {timer} seconds...</p>
            ) : (
               <p style={styles.progressText}>Progress: {canUnlock ? '100%' : '0%'}</p>
            )}
            <div style={styles.progressBarBg}>
              <div style={{
                ...styles.progressBarFill, 
                width: canUnlock ? '100%' : isTaskDone ? `${((30 - timer) / 30) * 100}%` : '0%'
              }}></div>
            </div>
          </div>
          
          {/* Botón Final (Unlock) */}
          <button 
            style={canUnlock ? styles.unlockActive : styles.unlockDisabled} 
            disabled={!canUnlock}
            onClick={handleUnlock}
          >
            {canUnlock ? 'UNLOCK CONTENT' : '🔒 LOCKED'}
          </button>
        </div>
        
        <p style={styles.footer}>
          Secure Checkpoint • Powered by Bx-Usuarios
        </p>
      </div>
    </div>
  );
}

// Estilos CSS-in-JS mejorados
const styles = {
  container: {
    backgroundColor: '#050505',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Poppins", sans-serif',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  loading: { color: 'white', backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backgroundEffect: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(62, 84, 172, 0.15) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 1,
  },
  card: { 
    position: 'relative',
    zIndex: 10,
    width: '90%', 
    maxWidth: '380px', 
    backgroundColor: 'rgba(20, 20, 25, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '30px 20px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    textAlign: 'center'
  },
  imageContainer: {
    width: '80px',
    height: '80px',
    margin: '0 auto 15px',
    borderRadius: '50%',
    padding: '3px',
    background: 'linear-gradient(45deg, #ff00cc, #3333ff)', // Borde neón
    boxShadow: '0 0 20px rgba(51, 51, 255, 0.4)'
  },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block', backgroundColor: '#000' },
  title: { fontSize: '22px', fontWeight: '700', margin: '0 0 5px 0', textShadow: '0 0 10px rgba(255,255,255,0.3)' },
  tag: { 
    display: 'inline-block', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    fontSize: '10px', 
    letterSpacing: '1px', 
    color: '#aaa',
    marginBottom: '25px'
  },
  taskContainer: {
    backgroundColor: '#0f0f12',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  instruction: { fontSize: '12px', color: '#888', marginBottom: '15px', textAlign: 'left' },
  taskButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a20',
    border: '1px solid #333',
    padding: '12px 15px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    marginBottom: '20px',
    color: 'white'
  },
  statusArea: { marginBottom: '20px' },
  progressText: { fontSize: '11px', color: '#666', marginBottom: '5px', textAlign: 'right' },
  timerText: { fontSize: '12px', color: '#ffcc00', marginBottom: '5px', fontWeight: 'bold', textAlign: 'center' },
  progressBarBg: { height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4ade80', transition: 'width 1s linear' },
  
  unlockDisabled: {
    width: '100%',
    backgroundColor: '#222',
    color: '#555',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'not-allowed'
  },
  unlockActive: {
    width: '100%',
    background: 'linear-gradient(90deg, #fff, #e0e0e0)',
    color: '#000',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(255, 255, 255, 0.4)', // Resplandor
    animation: 'pulse 1.5s infinite'
  },
  footer: { fontSize: '10px', color: '#444', marginTop: '20px' }
};
