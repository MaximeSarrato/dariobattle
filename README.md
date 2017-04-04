# Projet AWS : Dario Battle réalisé par Sébastien POIROT et Maxime SARRATO

Ce dépôt contient les fichiers du jeu web Dario Battle réalisé dans le cadre du module 
AWS encadré par M. Luca DeFeo à l'école d'Ingénieurs ISTY.

# Pour lancer le projet

Il faut installer socket.io avec la commande npm install socket.io

Vérifier que le serveur Apache n'est pas lancé car l'application et Apache qui contient
la base de données MySQL écoutent sur le même port (8080).

Pour cela : sudo service apache2 stop dans le bash de Cloud9.
Un petit mysql-ctl restart ne fait pas de mal pour être sûr d'avoir les données.


Ensuite il suffit de lancer le serveur qui est dans app.js puis d'aller à l'url 
https://dario-project-maximesrt.c9users.io.

# Lancer une partie
Pour lancer une partie il faut deux comptes connectés. Si vous êtes seul, connectez vous
sur le site (créez votre compte avant) et faîtes de même avec un navigateur en mode
navigation privée pour pouvoir avoir deux comptes connectés en même temps.

Aller dans "Jouer" dans le menu.

Cliquer sur l'autre joueur connecté

Invitez l'autre joueur


# Let's play !
Les touches de contrôles sont : Z Q S D
Z pour sauter, S pour s'accroupir et Q et D pour aller vers la gauche ou la droite.

Pour tuer l'autre joueur il faut lui sauter sur la tête.
Le vainqueur est le dernier ayant conservé l'intégrité de son crâne.