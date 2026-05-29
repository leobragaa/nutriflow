const { PrismaClient } = require('@prisma/client')
const nodemailer  = require('nodemailer')

const prisma = new PrismaClient()

const cadastrar = async(req, res) =>{
    try{
        const {peso, altura, dataNasc, objetivo, alergias, patologias, usuarioId} = req.body

        const nutricionistaId = req.usuario.id

        const paciente = await prisma.paciente.create({
            data:{
                peso,
                altura,
                dataNasc: new Date(dataNasc),
                objetivo,
                alergias,
                patologias,
                usuarioId,
                nutricionistaId
            } 
        })

        if(paciente){
            return res.status(400).json({erro: 'Paciente Cadastrado'})
        }

    }catch(error){
        return res.status(500).json({erro: 'Erro Sistema Interno do servidor', detalhe: error.message})
    }
}
const listar = async (req, res) => {
    try{
        const nutricionistaId = req.usuario.id

        const paciente = await prisma.paciente.findMany({
            where: {nutricionistaId},
            include:{
                usuario:{
                    select: {nome: true, email: true}
                }
            }
        })

        return res.status(200).json(pacientes)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno do Servidor', detalhe: error.message})
    }
}
const buscarPorId = async (req, res) => {
    try{
        const{ id } = req.params
        const paciente = await prisma.paciente.findUnique({
            where: {id: parseInt(id)},
            include:{
                usuario:{
                    select: {nome: true, email: true}
                }
            }
        })
        if(!paciente){
            return res.status(404).json({erro: 'Paciente não encontrado'})
        }
        return res.status(200).json(paciente)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno no Servidor', detalhe: error.message})
    }
}

const editar = async (req, res) => {
    try{
        const { id } = req.params
        const {peso, altura, dataNasc, objetivo, alergias, patologias} = req.body

        const paciente = await prisma.paciente.update({
            where: { id: parseInt(id) },
            data: {peso, altura, dataNasc, objetivo, alergias, patologias}  
        })
        return res.status(200).json({ mensagem: 'Paciente Atualizado', paciente})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}
const excluir = async (req, res) => {
    try{
        const { id } = req.params
        
        await prisma.paciente.delete({ where: { id: parseInt(id)} })

        return res.status(200).json({ mensagem: 'Paciente Excluido'})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.mensage})
    }
}

module.exports = { cadastrar, listar, buscarPorId, editar, excluir }