const { PrismaClient } = require('@prisma/client')
const nodemailer  = require('nodemailer')

const prisma = new PrismaClient()

const cadastrar = async(req, res) =>{
    try{
        const {peso, altura, dataNasc, objetivo, alergias, patologias, usuarioId} = req.body

        const nutricionista = await prisma.nutricionista.findUnique({
            where: {
                usuarioId: req.usuario.id
            }
        })

        if (!nutricionista) {
            return res.status(404).json({ erro: 'Nutricionista logado não encontrado no sistema.' })
        }
        const paciente = await prisma.paciente.create({
            data:{
                peso,
                altura,
                dataNasc: new Date(dataNasc),
                objetivo,
                alergias,
                patologias,
                usuarioId,
                nutricionistaId: nutricionista.id
            } 
        })

        return res.status(201).json({
            messagem: 'Paciente Cadastrado com Sucesso',
            paciente
        })

    }catch(error){
        return res.status(500).json({erro: 'Erro Sistema Interno do servidor', detalhe: error.message})
    }
}
const listar = async (req, res) => {
    try{
        const nutricionista = await prisma.nutricionista.findUnique({
            where: {
                usuarioId: req.usuario.id
            }
        })
        console.log("usuario encontrado:", usuario)

        console.log("nutricionista encontrado:", nutricionista)
        const paciente = await prisma.paciente.findMany({
            where: {nutricionistaId: nutricionista.id},
            include:{
                usuario:{
                    select: {nome: true, email: true}
                }
            }
        })


        return res.status(200).json(paciente)
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
        return res.status(200).json({ messagem: 'Paciente Atualizado', paciente})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}
const excluir = async (req, res) => {
    try{
        const { id } = req.params
        
        await prisma.paciente.delete({ where: { id: parseInt(id)} })

        return res.status(200).json({ messagem: 'Paciente Excluido'})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}

module.exports = { cadastrar, listar, buscarPorId, editar, excluir }