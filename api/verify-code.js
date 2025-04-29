require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Correo electrónico y código son obligatorios' });
    }

    try {
      // Obtener el código de Supabase
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Código de verificación no encontrado' });
      }

      const storedCode = data.code;
      const createdAt = new Date(data.created_at);
      const now = new Date();
      const expirationTime = 5 * 60 * 1000; // 5 minutos

      if (code !== storedCode || now.getTime() - createdAt.getTime() > expirationTime) {
        return res.status(400).json({ error: 'Código de verificación incorrecto o ha expirado' });
      }

      // Eliminar el código de Supabase
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email);

      return res.status(200).json({ message: 'Código de verificación verificado correctamente' });
    } catch (error) {
      console.error('Error al verificar el código:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};