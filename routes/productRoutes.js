const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    filterProductsByName,
    filterProductsByCategory
} = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/product/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/filter/nombre', filterProductsByName);
router.get('/filter/categoria', filterProductsByCategory);

module.exports = router;
