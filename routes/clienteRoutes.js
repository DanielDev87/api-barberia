const express = require('express');
const router = express.Router();

const {
   createClient,
   getClientes,
   getClienteById,
   updateCliente,
   deleteCliente 
} = require('../controllers/clienteController');

//Ruta para crear un cliente
router.post('/', createClient);
router.get('/', getClientes); 
router.get('/:id', getClienteById); 
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

module.exports = router;