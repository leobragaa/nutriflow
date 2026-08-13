const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const nodemailer  = require('nodemailer')

const prisma = new PrismaClient()

// Configuração de envio de email com nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
}

const initialEmail = (nome, email, senhaTemporaria) => {
    return `
        <div> 
            <div>
                <h1> Nutriflow </h1>
                <p> Nutrição - Perfomance - Equilíbrio </p>
            </div>
            <div>
                <h2> Seja Bem-Vindo, ${nome}!</h2>

                <p> 
                    Seu cadastro foi realizado com sucesso no <strong> NutriFlow </strong>.
                    Aqui está sua senha temporaria de acesso ao sistema.
                </p>

                <div>
                    <p> 
                        Senha Temporária:
                        <span> ${senhaTemporaria} </span>
                    </p>
                </div>

                <div>
                    <p>
                        <strong> Importante: </strong>
                        Esta é uma Senha Temporária.
                        Será solicitada a troca senha, assim que realizar o primeiro acesso.
                    </p>
                </div>

                <div>
                    <p>
                        Em caso de dúvidas, entre em contato com o Nutricionista.
                    </p>
                </div>

                <div>
                    <p>
                        © NutriFlow
                    </p>
                </div>
            </div>
        </div>
    `
}

const cadastrar = async(req, res) =>{
    try{
        const {nome, email, tipo} = req.body

        if(!nome || !email || !tipo){
            return res.status(400).json({erro: 'Nome, e-mail e tipo são obrigatórios'})
        }

        const usuarioExistente = await prisma.usuario.findUnique({ where: {email} })
        if(usuarioExistente){
            return res.status(400).json({erro: 'E-mail já Cadastrado'})
        }

        const tipoValido = ['nutricionista', 'paciente']
        
        if(!tipoValido.includes(tipo)){
            return res.status(400).json({erro: 'Tipo Inválido. Use: Nutricionista, paciente'})
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
        try{
            const transporter = createTransporter();

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'NutriFlow, seja bem-vindo !',
                html: initialEmail(nome, email, senhaTemporaria)
            })
        }catch(error){
            console.error('Erro ao enviar email', error)
        }

        return res.status(201).json({
            messagem: 'Usuario Cadastrado com sucesso',
            senhaTemporaria,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
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

        if(!nome && !email){
            return res.status(400).json({erro: 'Informe ao menos nome ou e-mail para a atualização'})
        }
        const usuario = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {nome, email},
            select: {
                id: true,
                nome: true,
                email: true,
                tipo: true
            }
        })
        return res.status(200).json({ mensagem: 'Usuario Atualizado', usuario})
    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}

const excluir = async (req, res) => {
    try{
        const { id } = req.params
        
        const usuario = await prisma.usuario.findUnique({ where: {id: parseInt(id)}})

        if(!usuario){
            return res.status(404).json({erro: 'Usuário não encontrado'})
        }
        
        await prisma.usuario.delete({ where: { id: parseInt(id)} })

        return res.status(200).json({ mensagem: 'Usuario Excluido'})

    }catch(error){
        return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message})
    }
}

module.exports = { cadastrar, listar, buscarPorId, editar, excluir }