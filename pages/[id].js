import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RedirectPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) {
            window.location.href = data.url;
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p>Cargando destino...</p>;
  return <p>Error: El enlace no existe o ha expirado.</p>;
}
