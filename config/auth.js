const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
    }
})

const users = [{
    _id: 1,
    username: 'admin',
    password: '$2a$06$HT.EmXYUUhNo3UQMl9APmeC0SwoGsx7FtMoAWdzGicZJ4wR1J8alW',
    email: 'contato@gmail.com'
}]

module.exports = function (passport) {
    
    function findUser(username){
        return users.find(item=> item.username === username)
    }

    function findUserById(id){
        // return 
        //     knex.select('*')
        //     .from('usuario')
        //     .where('id', id).then((usuario)=>{

        //     })

        return users.find(item=> item._id === id)
    }
    
        
    // passport.use(new localStrategy({ usernameField: "email", passwordField: "senha" }, (email, senha, done) => {        
    //     knex.select('*')
    //     .from('usuario').where('email', email).then((usuario) => {
    //     // knex
    //     //     .where({ email: email }).table("usuario")
    //     //     .then((usuario) => {
    //             if (!usuario) {
    //                 console.log("USUARIO NÂO BATEU")
    //                 return done(null, false, { message: "Usuário ou senha incorreta" })
    //             } else {
    //                 bcrypt.compare(senha, usuario.senha, (erro, batem) => {
    //                     if (batem) {
    //                         console.log("USUARIO BATEU")
    //                         return done(null, usuario)
    //                     } else {
    //                         return done(null, false, { message: "Usuário ou senha incorreta" })
    //                     }
    //                 })
    //             }
    //         });
    // }))

    // passport.serializeUser((usuario, done) => {
    //     done(null, usuario.id)
    // })

    // passport.deserializeUser((id, done) => {
    //     knex
    //     .where({ id: id }).table("usuario")
    //     .then((usuario) => {
    //         done(err, usuario)
    //     }).catch((err) => {
    //         console.log("Erro des: " + err)
    //     })
    // })


    passport.serializeUser((user, done)=>{
        done(null, user._id)
    })

    passport.deserializeUser((id, done)=>{
        try{
            const user = findUserById(id)
            done (null, user)
        }
        catch(err){
            console.log(err)
            return done(err, null)
        }
    })

    passport.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done)=>{
        try{
            const user = findUser(username);
            if (!user) return done(null, false)

            const isValid = bcrypt.compareSync(password, user.password)

            if(!isValid) return done(null, false)
            return done(null, user)
        }
        catch(err){
            console.log(err)
            return done(err, false)
        }
    }))
}