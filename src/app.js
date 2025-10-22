const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport'); // outh2 google
const session = require('express-session');
require('./config/passport-setup');
const userRoutes = require("./routes/userRoutes");
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const PORT = 3000; // Puedes usar cualquier puerto libre

// Middleware
app.use(cors()); // Permite peticiones desde el frontend de RN
app.use(express.json()); // Permite recibir datos en formato JSON
app.use(cookieParser());

app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/crear', userRoutes); //para crear un usuario
app.use('/api/auth', authRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});

