const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const cfnService = require("../services/CfnService");

async function verificarCRN(req, res) {
    try{
        const{nome, registro, crn} = req.body;

        if(!nome || !registro || !crn){
            return res.status(400).json({
                erro: "Nome, registro e crn são obrigatorios"
            });
        }

        const resultado = await cfnService.vereficarCRN(nome);

        if(resultado.data || resultado.data.length === 0){
            return res.status(404).json({
                valido: false,
                mensagem:"Nutricionista não encontrado."
            });
        }

        const nutricionista = resultado.data.find(item => 
            item.registro == registro &&
            item.crn == crn &&
            item.situacao == "ATIVO"
        );

        if(!nutricionista){
            return res.status(400).json({
                valido: false,
                mensagem: "CRN inválido ou inativo."
            });
        }

        return res.json({
            valido: true,
            nutricionista
        });

    }catch(erro){
        console.log(erro);

        return res.status(500).json({
            erro: "Erro ao consultar CFN."
        });
    }
}
const cadastrar = async(req, res) =>{
    try{

        const {crn, especialidade, usuarioId} = req.body

        const nutricionista = await prisma.nutricionista.create({ 
            data: {
                crn,
                especialidade,
                usuarioId
            } 
        })

        return res.status(201).json({
            message: 'Nutricionista Cadastrado com sucesso', nutricionista
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
        const nutricionista = await prisma.nutricionista.findUnique({
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
        const {crn, especialidade} = req.body
        const nutricionista = await prisma.nutricionista.update({
            where: { id: parseInt(id) },
            data: {crn, especialidade}  
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

module.exports = { verificarCRN, cadastrar, listar, buscarPorId, editar, excluir }