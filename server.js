const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/mapaComunitario')
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
  });


// Crear el esquema y modelo para el usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Ruta de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Buscar al usuario por su nombre de usuario
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }

  // Verificar si las contraseñas coinciden
  if (user.password === password) {
    res.json({ success: true, message: 'Login exitoso' });
  } else {
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Verificar si el nombre de usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso' });
    }

    // Crear un nuevo usuario con la contraseña en texto plano
    const newUser = new User({
        username,
        email,
        password,
    });

    try {
        // Guardar el usuario en la base de datos
        await newUser.save();
        res.json({ success: true, message: 'Registro exitoso' });
    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        res.status(500).json({ success: false, message: 'Error al registrar al usuario', error });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
