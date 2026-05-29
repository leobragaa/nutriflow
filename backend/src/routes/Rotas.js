const express = require('express')
const router = express.Router()
const {login, logout, alterarSenha, recuperarSenha } = require('../controllers/AuthController')
const middlwares = require('../middleware/AuthMiddleware')

router.post('/login', login)
router.post('/logout', logout)
router.post('/recuperar-senha', recuperarSenha)
router.post('/alterar-senha', alterarSenha)

module.exports = router