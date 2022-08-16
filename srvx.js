//require('dotenv').config

const port = process.env.PORT || 3000;

const { json } = require('express');
// Importa o módulo do Express Framework
const express = require('express')

// Inicializa um objeto de aplicação Express
const app = express()
const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
    }
})

// Cria um manipulador da rota padrão 
app.use('/', express.static('public_html'))

// Inicializa o servidor HTTP na porta 3000
app.listen(port, function () {
    console.log('Servidor rodando na porta 3000')
})

//realiza log da requisição
app.get('*', function (req, res, next) {
    console.log(new Date().toLocaleString(), req.method, req.url, req.path, req.body);
    next();
})

//Processa 
app.use(express.json())

// const lista_produtos = {
//     produtos: [
//         { id: 1, descricao: "Arroz parboilizado 500Kg", valor: 25.00, marca: "Tio João" },
//         { id: 2, descricao: "Maionese 250gr", valor: 7.20, marca: "Helmans" },
//         { id: 3, descricao: "Iogurte Natural 200ml", valor: 2.50, marca: "Itambé" },
//         { id: 4, descricao: "Batata Maior Palha 300gr", valor: 15.20, marca: "Chipps" },
//         { id: 5, descricao: "Nescau 400gr", valor: 8.00, marca: "Nestlé" },
//     ]
// }

//LOCALIZAR TODOS PRODUTOS
app.get('/produtos', function (req, res) {
    knex
        .select('*')
        .from('produto')
        .then(produtos => res.json(produtos))

    //res.json(lista_produtos.produtos)
})


//LOCALIZAR PRODUTO POR ID
app.get('/produtos/:id', function (req, res) {
    let id = Number.parseInt(req.params.id)
    let idx = lista_produtos.produtos.findIndex(s => s.id == id)
    if (idx > -1) {
        res.json(lista_produtos.produtos[idx])
    }
    else {
        res.status(404).json({
            message: "Produto não encontrado"
        })
    }
})

//DELETE
app.delete('/produtos/:id', function (req, res) {
    let id = Number.parseInt(req.params.id);
    let idx = lista_produtos.produtos.findIndex(s => s.id == id)
    if (idx > -1) {
        lista_produtos.produtos.splice(idx, 1);
        res.status(200).json({
            message: 'Produto ' + id + 'excluído com sucesso',
        })
    } else {
        res.status(404).json({
            message: "Produto não encontrado"
        })
    }
})

//INSERT
app.post('/produtos', function (req, res) {
    lista_produtos.produtos.push(req.body);
    res.status(200).json({
        message: "Produto cadastrado com sucesso",
    })
})


//UPDATE
app.put('/produtos/:id', function (req, res) {
    let id = Number.parseInt(req.params.id);
    let idx = lista_produtos.produtos.findIndex(s => s.id == id)
    if (idx > -1) {
        lista_produtos.produtos[idx] = req.body;
        res.status(200).json({
            message: 'Produto ' + id + ' alterado com sucesso',
        })
    } else {
        res.status(404).json({
            message: "Produto não encontrado"
        })
    }
})

const checkToken = (req, res, next) => {
    let authHeader = req.get('Authorization')
    if (!authHeader) {
        res.status(403).json({ message: 'Token requerida' })
        res.end();
    }
    else {
        let token = authHeader.split(' ')[1]
        req.role = token
        next()
    }
}

const isAdmin = (req, res, next) => {
    if (req.role && req.role == 'admin') {
        next()
    }
    else {
        res.status(401).json({ message: 'Acesso não autorizado' })
        res.end();
    }
}

app.post('/produtos', checkToken, isAdmin, function (req, res) {
    knex('produto')
        .insert({
            descricao: req.body.descricao
        })
})

// app.post('/login', express.json(), (req, res) => {
//     let user = req.body.login
//     let pass = req.body.senha

//     knex
//         .select('*')
//         .from('usuario')
//         .where({ login: user })
//         .then((usuarios)=> {
//             if(usuarios.length){
//                 let usuario = usuarios[0]
//                 let checkSenha = bcrypt.compareSync(pass, usuario.senha)
//                 if(checkSenha){
//                     let token jwt.sing({id: usuario.id}, 
//                                         process.env.SECRET_KEY, 
//                                         {expiresIn: 30})
                    
//                     res.status(200).json({
//                         id: usuario.id,
//                         token: token
//                     })
//                     res.end()
//                 }
//                 else{
//                     res.status(200).json({message: "Usuário ou senha incorretos"})
//                     res.end()
//                 }
//             }
//             else{
//                 res.status(200).json({message: "Usuário ou senha incorretos"})
//                 res.end()
//             }
//         })
//         .catch(err => res.status(500).json({message: `Erro ao verficar login: ${err.message}`}))

//     let checkUser = (user == "simei") && (pass == "1234")

//     if (checkUser) {
//         res.status(200).json({ token = "admin" })
//         res.end()
//     }
//     else {
//         res.status(401).json({ message: "Usuário ou senha incorretos." })
//         res.end()
//     }
// })

app.post('/register', express.json(), (req, res) => {
    res.status(200).json()
})