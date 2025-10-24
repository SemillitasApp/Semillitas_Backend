// Importa la biblioteca principal de Passport, el middleware de autenticación para Node.js.
const passport = require('passport');

const modelBD = require('../modelsBD/accountModel');

// Importa la estrategia específica para la autenticación con Google usando el protocolo OAuth 2.0.
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Carga la librería dotenv. Esto lee tu archivo .env y pone 
// todas esas variables en un objeto global llamado process.env
require('dotenv').config();

// --- MANEJO DE SESIONES ---

// Esta función se llama después de que un usuario se autentica correctamente.
// Su trabajo es decidir qué información del usuario se guardará en la cookie de sesión.
passport.serializeUser((user, done) => {
    // Guardamos únicamente el ID de Google del usuario en la sesión.
    // 'done' es una función de callback que le dice a Passport que hemos terminado.
    // El primer argumento es para errores (null si no hay) y el segundo es el dato a guardar.
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try{
        const user = await modelBD.findUserById(id);

        if (user){
            done(null, user);
        }else{
            done(new Error('Usuario no encontrado'), null);
        }
    } catch (error){
        done(error, null)
    }
});


passport.use(
    
    new GoogleStrategy({
        
        clientID: process.env.GOOGLE_CLIENT_ID,
        
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {

        const email = profile.emails[0].value;
        const googleID = profile.id;
        const displayName = profile.displayName;

        try {
            let user = await modelBD.findUserByEmail(email);

            if (user){
                if(!user.google_id){
                    await modelBD.updateUserGoogleId(user.id, googleID);
                }
                done(null, user);
            }
            else {
                const newUser = await modelBD.createGoogleUser(email, googleID, displayName);
                done(null, newUser);
            }
        } catch (error){
            console.error(error);
            done(error, null);
        }   
    })
);