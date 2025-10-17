const crearUsuario = (req, res) => {
    const {email, password} = req.body;
    res.status(201).json({
        message: `usuario ${email} creado con la contrasenia ${password}`
    });
}

const loginUsuarioEmail = (req, res) => {
    const { email, password } = req.body;
    console.log(`Intento de login para: ${email} con contrasenia ${password}`);
    res.json({ message: 'Login exitoso'})
}

module.exports = {
    crearUsuario,
    loginUsuarioEmail
}