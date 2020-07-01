// ESTUDIANTES:
// BENITEZ, ARACELI
// JURADO, MATÍAS
// VILLANUEVA, ANDREA

var express = require('express');
var app = express();
var session = require('express-session');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');


app.use(session({secret: 'clave'}));

app.engine('hbs', hbs());
app.set('view engine', 'hbs');

app.use(express.urlencoded());
app.use(express.json());

var url = 'mongodb://localhost:27017/novedades';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

var esquemaUsuarios = mongoose.Schema({
    usuario: String,
    email: String,
    password: String
});

var esquemaNovedades = mongoose.Schema({
    creador: String,
    novedad: String
});

var Usuario = mongoose.model('Usuario', esquemaUsuarios);
var Novedad = mongoose.model('Novedad', esquemaNovedades);

app.get('/', function(req, res) {
    res.render('registracion');
});

app.get('/crear', function(req, res) {
    req.session.contador = 0;
    res.json(req.session.contador);
});

app.get('/incrementar', function(req, res) {
    req.session.contador++;
    res.json(req.session.contador);
});

app.get('/formulario_registracion', function(req, res) {
    res.render('registracion');
});

app.post('/registracion', async function(req, res) {
    var usr = new Usuario();
    usr.usuario = req.body.usuario;
    usr.email = req.body.email;
    usr.password = req.body.password;
    await usr.save();
    res.redirect('/formulario_login');
});

app.post('/api/registracion', async function(req, res) {
    var usr = new Usuario();
    usr.usuario = req.body.usuario;
    usr.email = req.body.email;
    usr.password = req.body.password;
    await usr.save();
    res.json(usr);
});

app.get('/formulario_login', function(req, res) {
    res.render('login');
});

app.post('/login', async function(req, res) {
    var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
    if (usr) {
        req.session.usuario_id = usr._id;
        res.redirect('/todas_novedades');
    } else {
        res.render('login', {mensaje_error: 'Usuario/password incorrecto', usuario: req.body.usuario});
    }
})

app.post('/api/login', async function (req, res) {
    var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
    if (usr) {
        req.session.usuario_id = usr._id;
        res.json(usr);
    } else {
        res.status(404).send();
    }
});

app.get('/alta_novedad', function(req, res) {
    if (!req.session.usuario_id) {
        res.redirect('/formulario_login');
        return;
    }
    res.render('formulario_novedad');
});

app.post('/crear_novedad', async function(req, res) {
    var novedad = new Novedad();
    novedad.creador = req.body.creador;
    novedad.novedad = req.body.novedad;
    await novedad.save();
    res.redirect('/todas_novedades');
});

app.post('/api/crear_novedad', async function(req, res) {
    var novedad = new Novedad();
    novedad.creador = req.body.creador;
    novedad.novedad = req.body.novedad;
    await novedad.save();
    res.json(novedad);
});

app.get('/todas_novedades',async function(req, res) {
    if (!req.session.usuario_id) {
        res.redirect('/formulario_login');
        return;
    }
      var listado = await Novedad.find({}).sort({_id: -1});
    
    res.render('novedades', {listado});
});

app.post('/api/todas_novedades', async function(req, res) {
    var listado = await Novedad.find();
    res.json(listado);
});

app.listen(3000, function() {
    console.log('Corriendo en el puerto 3000');
});