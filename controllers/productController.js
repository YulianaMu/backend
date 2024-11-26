const supabase = require('../config/supabaseClient');

// Validar entrada del producto
const validateProductInput = (product) => {
    const { nombre, descripcion, precio, stock, id_categoria, id_genero, url } = product;

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
    if (!url || typeof url !== 'string' || url.trim().length < 3) {
        throw { status: 400, message: 'El campo "nombre" es obligatorio y debe tener al menos 3 caracteres.' };
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


// Filtrar productos por nombre
exports.filterProductsByName = async (req, res, next) => {
    try {
        const { nombre } = req.query;
        // Validar que el parámetro 'nombre' esté presente y sea válido
        if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es obligatorio y debe tener al menos 3 caracteres.',
            });
        }

        // Consulta a Supabase con el filtro 'nombre'
        const { data, error } = await supabase
        .from('producto')  // Reemplaza con el nombre de tu tabla de productos
        .select('*')  // Selecciona todas las columnas
        .or(`nombre.ilike.%${nombre}%,descripcion.ilike.%${nombre}%`)
            

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos: ' + error.message,
            });
        }

        // Si no se encuentran resultados, devolver un mensaje apropiado
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontraron productos que coincidan con "${nombre}".`,
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
};



// Filtrar productos por categoría
// Filtrar productos por categoría (usando ID de categoría)
exports.filterProductsByCategory = async (req, res, next) => {
    try {
        const { categoria } = req.query;

        // Validar que el parámetro 'categoria' esté presente y sea válido
        if (!categoria || typeof categoria !== 'string' || categoria.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "categoria" es obligatorio y debe ser una cadena válida.',
            });
        }

        // 1. Buscar el ID de la categoría en la tabla 'categoria' usando el nombre o valor de la categoría
        const { data: categoriaData, error: categoriaError } = await supabase
            .from('categoria')  // Nombre de la tabla de categorías
            .select('id_categoria')  // Suponiendo que 'id' es el campo de la clave primaria
            .eq('nombre', categoria)  // 'nombre' es el campo que contiene el nombre de la categoría
            .single();  // Devuelve solo un resultado (una categoría)

        if (categoriaError) {
            return res.status(500).json({
                success: false,
                message: 'Error al buscar la categoría: ' + categoriaError.message,
            });
        }

        // Verificar que la categoría existe
        if (!categoriaData) {
            return res.status(404).json({
                success: false,
                message: `No se encontró la categoría "${categoria}".`,
            });
        }

        // 2. Usar el ID de la categoría para filtrar los productos
        const { data, error } = await supabase
            .from('producto')  // Nombre de la tabla de productos
            .select('*')  // Selecciona todas las columnas
            .eq('id_categoria', categoriaData.id_categoria);  // Filtra por el ID de la categoría

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos: ' + error.message,
            });
        }

        // Si no se encuentran resultados, devolver un mensaje apropiado
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontraron productos en la categoría "${categoria}".`,
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
};



// Obtener un producto por ID
exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validación del ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El campo "id" es obligatorio.',
            });
        }

        // Consulta a la base de datos
        const { data, error } = await supabase.from('producto').select('*').eq('id_producto', id).single();

        // Manejo de errores de Supabase
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos: ' + error.message,
            });
        }

        // Verificar si el producto existe
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el producto con el ID especificado.',
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        // Manejo de errores inesperados
        next(err);
    }
};


// Crear un nuevo producto
exports.createProduct = async (req, res, next) => {
    try {
        const { nombre, descripcion, precio, stock, id_categoria, id_genero, url } = req.body;

        // Validar los datos del producto
        validateProductInput({ nombre, descripcion, precio, stock, id_categoria, id_genero, url });

        const { data, error } = await supabase.from('producto').insert([
            { nombre, descripcion, precio, stock, id_categoria, id_genero, url },
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
        const { nombre, descripcion, precio, stock, id_categoria, id_genero, url  } = req.body;

        if (!id) {
            throw { status: 400, message: 'El campo "id" es obligatorio para actualizar un producto.' };
        }

        // Validar los datos del producto
        validateProductInput({ nombre, descripcion, precio, stock, id_categoria, id_genero, url });

        const { data, error } = await supabase
            .from('producto')
            .update({ nombre, descripcion, precio, stock, id_categoria, id_genero, url })
            .eq('id_producto', id);

        if (error) throw error;

        if (data.length === 0) {
            throw { status: 404, message: 'No se encontró el producto con el id especificado.' };
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validación del ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El campo "id" es obligatorio para eliminar un producto.',
            });
        }

        // Intentar eliminar el producto
        const { data, error } = await supabase.from('producto').delete().eq('id_producto', id);

        // Manejo de errores de Supabase
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos: ' + error.message,
            });
        }

        // Verificar si se encontró y eliminó el producto
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el producto con el id especificado.',
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente.',
        });
    } catch (err) {
        // Manejo de errores inesperados
        next(err);
    }
};

