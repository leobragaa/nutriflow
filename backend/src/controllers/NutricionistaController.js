const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const cadastrar = async(req, res) =>{
    try{
        const {cro, especialidade, usuarioId} = req.body

        const nutricionista = await prisma.nutricionista.findUnique({ 
            data: {
                cro,
                especialidade,
                usuarioId
            } 
        })

        return res.status(201).json({
            mensagem: 'Nutricionista Cadastrado com sucesso', nutricionista
        })

        return res.status(201).json({
            messagem: 'Nutricionista cadastrado',
            nutricionista
        })
    }catch(error){
        return res.status(500).json({erro: 'Erro Sistema Interno do servidor', detalhe: error.message})
    }
}

const listar = async (req, res) => {
    try{
        const nutricionista = await prisma.nutricionista.findMany({
            include:{
                usuario:{
                    select: {nome: true, email: true}
                }
            }
        })
        return res.status(200).json(nutricionista)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno do Servidor', detalhe: error.message})
    }
}

const buscarPorId = async (req, res) => {
    try{
        const{ id } = req.params
        const nutricionista = await prisma.usuario.findUnique({
            where: {id: parseInt(id)},
            include: {
                usuario:{
                    select: {nome: true, email: true}
                },
                pacientes: {
                    include: {
                        usuario: {
                            select: {nome: true, email: true}
                        }
                    }
                }
            }
        })
        if(!nutricionista){
            return res.status(404).json({erro: 'Nutricionista não encontrado'})
        }
        return res.status(200).json(nutricionista)
    }catch(error){
        return res.status(500).json({erro: 'Erro Interno no Servidor', detalhe: error.message})
    }
}

const editar = async (req, res) => {
    try{
        const { id } = req.params
        const {cro, especialidade} = req.body
        const nutricionista = await prisma.nutricionista.update({
            where: { id: parseInt(id) },
            data: {cro, especialidade}  
        })
        return res.status(200).json({ mensagem: 'Nutricionista Atualizado', nutricionista})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}

const excluir = async (req, res) => {
    try{
        const { id } = req.params
        
        await prisma.nutricionista.delete({ where: { id: parseInt(id)} })

        return res.status(200).json({ mensagem: 'Nutricionista Excluido'})

    }catch(error){
        return res.status(500).json({ error: 'Erro interno do servidor', detalhe: error.message})
    }
}

module.exports = { cadastrar, listar, buscarPorId, editar, excluir }