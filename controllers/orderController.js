const supabase = require('../config/supabaseClient');

// Agregar un producto al pedido
// exports.addProductToOrder = async (req, res, next) => {
//     try {
//         const { id_producto, id_pedido, cantidad, precio_total } = req.body;

//         // Validar los datos necesarios
//         if (!id_producto || !id_pedido || !cantidad || !precio_total) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Los campos "id_producto", "id_pedido", "cantidad" y "precio_unitario" son obligatorios.',
//             });
//         }

//         if (cantidad <= 0 || precio_total <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'La cantidad y el precio_unitario deben ser mayores a 0.',
//             });
//         }

//         // Calcular el total parcial
//         //const total_parcial = cantidad * precio_unitario;
//         const total_parcial = precio_total;

//         // Insertar el producto en la tabla productos_pedidos
//         const { data, error } = await supabase.from('producto_has_pedido').insert([
//             {
//                 id_producto,
//                 id_pedido,
//                 cantidad,
//                 total_parcial,
//             },
//         ]);

//         if (error) throw error;

//         // Respuesta exitosa
//         res.status(201).json({
//             success: true,
//             message: 'Producto agregado al pedido exitosamente.',
//             data,
//         });
//     } catch (err) {
//         next(err);
//     }
// };



// Agregar un producto al pedido
exports.addProductsToOrder = async (req, res, next) => {
    try {
        const { productos } = req.body;

        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El campo "productos" es obligatorio y debe ser un array con al menos un producto.',
            });
        }

        const productosProcesados = productos.map((producto) => {
            const { id_producto, id_pedido, cantidad, precio_unitario } = producto;

            // Validar cada producto
            if (!id_producto || !id_pedido || !cantidad || !precio_unitario) {
                throw {
                    status: 400,
                    message: 'Cada producto debe tener "id_producto", "id_pedido", "cantidad" y "precio_unitario".',
                };
            }

            if (cantidad <= 0 || precio_unitario <= 0) {
                throw {
                    status: 400,
                    message: 'La cantidad y el precio_unitario deben ser mayores a 0.',
                };
            }
           const  total_parcial = precio_unitario
            return {
                id_producto,
                id_pedido,
                cantidad,
                total_parcial,
            };
        });

        // Insertar todos los productos en la base de datos
        const { data, error } = await supabase.from('producto_has_pedido').insert(productosProcesados);

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Productos agregados al pedido exitosamente.',
            data,
        });
    } catch (err) {
        next(err);
    }
};






// Controlador genérico de errores
exports.errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor.',
    });
};
