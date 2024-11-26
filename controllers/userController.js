const supabase = require('../config/supabaseClient');

// Validación de entrada de usuario
const validateUserInput = (user) => {
    const { nombre, apellido, correo, telefono, usuario_login, contrasena_hash } = user;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        throw { status: 400, message: 'El campo "nombre" es obligatorio y debe tener al menos 2 caracteres.' };
    }

    if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
        throw { status: 400, message: 'El campo "apellido" es obligatorio y debe tener al menos 2 caracteres.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo || !emailRegex.test(correo)) {
        throw { status: 400, message: 'El campo "correo" es obligatorio y debe ser un correo electrónico válido.' };
    }

    const phoneRegex = /^\d{10}$/; // Asegura que el teléfono sea un número de 10 dígitos.
    if (!telefono || !phoneRegex.test(telefono)) {
        throw { status: 400, message: 'El campo "telefono" es obligatorio y debe contener 10 dígitos.' };
    }

    if (!usuario_login || typeof usuario_login !== 'string' || usuario_login.trim().length < 5) {
        throw { status: 400, message: 'El campo "usuario_login" es obligatorio y debe tener al menos 5 caracteres.' };
    }

    if (!contrasena_hash || typeof contrasena_hash !== 'string' || contrasena_hash.length < 8) {
        throw { status: 400, message: 'El campo "contraseña_hash" es obligatorio y debe tener al menos 8 caracteres.' };
    }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from('usuario').select('*');
        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Obtener usuario por ID
exports.getUserById = async (req, res, next) => {
    try {
        const { id_usuario } = req.params;

        if (!id_usuario) {
            throw { status: 400, message: 'El campo "id_usuario" es obligatorio para buscar un usuario.' };
        }

        const { data, error } = await supabase.from('usuario').select('*').eq('id_usuario', id_usuario).single();
        if (error) throw error;

        if (!data) {
            throw { status: 404, message: 'No se encontró el usuario con el id especificado.' };
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res, next) => {
    try {
        const { nombre, apellido, correo, telefono, usuario_login, contrasena_hash } = req.body;

        // Validar datos del usuario
        validateUserInput({ nombre, apellido, correo, telefono, usuario_login, contrasena_hash });

        const { data, error } = await supabase.from('usuario').insert([
            { nombre, apellido, correo, telefono, usuario_login, contrasena_hash },
        ]);
        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res, next) => {
    try {
        const { id_usuario } = req.params;
        const { nombre, apellido, correo, telefono, usuario_login, contrasena_hash } = req.body;

        if (!id_usuario) {
            throw { status: 400, message: 'El campo "id_usuario" es obligatorio para actualizar un usuario.' };
        }

        // Validar datos del usuario
        validateUserInput({ nombre, apellido, correo, telefono, usuario_login, contrasena_hash });

        const { data, error } = await supabase
            .from('usuario')
            .update({ nombre, apellido, correo, telefono, usuario_login, contrasena_hash })
            .eq('id_usuario', id_usuario);

        if (error) throw error;

        if (data.length === 0) {
            throw { status: 404, message: 'No se encontró el usuario con el id especificado.' };
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res, next) => {
    try {
        const { id_usuario } = req.params;

        // Validación del ID
        if (!id_usuario) {
            return res.status(400).json({ success: false, message: 'El campo "id_usuario" es obligatorio para eliminar un usuario.' });
        }

        // Intentar eliminar el usuario
        const { data, error } = await supabase.from('usuario').delete().eq('id_usuario', id_usuario);

        // Manejo de errores de Supabase
        if (error) {
            return res.status(500).json({ success: false, message: 'Error en la base de datos: ' + error.message });
        }

        // Verificar si se encontró y eliminó un usuario
        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró el usuario con el id especificado.' });
        }

        // Respuesta exitosa
        return res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente.' });
    } catch (err) {
        // Pasar errores inesperados al middleware de manejo de errores
        next(err);
    }
};
