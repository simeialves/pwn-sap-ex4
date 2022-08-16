// Importa o módulo do Express Framework
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const apiRouter = require('./routes/apiRouter')
const secRouter = require('./routes/secRouter')
const clientRouter = require('./routes/clientRouter')
const userRouter = require('./routes/userRouter')
const handlebars = require('express-handlebars')
const session = require("express-session")
const flash = require("connect-flash")
const passport = require('passport')
const { Cookie } = require('express-session')
require("./config/auth")(passport)

// Inicializa um objeto de aplicação Express
const app = express()

//Configurações

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 1000 }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})
//Realiza log da requisição
app.use(morgan('common'))
app.use('/api', apiRouter)
app.use('/sec', secRouter)
app.use('/user', userRouter)

app.engine("handlebars", handlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
app.use('/images', express.static('images'))
app.use('/contato/index', express.static('contato'))

app.get("/", function (req, res) {
    res.render('index');
})

// app.get("/inserir", function(req, res){res.render("inserir")})
// app.get("/select", function(req, res){res.render("select")})
// app.get("/delete/:id", function(req, res){
//     res.render("select")
// })

// Inicializa o servidor HTTP na porta 3000
let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Servidor rodando na porta ${port}`)
})
