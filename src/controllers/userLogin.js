const modelBD = require('../modelsBD/accountModel'); // importo el pool del archivo db.js que sera mi conexion

const bcrypt = require('bcrypt'); //importo bcrypt que es una libreria para hashear las contrasenias.

const jwt = require('jsonwebtoken'); // importo esto para hacer un json web token y hacer la sesion persisntente

const crypto = require('crypto'); // con esta libreria creare un token qr aleatorio para guardarlo en la tabla de tokens_qr

const crearUsuario = async (req, res) => { // la coloco en async para poder manejar las peticiones de manera asincrona y que el backend o servidor siempre este tomando peticiones.
    const {email, password} = req.body; // del body del req saco los datos de email y password

    if (!email || !password) { // reviso que los campos de email y password tengan informacion.
        return res.status(400).send("Email y contraseña son requeridos");
    }

    try{
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await modelBD.createUser(email, passwordHash);

        if (!result || !result.userID) {
            return res.status(500).send("Error al crear el usuario (no se recibio ID)");
        }

        const accessToken = jwt.sign(
            {"userID": result.userID}, // Usamos el ID del nuevo usuario
            process.env.JWT_ACCESS_SECRET,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            {"userID": result.userID}, // Usamos el ID del nuevo usuario
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: '7d'}
        );

        await modelBD.updateUserRefreshToken(result.userID, refreshToken);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000

        });

        res.status(201).json({ // si todo sale bien se regresa codigo 201 y el id del nuevo usuario
        message: "Usuario creado exitosamente y logueado exitosamente",
        accessToken: accessToken,
        userID: result.userID
        });
    } catch (error){
        console.error(error);
        
        if (error.code === 'ER_DUP_ENTRY'){ // en caso de que el usuario ingresado sea duplicado
            return res.status(409).send("El email ya esta registrado");
        }
        res.status(500).send("Error al crear el usuario");
    }
}

const loginUsuarioEmail = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).send("Email y contraseña son requeridos");
    }

    try{
        const user = await modelBD.findUserByEmail(email);

        if (!user) {
            return res.status(401).send("Email o contrasenia incorrectos");
        }

        const passwordIsValid = await bcrypt.compare(password, user.password_hash); // comparamos las contrasenias en hash

        if (!passwordIsValid) {
            return res.status(401).send("Email o contraseña incorrectos");
        }

        // aqui se crea el JWT para la sesion persistente

        const accessToken = jwt.sign( // esto le dara un acceso temporal al usuario
            {"userID": user.id}, // payload, estos son los datos que tendra el token
            process.env.JWT_ACCESS_SECRET,
            {expiresIn: '15m'} // esto quiere decir que expira en 15 min
        );

        const refreshToken = jwt.sign(
            {"userID": user.id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: '7d'} // expirara en 7 dias.
        );

        await modelBD.updateUserRefreshToken(user.id, refreshToken); // guardamos el token en la base de datos

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login exitoso",
            accessToken: accessToken,
            userID: user.id
        });


    } catch (error){
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
}


module.exports = {
    crearUsuario,
    loginUsuarioEmail
}