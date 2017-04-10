localStorage.setItem('lsid', localStorageId);
var currentPage = document.getElementsByClassName('home')[0];
currentPage = currentPage.getElementsByTagName('a')[0];
currentPage.classList.add('active');