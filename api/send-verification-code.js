require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }

    const verificationCode = generateVerificationCode();

    try {
      // Guardar el código en Supabase
      const { data, error } = await supabase
        .from('verification_codes')
        .upsert({
          email: email,
          code: verificationCode,
          created_at: new Date(),
        }, { onConflict: 'email' });

      if (error) {
        console.error('Error al guardar el código en Supabase:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Enviar el correo electrónico
      const mailOptions = {
        from: `WitechPlay <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Código de Verificación - WitechPlay',
        html: `<p>Tu código de verificación de WitechPlay es: <strong>${verificationCode}</strong></p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'Código de verificación enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};