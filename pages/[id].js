import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Redirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetch(`/api/links?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.url) window.location.href = data.url;
        })
        .catch(err => console.log(err));
    }
  }, [id]);

  return <div>Redireccionando...</div>;
}
