import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RedirectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [linkData, setLinkData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10); // Tiempo de espera tipo Lootlabs

  useEffect(() => {
    if (id) {
      const savedLinks = JSON.parse(localStorage.getItem('bx_links') || '[]');
      const found = savedLinks.find(l => l.id === id);
      if (found) {
        setLinkData(found);
      }
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  if (!linkData) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>404 - Link not found or expired.</div>;

  return (
    <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#0f172a', padding: '40px', borderRadius: '25px', textAlign: 'center', border: '1px solid #334155', maxWidth: '400px' }}>
        <h1 style={{ color: '#38bdf8' }}>BX SYSTEMS</h1>
        <p>You are almost there! Destination: <b>{linkData.title}</b></p>
        
        <div style={{ margin: '30px 0', fontSize: '1.2rem' }}>
          {timeLeft > 0 ? (
            <span>Please wait <b>{timeLeft}</b> seconds...</span>
          ) : (
            <button 
              onClick={() => window.location.href = linkData.original}
              style={{ background: '#10b981', color: 'white', padding: '15px 30px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              GET LINK
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Complete the security check to proceed.</p>
      </div>
    </div>
  );
}
t
