var currentPage = document.getElementsByClassName('home')[0];
currentPage = currentPage.getElementsByTagName('a')[0];
currentPage.classList.add('active');
// Si le joueur n'a pas de lsid ou vide on lui en donne un
if (localStorage.lsid == "" || !localStorage.lsid)
    localStorage.setItem('lsid', pInfo.lsid);
            
if (localStorage.login == "" || !localStorage.login)
    localStorage.setItem('login', pInfo.login);

var socket = io.connect();

console.log(pInfo.login + ' ' + pInfo.lsid);
socket.emit('homeConnection', localStorage.lsid, localStorage.login);


                