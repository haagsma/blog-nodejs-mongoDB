const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');


router.get('/registro', (req, res)=>{
    res.render('usuarios/registro');
});
router.post('/registro', (req, res)=>{
    let dados = req.body;
    Usuario.findOne({email: dados.email}).then((usuario)=>{
        if(usuario){
            req.flash('error_msg', 'Já existe uma conta com esse email');
            res.redirect('/usuarios/registro');
        }else{

            const novoUsuario = new Usuario({
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha
            });

            bcrypt.genSalt(10, (erro, salt)=>{
               bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                   if(erro){
                       req.flash('error_msg', 'Houve um erro ao salvar usuário');
                       res.redirect('/usuarios/registro');
                   }else{
                       novoUsuario.senha = hash;
                       novoUsuario.save().then(()=>{
                           req.flash('success_msg', 'Usuário cadastrado com sucesso');
                           res.redirect('/');
                       }).catch((err)=>{
                           req.flash('error_msg', 'Houve um erro ao salvar usuário');
                           res.redirect('/usuarios/registro');
                       })
                   }
               })
            });

        }
    }).catch((err)=>{
        req.flash("error_msg", 'Houve um erro interno!: '+err);
        res.redirect('/');
    });
});

router.get('/login', (req, res)=>{
    res.render('usuarios/login');
});
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});
router.get('/sair', (req, res)=>{
   req.logout();
   res.redirect('/');
});

module.exports = router;