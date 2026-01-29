import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000); // Genera los 4 dígitos

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS  // Aquí irá tu código de 16 letras (lo configuraremos en Vercel)
    }
  });

  try {
    await transporter.sendMail({
      from: '"BX Gmail" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: "Tu código de verificación BX",
      text: `Tu código de acceso es: ${code}. Si no lo solicitaste, ignora este correo.`,
    });
    // Enviamos el código de vuelta a la web para que pueda comparar
    res.status(200).json({ success: true, code: code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
