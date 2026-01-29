import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email, type, customMessage, code } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS 
    }
  });

  // Elegimos qué enviar: El código o el mensaje del Owner
  const subject = type === 'custom' ? "New Message from BX System" : "Your BX Verification Code";
  const content = type === 'custom' ? customMessage : `Your access code is: ${code}`;

  try {
    await transporter.sendMail({
      from: '"BX-gmail" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: subject,
      text: content,
      html: `<div style="font-family: sans-serif; border: 2px solid #3b82f6; padding: 20px; border-radius: 15px; background-color: #f8fafc;">
               <h2 style="color: #1e40af;">BX-gmail Official Communication</h2>
               <p style="font-size: 1.1rem; color: #334155;">${content}</p>
               <footer style="margin-top: 20px; font-size: 0.8rem; color: #94a3b8;">Sent via BX Secure Systems</footer>
             </div>`
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
