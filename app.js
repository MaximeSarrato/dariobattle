var mysql = require('mysql');
var db    = mysql.createConnection({
  host     : process.env.IP,  // pas touche à ça : spécifique pour C9 !
  user     : process.env.C9_USER.substr(0,16),  // laissez comme ça
  password : '',
  database : 'c9'  // mettez ici le nom de la base de données
});

var session = require('express-session');
var express = require('express');
var twig = require("twig");
var bodyParser = require('body-parser');
var ws = require('ws');
var http = require('http');
var app = express();

const sessionStorage = session({
    secret: '12345',
    resave: false,
    saveUninitialized: false
});

// On configure le dossier contenant les templates
// et les options de Twig
app
    .set('views', 'templates')
    .set('twig options', { autoescape: true })
    .use(bodyParser.urlencoded({ extended: false }))
    .use(sessionStorage)
    // Permet d'afficher le contenu du dossier public sans
    // faire de gestionnaires, ne pas mettre le dossier /public/
    // dans l'URL pour utiliser le contenu
    .use(express.static('public'));

// Objet qui va contenir les membres connectés
var usersConnected = {};

// Variables pour le hash des mots de passe
var bcrypt = require('bcrypt');
const saltRounds = 10;


/* Gestionnaire de la page de connexion */
app.all('/', function (req, res) {
    var hash = '';

    if(req.method == "GET")
        res.render('connexion.twig');
        
    else if (req.method == "POST") {
        // Recherche si le login existe dans la BD
        db.query('SELECT * FROM users WHERE login = ?',
        [ req.body.login ], function(err, rows) {
            // Si la requête fonctionne mais que le login 
            // n'est pas trouvé dans la BD on redirige
            // vers la page de connexion avec un msg d'erreur
            if (!err) {
                if (rows == "") {
                    res.render('connexion.twig', { 'result' : "false" });
                }
            }
        });
        
        db.query('SELECT * FROM users WHERE login = ?',
        [ req.body.login ], function(err, rows) {
            // Si la requête de sélection échoue
            if (err) {
                console.log(err);
            }
            // Si le compte qui souhaite se connecter existe
            else if (rows != "") {
                hash = rows[0].password;
                bcrypt.compare(req.body.password, hash, function (err, result) {
                    // Si la requête est bonne
                    if(!err) {
                        console.log("Résultat de la comparaison des hash = " + result);
                        // Si c'est le bon mot de passe
                        if (result == true) {
                            // Création des variables de session
                            req.session.login = rows[0].login;
                            req.session.parties = rows[0].nb_parties;
                            req.session.gagnees = rows[0].nb_p_gagnees;
                            // Stockage de l'utilisateur et de ses données 
                            // dans l'objet userConnected
                            usersConnected[rows[0].login] = { 
                                games: rows[0].nb_parties, 
                                won: rows[0].nb_p_gagnees,
                                statut: "LIBRE",
                                adversaire: "NULL"
                            };
                            res.redirect('/userlist');
                            console.log(usersConnected);
                        }
                        // Si c'est le mauvais mot de passe on retourne
                        // sur la page de connexion avec un msg d'erreur
                        else if (result == false) {
                            res.render('connexion.twig', { 'result' : "false" });
                        }
                    }
                    // Si erreur dans la requête de comparaison du hash
                    else if (err)
                        console.log("Erreur bcrypt.compare = " + err);
                });
            }
        });
    }
});
        


app.all('/signup', function(req, res) {
    // Date d'inscription du compte
    var d = new Date();

    // Affichage de la page d'inscription
    if(req.method == "GET")
        res.render('signup.twig');
        
    // Stockage du nouveau compte
    else if(req.method == "POST") {
        // Hashage du mot de passe de l'utilisateur
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if (!err) {
                // Insertion du login, hash du password et de la date de l'inscription
                // du compte dans la base de données
                db.query('INSERT INTO users VALUES (?, ?, 0, 0, ?)', [ req.body.login, hash, d ],
                function(err,result) {
                    if(!err) {
                        res.redirect('/userlist');
                    }
                    // Si le login existe déjà
                    else if (err.code == "ER_DUP_ENTRY") {
                        res.render('signup.twig', { 'result' : err.code, "login" : req.body.login });
                    }
                    // Sinon on affiche l'erreur
                    else {
                        console.log(err);
                    }
                });    
            }    
        });
    }
});

// On définit une route pour l'url /
app.get('/userlist', function(req, res) {
    var i = 0; var connectes = [];
    
    // Si l'utilisateur tente d'accéder à la page sans être connecté
    // Redirection vers la page de connexion
    if(!req.session.login) {
        res.redirect('/');
    }
    
    else {
        // Récupération des login des utilisateurs connectés
        for(var elt in usersConnected) {
            connectes[i] = elt;
            i++;
        }
        
        db.query('SELECT * FROM users', function(err, rows) {
            // Si la requête réussit on envoie les tuples récupérés à userlist
            if (!err)
                res.render('userlist.twig', { 'users' : rows, 'nom' : req.session.login, 'connectes' : connectes });
        });
    }
});

app.all('/playdario', function(req, res) {
   if(req.method == "GET") {
       res.render('plateau.twig');
   } 
});

/* Gestionnaire de déconnexion */
app.all('/logout', function(req, res) {
    var login = req.session.login;
    console.log("Login = " + login);
        req.session.destroy(function(err) {
            if(!err) {
                delete usersConnected[login];
                console.log('Session détruite');
                console.log('usersConnected après destruction de la session');
                console.log(usersConnected);
            }    
        });
        res.redirect('/');
});

const server = http.createServer(app);
const wss = new ws.Server({
    server: server,
    verifyClient: function(info, next) {
        sessionStorage(info.req, {}, function(err) {
            if (err)
                next(err, 500, "Error :" + err);
            else {
                next(true);
            }
        });
    }
});


// On définit la logique de la partie Web Socket
wss.on('connection', function(wsconn) {
    console.log('WS connection by', wsconn.upgradeReq.session);
    wsconn.send('Hello world!');
    wsconn.on('message', function(data) {
        console.log(data);
    });
    // ...
});

// On lance l'application
// (process.env.PORT est un paramètre fourni par Cloud9)
server.listen(process.env.PORT);
