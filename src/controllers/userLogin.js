const pool = require('../config/db.js'); // importo el pool del archivo db.js que sera mi conexion

const bcrypt = require('bcrypt'); //importo bcrypt que es una libreria para hashear las contrasenias.

const crearUsuario = async (req, res) => { // la coloco en async para poder manejar las peticiones de manera asincrona y que el backend o servidor siempre este tomando peticiones.
    const {email, password} = req.body; // del body del req saco los datos de email y password

    if (!email || !password) { // reviso que los campos de email y password tengan informacion.
        return res.status(400).send("Email y contraseña son requeridos");
    }

    try{
        const passwordHash = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO accounts (email, password_hash) VALUES (?, ?)"; //se manda la query, se setean los valores con ? para evitar inyeccion SQL

        const [result] = await pool.query(sql, [email, passwordHash]); // aqui se detiene la funcion y se espera a que se termine de hacer

        res.status(201).json({ // si todo sale bien se regresa codigo 201 y el id del nuevo usuario
        message: "Usuario creado exitosamente",
        userID: result.insertID
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
        const sql = "SELECT * FROM accounts WHERE email = ?";
        const [rows] = await pool.query(sql, [email]);

        if (rows.length === 0){
            return res.status(401).send("Email o contraseña incorrectos");
        }

        const user = rows[0];

        const passwordIsValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).send("Email o contraseña incorrectos");
        }

        res.status(200).json({
            message: "Login exitoso",
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