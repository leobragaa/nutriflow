const express = require('express')
const router = express.Router()
const { cadastrar, listar, buscarPorId, editar, excluir } = require('../controllers/NutricionistaController')
const authMiddleware = require('../middleware/AuthMiddleware')

router.post('/', authMiddleware, cadastrar)
router.get('/', authMiddleware, listar)
router.get('/:id', authMiddleware, buscarPorId)
router.put('/:id', authMiddleware, editar)
router.delete('/:id', authMiddleware, excluir)

module.exports = router