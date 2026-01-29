import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS 
    }
  });

  try {
    await transporter.sendMail({
      from: '"BX-gmail" <' + process.env.GMAIL_USER + '>', // Nombre actualizado
      to: email,
      subject: "Your BX Verification Code",
      text: `Your access code is: ${code}`,
      html: `<div style="font-family: Arial; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
               <h2 style="color: #3b82f6;">BX Verification</h2>
               <p>Your security code is:</p>
               <h1 style="letter-spacing: 5px; color: #1d4ed8;">${code}</h1>
             </div>`
    });
    res.status(200).json({ success: true, code: code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
