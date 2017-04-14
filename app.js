'use strict';

var mysql = require('mysql');
var db    = mysql.createConnection({
  host     : process.env.IP, 
  user     : process.env.C9_USER.substr(0,16), 
  password : '6;b9pC3d.Y[$9UJr',
  database : 'dario_database'  
});

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var session = require('express-session');
var twig = require("twig");
var bodyParser = require('body-parser');
const crypto = require('crypto');

const sessionStorage = session({
    secret: 'M1n4$^T1r1th.',
    resave: false,
    saveUninitialized: false,
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

// All the rooms and informations associated
var rooms = {};

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
                            var login = rows[0].login.toLowerCase();
                            req.session.login = login;
                            req.session.games = rows[0].games;
                            req.session.kills = rows[0].kills;
                            req.session.deaths = rows[0].deaths;
                            // Stockage de l'utilisateur et de ses données 
                            // dans l'objet userConnected
                            usersConnected[login] = { 
                                games: rows[0].games, 
                                kills: rows[0].kills,
                                deaths: rows[0].deaths,
                                statut: "ACCUEIL",
                                adversaire: "NULL",
                                socket: "NULL",
                                wsId: "NULL",
                                room: "NULL",
                                /* Le LSID sera stocké dans le localStorage
                                de l'utilisateur et permettra de savoir le pseudo
                                du joueur qui a cet lsid en le comparant avec
                                usersConnected */
                                lsid: random(64)
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
        // Vérifier qu'il y a les caractères que l'on autorise pour le login
        /* Ce pattern vérifie que le login commence par au moins une lettre 
        suivie de n lettres et/ou n chiffres. Au total la chaîne de caractère doit
        fait au maximum 15 caractères */
        const pattern = /^[a-zA-Z][a-zA-Z|0-9]{1,14}$/; 
        var matchingChars = req.body.login.match(pattern);
        
        // Si l'utilisateur a rentré un login avec les caractères autorisés
        if (matchingChars) {
            // Hashage du mot de passe de l'utilisateur
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                if (!err) {
                    // Insertion du login, hash du password et de la date de l'inscription
                    // du compte dans la base de données
                    db.query('INSERT INTO users VALUES (?, ?, 0, 0, 0, ?)', [ req.body.login, hash, d ],
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
        else if (!matchingChars) 
            res.render('signup.twig', { 'result' : "wrongChars", 'login' : req.body.login });
    }
});

/****************************************
** PAGE D'ACCUEIL ***********************
****************************************/
app.all('/userlist', function(req, res) {
    var i = 0; var connectes = [];
    // Si l'user a une variable de session 
    if (req.session.login) {

        /* On change les informations du joueur lors de son arrivée / retour dans l'accueil */
        usersConnected[req.session.login].statut = "ACCUEIL";
        usersConnected[req.session.login].room = "NULL";
        usersConnected[req.session.login].adversaire = "NULL";
        
        console.log(usersConnected);
        
        // Récupération des login des utilisateurs connectés
        for(var joueur in usersConnected) {
            connectes[i] = joueur;
            i++;
        }
        
        
        // Tri par nombre de kills et on envoie tous les joueurs ainsi que ceux qui sont co dans la page
        db.query('SELECT * FROM users ORDER BY kills DESC', function(err, rows) {
            /* On récupère les logins et on les met en minuscule afin que la comparaison
            dans la boucle twig pour obtenir les membres connectés 
            puisse bien trouver les logins correspondants */
            for (i = 0; i < rows.length; i++) {
                rows[i].login = rows[i].login.toLowerCase();
            }
            // Si la requête réussit on envoie les tuples récupérés à userlist
            if (!err)
                res.render('userlist.twig', { 
                    'users' : rows, 
                    'nom' : req.session.login, 
                    'connectes' : connectes, 
                    'localStorageId' : usersConnected[req.session.login].lsid });
        });
    }
    else 
        res.redirect('/');
});

/****************************************
** Gestionnaire de la page du jeu *******
****************************************/
app.all('/playdario', function(req, res) {
    if(req.method == "GET") {
        
        if(req.session.login && usersConnected[req.session.login].statut === 'INGAME' && usersConnected[req.session.login].adversaire != req.session.login.toLowerCase()) {
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
    
    if(req.session.login && isUserConnected(req.session.login)) {
        var i = 0; var joueursDispo = [];
        usersConnected[req.session.login].statut = "LOBBY";
        usersConnected[req.session.login].room = "NULL";
        // Récupération des login des utilisateurs connectés et disponible
        for(var login in usersConnected) {
            if(usersConnected[login].statut == "LOBBY") {
                joueursDispo[i] = login.toLowerCase();
                i++;
            }
        }
        res.render('lobby.twig', { 'nom' : req.session.login, 'joueursDispo' : joueursDispo });
    }
    
    else
        res.redirect('/');
    
});
    
/****************************************
** GESTIONNAIRE DE DECONNEXION **********
****************************************/
app.all('/logout', function(req, res) {
    console.log(req.session.login);
    if(req.session.login) {
        var login = req.session.login;
        req.session.destroy(function(err) {
            if(!err) {
                if(isUserConnected(login)) {
                    delete usersConnected[login];
                    console.log('Session détruite');
                    console.log(usersConnected);
                }
            }    
        });
        res.redirect('/');
    }
    else
        res.redirect('/');
});

/********************* 
** FONCTIONS *********
**********************/

/* Fonction permettant de générer un id pour le localStorage */
function random (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len];
    }

    return value.join('');
}

/* Fonction permettant de récupérer l'id WebSocket d'un joueur */
function getId(target) {
    return usersConnected[target].wsId;
}

/* Fonction permettant de vérifier si un utilisateur est connecté */
function isUserConnected(user) {
    var connectedPlayers = []; var i = 0;
    var playerFound;
    // On stocke les logins des utilisateurs connectés dans un tableau
    for(var login in usersConnected) {
        connectedPlayers[i] = login;
        i++;
    }
    // On compare le tableau avec user
    // Si le joueur existe on renvoie true
    for(i=0; i < connectedPlayers.length; i++) {
        if(connectedPlayers[i] === user) {
            playerFound = true;
            return true;
        }
    }
    // Sinon on renvoie false
    if (!playerFound) {
        return false;
    }
}

/* Fonction permettant de trouver un joueur par son localStorage id */
function getPlayerByLsid(lsid) {
    var playerFound = false;
    for (var player in usersConnected) {
        if(usersConnected[player].lsid == lsid) {
            playerFound = true;
            return player;
        }
    }
    if (!playerFound) {
        return false;
    }
}

/* Count how many players are in a room */
function countPlayersInRoom(roomName) {
    console.log('------- COUNTING PLAYERS IN ROOM -------');
    // Room is an array containing sockets which are in the room
    var rooms = io.sockets.adapter.rooms[roomName];
    // The length of rooms permit to know how many players are in
    console.log('Number of players in ' +  roomName + ' = ' + rooms.length);
}

function createRoom() {
    console.log('------- CREATING ROOM -------');
    var roomAlreadyIn = false;
    var names = ['Triforce', 'Lichking', 'Cataclysm', 'Illidan', 'Arthas', 'Thrall', 'Orgrimmar'];
    // Generating random number between 0 and the size of the names array
    var cell = Math.floor(Math.random()*names.length);

    var room = names[cell];
    console.log(room);
    
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i] === room) {
            roomAlreadyIn = true;
        }
    }
    
    // If the name is not in the array then we can create the room
    if (!roomAlreadyIn) {
        rooms[room] = {
            sockets: [],
            playersInside: 0
        };
        return room;
    }
    // If a room has already that name, recalling creating function
    // Problem is that names are limited for the moment, that will cause endless loop
    else if (roomAlreadyIn) {
        createRoom();
    }
}

/* Search a not full room 
rooms contains all the rooms
room is the name of a room */
function searchNotFullRoom() {
    console.log('------- SEARCHING FOR A ROOM ------- ');
    for(var room in rooms) {
        if(rooms[room].playersInside <= 1) {
            return room;
        }
    }
    // If all existing rooms are full, we will create one
    room = createRoom();
    return room;
}

/****************************************
** GESTIONNAIRE SOCKET.IO ***************
****************************************/
io.sockets.on('connection', function(socket) {
    
    // Le joueur arrive sur l'accueil
    socket.on('homeConnection', function(lsid, login) {
       var player = getPlayerByLsid(lsid);
       if (player) {
           usersConnected[player].socket = socket;
           usersConnected[player].wsId = socket.id;
           console.log(usersConnected);
       }
       else {
           console.log('This player does not exists');
       }
    });
    
    // Lorsque un joueur arrive dans le lobby
    socket.on('lobbyConnection', function(lsid) {
        console.log('lobbyConnection !');
        var player = getPlayerByLsid(lsid);
        // Si le lsid appartient bien à un joueur
        if (player) {
            // Stockage du socket et de l'id du socket dans les infos du joueur
            usersConnected[player].wsId = socket.id;
            usersConnected[player].socket = socket;
            console.log(usersConnected);
            socket.broadcast.emit('newPlayerAvailable', player);
        }
        /* Si le lsid du joueur qui rentre dans le lobby ne correspond pas
        à son lsid dans usersConnected */
        else {
            console.log('player = ' + player);
            socket.emit('destroySession');
        }
    });
    
    
    // Lorsque un joueur clique sur un joueur disponible dans le lobby
    socket.on('clickOnPlayer', function(lsid, target) {
        var source = getPlayerByLsid(lsid);
        if(isUserConnected(source) && isUserConnected(target)) 
            console.log('Un clic sur le joueur ' + target + ' a été fait par ' + source + ' !');
        else
            console.log('ALERT : Modification de la page');
    });
    
    // Lorsque un joueur clique sur un joueur puis sur une intéraction
    // dans le menu déroulant
    socket.on('clickOnInteraction', function(lsidSource, interaction, target) {
        var sender = getPlayerByLsid(lsidSource);
        console.log('source = ' + sender + ' target = ' + target);
        // On vérifie que les utilisateurs existent et sont connectés
        if(isUserConnected(sender) && isUserConnected(target)) {
            // On stocke l'id WebSocket de la cible
            var idTarget = getId(target);
            console.log('Source : ' + getId(sender) + ' Target : ' + idTarget);
            
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
                // Si le target à un id WebSocket et que le joueur n'essaie pas de s'inviter lui-même
                if(idTarget != undefined && sender.toLowerCase() != target.toLowerCase()) {
                    var message = ' vous invite a faire une partie.';
                    socket.to(idTarget).emit('invitedToGame', sender, message);
                }
                
                else {
                    console.log('Cet utilisateur n\'est plus connecté ou bien il essaie de s\'inviter lui même !');
                }
            }
            
            /* Si l'intéraction n'existe pas */
            else {
                console.log('Le joueur ' + sender + ' tente une intéraction inconnue vers ' + target);
            }
        }

    });
    
    // On envoie à la cible le message écrit dans le prompt 
    socket.on('sendMessageFromPrompt', function(lsid, message, target) {
        var source = getPlayerByLsid(lsid);
        if (usersConnected[source] && usersConnected[target]) {
            socket.to(getId(target)).emit('sendMsg', source, message);
        }
    });
    
    // Invitation à jouer envoyée par sender et acceptée par le receiver
    socket.on('acceptInvitation', function(sender, lsid) {
        var receiver = getPlayerByLsid(lsid);
        console.log('Invitation par ' + sender);
        /* On vérifie que le sender et le receiver existent bien et sont bien connectés
        et qu'ils sont bien dans l'état "INGAME" */
        if (isUserConnected(sender) && isUserConnected(receiver)) {
            
            // Notifier le joueur que son invitation a été acceptée
            var message = 'Le joueur ' + receiver + ' a accepte votre invitation !';
            socket.to(getId(sender)).emit('invHasBeenAccepted', message);
            
            // On change les statuts des joueurs
            usersConnected[sender].statut = "INGAME";
            usersConnected[receiver].statut = "INGAME";
            usersConnected[sender].adversaire = receiver;
            usersConnected[receiver].adversaire = sender;

            /* On incrémente le nombre de partie des deux joueurs */ 
            db.query('UPDATE users SET games = games+1 WHERE LOGIN = ?', [sender], 
            function(err, result) {
                if (err) 
                    console.log(err);
            });   
            db.query('UPDATE users SET games = games+1 WHERE LOGIN = ?', [receiver], 
            function(err, result) {
                if (err) 
                    console.log(err);
            });  
        }
    });
    
    // Invitation à jouer refusée
    socket.on('declineInvitation', function(sender, receiver) {
        if (isUserConnected(sender) && isUserConnected(receiver)) {
            console.log('Invit lancée par ' + sender + ' et refusée par ' + receiver);
        }
    });
    
    // Quand le joueur arrive dans la partie Dario Battle
    socket.on('playerInGame', function(lsid) {
        var player = getPlayerByLsid(lsid);
        console.log('Player in game ! He is : ' + player);
        if (player) {
            usersConnected[player].socket = socket;
            usersConnected[player].wsId = socket.id;
            var room = searchNotFullRoom();
            usersConnected[player].socket.join(room, function() { 
                console.log('Les rooms de ' + player 
                + ' = ' + Object.keys(usersConnected[player].socket.rooms));
            });
            usersConnected[player].room = room;
            rooms[room].playersInside += 1;
            console.log(usersConnected);
            countPlayersInRoom(room);
            io.in(room).emit('roomHasBeenJoined', player, room);
        }
        else {
            console.log('This user does not exists');
        }
    });
    
    // Dés qu'un joueur bouge on envoie ses positions à l'autre joueur
    socket.on('playerMoved', function(player, lsid, room) {
        var playerName = getPlayerByLsid(lsid);
        if(isUserConnected(playerName)) {
            for(var adversaire in usersConnected) {
                if(usersConnected[adversaire].room == room && adversaire != playerName) {
                    socket.to(room).emit('enemyIsHere', player);
                }
            }
        }
    });
    
    // Lorsque un joueur est mort
    socket.on('playerIsDead', function(killerLsid, room) {
        var deadPlayerName = '';
        var killerName = getPlayerByLsid(killerLsid);
        if(killerName) {
            /* On parcourt les utilisateurs connectés qui sont dans la salle gameRoom1
            Lorsque on tombe sur un joueur ayant un nom différent de killerName 
            alors c'est lui qui est mort */
            for(var deadPlayer in usersConnected) {
                if(usersConnected[deadPlayer].room == room && deadPlayer != killerName) {
                    deadPlayerName = deadPlayer;
                    console.log(deadPlayerName + ' est mort !');
                    // On signale au joueur qu'il est mort et qui l'a tué afin de changer son statut
                    socket.to(room).emit('youAreDeadBro', killerName);
                }
            }
            /* On incrémente le nombre de kills */ 
            db.query('UPDATE users SET kills = kills+1 WHERE LOGIN = ?', [killerName], 
            function(err, result) {
                if (err) 
                    console.log(err);
            });   
            db.query('UPDATE users SET deaths = deaths+1 WHERE LOGIN = ?', [deadPlayerName], 
                function(err, result) {
                    if (err) 
                        console.log(err);
            });  
        }
        else {
            console.log('This player does not exists');
        }
    });
    /* When the game is finished, do the player quit his room and decrement the
    number of players in that room */
    socket.on('removePlayerFromRoom', function (room) {
        rooms[room].playersInside -= 1;
    });
});



// On lance l'application
// (process.env.PORT est un paramètre fourni par Cloud9)
server.listen(process.env.PORT);
console.log('Server listening on port : ' + process.env.PORT);