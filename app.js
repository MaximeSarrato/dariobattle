'use strict';

var mysql = require('mysql');
var db    = mysql.createConnection({
  host     : process.env.IP,  // pas touche à ça : spécifique pour C9 !
  user     : process.env.C9_USER.substr(0,16), // laissez comme ça
  password : '6;b9pC3d.Y[$9UJr',
  database : 'c9'  // mettez ici le nom de la base de données
});

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var session = require('express-session');
var twig = require("twig");
var bodyParser = require('body-parser');

const sessionStorage = session({
    secret: 'M1n4$^T1r1th.',
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

// Tableau qui va contenir les salles 
var rooms = [];

// Variables pour le hash des mots de passe
var bcrypt = require('bcrypt');
const saltRounds = 10;


/****************************************
** PAGE DE CONNEXION ********************
****************************************/
app.all('/', function (req, res) {
    var hash = '';

    if(req.method == "GET") {
        // Si pas de session on va vers la page de connexion
        if(!req.session.login)
            res.render('connexion.twig');
        // Sinon s'il y a une session on va vers l'accueil
        else {
            var i = 0; var connectes = [];
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
        
    }
        
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
                                adversaire: "NULL",
                                gameSocket: 'NULL',
                                socket: 'NULL',
                                wsId: "NULL",
                                room: "NULL",
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
        

/****************************************
** PAGE D'ENREGISTREMENT ****************
****************************************/
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

/****************************************
** PAGE D'ACCUEIL ***********************
****************************************/
app.get('/userlist', function(req, res) {
    var i = 0; var connectes = [];
    
    // Si l'utilisateur tente d'accéder à la page sans être connecté
    // Redirection vers la page de connexion
    if(!req.session.login) {
        res.redirect('/');
    }
    /* Sinon s'il est connecté il peut accéder à la page */
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

/****************************************
** Gestionnaire de la page du jeu *******
****************************************/
app.all('/playdario', function(req, res) {
    if(req.method == "GET") {
        
        if(req.session.login) {
            res.render('plateau.twig', { 'nom' : req.session.login });
        }
        else {
            res.redirect('/');
        }
   } 
});


/****************************************
** LOBBY ********************************
****************************************/
app.get('/lobby', function(req, res) {
    
    if(req.session.login) {
        var i = 0; var joueursDispo = [];
        // Récupération des login des utilisateurs connectés et disponible
        for(var login in usersConnected) {
            if(usersConnected[login].statut == "LIBRE") {
                joueursDispo[i] = login;
                i++;
            }
        }
        res.render('lobby.twig', { 'nom' : req.session.login, 'joueursDispo' : joueursDispo });
    }
    
    else if(!req.session.login){
        res.redirect('/');
    }
    
});
    
/****************************************
** GESTIONNAIRE DE DECONNEXION **********
****************************************/
app.all('/logout', function(req, res) {
    if(req.session.login) {
        var login = req.session.login;
        req.session.destroy(function(err) {
            if(!err) {
                delete usersConnected[login];
                console.log('Session détruite');
                console.log(usersConnected);
            }    
        });
        res.redirect('/');
    }
    else {
        res.redirect('/');
    }
});

/* Fonction permettant de récupérer l'id WebSocket d'un joueur */
function getId(target) {
    return usersConnected[target].wsId;
}

/****************************************
** GESTIONNAIRE SOCKET.IO ***************
****************************************/
io.sockets.on('connection', function(socket) {
    // Lorsque un joueur arrive dans le lobby
    socket.on('lobbyConnection', function(pseudo) {
        // Stockage du socket et de l'id du socket dans les infos du joueur
        if(socket.id != undefined) {
            usersConnected[pseudo].wsId = socket.id;
            usersConnected[pseudo].socket = socket;
            console.log('Connexion WebSocket de : ' + pseudo + ' dont l\'id est ' + socket.id);
            console.log(usersConnected);
            socket.broadcast.emit('newPlayerAvailable', pseudo);
        }
        else {
            console.log('Erreur, ce joueur n\'a pas de Websocket id');
        }
        
    });
    
    // Lorsque un joueur clique sur un joueur disponible dans le lobby
    socket.on('clickOnPlayer', function(source, target) {
        console.log('Un clic sur le joueur ' + target + ' a été fait par ' + source + ' !');
    });
    
    // Lorsque un joueur clique sur un joueur puis sur une intéraction
    // dans le menu déroulant
    socket.on('clickOnInteraction', function(source, interaction, target) {
        
        // On stocke l'id WebSocket de la cible
        var idTarget = getId(target);
        console.log('Source : ' + getId(source) + ' Target : ' + idTarget);
        
        /* Intéraction d'envoi de message entre joueurs */
        if (interaction === "Envoyer un message") {
            // Si l'id WebSocket du joueur existe
            if (idTarget != undefined) {
                console.log('Envoi de message');
            }
            else {
                console.log('Cet utilisateur n\'est plus connecté !');
            }
        }
                
        /* Intéraction d'invitation à la partie entre joueurs */
        else if (interaction === "Inviter à jouer") {
            console.log('Invitation à jouer');
            
            if(idTarget != undefined) {
                var message = ' vous invite à faire une partie.';
                socket.to(idTarget).emit('invitedToGame', source, message);
            }
            
            else {
                console.log('Cet utilisateur n\'est plus connecté !');
            }
        }
        
        /* Si l'intéraction n'existe pas */
        else {
            console.log('Le joueur ' + source + ' tente une intéraction inconnue vers ' + target);
        }
    });
    
    // On envoie à la cible le message écrit dans le prompt 
    socket.on('sendMessageFromPrompt', function(source, message, target) {
            socket.to(getId(target)).emit('sendMsg', source, message);
    });
    
    // Invitation à jouer envoyée par sender et acceptée par le receiver
    socket.on('acceptInvitation', function(sender, receiver) {
        // Notifier le joueur que son invitation a été acceptée
        var message = 'Le joueur ' + receiver + ' a accepté votre invitation !';
        socket.to(getId(sender)).emit('invHasBeenAccepted', message);
        // On change les statuts des joueurs
        usersConnected[sender].statut = "INGAME";
        usersConnected[receiver].statut = "INGAME";
        console.log('Invit lancée par ' + sender + ' et acceptée par ' + receiver);
    });
    
    // Invitation à jouer refusée
    socket.on('declineInvitation', function(sender, receiver) {
        console.log('Invit lancée par ' + sender + ' et refusée par ' + receiver);
    });
    
    // Quand le joueur arrive dans la partie Dario Battle
    socket.on('playerInGame', function(playerName) {
        // Bug : besoin de join deux fois la salle pour pouvoir y être sans refresh
        // la page
        usersConnected[playerName].socket.join('gameRoom1');
    });
    
    // Le joueur demande une salle pour jouer
    socket.on('needRoom', function(playerName) {
        // Bug : besoin de join deux fois la salle pour 
        // pouvoir y être sans refresh la page
        usersConnected[playerName].socket.join('gameRoom1');
        usersConnected[playerName].room = 'gameRoom1';
        console.log('Rooms de ' + playerName + ' = ' + Object.keys(usersConnected[playerName].socket.rooms));
        // Ce emit devrait être un emit vers la room mais fonctionne pas
        socket.emit('roomHasBeenJoined', 'Tu as rejoint la salle !');
    });
    
    socket.on('playerMoved', function(player, playerName) {
        for(var adversaire in usersConnected) {
            if(usersConnected[adversaire].room == 'gameRoom1' && adversaire != playerName) {
                socket.broadcast.emit('enemyIsHere', player);
            }
        }
    });
});





// On lance l'application
// (process.env.PORT est un paramètre fourni par Cloud9)
server.listen(process.env.PORT);
console.log('Server listening on port : ' + process.env.PORT);
