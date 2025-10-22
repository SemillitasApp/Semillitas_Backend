const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // importo esto para hacer un json web token y hacer la sesion persisntente
const pool = require('../config/db.js');
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']})); // con el scope le decimos a google que datos necesitamos, profile tiene todos los datos publicos del usuario y email nos da el email publico y si esta verficado.


router.get('/google/callback', passport.authenticate('google'), async (req, res) => {
  try{
    const user = req.user;

    const accessToken = jwt.sign(
      {"userID": user.id},
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '15m'}
    );

    const refreshToken = jwt.sign(
      {"userID": user.id},
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '7d'}
    );

    const saveTokenSql = "UPDATE accounts SET refresh_token = ? WHERE id = ?";
    await pool.query(saveTokenSql, [refreshToken, user.id]);

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message: "Login con Google exitoso",
      accessToken: accessToken,
      userID: user.id
    });
  } catch (error){
    console.error("Error en el callback de Google: ", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
