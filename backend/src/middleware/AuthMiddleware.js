const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(404).json({erro: 'Tokwn não fornecido'})
    }

    const token = authHeader.split(' ')[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = decoded
        next()
    }catch(error){
        return res.status(401).json({erro: 'Token Inválido ou experido'})
    }
}

module.exports = authMiddleware