var currentPage = document.getElementsByClassName('home')[0];
currentPage = currentPage.getElementsByTagName('a')[0];
currentPage.classList.add('active');

var socket = io.connect();

// Si le joueur n'a pas de lsid ou vide on lui en donne un
if (localStorage.lsid == "" || !localStorage.lsid)
    localStorage.setItem('lsid', pInfo.lsid);

// If the player has not his login in localStorage we add it
if (localStorage.login == "" || !localStorage.login)
    localStorage.setItem('login', pInfo.login);

// If the player has a room, we clean it
if (localStorage.room) {
    console.log('Je suis dans la room ' + localStorage.room);
    socket.emit('removePlayerFromRoom', localStorage.room);
    localStorage.removeItem('room');
}


socket.emit('homeConnection', localStorage.lsid, localStorage.login);


                