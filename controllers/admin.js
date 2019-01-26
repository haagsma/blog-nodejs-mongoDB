const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {eAdmin} = require('../helpers/eAdmin');

//Carregando Model
require('../models/Categoria');
const Categoria = mongoose.model('categorias');

require('../models/Postagem');
const Postagem = mongoose.model('postagens');





//Rotas

router.get('/', eAdmin, (req, res)=>{
    res.render("admin/index");
});

    // Rotas Categorias

        router.get('/categorias', (req, res)=>{
           Categoria.find().sort({date: 'desc'}).then((cats)=>{
                res.render('admin/categorias', {cats: cats});
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro ao listar as categorias");
                res.render("/admin");
            })
        });
        router.get('/categorias/add', (req, res)=>{
            res.render('admin/addcategorias')
        });
        router.post('/categorias/nova', (req, res)=>{

            let erros = [];

            if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({text: 'Nome inválido'});
            }
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({text: 'Slug inválido'});
            }

            if(erros.length > 0 ){
                res.render("admin/addcategorias", {
                    erros: erros
                })
            }else {
                let novaCategoria = req.body;
                new Categoria(novaCategoria).save().then((suc)=>{
                    req.flash("success_msg", "Categoria criada com sucesso!");
                    res.redirect("/admin/categorias")
                }).catch((err)=>{
                    req.flash("error_msg", "Houve um erro ao salvar a categoria!");
                    res.redirect("/admin")
                });
            }

        });
        router.get('/categorias/edit/:id', (req, res) => {
            Categoria.findOne({_id: req.params.id}).then((cat)=>{
                res.render('admin/editcategorias', {cat: cat});
            }).catch((err)=>{
                req.flash("error_msg", "Categoria não existe");
                res.redirect('/admin/categorias');
            })

        });
        router.post('/categorias/edit', (req, res) => {
           Categoria.findOne({_id: req.body.id}).then((cat)=>{
               cat.nome = req.body.nome;
               cat.slug = req.body.slug;
               cat.save().then(()=>{
                   req.flash("success_msg", "Categoria editada com sucesso!");
                   res.redirect("/admin/categorias")
               }).catch((err)=>{
                   req.flash("error_msg", "Erro em editar a Categoria");
                   res.redirect('/admin/categorias');
               })
           }).catch((err)=>{
               req.flash("error_msg", "Erro em editar a Categoria");
               res.redirect('/admin/categorias');
           })
        });

        router.get('/categorias/delete/:id', (req, res) => {
            Categoria.remove({_id: req.params.id}).then(()=>{
                req.flash("success_msg", "Categoria deletada com sucesso!");
                res.redirect("/admin/categorias")
            }).catch((err)=>{
                req.flash("error_msg", "Erro em deletar a Categoria");
                res.redirect('/admin/categorias');
            })
        });

    // Rotas Postagens

    router.get('/postagens', (req, res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((posts)=>{
            res.render('admin/postagens', {
                posts:posts
            });
        }).catch((err)=>{
            req.flash("error_msg", "Erro em listar as postagens");
            res.redirect('/admin');
        });
    });
    router.get('/postagens/add', (req, res)=>{
        Categoria.find().then((cats)=>{
            res.render('admin/addpostagens', {cats: cats});
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar as categorias: "+err);
            res.redirect('/admin/categorias');
        });

    });
    router.post('/postagens/nova', (req, res)=>{
        new Postagem(req.body).save().then((suc)=>{
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a postagem!: "+err);
            res.redirect("/admin/postagens")
        });
    });
    router.get('/postagens/edit/:id', (req, res)=>{
        Postagem.findOne({_id: req.params.id}).populate('categoria').then((post)=>{
            Categoria.find().then((cats)=>{
                res.render('admin/editpostagens', {
                    cats: cats,
                    post: post
                });
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro ao salvar a postagem!");
                res.redirect("/admin/postagens")
            });

        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a postagem!");
            res.redirect("/admin/postagens")
        });
    });
    router.post('/postagens/edit', (req, res)=>{
        Postagem.findOne({_id: req.body.id}).then((post)=>{
            post.titulo = req.body.titulo;
            post.slug = req.body.slug;
            post.descricao = req.body.descricao;
            post.conteudo = req.body.conteudo;
            post.categoria = req.body.categoria;
            post.save().then(()=>{
                req.flash("success_msg", "Postagem editada com sucesso!");
                res.redirect("/admin/postagens")
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro ao salvar a postagem!");
                res.redirect("/admin/postagens")
            });
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a postagem!");
            res.redirect("/admin/postagens")
        });
    });
    router.get('/postagens/delete/:id', (req, res)=>{
        Postagem.remove({_id: req.params.id}).then(()=>{
            req.flash("success_msg", "Postagem deletada com sucesso!");
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao deletar a postagem!");
            res.redirect("/admin/postagens")
        })
    });



module.exports = router;