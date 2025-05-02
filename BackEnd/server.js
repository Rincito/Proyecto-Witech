const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const { generateCode, saveCode, validateCode } = require("./verificationCodes");
const supabase = require("./supabaseClient");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Enviar código
app.post("/api/send-verification-code", async (req, res) => {
  const { email } = req.body;
  const code = generateCode();
  saveCode(email, code);

  try {
    await transporter.sendMail({
      from: `"Witech" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu código de verificación",
      text: `Tu código es: ${code}`,
    });

    res.json({ message: "Código enviado" });
  } catch (err) {
    console.error("Error al enviar email:", err);
    res.status(500).json({ message: "Error al enviar correo" });
  }
});

// Verificar código y registrar
app.post("/api/verify-code", async (req, res) => {
  const { email, code, password } = req.body;

  if (!validateCode(email, code)) {
    return res.status(400).json({ message: "Código inválido o expirado" });
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Usuario registrado con éxito" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
