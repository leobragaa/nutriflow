const express = require('express')
const cors = require('cors')
const {Server} = require('socket.io')
const http = require('http')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const authRoutes = require('./routes/Rotas')
const usuarioRoutes = require('./routes/UsuarioRoutes')
const pacienteRoutes = require('./routes/PacienteRoute')
const nutricionistaRoutes = require('./routes/NutricionistaRoute')

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/pacientes', pacienteRoutes)
app.use('/api/nutricionistas', nutricionistaRoutes)

app.get('/', (req, res) => {
    res.json({mensagem: 'NutriFlow Funcionando!'})
})

io.on('connection', (socket) =>{
    console.log('Usuario Conectado: ',socket.io)
    socket.io('enviarMensagem', (dados) =>{
        io.emit('receberMensagem', dados)
    })
    socket.on('disconnect', () => {
        console.log('Usuario desconectado: ', socket.id)
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`)
})