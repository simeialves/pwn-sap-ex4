const express = require('express')
const userRouter = express.Router()
const passport = require('passport')
//const passport = require('passport-local')

userRouter.get("/login", (req, res) => {
    res.render("usuarios/login")
})

userRouter.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: ("/"),
        failureRedirect: ("/user/login"),
        failureFlash: true
    })(req, res, next)
})

module.exports = userRouter