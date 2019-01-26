if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb://haagsma:haagsma123@ds113845.mlab.com:13845/blogapp"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}