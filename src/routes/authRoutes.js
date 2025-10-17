const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']})); // con el scope le decimos a google que datos necesitamos, profile tiene todos los datos publicos del usuario y email nos da el email publico y si esta verficado.

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    const email = req.user.emails[0].value;
    const name = req.user.displayName;
    const idGoogle = req.user.id;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Cerrando...</title></head>
      <body>
        <script>
          setTimeout(() => window.close(), 250);
        </script>
        <p>¡Autenticación exitosa! Regresando a la aplicación...</p>
      </body>
      </html>
    `);
});

module.exports = router;
