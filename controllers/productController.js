const supabase = require('../config/supabaseClient');

// Validar entrada del producto
const validateProductInput = (product) => {
    const { nombre, descripcion, precio, stock, id_categoria, id_genero } = product;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
        throw { status: 400, message: 'El campo "nombre" es obligatorio y debe tener al menos 3 caracteres.' };
    }

    if (descripcion && (typeof descripcion !== 'string' || descripcion.trim().length > 255)) {
        throw { status: 400, message: 'El campo "descripcion" debe ser un texto válido y no superar 255 caracteres.' };
    }

    if (typeof precio !== 'number' || precio <= 0) {
        throw { status: 400, message: 'El campo "precio" es obligatorio y debe ser un número mayor a 0.' };
    }

    if (!Number.isInteger(stock) || stock < 0) {
        throw { status: 400, message: 'El campo "stock" debe ser un número entero mayor o igual a 0.' };
    }

    if (!Number.isInteger(id_categoria) || stock < 0) {
        throw { status: 400, message: 'El campo "categoria" es obligatorio y debe ser un numero válido.' };
    }

    if (!Number.isInteger(id_genero) || stock < 0) {
        throw { status: 400, message: 'El campo "categoria" es obligatorio y debe ser un numero válido.' };
    }
};

// Obtener todos los productos
exports.getProducts = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from('producto').select('*');
        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Crear un nuevo producto
exports.createProduct = async (req, res, next) => {
    try {
        const { nombre, descripcion, precio, stock, id_categoria, id_genero } = req.body;

        // Validar los datos del producto
        validateProductInput({ nombre, descripcion, precio, stock, id_categoria, id_genero });

        const { data, error } = await supabase.from('producto').insert([
            { nombre, descripcion, precio, stock, id_categoria, id_genero },
        ]);

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Actualizar un producto
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, id_categoria, id_genero } = req.body;

        if (!id) {
            throw { status: 400, message: 'El campo "id" es obligatorio para actualizar un producto.' };
        }

        // Validar los datos del producto
        validateProductInput({ nombre, descripcion, precio, stock, id_categoria, id_genero });

        const { data, error } = await supabase
            .from('producto')
            .update({ nombre, descripcion, precio, stock, id_categoria, id_genero})
            .eq('id', id);

        if (error) throw error;

        if (data.length === 0) {
            throw { status: 404, message: 'No se encontró el producto con el id especificado.' };
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Eliminar un producto
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw { status: 400, message: 'El campo "id" es obligatorio para eliminar un producto.' };
        }

        const { data, error } = await supabase.from('producto').delete().eq('id', id);

        if (error) throw error;

        if (data.length === 0) {
            throw { status: 404, message: 'No se encontró el producto con el id especificado.' };
        }

        res.status(200).json({ success: true, message: 'Producto eliminado exitosamente.' });
    } catch (err) {
        next(err);
    }
};
