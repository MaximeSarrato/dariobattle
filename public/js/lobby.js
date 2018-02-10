/* Change la page en page active pour le CSS */
var currentPage = document.getElementsByClassName('play')[0];
currentPage = currentPage.getElementsByTagName('a')[0];
currentPage.classList.add('active');

// Connexion avec le serveur Socket.IO
var socket = io();
var playerLogin = '{{nom}}';
// Tableau qui aura en première case le pseudo du joueur ciblé par le clic
var nameTarget = [];
/* Variable du cadre des joueurs disponible */
var zoneJoueurs = document.getElementById('onlinePlayers');
var players = zoneJoueurs.getElementsByTagName('td');
var addPlayer = true;
/* Variables du menu d'intéractions entre joueurs */
var menuInteractions = document.getElementById('menu');
var ul = document.createElement('ul');
var li = document.createElement('li');
var li2 = document.createElement('li');
li.classList.add('choixMenu');
li2.classList.add('choixMenu');
ul.classList.add('choixMenu');
var choix1 = document.createTextNode('Envoyer un message');
var choix2 = document.createTextNode('Inviter à jouer');
menuInteractions.appendChild(ul);
ul.appendChild(li);
ul.appendChild(li2);
li.appendChild(choix1);
li2.appendChild(choix2);
menuInteractions.style.visibility = 'hidden';
var interactions = menuInteractions.getElementsByTagName('li');
/* Variables de l'interface pour envoyer des messages entre joueurs */
var prompt = document.createElement('input');
prompt.id = 'promptInputMessage';
prompt.type = 'text';
prompt.placeholder = 'Ecrivez votre message ici...';
/* Variables de la fenêtre d'invitation à la partie */
var gameInvitationWindow = document.getElementById('gameInvitationWindow');
gameInvitationWindow.style.visibility = 'hidden';
var buttonAccept = document.createElement('button');
var buttonDecline = document.createElement('button');
buttonAccept.classList.add('answerInvit');
buttonDecline.classList.add('answerInvit');

// Fonction permettant de modifier l'attribut CSS pour rendre visible un élément
function afficheElement(element) {
  element.style.visibility = 'visible';
}
// Fonction permettant de modifier l'attribut CSS pour cacher un élément
function hideElement(element) {
  element.style.visibility = 'hidden';
}

/* Fonction qui va être utilisée deux fois : une fois dans l'évènement
        *  newPlayerAvailable pour pouvoir cliquer sur les joueurs qui sont
        *  ajoutés à la volée et une autre fois pour pouvoir cliquer
        *  sur les joueurs qui sont affichés via la boucle twig */
function getPseudo(target) {
  // On stocke le nom du joueur cliqué dans le tableau
  nameTarget[0] = this.textContent;
  var target = nameTarget[0];
  console.log('Cible du clic ' + nameTarget[0]);
  // On affiche le menu lorsque un clic est fait sur un joueur
  // On notifie le serveur quel joueur a cliqué sur qui
  socket.emit('clickOnPlayer', localStorage.lsid, target);
  afficheElement(menuInteractions);
}

/* Fonction qui permet de récupérér la chaîne de caractère
        *  qui contient l'intéraction cliquée par le joueur */
function getInteraction() {
  var source = localStorage.lsid;
  var interaction = this.textContent;
  var target = nameTarget[0];
  console.log(interaction);
  socket.emit('clickOnInteraction', source, interaction, target);
  hideElement(menuInteractions);
  // Si l'utilisateur veut envoyer un message
  if (interaction === 'Envoyer un message') {
    // On affiche le prompt
    /* On crée le prompt */
    afficheElement(prompt);
    document.body.appendChild(prompt);
  }
}

/* Evenement du Prompt d'envoi de message
           Si le joueur appuie sur la touche entrée
           on envoie le message et on efface le prompt */
prompt.addEventListener('keyup', function(e) {
  if (e.keyCode == 13) {
    socket.emit(
      'sendMessageFromPrompt',
      localStorage.lsid,
      this.value,
      nameTarget[0]
    );
    // On remet la valeur à vide
    this.value = '';
    document.body.removeChild(prompt);
  }
});

function redirectToGame() {
  document.location.href = '/playdario';
}

function redirectToLogout() {
  localStorage.clear();
  document.location.href = '/logout';
}

// Détruit la session quand le lsid du joueur n'existe pas dans usersConnected
socket.on('destroySession', redirectToLogout);

// Signale au serveur qu'un joueur vient de se connecter au lobby
socket.emit('lobbyConnection', localStorage.lsid);

// Lorsque un nouveau joueur se connecte on l'ajoute
// à la liste des joueurs disponible sans rafraichir la page
socket.on('newPlayerAvailable', function(pseudo) {
  // On vérifie que le joueur n'existe pas déjà dans la liste
  for (var i = 0; i < players.length; i++) {
    if (players[i].textContent == pseudo) {
      addPlayer = false;
    }
  }

  // Si le joueur n'est pas déjà présent dans la liste on l'ajoute
  if (addPlayer) {
    /* Création des variables pour ajouter à la volée
                les nouveaux membres qui se connectent */
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.classList.add('nomJoueur');
    var playerName = document.createTextNode(pseudo);
    tr.appendChild(td);
    td.appendChild(playerName);
    zoneJoueurs.appendChild(tr);
  }

  // Récupérer le pseudo sur lequel l'utilisateur a cliqué
  // lorsque celui-ci vient d'être ajouté à la volée
  // et affichage du menu contextuel
  for (var i = 0; i < players.length; i++) {
    players[i].addEventListener('click', getPseudo);
  }
});

// Récupération du pseudo sur lequel l'utilisateur a cliqué
// lorsque les utilisateurs étaient déjà connectés
// et affichage du menu contextuel
for (var i = 0; i < players.length; i++) {
  players[i].addEventListener('click', getPseudo);
}

// Récupération de l'intéraction sur laquelle le joueur a cliqué
for (i = 0; i < interactions.length; i++) {
  interactions[i].addEventListener('click', getInteraction);
}

/* Si le joueur veut envoyer un message à un autre joueur
           alors on lui affiche un prompt pour qu'il puisse écrire */
socket.on('prompt', function(target) {
  console.log(target);
});

/* Si on reçoit un message on l'affiche dans la discussion */
socket.on('sendMsg', function(source, message) {
  console.log('EVENEMENT SENDMSG');
  var box = document.getElementById('msgbox');
  var li = document.createElement('li');
  var spanLogin = document.createElement('span');
  var spanMsg = document.createElement('span');
  box.appendChild(li);
  li.classList.add('messages');
  spanLogin.classList.add('username');
  spanMsg.classList.add('messageBody');
  spanLogin.textContent = source + ' : ';
  spanMsg.textContent = message;
  li.appendChild(spanLogin);
  li.appendChild(spanMsg);
  console.log('--- Message reçu --- ' + message);
});

/* Si on est invité à jouer on affiche la fenêtre d'invitation */
socket.on('invitedToGame', function(source, message) {
  var context = document.createTextNode('Le joueur ' + source + ' ' + message);
  var br = document.createElement('br');
  var p = document.createElement('p');
  buttonAccept.textContent = 'Accepter';
  buttonDecline.textContent = 'Refuser';
  gameInvitationWindow.appendChild(p);
  p.appendChild(context);
  gameInvitationWindow.appendChild(br);
  gameInvitationWindow.appendChild(buttonAccept);
  gameInvitationWindow.appendChild(buttonDecline);
  // On affiche la fenêtre d'invitation
  afficheElement(gameInvitationWindow);
  // Si le joueur accepte l'invitation
  buttonAccept.addEventListener('click', function() {
    socket.emit('acceptInvitation', source, localStorage.lsid);
    hideElement(gameInvitationWindow);
    /* On enlève tous les éléments ajoutés à la fenêtre
                pour éviter les problèmes de doublons au prochain affichage */
    while (gameInvitationWindow.firstChild) {
      gameInvitationWindow.removeChild(gameInvitationWindow.firstChild);
    }
    while (p.firstChild) {
      p.removeChild(p.firstChild);
    }
    /* On affiche un bloc afin d'informer que le joueur
                va être redirigé vers la partie */
    context = document.createTextNode(
      'Vous allez etre redirige vers la partie dans quelques secondes'
    );
    p.appendChild(context);
    gameInvitationWindow.appendChild(p);
    afficheElement(gameInvitationWindow);
    setTimeout(redirectToGame, 3000);
  });
  // Si le joueur refuse l'invitation
  buttonDecline.addEventListener('click', function() {
    socket.emit('declineInvitation', source, playerLogin);
    hideElement(gameInvitationWindow);
    while (gameInvitationWindow.firstChild) {
      gameInvitationWindow.removeChild(gameInvitationWindow.firstChild);
    }
  });
});

socket.on('invHasBeenAccepted', function(message) {
  // Le joueur x a accepté votre invitation
  var context = document.createTextNode(message);
  var redirection = document.createTextNode(
    'Vous allez etre redirige vers la partie dans quelques secondes'
  );
  var p = document.createElement('p');
  p.appendChild(context);
  p.appendChild(redirection);
  gameInvitationWindow.appendChild(p);
  afficheElement(gameInvitationWindow);
  setTimeout(redirectToGame, 3000);
});
