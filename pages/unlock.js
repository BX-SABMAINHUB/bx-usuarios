import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function UnlockPage() {
  const router = useRouter();
  const { data, t, i, s1, s2, s3, n } = router.query;
  
  const [info, setInfo] = useState({ url: '', title: '', image: '' });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(30); 
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);

  useEffect(() => {
    if (data && t && i) {
      setInfo({
        url: atob(data), 
        title: atob(t),  
        image: atob(i)   
      });

      // Lógica de "Value Steps" y "Info Steps"
      const numSteps = parseInt(n) || 1;
      const stepLinks = [s1, s2, s3].slice(0, numSteps).map(link => link ? atob(link) : "https://www.opera.com");
      setSteps(stepLinks);
    }
  }, [data, t, i, s1, s2, s3, n]);

  useEffect(() => {
    if (isTaskDone && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (isTaskDone && timer === 0) {
      if (currentStep < steps.length - 1) {
        // Si hay más pasos, reiniciar para el siguiente
        setCurrentStep(prev => prev + 1);
        setIsTaskDone(false);
        setTimer(30);
      } else {
        setCanUnlock(true);
      }
    }
  }, [isTaskDone, timer, currentStep, steps.length]);

  const handleTaskClick = () => {
    window.open(steps[currentStep], "_blank");
    setIsTaskDone(true);
  };

  const handleUnlock = () => {
    if (info.url) window.location.href = info.url;
  };

  if (!data) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Loading configuration...</div>;

  return (
    <div style={styles.container}>
      <Head><title>{info.title} - Unlocking Content</title></Head>
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          <img src={info.image} style={styles.avatar} alt="Logo" />
        </div>
        <h1 style={styles.title}>{info.title}</h1>
        <div style={styles.tag}>WAIT FOR THE TIMER TO UNLOCK</div>
        
        <div style={styles.taskContainer}>
          {/* Renderizado dinámico del paso actual */}
          <div style={styles.taskButton} onClick={handleTaskClick}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <span>🚀</span>
              <div style={{textAlign:'left'}}>
                <span style={{display:'block', fontSize:'9px', color:'#aaa'}}>STEP {currentStep + 1} OF {steps.length}</span>
                <span style={{fontWeight:'bold'}}>Click to start</span>
              </div>
            </div>
            {isTaskDone ? <span style={{color:'#4ade80'}}>✓</span> : <span>➜</span>}
          </div>

          <div style={styles.statusArea}>
            {isTaskDone && !canUnlock ? (
              <p style={styles.timerText}>Wait {timer} seconds...</p>
            ) : (
              <p style={styles.progressText}>
                {canUnlock ? 'Ready!' : isTaskDone ? 'Next step loading...' : `Complete step ${currentStep + 1} above`}
              </p>
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
  progressText: { fontSize: '12px', marginBottom: '5px', color: '#666' },
  progressBarBg: { height: '4px', backgroundColor: '#222', borderRadius: '2px' },
  progressBarFill: { height: '100%', backgroundColor: '#00f2fe', transition: 'width 1s linear' },
  unlockDisabled: { width: '100%', backgroundColor: '#222', color: '#444', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '20px', fontWeight: 'bold' },
  unlockActive: { width: '100%', background: '#fff', color: '#000', padding: '15px', borderRadius: '12px', border: 'none', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px #fff' }
};
