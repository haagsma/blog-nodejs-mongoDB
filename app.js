//Carregando módulos
    const express = require('express');
    const app = express();
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    const path = require("path");
    const session  = require('express-session');
    const flash = require('connect-flash');
    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');
    require('./models/Categoria');
    const Categoria = mongoose.model('categorias');
    const passport = require('passport');
    require('./config/auth')(passport);
    const db = require('./config/db');

//Carregando Controllers
    const admin = require('./controllers/admin');
    const usuario = require('./controllers/usuario');

//Configurações

    //Sessão
        app.use(session({
            secret: 'd3uj289jud322u9e2',
            resave: true,
            saveUninitialized: true
        }));

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
            next();
        });

    //Body Parser

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    //Handlebars

        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI, { useNewUrlParser: true }).then(()=>{console.log('db:success')}).catch((err)=>{console.log("db:failed")});
        // Em breve
    //Assets
    app.use(express.static(path.join(__dirname, 'assets')));

// Rotas
    app.get('/', (req,res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((post)=>{
            res.render('index', {post:post});
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno");
            res.redirect('/404');
        });
    });
    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).then((post)=>{
            if(post){
                res.render('postagem/index', {post:post})
            }else{
                req.flash('error_msg', 'Esta postagem não existe!');
                res.redirect('/');
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!');
            res.redirect('/');
        });
    });
    app.get('/categorias', (req, res)=>{
        Categoria.find().then((cats)=>{
            res.render('categorias/index', {cats:cats})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!');
            res.redirect('/');
        });
    });
    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug:req.params.slug}).then((cat)=>{
            if(cat){
                Postagem.find({categoria: cat._id}).populate('categoria').then((post)=>{
                    res.render('categorias/postagens', {post:post});
                }).catch((err)=>{
                    req.flash('error_msg', 'Erro ao carregar postagens da categoria!');
                    res.redirect('/');
                })
            }else{
                req.flash('error_msg', 'Essa categoria não existe');
                res.redirect('/');
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!');
            res.redirect('/');
        });
    });
    app.get('/404', (req, res)=>{
        res.send('Erro 404!');
    });

    app.use('/admin', admin);
    app.use('/usuarios', usuario);

//Outros
//production -
//local development - const PORT = 8081;
const PORT =  process.env.PORT || 8081;
app.listen(PORT, ()=>{
   console.log('serv:success');
});