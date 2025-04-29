require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ error: 'Correo electrónico y UID son obligatorios' });
    }

    try {
      // Crear el perfil de usuario en Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          uid: uid,
          email: email,
        });

      if (error) {
        console.error('Error al crear el perfil de usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      return res.status(200).json({ message: 'Perfil de usuario creado correctamente' });
    } catch (error) {
      console.error('Error al crear el perfil de usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};