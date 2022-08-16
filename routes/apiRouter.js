const express = require('express')
const jwt = require('jsonwebtoken')
const apiRouter = express.Router()
const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
    }
})
const bodyParser = require('body-parser')
const urlencodeParser = bodyParser.urlencoded({ extended: false })

apiRouter.get("/contato", function (req, res) { res.render("contato") })

//#region Validações
const checkToken = (req, res, next) => {
    console.log(req)
    let authHeader = req.get('Authorization')
    //let authHeader = req.body.token    
    if (!authHeader) {
        res.status(403).json({ message: 'Token requerida: ' + authHeader })
        res.end()
    }
    else {
        let token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.SECRET_KEY, (err, decodeToken) => {
            if (err) {
                res.status(401).json({ message: 'Token inválida' })
                res.end()
            }
            else {
                req.token = decodeToken
                req.userId = decodeToken.id
                next()
            }
        })
    }
}

const isAdmin = (req, res, next) => {
    knex
        .select('*').from('usuario').where({ id: req.userId })
        .then((usuarios) => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let roles = usuario.roles.split(';')
                let adminRole = roles.find(i => i === 'ADMIN')
                if (adminRole === 'ADMIN') {
                    next()
                    return
                }
                else {
                    res.status(403).json({ message: 'Role de ADMIN requerida' })
                    return
                }
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar roles de usuário - ' + err.message
            })
        })
}
//#endregion

//#region Produtos

//LOCALIZAR TODOS PRODUTOS OU POR ID
apiRouter.get('/produtos/:id?', function (req, res) {
    if (!req.params.id) {
        knex
            .select('*')
            .from('produto').orderBy('id')
            .then(function (produtos) {
                res.render('produtos/produtos', { produtos: produtos })
            }
            )
    }
    else {
        let id = Number.parseInt(req.params.id)
        if (id > -1) {
            knex
                .where({ id: id }).table("produto")
                .then(function (produtos) {
                    res.render('produtos/produtos', { produtos: produtos })
                }
                )
        }
        else {
            res.status(404).json({
                message: "Produto não encontrado"
            })
        }
    }
})

//INSERT PRODUTO

apiRouter.get("/novoProduto", function (req, res) { res.render("produtos/novoProduto") })

apiRouter.post('/produtos', urlencodeParser, express.json(), function (req, res) {
    knex('produto')
        .insert({
            descricao: req.body.descricao,
            valor: req.body.valor,
            marca: req.body.marca
        })
        .then(produtos => {
            let produto = produtos[0];
            res.redirect('/api/produtos');
        })
        .catch(err => res.status(500).json({ message: `Erro ao inserir produto: ${err.message}` }))
})

//UPDATE PRODUTO
apiRouter.get("/produtos/update/:id", function (req, res) {
    let id = Number.parseInt(req.params.id)

    if (id > -1) {
        knex
            .where({ id: id }).table("produto")
            .then(function (produtos) {
                res.render("produtos/editProduto", { produtos: produtos })
            }
            )
    }
})

apiRouter.post('/produtos/update/:id', urlencodeParser, express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);

    if (id > 0) {
        knex.where({ id: id }).update({
            descricao: req.body.descricao,
            valor: req.body.valor.replace(',', '.'),
            marca: req.body.marca
        }).table("produto")
            .then(produtos => {
                res.redirect('/api/produtos');
            }).catch(err => {
                console.log(err);
            })
    } else {
        res.status(404).json({
            message: "Produto não encontrado"
        })
    }
})

//DELETE PRODUTO
apiRouter.get('/produtos/deletar/:id', express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);
    if (id > 0) {
        knex.where({ id: id }).delete().table("produto").then(produtos => {
            res.redirect('/api/produtos');
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(404).json({
            message: "Produto não encontrado"
        })
    }
})

//#endregion

//#region Clientes

//LOCALIZAR TODOS CLIENTES OU POR ID
apiRouter.get('/clientes/:id?', function (req, res) {
    if (!req.params.id) {
        knex
            .select('*')
            .from('cliente').orderBy('id')
            .then(function (clientes) {
                res.render('clientes/clientes', { clientes: clientes })
            }
            )
    }
    else {
        let id = Number.parseInt(req.params.id)
        if (id > -1) {
            knex
                .where({ id: id }).table("cliente")
                .then(function (clientes) {
                    res.render('clientes/clientes', { clientes: clientes })
                }
                )
        }
        else {
            res.status(404).json({
                message: "Cliente não encontrado"
            })
        }
    }
})

//INSERT CLIENTE
apiRouter.get("/novoCliente", function (req, res) {
    res.render("clientes/novoCliente")
})

apiRouter.post('/clientes/novo', urlencodeParser, express.json(), function (req, res) {
    knex('cliente')
        .insert({
            nome: req.body.nome,
            documento: req.body.documento,
            profissao: req.body.profissao
        })
        .then(clientes => {
            let cliente = clientes[0];
            res.redirect('/api/clientes');
        })
        .catch(err => res.status(500).json({ message: `Erro ao inserir cliente: ${err.message}` }))
})

//UPDATE CLIENTE
apiRouter.get("/clientes/update/:id", function (req, res) {
    let id = Number.parseInt(req.params.id)

    if (id > -1) {
        knex
            .where({ id: id }).table("cliente")
            .then(function (clientes) {
                res.render("clientes/editCliente", { clientes: clientes })
            }
            )
    }
})

apiRouter.post('/clientes/update/:id', urlencodeParser, express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);

    if (id > 0) {
        knex.where({ id: id }).update({
            nome: req.body.nome,
            documento: req.body.documento,
            profissao: req.body.profissao
        }).table("cliente")
            .then(usuarios => {
                res.redirect('/api/clientes');
            }).catch(err => {
                console.log(err);
            })
    } else {
        res.status(404).json({
            message: "Usuário não encontrado"
        })
    }
})

//DELETE CLIENTE
apiRouter.get('/clientes/deletar/:id', express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);
    if (id > 0) {
        knex.where({ id: id }).delete().table("cliente").then(clientes => {
            res.redirect('/api/clientes');
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(404).json({
            message: "Cliente não encontrado"
        })
    }
})

//#endregion

//#region Usuarios

//LOCALIZAR TODOS USUARIOS
apiRouter.get('/usuarios', function (req, res) {
    knex
        .select('*')
        .from('usuario')
        .then(usuarios => res.json(usuarios))
})

//LOCALIZAR USUARIO POR ID
apiRouter.get('/usuarios/:id', express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id)
    if (id > -1) {
        knex
            .where({ id: id }).table("usuario")
            .then(usuarios => res.json(usuarios));
    }
    else {
        res.status(404).json({
            message: "Usuário não encontrado"
        })
    }
})

//INSERT USUARIO
apiRouter.post('/usuarios', express.json(), function (req, res) {

    knex('usuario')
        .insert({
            nome: req.body.nome,
            email: req.body.email,
            login: req.body.login,
            senha: req.body.senha,
            roles: req.body.roles
        }, ['id', 'nome', 'email', 'login', 'senha', 'roles'])
        .then(produtos => {
            let usuario = usuarios[0]
            res.json({ usuario })
        })
        .catch(err => res.status(500).json({ message: `Erro ao inserir usuario: ${err.message}` }))

    res.status(200).json({
        message: "Usuário cadastrado com sucesso",
    })
})

//UPDATE USUARIO
apiRouter.put('/usuarios/:id', express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);
    if (id > 0) {
        knex.where({ id: id }).update({
            nome: req.body.nome,
            email: req.body.email,
            login: req.body.login,
            senha: req.body.senha,
            roles: req.body.roles
        }).table("usuario").then(usuarios => {
            console.log(usuario);
        }).catch(err => {
            console.log(err);
        })

        res.status(200).json({
            message: 'Usuário ' + id + ' alterado com sucesso',
        })
    } else {
        res.status(404).json({
            message: "Usuário não encontrado"
        })
    }
})

//DELETE USUARIO
apiRouter.delete('/usuarios/:id', express.json(), function (req, res) {
    let id = Number.parseInt(req.params.id);
    if (id > 0) {
        knex.where({ id: id }).delete().table("usuario").then(usuario => {
            console.log(usuarios);
        }).catch(err => {
            console.log(err);
        })

        res.status(200).json({
            message: 'Usuário ' + id + ' excluído com sucesso'
        })

    } else {
        res.status(404).json({
            message: "Usuário não encontrado"
        })
    }
})

//#endregion

module.exports = apiRouter