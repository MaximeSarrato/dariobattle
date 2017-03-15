var mysql = require('mysql');
var db    = mysql.createConnection({
  host     : process.env.IP,  // pas touche à ça : spécifique pour C9 !
  user     : process.env.C9_USER.substr(0,16),  // laissez comme ça
  password : '',
  database : 'c9'  // mettez ici le nom de la base de données
});

var session = require('express-session');

// On charge le framework Express...
var express = require('express');
// ...et le moteur de templating Twig
var twig = require("twig");

var bodyParser = require('body-parser');

// On crée l'application web
var app = express();

// On configure le dossier contenant les templates
// et les options de Twig
app
    .set('views', 'templates')
    .set('twig options', { autoescape: true })
    .use(bodyParser.urlencoded({ extended: false }))
    .use(session({secret: '12345', resave: false, saveUninitialized: false}));


app.all('/', function (req, res) {
    if(req.method == "GET")
        res.render('connexion.twig');
    else if(req.method == "POST") {
        db.query('SELECT * FROM users WHERE login = ? AND pass = ?', [ req.body.login, req.body.password ], 
        function(err, rows) {
        if(!err) {
            if(rows != "") {
                req.session.login = rows[0].login;
                req.session.couleurPref = rows[0].couleur1;
                req.session.parties = rows[0].parties;
                req.session.gagnees = rows[0].gagnees;
                res.redirect('/userlist');
            }
            else {
                res.render('connexion.twig', { 'result' : "false" });
            }
        }
        })};
});

app.all('/logout', function(req, res) {
        req.session.destroy(function(err) {
            if(!err) {
            console.log('Session détruite');
            }    
        });
        res.redirect('/');
});

// On définit une route pour l'url /
app.get('/userlist', function(req, res) {
    
    if(!req.session.login) {
        res.redirect('/');
    }
    
    else {
        db.query('SELECT * FROM users',
        function(err, rows) {
        if (!err) {
            for (var i = 0 ; i < rows.length ; i++) {
                console.log(rows[i]);
            }
        }
        res.render('userlist.twig', { 'users' : rows });
      });
    }
});

app.all('/signup', function(req, res) {
    if(req.method == "GET")
        res.render('signup.twig');
    else if(req.method == "POST") {
        db.query('INSERT INTO users VALUES (?, ?, ?, ?, 0, 0)', [ req.body.login, req.body.password, req.body.couleurPref, req.body.couleurSec ],
        function(err, result) {
        if(!err) {
            res.redirect('/userlist');
        }
        else if(err.code == "ER_DUP_ENTRY") {
            console.log(err.code);
            res.render('signup.twig', { 'result' : err.code, "login" : req.body.login});
        } 
            
        })};
});




// On lance l'application
// (process.env.PORT est un paramètre fourni par Cloud9)
app.listen(process.env.PORT);
