const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({erro: 'Token não fornecido'})
    }

    const parts = authHeader.split(' ')
    if(parts.length !== 2 || parts[0] !== 'Bearer'){
        return res.status(401).json({ erro: 'Erro no formato token'})
    }
    const token = parts[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = decoded
        return next()
    }catch(error){
        return res.status(401).json({erro: 'Token Inválido ou expirado'})
    }
}

module.exports = authMiddleware