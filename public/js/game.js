
         //liens utiles
        //https://www.w3schools.com/graphics/game_controllers.asp
        //https://www.w3schools.com/graphics/tryit.asp?filename=trygame_controllers_keys
        //http://users.polytech.unice.fr/~strombon/camash/Foundation%20HTML5%20Animation%20with%20JavaScript/html5-animation-source-code/
        //http://stackoverflow.com/questions/14389864/javascript-html5-making-a-canvas-animation-using-wasd-to-move-around-a-rectang
        
        /*****************************
        /*****************************
        /*****************************
        /*****************************
        * A METTRE DANS UN FICHIER .JS */

        // Le joueur signale au serveur qu'il arrive sur la page 
        socket.emit('playerInGame', '{{nom}}'); 
        // Le joueur demande une salle pour la partie
        socket.emit('needRoom', '{{nom}}');
        // Le serveur signale au joueur qu'il est bien dans la salle
        socket.on("roomHasBeenJoined", function(message) {
          console.log(message);
        });
        
        
        /* A METTRE DANS UN FICHIER .JS
        *****************************
        /*****************************
        /*****************************
        /*****************************
        */
        
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
          
      
            
          
          this.getX = function() {
            return this.x;
          }
        }
       
        
        // Objet player2 qui prendra les valeurs envoyées du joueur adverse au serveur
        var player2 = {};
        
        
        var keyQ = false;
        var keyZ = false;
        var keyS = false;
        var keyD = false;
        
        // Constante pour le saut
        const K = 20;
        
        //test de solution pour entrer clavier
        (function(){
          // prend le frame rate optimal pour chaque navigateur
            var requestAnimationFrame = window.mozRequestAnimationFrame    ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame     ||
                window.oRequestAnimationFrame;
                window.requestAnimationFrame = requestAnimationFrame;
        })();
        // Evenement pour savoir quelles touches sont utilisées
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
        
        // On instancie player 1 avec ses coordonnées et ses vitesses
        var player1 = new Player(300, 545, 10, -300);

        
        function animation() {
        



          /* Notifie le navigateur que l'on veut exécuter une animation
             l'animation va être refresh en fonction des Hz de l'écran */
          window.requestAnimationFrame(animation);
          
          // Scène de Dario Battle 
          var canvas = document.getElementById("darioScene");
          // La variable ctx contient l'endroit où on va dessiner.
          var ctx=canvas.getContext("2d");
          
          // On clear toute la scène de jeu à chaque rafraichissement d'écran 
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          

                    // Dessin de l'image statique du joueur 2 pour test
          var luigiStandingLeft = new Image();
          luigiStandingLeft.src = "/img/luigiStandingLeft.png"

          /* ####################### RECUPERATION COORDONNEES HERE !!!!! #################################### */
          /* ####################### RECUPERATION COORDONNEES HERE !!!!! #################################### */
          /* ####################### RECUPERATION COORDONNEES HERE !!!!! #################################### */
          /* ####################### RECUPERATION COORDONNEES HERE !!!!! #################################### */
          /* ####################### RECUPERATION COORDONNEES HERE !!!!! #################################### */
          
          // Envoyer en permanence au serveur les coordonnées après avoir bougé
          socket.emit('playerMoved', player1, '{{nom}}');
        
          socket.on('enemyIsHere', function(enemy) {
             player2 = { 
              x: enemy.x,
              y: enemy.y,
              speedX: enemy.speedX,
              speedY: enemy.speedY,
             }

        });
        
        ctx.drawImage(luigiStandingLeft, player2.x, player2.y)
        // console.log(Object.keys(player2));

          // Si le joueur court à gauche ou à droite et qu'il ne saute pas
          if (player1.running && keyD && !player1.jumping || player1.running && keyQ && !player1.jumping) { 
            // Image qui court vers la droite
            player1.image.src = "/img/marioRunningRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }

          // Si le joueur saute ou qu'il a sauté et est en train de retomber
          else if (player1.jumping || player1.goDown ) {
            // Image qui saute
            player1.image.src = "/img/marioJumpingRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }
          
          else if (player1.standing) {
            // Image debout
            player1.image.src = "/img/marioStandingRight.png";
            ctx.drawImage(player1.image, player1.x, player1.y);
          }
          
          else if (player1.crouch) {
            // Image accroupi
            player1.image.src = "/img/marioCrouchRight.png";
            ctx.drawImage(player1.image, player1.x+15, player1.y+15);
          }
            
          if(keyZ || player1.jumping || player1.goDown) {
            player1.crouch = false;
            player1.jumping = true;
            player1.standing = false;
            player1.y += 0.08 * player1.speedY;
            player1.speedY += K;
            
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
              player1.x-=player1.speedX;
            }
            
            if (player1.y > 545) {
              player1.jumping = false;
              player1.goDown = false;
              player1.y = 545;
              player1.speedY = -300;
            }
            
            /* Si le joueur sort du cadre par la gauche alors il arrive à droite */
            if (player1.x < -65) {
              player1.x = 810;
            }
            
            else if(player1.x > 810) {
              player1.x = -65;
            }
            /*
            // Mario accroupit et glisse vers droite 
            if(keyS && keyD) {
              player1.crouch = true;
              player1.slide = true;
              player1.x += player1.speedX;
            }
            // Mario accroupit et glisse vers gauche 
            else if(keyS && keyQ) {
              player1.crouch = true;
              player1.slide = true;
              if(player1.slide == true) {
                player1.x -= player1.speedX;
              }
            }
            */
            
            // collision de base (grace a la distance)
            var distX = player1.x - player2.x;
            var distY = player1.y - player2.y;
            distX = Math.sqrt(Math.pow(distX, 2));
            distY = Math.sqrt(Math.pow(distY, 2));
            
            if (player1.goDown && distX < 25) {
              if (distY == 46.39999999999998)
                console.log("Tu viens de te faire fist");
            }
            
            
        }
        window.requestAnimationFrame(animation);
