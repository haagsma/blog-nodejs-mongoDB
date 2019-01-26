module.exports = {
    eAdmin: (req, res, next)=>{
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }else{
            req.flash("error_msg", 'Você não tem autorização para entrar nesse link');
            res.redirect('/')
        }
    }
};