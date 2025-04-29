require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { uid, name, lastName } = req.body;

    if (!uid || !name || !lastName) {
      return res.status(400).json({ error: 'UID, nombre y apellido son obligatorios' });
    }

    try {
      // Actualizar el perfil de usuario en Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          name: name,
          last_name: lastName,
        })
        .eq('uid', uid);

      if (error) {
        console.error('Error al actualizar el perfil de usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      return res.status(200).json({ message: 'Perfil de usuario actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar el perfil de usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};