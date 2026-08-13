const express = require('express')
const router = express.Router()
const {login, logout, alterarSenha, recuperarSenha } = require('../controllers/AuthController')
const authMiddleware = require('../middleware/AuthMiddleware')

router.post('/login', login)
router.post('/logout', logout)
router.post('/recuperar-senha', recuperarSenha)
router.put('/alterar-senha', authMiddleware, alterarSenha)

module.exports = router