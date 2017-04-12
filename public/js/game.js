
        //liens utiles
        //https://www.w3schools.com/graphics/game_controllers.asp
        //https://www.w3schools.com/graphics/tryit.asp?filename=trygame_controllers_keys
        //http://users.polytech.unice.fr/~strombon/camash/Foundation%20HTML5%20Animation%20with%20JavaScript/html5-animation-source-code/
        //http://stackoverflow.com/questions/14389864/javascript-html5-making-a-canvas-animation-using-wasd-to-move-around-a-rectang
        
        /* Socket.IO */
        var socket = io.connect();
        // Le joueur signale au serveur qu'il arrive sur la page 
        // et demande une salle
        socket.emit('playerInGame', localStorage.lsid); 
        
        // Le serveur signale au joueur qu'il est bien dans la salle
        socket.on("roomHasBeenJoined", function(message) {
          console.log(message);
        });
        
        // Quand un des deux joueurs est mort on redirige vers l'accueil
        function redirectToHome() {
            document.location.href='/';
        }
        
        /* Constructeur de l'objet Player */
        function Player(x, y, speedX, speedY) {
          this.x = x;
          this.y = y;
          this.speedX = speedX;
          this.speedY = speedY;
          this.running = false;
          this.jumping = false;
          this.standing = true;
          this.alive = true;
          this.crouch = false;
          this.sliding = false;
          this.goDown = false;
          this.image = new Image();
          this.image.src = "/img/marioStandingRight.png";
        }
        
        var fps,then,now,tempsPasse,fpsRate;


        // Images utilisées par le joueur 2
        var luigiStandingLeft = new Image();
        luigiStandingLeft.src = "/img/luigiStandingLeft.png"
        
        var luigiDying = new Image();
        luigiDying.src = "/img/luigiDying.png"
        
        var luigiCrouchLeft = new Image();
        luigiCrouchLeft.src = "/img/luigiCrouchLeft.png";
        
        var luigiJumpingLeft = new Image();
        luigiJumpingLeft.src = "/img/luigiJumpingLeft.png";
        
        var luigiRunningLeft = new Image();
        luigiRunningLeft.src = "/img/luigiRunningLeft.png";  
        
        var luigiDying = new Image();
        luigiDying.src = "img/luigiDying.png";
        
        /* L'objet player du joueur adverse, ses propriétés seront définies
        dans le listener enemyIsHere de socket.io */
        var player2 = {};
        
        // On met à faux les différentes touches de jeu
        var keyQ = false;
        var keyZ = false;
        var keyS = false;
        var keyD = false;
        
        // Constante permettant de réduire la vitesse pour la retombée du saut
        const K = 20;
        
        //test de solution pour entrer clavier
        (function(){
          // prend le frame rate optimal pour chaque navigateur
            /*var requestAnimationFrame = window.mozRequestAnimationFrame    ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame     ||
                window.oRequestAnimationFrame;
                window.requestAnimationFrame = requestAnimationFrame;*/
        })();
        
        // Evenements pour savoir quelles touches sont utilisées
        window.addEventListener("keydown",onKeyDown,false);
        window.addEventListener("keyup",onKeyUp,false);
        
        
        // Fonction qui indique quelle touche est enfoncée
        function onKeyDown(event) {
              var keyCode = event.keyCode;
              switch (keyCode) {
                case 68: //d
                keyD = true;
                break;
                case 83: //s
                  keyS = true;
                  break;
                case 81: //q
                  keyQ = true;
                  break;
                case 90: //z
                  keyZ = true;
                  break;
                }
        }

        // Fonction pour savoir quelle touche n'est pas enfoncée
        function onKeyUp(event) {
          var keyCode = event.keyCode;
        
          switch (keyCode) {
            case 68: //d
              keyD = false;
              break;
            case 83: //s
              keyS = false;
              break;
            case 81: //q
              keyQ = false;
              break;
            case 90: //z
              keyZ = false;
              break;
          }
        }
        
        // On instancie player 1 avec ses coordonnées et ses vitesses(on le place de manière aléatoire sur le sol)
        var player1 = new Player(((Math.random()*700)+100), 545, 10, -300);

        
        function animation() {
          /* Notifie le navigateur que l'on veut exécuter une animation
             l'animation va être refresh en fonction des Hz de l'écran */
          window.requestAnimationFrame(animation);
          now=Date.now();
          tempsPasse=now-then;
          if(tempsPasse > fpsRate)
          {
            then=now-(tempsPasse % fpsRate)
          // Scène de Dario Battle 
          var canvas = document.getElementById("darioScene");
          // La variable ctx contient l'endroit où on va dessiner.
          var ctx=canvas.getContext("2d");
          
          // On clear toute la scène de jeu à chaque rafraichissement d'écran 
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Envoyer en permanence au serveur les coordonnées et les états du personnage
          socket.emit('playerMoved', player1, localStorage.lsid);
          
          /* Ce listener récupère les propriétés du joueur adverse que le serveur
             lui ait envoyé. Ces propriétés sont envoyées en permanence au serveur
             par le joueur adverse */
          socket.on('enemyIsHere', function(enemy) {
             player2 = { 
              x: enemy.x,
              y: enemy.y,
              speedX: enemy.speedX,
              speedY: enemy.speedY,
              alive: enemy.alive,
              running: enemy.running,
              jumping: enemy.jumping,
              standing: enemy.standing,
              crouch: enemy.crouch,
              sliding: enemy.sliding,
              goDown: enemy.goDown           
             }
            // Si le joueur est mort on met tous ses états à false
            if (player2.alive == false) {
              player2.running = false;
              player2.jumping = false;
              player2.standing = false;
              player2.crouch = false;
              player2.sliding = false;
              player2.goDown = false;
              }            
          });
          
          // Listener de l'évènement envoyé par le serveur qui signale au joueur qu'il est mort
          socket.on('youAreDeadBro', function(killerName) {
            player1.alive = false;
            player1.image.src = "/img/marioDying.png";
            ctx.drawImage(player1.image, player1.x, player1.y+15);
            setTimeout(redirectToHome, 3000);
          });
          
          // Si le joueur est mort on met tous ses états à false
          if (player1.alive == false) {
            player1.running = false;
            player1.jumping = false;
            player1.standing = false;
            player1.crouch = false;
            player1.sliding = false;
            player1.goDown = false;
            ctx.drawImage(player1.image, player1.x, player1.y);
            }          
            
          
            
          /************** DIFFERENT IMAGES OF PLAYER 2 **************/
          // Si le joueur 2 est debout
          if (player2.standing)
            ctx.drawImage(luigiStandingLeft, player2.x, player2.y);
          // Si il court
          if (player2.running)
            ctx.drawImage(luigiRunningLeft, player2.x, player2.y);
          // Si il saute ou retombe  
          if (player2.jumping || player2.goDown)
            ctx.drawImage(luigiJumpingLeft, player2.x, player2.y);
          // Si il s'accroupit  
          if (player2.crouch)
            ctx.drawImage(luigiCrouchLeft, player2.x, player2.y+15);
          // Si il est mort
          if (player2.alive == false) {
            ctx.drawImage(luigiDying, player2.x, player2.y+15);
          }
            

          // Si le joueur court à gauche ou à droite et qu'il ne saute pas
          if (player1.running && !player1.jumping) { 
            if(keyD)
              player1.image.src = "/img/marioRunningRight.png";
            else if(keyQ)
              player1.image.src = "/img/marioRunningLeft.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }

          // Si le joueur saute ou qu'il a sauté et est en train de retomber
          else if (player1.jumping || player1.goDown ) {
            if(keyD)
              player1.image.src = "/img/marioJumpingRight.png";
            else if(keyQ)
              player1.image.src = "/img/marioJumpingLeft.png";
            else
              player1.image.src = "/img/marioJumpingRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }
          
          // Si le joueur 1 est debout
          else if (player1.standing) {
            player1.image.src = "/img/marioStandingRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }
          
          /* Si le joueur s'accroupit */
          else if (player1.crouch) {
            if(keyD)
              player1.image.src = "/img/marioCrouchRight.png";
            else if(keyQ)
              player1.image.src = "/img/marioCrouchLeft.png";
            else
              player1.image.src = "/img/marioCrouchRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y+15);
          }
          /* ########### CHARACTER DEPLACEMENT BEGIN ########### */
          /* ########### CHARACTER DEPLACEMENT BEGIN ########### */
          /* ########### CHARACTER DEPLACEMENT BEGIN ########### */
          if(player1.alive) {
            
            if(keyZ || player1.jumping || player1.goDown) {
              player1.crouch = false;
              player1.jumping = true;
              player1.standing = false;
              player1.y += 0.08 * player1.speedY;
              player1.speedY += K;
             // effetSonore('saut');
              
              if (player1.speedY > 0) {
                  player1.jumping = false;
                  player1.goDown = true;
              }
            }
              
            if(keyS && player1.y == 545) {
              player1.running = false;
              player1.standing = false;
              player1.jumping = false;
              player1.goDown = false;
              player1.crouch = true;
            }
            // mario se déplace vers la droite si la touche D est enfoncée
            if (keyD && !keyS) {
              player1.crouch = false;
              player1.standing = false;
              player1.running = true;
              player1.x += player1.speedX;
            }
            
            if (!keyD && !keyQ && !keyS) {
                player1.crouch = false;
                player1.standing = true;
                player1.running = false;
              }
              // mario se déplace vers la gauche si Q est enfoncée
              if (keyQ && !keyS) {
                player1.standing = false;
                player1.running = true;
                player1.crouch = false;
                player1.x -= player1.speedX;
              }
              
              if (player1.y > 545) {
                player1.jumping = false;
                player1.goDown = false;
                player1.y = 545;
                player1.speedY = -300;
              }
              
              /* Si le joueur sort du cadre alors il revient de l'autre côté */
              if (player1.x < -65) {
                player1.x = 810;
              }
              
              else if(player1.x > 810) {
                player1.x = -65;
              }
          }
              
          /* ########### CHARACTER DEPLACEMENT END ########### */
          /* ########### CHARACTER DEPLACEMENT END ########### */
          /* ########### CHARACTER DEPLACEMENT END ########### */
          
            /* Détection de la collision entre les 2 joueurs
            par le calcul de la distance entre les deux */
            var distX = player1.x - player2.x;
            var distY = player1.y - player2.y;
            distX = Math.sqrt(Math.pow(distX, 2));
            distY = Math.sqrt(Math.pow(distY, 2));
            
            // Détecte qu'un joueur se fait écraser
            if (player1.goDown && distX < 25) {
              if (distY == 46.39999999999998) {
                /* On envoie l'évenement playerIsDead au serveur
                   avec le nom du compte qui l'a tué */
                if(player1.alive && player2.alive) {   
                  socket.emit('playerIsDead', localStorage.lsid);
                  // On redirige les joueurs vers l'accueil quand la game est finie
                  setTimeout(redirectToHome, 3000);
                }
              }
            }
            
            /* Si un des deux joueurs est mort on affiche le message de ENDGAME 
            Cela affiche aussi le EndGame lorsque un seul des deux joueurs est
            dans la partie */
            if(!player1.alive || !player2.alive) {
              ctx.font = "50px smbFont";
              ctx.fillStyle = "#FFD700";
              ctx.textAlign="center";
              ctx.fillText('GAME IS OVER !', 400, 150);   
            }
          }
        }
        
        // gestion des fps
        function debutAnimation(fps)
        {
          fpsRate=1000/fps;
          then=Date.now();
          animation();
        }
        // Fonction qui bruite le saut de mario
       /* function effetSonore(event)
        {
          var son;
          if(event == "saut")
          son=document.getElementById('boing')
          
          son.play();
        }*/
        
        debutAnimation(60);