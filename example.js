// On charge le framework Express...
var express = require('express');
// ...et le moteur de templating Twig
var twig = require("twig");

// On crée l'application web
var app = express();

// On configure le dossier contenant les templates
// et les options de Twig
app
    .set('views', 'templates')
    .set('twig options', { autoescape: true });

// On définit une route pour l'url /
app.get('/', function(req, res) {
    res.send('Hello world!');
});

// Maintenant on démontre l'utilisation des templates Twig
// On définit une route qui répond à tout url de la forme /blabla
// en répondant Hello blabla
app.get('/:n', function(req, res) {
    res.render('example.twig', { 'nom' : req.params.n })
});

// On lance l'application
// (process.env.PORT est un paramètre fourni par Cloud9)
app.listen(process.env.PORT);
