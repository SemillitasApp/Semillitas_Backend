const pool = require('../config/db.js');

const findUserByEmail = async (email) => {
    try{
        const sqlFind = "SELECT * FROM accounts WHERE email = ?";

        const [rows] = await pool.query(sqlFind, [email]);

        return rows.length > 0 ? rows[0] : null;
    } catch (error){
        console.error("Error al buscar usuario por email: ", error);
        throw error;
    }
}

const findUserById = async (id) => {
    try{
        const sqlFind = "SELECT * FROM accounts WHERE id = ?";
        const [accountResult] = await pool.query(sqlFind, [id]);

        return accountResult.length > 0 ? accountResult[0] : null;
    } catch (error){
        console.error("Error al buscar usuario por ID: ", error);
        throw error;
    }
}

const createGoogleUser = async (email, googleID, displayName) => {
    let connection;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        const sqlAccount = "INSERT INTO accounts (email, google_id) VALUES (?, ?)";
        const [accountResult] = await connection.query(sqlAccount, [email, googleID]);

        const newAccountId = accountResult.insertId;

        const sqlFather = "INSERT INTO padres (father_name, account_id) VALUES (?, ?)";
        await connection.query(sqlFather, [displayName, newAccountId]);

        await connection.commit();

        return{
            id: newAccountId,
            email: email,
            google_id: googleID
        };
    } catch (error){
        if (connection){
            await connection.rollback();
        }
        console.error("Error al crear el usuario de Google", error);
        throw error;
    } finally {
        if (connection){
            connection.release();
        }
    }
}

const createUser = async (email, passwordHash) => {
    let connection; // se pide una conexion del pool

    try {
        connection = await pool.getConnection(); // se obtiene esa conexion con el pool

        await connection.beginTransaction(); // aqui decimos, inicia con la transmision de los datos

        const sqlCreate = "INSERT INTO accounts (email, password_hash) VALUES(?, ?)";
        const [result] = await connection.query(sqlCreate, [email, passwordHash]); // ahora uso connection para mandar las query

        const newAccountId = result.insertId;

        const sqlCreateFather = "INSERT INTO padres (account_id, father_name) VALUES (?, ?)";
        await connection.query(sqlCreateFather, [newAccountId, null]);

        await connection.commit();

        return{
            userID: newAccountId,
        }
    } catch (error){
        if (connection){ // si algo en el try falla
            await connection.rollback(); // esto le dice que no guarde nada a la base de datos
        }
        console.error("Error al crear el usuario con email y contrasenia: ", error);
        throw error;
    } finally {
        if (connection){ // no importa que pase librea la conexion de la base de datos
            connection.release();
        }
    }
}

const updateUserGoogleId = async (id, googleID) => {
    try {
        const sql = "UPDATE accounts SET google_id = ? WHERE id = ?";
        await pool.query(sql, [googleID, id]);
    } catch (error){
        console.error("Error al actualizar google_id: ", error);
        throw error;
    }
}

const updateUserRefreshToken = async (id, refreshToken) => {
    try{
        const sql = "UPDATE accounts SET refresh_token = ? WHERE id = ?";
        await pool.query(sql, [refreshToken, id]);
    } catch (error){
        console.error("Error al guardar el refresh token: ", error);
        throw error;
    }
};

module.exports = {
    findUserByEmail,
    createGoogleUser,
    updateUserGoogleId,
    findUserById,
    createUser,
    updateUserRefreshToken
};