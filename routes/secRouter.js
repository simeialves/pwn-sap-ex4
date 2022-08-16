const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { json } = require('body-parser')
const secRouter = express.Router()

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

secRouter.get("/login", (req, res) => {
    res.render("usuarios/login")
})


secRouter.post('/login', urlencodeParser, express.json(), (req, res) => {
    let email = req.body.email
    let pass = req.body.senha

    knex
        .select('*')
        .from('usuario')
        .where({ email: email })
        .then((usuarios) => {
            if (usuarios.length) {

                let usuario = usuarios[0]
                let checkSenha = bcrypt.compareSync(pass, usuario.senha)

                if (checkSenha) {
                    let token = jwt.sign({ id: usuario.id }, process.env.SECRET_KEY, { expiresIn: 600 })
                    
                    req.flash("success_msg", "Bem vindo, " + usuario.nome)
                    res.redirect("/api/produtos", { auth: true, token: token })

                    res.end()
                    //return res.json({ auth: true, token: token });
                }
                else {
                    req.flash("error_msg", "Usuário ou senha incorretos!")
                    res.redirect("/user/login")
                }
            }
            else {
                req.flash("error_msg", "Usuário ou senha incorretos!")
                res.redirect("/user/login")
            }
        }).catch(err => {
            req.flash("error_msg", `Erro ao verificar login: ${err.message}`)
            res.redirect("/user/login")
        }
        )
})


secRouter.post('/logout', function(req, res) {
    res.json({ auth: false, token: null });
})

secRouter.get('/register', express.json(), (req, res) => {
    res.render("usuarios/novoUsuario")
})

secRouter.post('/register', urlencodeParser, express.json(), function (req, res) {
    console.log(req.body)
    knex.select('*')
        .from('usuario').where('email', req.body.email).then((usuario) => {
            if (usuario.length > 0) {
                req.flash("error_msg", "Já existe uma conta com esse e-mail em nosso sistema")
                res.redirect("/sec/register")
            } else {
                const novoUsuario = {
                    nome: req.body.nome,
                    login: req.body.login,
                    email: req.body.email,
                    senha: req.body.senha
                }

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            console.log("Houve um erro ao salvar o usuário" + err)
                            res.redirect("/")
                        }
                        else {
                            novoUsuario.senha = hash
                            knex.insert(novoUsuario).into('usuario').then(data => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!")
                                res.redirect("/user/login")
                            }).catch(err => {
                                console.log("Erro ao cadastrar o usuário: " + err)
                                res.redirect("/user/login")
                            })
                        }
                    })
                })

            }
        }).catch(err => {
            console.log(err)
        })
})

module.exports = secRouter