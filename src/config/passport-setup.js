// Importa la biblioteca principal de Passport, el middleware de autenticación para Node.js.
const passport = require('passport');

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

// Esta función se llama en cada petición subsecuente del usuario.
// Su trabajo es tomar el ID guardado en la sesión y obtener los datos completos del usuario.
passport.deserializeUser((id, done) => {
    // Aquí, en una aplicación real, buscarías en tu base de datos al usuario con ese 'id'.
    // Por ahora, solo devolvemos un objeto simple con el ID para adjuntarlo a `req.user`.
    done(null, {id: id});
});

// --- CONFIGURACIÓN DE LA ESTRATEGIA DE GOOGLE ---

// Le dice a Passport que use la estrategia de Google que hemos configurado.
passport.use(
    // Crea una nueva instancia de la estrategia de Google con nuestras credenciales y opciones.
    new GoogleStrategy({
        // El ID de cliente que obtuvimos de la Google Cloud Console. Es público.
        clientID: process.env.GOOGLE_CLIENT_ID,
        // El secreto de cliente de Google. ¡DEBE MANTENERSE PRIVADO!
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // La URL a la que Google redirigirá al usuario después de que inicie sesión.
        // Debe coincidir EXACTAMENTE con la que está configurada en la Google Cloud Console.
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {
        // --- FUNCIÓN DE VERIFICACIÓN (CALLBACK) ---
        // Esta función se ejecuta después de que Google autentica al usuario y nos redirige de vuelta.
        // 'accessToken' es un token para acceder a las APIs de Google en nombre del usuario.
        // 'refreshToken' se usa para obtener un nuevo accessToken cuando el primero expire.
        // 'profile' contiene toda la información del usuario que nos dio Google (nombre, email, foto, etc.).
        
        // Muestra en la consola del servidor el perfil del usuario que acaba de iniciar sesión. Muy útil para depurar.
        console.log('Tenemos un perfil de Google!: ', profile);

        // Aquí es donde normalmente buscarías al usuario en tu base de datos o lo crearías si no existe.

        // Llama a 'done' para indicarle a Passport que la autenticación fue exitosa.
        // Pasamos 'null' porque no hubo errores, y 'profile' como el objeto de usuario.
        // Este 'profile' se pasará a `passport.serializeUser` para iniciar la sesión.
        done(null, profile);
        
    })
);