import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [paso, setPaso] = useState(1); // 1: Inicio, 2: Input Email, 3: Input Código
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [inputCodigo, setInputCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const enviarCorreo = async () => {
    setMensaje("Enviando código...");
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      setCodigoGenerado(data.code);
      setPaso(3);
      setMensaje("");
    } else {
      setMensaje("Error al enviar el correo. Revisa la configuración.");
    }
  };

  const validar = () => {
    if (inputCodigo === codigoGenerado.toString()) {
      setMensaje("✅ Te registraste con éxito");
    } else {
      setMensaje("❌ Código incorrecto, inténtelo de nuevo y compruebe la carpeta spam.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1>BX usuarios</h1>

      {paso === 1 && (
        <button onClick={() => setPaso(2)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Introducir correo electrónico
        </button>
      )}

      {paso === 2 && (
        <div>
          <input 
            type="email" 
            placeholder="Escribe tu correo" 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button onClick={enviarCorreo} style={{ padding: '10px' }}>OK</button>
        </div>
      )}

      {paso === 3 && (
        <div>
          <p>Introduce el código de 4 dígitos enviado por BX Gmail:</p>
          <input 
            type="text" 
            maxLength="4"
            onChange={(e) => setInputCodigo(e.target.value)}
            style={{ padding: '10px', marginRight: '10px', textAlign: 'center' }}
          />
          <button onClick={validar} style={{ padding: '10px' }}>Verificar</button>
        </div>
      )}

      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{mensaje}</p>
    </div>
  );
}
