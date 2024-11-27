const express = require('express');
const { addProductsToOrder } = require('../controllers/orderController');


const router = express.Router();

// Ruta para agregar un producto al pedido
router.post('/pedido', addProductsToOrder);

module.exports = router;
