import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Redirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Busca en tu base de datos el link con ese ID
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) {
            // ¡Vuela al destino real!
            window.location.href = data.url;
          }
        })
        .catch((err) => console.error("Error:", err));
    }
  }, [id]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Redireccionando...</p>
    </div>
  );
}
