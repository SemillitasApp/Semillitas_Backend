const express = require('express');
const router = express.Router();

const {crearUsuario, loginUsuarioEmail} = require('../controllers/userLogin');
const { route } = require('./authRoutes');

router.post('/nuevoUsuario', crearUsuario);
router.get('/loginUsuarioEmail', loginUsuarioEmail);

module.exports = router;