const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const prisma = new PrismaClient()

const login = async (req, res) => {
    try {
        const {email, senha} = req.body
        
        const usuario = await prisma.usuario.findUnique({ where: {email}})

        if(!usuario){
            return res.status(404).json({erro: 'Usuario não foi possivel encontar'})
        }

        const senhaValida = await bcrypt.compare (senha, usuario.senha)

        if(!senhaValida){
            return res.status(401).json({erro: 'Senha incorreta'})
        }

        const token = jwt.sign({id: usuario.id, tipo: usuario.tipo}, process.env.JWT_SECRET, { expiresIn: '8h'})

        return res.status(200).json({
            mensagem: 'Login Realizado com Sucesso',
            token,
            usuario:{
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                primeiroAcesso: usuario.primeiroAcesso
            }
        })
    }catch(error){
        return res.status(500).json({erro: 'Erro interno no sistema', detalhe: error.message})
    }
}

const logout = async (req, res) => {
    return res.status(200).json({mensagem: 'Logout realizado com sucesso!'})
}

const alterarSenha = async (req, res) => {
    try{
        const {id} = req.usuario
        const {senhaAtual, senhaNova} = req.body

        const usuario = await prisma.usuario.findUnique({where: {id}})

        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha)
   
        if(!senhaValida){
            return res.status(401).json({erro: 'Senha Atual Incorreta'})
        }

        const senhaCriptografada = await bcrypt.hash(senhaNova, 10)

        await prisma.usuario.update({
            where: {id},
            data: {
                senha: senhaCriptografada,
                primeiroAcesso: false,
                senhaTemporaria: false
            }
        })

        return res.status(200).json({mensagem: 'Senha temporaria alterada!'})
    }catch(error){
        return res.status(500).json({erro: 'Sistema Fora do Ar', detalhe: error.message})
    }
}

const recuperarSenha = async (req, res) => {
    try{
        const {email} = req.body

        const usuario = await prisma.usuario.findUnique({where: {email}})

        if(!usuario){
            return res.status(404).json({erro: 'E-mail não encontrado'})
        }

        const novaSenha = Math.random().toString(36).slice(-8)

        const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

        await prisma.usuario.update({
            where: {email},
            data: {
                senha: senhaCriptografada,
                senhaTemporaria: true,
                primeiroAcesso: true
            }
        })

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'NutriFlow - Recupere a sua Senha',
            html: `
                <h2> Recupercao de Senha </h2>
                <p> Olá, ${usuario.nome} </p>
                <p> Sua Nova senha temporaria é: <strong> ${novaSenha}</strong></p>
                <p> Acesse o sistema e altere sua senha no primeiro Login.</p>
            `
        })

        return res.status(200).json({mensagem: 'Nova Senha enviada para o E-mail'})
        
    }catch(error){
        return res.status(500).json({erro: 'Sistema Fora do Ar', detalhe: error.message})
    }
}

module.exports = { login, logout, alterarSenha, recuperarSenha}