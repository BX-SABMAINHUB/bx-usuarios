import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Redirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Esta línea pregunta a tu base de datos dónde debe ir el link
      fetch(`/api/links?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) {
            // Si encuentra la URL, te redirige automáticamente
            window.location.href = data.url;
          } else {
            console.error("No se encontró la URL en la base de datos");
          }
        })
        .catch((err) => console.error("Error al conectar con la API:", err));
    }
  }, [id]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Redireccionando al destino...</p>
    </div>
  );
}
