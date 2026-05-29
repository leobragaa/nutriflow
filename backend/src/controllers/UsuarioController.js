const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const nodemailer  = require('nodemailer')

const prisma = new PrismaClient()

const cadastrar = async(req, res) =>{
    try{
        const {nome, email, tipo} = req.body

        const usuarioExistente = await prisma.usuario.findUnique({ where: {email} })
        if(usuarioExistente){
            return res.status(400).json({erro: 'E-mail já Cadastrado'})
        }

        const senhaTemporaria = Math.random().toString(36).slice(-8)
        const senhaCripto = await bcrypt.hash(senhaTemporaria, 10)

        const usuario = await prisma.usuario.create({
            data:{
                nome,
                email,
                senha: senhaCripto,
                tipo,
                senhaTemporaria: true,
                primeiroAcesso: true
            }
        })
        const transporter = nodemailer.createTransport({
        })
        await transporter .sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'NutriFlow, seja bem-vindo !',
            html:`
                <h2> Bem-Vindo ao NutriFlow !</h2>
                <p> Olá, ${nome} </p>
                <p> Seu Cadastro foi ralizado com sucesso. </p>
                <p> Email: ${email} </p>
                <p> Senha Temporária: ${senhaTemporaria} </p>
                <p> Altere a sua senha </p>

            `
        })
        return res.status(201).json({
            messagem: 'Usuario Cadastrado com sucesso',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.nome,
                tipo: usuario.tipo
            }
        })
    }catch(error){
        return res.status(500).json({erro: 'Erro Sistema Interno do servidor', detalhe: error.message})
    }
}
const listar = async (req, res) => {
    try{
        const usuarios = await prisma.usuario.findMany({
            select:{
                id: true,
                nome: true,
                email: true,
                tipo: true,
                createdAt: true
            }
        })
        return res.status(200).json(usuarios)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno do Servidor', detalhe: error.message})
    }
}
const buscarPorId = async (req, res) => {
    try{
        const{ id } = req.params
        const usuario = await prisma.usuario.findUnique({
            where: {id: parseInt(id)},
            select:{
                id: true,
                nome: true,
                email: true,
                tipo:true,
                createdAt: true
            }
        })
        if(!usuario){
            return res.status(404).json({erro: 'Usuario não encontrado'})
        }
        return res.status(200).json(usuario)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno no Servidor', detalhe: error.message})
    }
}

const editar = async (req, res) => {
    try{
        const { id } = req.params
        const {nome, email} = req.body
        const usuario = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {nome, email}  
        })
        return res.status(200).json({ mensagem: 'Usuario Atualizado', usuario})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}
const excluir = async (req, res) => {
    try{
        const { id } = req.params
        
        await prisma.usuario.delete({ where: { id: parseInt(id)} })

        return res.status(200).json({ mensagem: 'Usuario Excluido'})

    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}

module.exports = { cadastrar, listar, buscarPorId, editar, excluir }