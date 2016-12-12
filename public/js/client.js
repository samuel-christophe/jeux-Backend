(function(window, io){
  //Au chargement du document
  window.addEventListener('DOMContentLoaded',() => {

    var room, username, numPlayer, facileLI, moyenLI, difficileLI, perso, perso2, nbPlayer, cartes, div, heure, positionVoyant, aiguille, aiguilleHeure, vision, tour, niveau, regles, suspect;
    var playerListe = [];
    var playerInfo = [];
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');
    // var socket = io('http://10.1.1.19:8888/');
    // var socket = io('http://www.samuelchristophe.com:8888/');

    // socket : Est un objet qui représente la connexion WebSocket établie entre le client WebSocket et le serveur WebSocket.

    var send = window.document.getElementById('send');
    var chat = window.document.getElementById('chat');
    var jeux = window.document.getElementById('jeux');
    var pseudo = window.document.getElementById('pseudo');
    var message = window.document.getElementById('message');
    var difficult = window.document.getElementById('difficult');
    var start = window.document.getElementsByClassName('start');
    var debut = window.document.getElementsByClassName('debut');
    var HTMLaElement = window.document.getElementsByTagName('a');
    var navigation = window.document.getElementById('navigation');
    var connection = window.document.getElementById('connection');
    var textAffiche = window.document.getElementById('textAffiche');
    var connect = window.document.getElementsByClassName('connect');
    var deconnection = window.document.getElementById('deconnection');

    var niveau = ['facile', 'moyen', 'difficile'];

    var spriteCarte = document.createElement('img');
    spriteCarte.src='image/sprite carte.png';
    spriteCarte.addEventListener('load', (event) => {
    });
    var plateau = document.createElement('img');
    plateau.src='image/plateau.png';
    plateau.addEventListener('load', (event) => {
    });
    var plateauFantom = document.createElement('img');
    plateauFantom.src='image/sprite plateau fantom.png';
    plateauFantom.addEventListener('load', (event) => {
    });
    var ecran = document.createElement('img');
    ecran.src='image/ecran/ecran.jpg';
    ecran.addEventListener('load', (event) => {
    });
    var regles = document.createElement('img');
    regles.src='image/start/rules.jpg';
    regles.addEventListener('load', (event) => {
    });

    connection.addEventListener('submit', (event) => {
      event.preventDefault();
      /**
      Au clic de souris sur l'élément HTML considéré
      on envoi un message à travers la connexion WebSocket.
      **/
      username = pseudo.value;
      if (username) {
        socket.emit('create player', { username: username });
      } else {
        pseudo.placeholder = 'Veuiller sésir au minumum un caractère';
      }

    });

    /**
    On attache un gestionnaire d'évènement à un évènement personnalisé 'joincreateconfirm'
    qui correspond à un événement déclaré coté serveur qui est déclenché lorsqu'un message
    a été reçu en provenance du serveur WebSocket.
    **/
    socket.on('joincreateconfirm', (data) => {
      /**
      A chaque message reçu, on affiche les données
      obtenues dans la console du navigateur Internet.
      **/
      room = data.room;
      numPlayer = data.numPlayer;
      nbPlayer = data.nbPlayer;

      //enregistre les joueurs
      if ( data.playerListe ) {
        playerListe = data.playerListe;
      }

      socket.emit('room', room);

      //supprime les élément de connexion
      for (var i = 0; i < start.length; i) {
        start[i].classList.remove('start');
      };
      for (var i = 0; i < connect.length; i) {
        connect[i].parentNode.removeChild(connect[i]);
      }

      //vérifie si le joueur à déjà un personnage
      if (data.joue) {
        perso = data.joue
        //parcour la liste des lien pour les supprimer
        for (var i = 1; i < HTMLaElement.length ; i) {
          status = HTMLaElement[i].getAttribute('href');
          if (status != '/regles') {
            HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
          }
        }
      }

      //vérifie si la partie à déjà commencé
      if (data.start) {
        cartes = data.cartes;
        tour = data.tour;
        corbeau = data.corbeau;
        perso = data.joue;
        suspect = data.suspect;
        debutPartie();
      }

    });

    //envoie de donné privé du serveur
    socket.on('cartes', (data) => {
      cartes = JSON.parse(JSON.stringify(data.cartes));
      tour = data.tour;
      corbeau = data.corbeau;
      nbPlayer = data.nbPlayer;
      playerListe = data.playerListe;
      debutPartie ();
    });

    socket.on('new player', (data) => {
      if ( username != data.name ) {
        addChat(data.name + ' vient de ce connecter.', 10000);
      }
    });

    //parcour la liste des lien
    for (var i = 0; i < HTMLaElement.length; i++) {
      HTMLaElement[i].addEventListener('click', function (event) {
        event.preventDefault();
        var status = this.getAttribute('href');
        perso = status;
        if (status != '/regles'){
          /**
          A chaque clic de souris sur l'élément HTML considéré
          on envoi un message à travers la connexion WebSocket.
          **/
          socket.emit('unJoueur', { room: room, username: username, perso: status, choisPerso : true, numPlayer : numPlayer });
          /**
          On déclare un évènement personnalisé 'unJoueur' dont
          la réception sera gérée coté serveur.
          **/
        } else {
          regles.classList.add('image', 'start', 'grandeCarte');
          jeux.appendChild(regles);
          afficheImage(this, regles);
          afficheImage(regles, regles);
        }
      });
    }

    //deconnect le joueur
    deconnection.addEventListener('submit', (event) => {
      event.preventDefault();
      socket.emit('disconnected', {room: room, username: username, numPlayer: numPlayer});
      addChat('la partie est terminée!', 120000);

    });

    socket.on('remove player', (data) => {
      if (data.end) {
        addChat('la partie est terminée suite au départ de ' + data.username + '!', 120000);
      } else {
        playerListe[numPlayer] = undefined;
        nbPlayer--;
      }
    });

    //partie perdu
    socket.on('end game', (data) => {
      addChat('la partie est terminée ' + data.message + '!', 120000);
    });

    //dernière partie
    socket.on('confrontation suspects', (data) => {
      console.log(playerInfo);
      playerListe = data.playerListe;
      if (perso == 'fantom') {
        //ajoute le menu du choix du coupable
        playerInfo.forEach ( function (item, numJoueur, array) {
          //déplace le pion intuition
          item.jeton.appendChild(item.intuition);
          contextmenu(item.jeton, [9, 13]);
        });
      } else {
        playerListe.forEach ( function (item, numJoueur, array) {
          console.log(item);
          if (item && item.joue != 'fantom') {
            //supprime les cartes vision
            var divElement = document.getElementById(numJoueur).parentNode;
            for (var i = 0; i < divElement.children.length; i) {
              console.log(divElement.children[i]);
              if ( !divElement.children[i].id ) {
                divElement.removeChild(divElement.children[i]);
              } else {
                i++;
              }
            }

            //ajoute la carte trouvé : carteDiv.id = nomObjet + numCartes; var idCartesSuspect = ['personnages', 'cartesLieux', 'cartesObjet'];
            if (playerInfo[numJoueur].position) {
              divElement.appendChild( document.getElementById( idCartesSuspect[ playerInfo[numJoueur].position ] + playerListe[numJoueur].find[ positionPlateau[ playerInfo[numJoueur].position ] ] ) );
              playerInfo[numJoueur].position = playerListe[numJoueur].position;
              //déplace le pion intuition
              document.getElementById(numJoueur).appendChild(playerInfo[numJoueur].intuition);
              //vérifie les votes
              for (var j = 0; playerInfo[numJoueur].intuition.children.length > 1 ; j++) {
                playerInfo[numJoueur].intuition.removeChild(playerInfo[numJoueur].intuition.children[i]);
              }
            }
          }
        });
        //déplacer le chat
        jeux.appendChild(textAffiche);
        //supprimer  le champ position
        jeux.removeChild(positionVoyant);
        //affiche les carte des voyant
        div.classList.remove('couper');
      }
    });


    send.addEventListener('submit', (event) => {
      event.preventDefault();
      /**
      Au clic de souris sur l'élément HTML considéré
      on envoi un message à travers la connexion WebSocket.
      **/
      if (message.value) {
        if (perso != 'fantom' || perso == undefined) {
          socket.emit('chat', { room: room, username: username, texte: message.value });
          addChat(username + ' a dit: ' + message.value, 10000);
        } else {
          addChat('en tant que fantome vous ne pouvez plus parler.', 20000);
        }
      } else {
        pseudo.placeholder = 'Veuillez saisir au minumum un caractère';
      }
    });

    /**
    On attache un gestionnaire d'évènement à un évènement personnalisé 'mysterium'
    qui correspond à un événement déclaré coté serveur qui est déclenché lorsqu'un message
    a été reçu en provenance du serveur WebSocket.
    **/
    socket.on('mysterium', (data) => {
      /**
      A chaque message reçu, on affiche les données
      obtenues dans la console du navigateur Internet.
      **/
      // un joueur à choisi un personnage
      if (data.choisPerso) {
        //le fantome a déjà été choisi
        if (!data.fantom) {
          //si le joueur à envoyé le message
          if ((data.numPlayer == numPlayer)) {
            if (data.perso == 'fantom' || nbPlayer > 3) {
              //parcour la liste des liens pour les supprimer
              for (var i = 1; i < HTMLaElement.length; i) {
                status = HTMLaElement[i].getAttribute('href');
                if (status != '/regles') {
                  HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
                }
              }
              perso = data.perso;
            } else {
              //parcour la liste des lien
              for (var i = 0; i < HTMLaElement.length; i++) {
                var status = HTMLaElement[i].getAttribute('href');
                if (status == data.perso){
                  HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
                  addChat(data.username + ' a selectionner un personnage.', 20000);
                }
              }
              if (perso) {
                perso2 = data.perso;
              } else {
                perso = data.perso;
              }
            }
            //ajoute le choix de la difficulté si il s'agit du fantom
            if (data.perso == 'fantom') {
              var li = document.createElement('li');
              var newContent = document.createTextNode('Choisissez la difficulté');
              li.appendChild(newContent); //add the text node to the newly created div.
              difficult.appendChild(li);

              facileLI = document.createElement('li');
              difficult.appendChild(facileLI);
              var newContent = document.createTextNode('facile');
              facileLI.appendChild(newContent); //add the text node to the newly created div.
              facileLI.addEventListener('click', () => {level(1)});

              moyenLI = document.createElement('li');
              difficult.appendChild(moyenLI);
              var newContent = document.createTextNode('moyen');
              moyenLI.appendChild(newContent); //add the text node to the newly created div.
              moyenLI.addEventListener('click', () => {level(2)});

              difficileLI = document.createElement('li');
              difficult.appendChild(difficileLI);
              var newContent = document.createTextNode('difficile');
              difficileLI.appendChild(newContent); //add the text node to the newly created div.
              difficileLI.addEventListener('click', () => {level(3)});

              var br = document.createElement('br');
              difficult.appendChild(br);
            }
          } else {
            //parcour la liste des lien
            for (var i = 0; i < HTMLaElement.length; i++) {
              var status = HTMLaElement[i].getAttribute('href');
              if (status == data.perso){
                HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
                addChat(data.username + ' a selectionné un personnage.', 20000);
              }
            }
          }
        } else {
          addChat(data.username + ' a selectionné un personnage. vous devez selectionner le fantôme en premier', 20000);
        }
      }
    });

    /**
    On attache un gestionnaire d'évènement à un évènement personnalisé 'mysterium'
    qui correspond à un événement déclaré coté serveur qui est déclenché lorsqu'un message
    a été reçu en provenance du serveur WebSocket.
    **/
    socket.on('chatMysterium', (data) => {
      /**
      A chaque message reçu, on affiche les données
      obtenues dans la console du navigateur Internet.
      **/
      if (username != data.username) {
        addChat(data.username + ' a dit: ' + data.texte, 10000);
      }
    });

    //reception des cartes vision.
    socket.on('receive card', (data) => {

      //si le joueur joue le fantom
      if (perso == 'fantom') {
        cartes.vision = data;
        vision.innerHTML = '';
        //mise à jour des cartes visions
        for (var i = 0; i < cartes.vision.length; i++) {
          visionFantom(vision, i);
        }
        jeux.insertBefore(vision, navigation);
        if (data.endTour) {
          time = 120000;
          endtour();
          addChat('tous les personnages ont eu leurs cartes', 20000);
        }
      } else {
        playerListe[data.joueur].vision = data.vision
        for (var numeroCarte = 0; numeroCarte < playerListe[data.joueur].vision.length; numeroCarte++) {
          //créeation des éléments et ajout des cartes
          var visionPetit = document.createElement('img');
          var visionGrand = document.createElement('img');
          var carte = document.createElement('div');

          //ajout des src
          visionPetit.src = 'image/spriteVisions.png';
          visionGrand.src = 'image/carte vision/' + playerListe[data.joueur].vision[numeroCarte].src;

          //ajout des class
          visionPetit.classList.add('image', 'index1');
          visionGrand.classList.add('image', 'start', 'grandeCarte');
          carte.classList.add('div', 'couper', 'carte', 'index1');

          //positionnement
          visionPetit.style.left = playerListe[data.joueur].vision[numeroCarte].left;
          visionPetit.style.top = playerListe[data.joueur].vision[numeroCarte].top;
          carte.style.width = playerListe[data.joueur].vision[numeroCarte].width;
          carte.style.height = playerListe[data.joueur].vision[numeroCarte].height;

          //ajout dans le document
          carte.appendChild(visionPetit);
          document.getElementById(data.joueur).parentNode.appendChild(carte);
          jeux.appendChild(visionGrand);

          //ajout des événements
          afficheImage(visionPetit, visionGrand);
          afficheImage(visionGrand, visionGrand);
        }

        if (data.endTour) {
          time = 120000;
          endtour();
          addChat('tous les personnages ont eu leurs cartes vision.', 20000);
          addChat('Il vous reste 2 minutes pour positionner votre pion intuition et vos jetons intuition.', 20000);
        }
      }
    });

    //selection de la difficulté
    socket.on('levelSelect', (data) => {
      if (username != data.username) {
        console.log(data.level);
        console.log(niveau[data.level - 1]);
        console.log(data.username + ' a selectionné la difficulté : ' + niveau[data.level - 1]);
        addChat(data.username + ' a selectionné la difficulté : ' + niveau[data.level - 1], 20000);
      }
      //début de la partie
      if (data.start){
        tour = data.tour;
        corbeau = data.corbeau;
        // debutPartie ();
      }
    });

    //fin d'un tour
    socket.on('end turn', (data) => {
      playerListe = data.playerListe;
      tour = data.tour;
      if (perso == 'fantom') {
        corbeauUse = true;
      }
      endTurn ();
    });

    //dernier choix des joueurs
    socket.on('last choice', (data) => {
      console.log(data);
      if ( perso != 'fantom'){
        var div = document.createElement('div');
        div.classList.add('div');
        div.style.top = '565px';
        data.vision.forEach(function(cartes, index, array) {
          //créeation des éléments et ajout des cartes
          var visionPetit = document.createElement('img');
          var visionGrand = document.createElement('img');
          var carte = document.createElement('div');

          //ajout des src
          visionPetit.src = 'image/spriteVisions.png';
          visionGrand.src = 'image/carte vision/' + cartes.src;

          //ajout des class
          visionPetit.classList.add('image', 'index1');
          visionGrand.classList.add('image', 'start', 'grandeCarte');
          carte.classList.add('div', 'couper', 'carte', 'index1');

          //positionnement
          visionPetit.style.left = cartes.left;
          visionPetit.style.top = cartes.top;
          carte.style.width = cartes.width;
          carte.style.height = cartes.height;

          //ajout dans le document
          carte.appendChild(visionPetit);
          div.appendChild(carte);
          jeux.appendChild(visionGrand);

          //ajout des événements
          afficheImage(visionPetit, visionGrand);
          afficheImage(visionGrand, visionGrand);
        });
        jeux.appendChild(div);
        for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
          if ( playerListe[numJoueur].joue != 'fantom') {
            contextmenu(document.getElementById(numJoueur), [14]);
          }
        }
      }
      // visionLast ();
    });

    //affiche la position du joueur
    socket.on('positionVoyant', (data) => {
      //le fantome ne vois pas le chois du joueur
      if (perso != 'fantom' && numPlayer != data.numPlayer) {
        document.getElementById(progressionVoyant[playerListe[data.numPlayer].position] + data.numCartes).parentNode.insertBefore(playerInfo[data.numPlayer].intuition, document.getElementById(progressionVoyant[playerListe[data.numPlayer].position] + data.numCartes).children[0]);
        playerInfo[data.numPlayer].choisCarte = data.position;
      }
    });

    //affiche un message de fin de tour.
    function endtour () {
      var temps;
      if (time > 10000) {
        temps = 10000;
        addChat('il vous reste: ' + time / 1000 + 's pour choisir.', temps);
        time = time - 10000;
      } else {
        temps = 1000;
        addChat('il vous reste: ' + time / 1000 + 's pour choisir.', temps);
        time = time - 1000;
      }
      if (time > 0) {
        window.setTimeout(function(){endtour()}, temps);
      }
    };

    //fonction ajouter message
    var addChat = (mes, times) => {
      // create a new div element
      // and give it some content
      var p = document.createElement('p');
      var newContent = document.createTextNode(mes);
      p.appendChild(newContent); //add the text node to the newly created div.
      chat.appendChild(p);
      window.setTimeout(function(){p.parentNode.removeChild(p);}, times);
    };

    //chois de la difficulté
    var level = (level) => {
      niveau = level;
      socket.emit('level', {room: room, username: username, level: level});
      facileLI.parentNode.removeChild(facileLI);
      moyenLI.parentNode.removeChild(moyenLI);
      difficileLI.parentNode.removeChild(difficileLI);
      addChat('vous avez selectionné la difficulté : ' + niveau[level - 1], 100000);
    };

    function endTurn() {
      //suppression des class
      aiguilleHeure.classList.remove(heureTour[tour - 1].div);
      aiguille.classList.remove(heureTour[tour - 1].img);

      //ajout des class
      aiguilleHeure.classList.add(heureTour[tour].div);
      aiguille.classList.add(heureTour[tour].img);

      if ( perso == 'fantom' ) {
        for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
          if (playerListe[numJoueur].joue != 'fantom') {
            //positionne les pions intuition
            if (playerListe[numJoueur].position < 4) {
              progression[numJoueur][playerListe[numJoueur].position].insertBefore(playerInfo[numJoueur].intuition, progression[numJoueur][playerListe[numJoueur].position].children[progression[numJoueur][playerListe[numJoueur].position].children.length - 1]);
            } else {
              document.getElementById(progressionVoyant[playerListe[numJoueur].position] + numJoueur).appendChild(playerInfo[numJoueur].intuition);
            }
          }
        }
        choisCarte = {vision : [], listesJoueur : []};
      } else {
        for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
          if (playerListe[numJoueur].joue != 'fantom') {
            //met à jour les points des joueurs
            playerInfo[numJoueur].carreJoueur.classList.remove(playerInfo[numJoueur].nbPoint);
            playerInfo[numJoueur].carreJoueur.classList.add('nbPoint' + playerListe[numJoueur].nbPoint);
            playerInfo[numJoueur].nbPoint = ('nbPoint' + playerListe[numJoueur].nbPoint);

            //met à jour les cartes trouvé
            console.log('ancienne position: ' + playerInfo[numJoueur].position);
            console.log('nouvel position: ' + playerListe[numJoueur].position);
            if ( playerListe[numJoueur].position > playerInfo[numJoueur].position ) {
              //supprime les cartes vision
              var divElement = document.getElementById(numJoueur).parentNode;
              for (var i = 0; i < divElement.children.length; i) {
                if ( !divElement.children[i].id ) {
                  divElement.removeChild(divElement.children[i]);
                } else {
                  i++;
                }
              }
              //ajoute la carte trouvé : carteDiv.id = nomObjet + numCartes; var idCartesSuspect = ['personnages', 'cartesLieux', 'cartesObjet'];
              console.log(idCartesSuspect[ playerInfo[numJoueur].position ]);
              console.log(playerListe[numJoueur].find[ positionPlateau[ playerInfo[numJoueur].position ] ]);
              console.log(document.getElementById( idCartesSuspect[ playerInfo[numJoueur].position ] + playerListe[numJoueur].find[ positionPlateau[ playerInfo[numJoueur].position ] ] ));
              divElement.appendChild( document.getElementById( idCartesSuspect[ playerInfo[numJoueur].position ] + playerListe[numJoueur].find[ positionPlateau[ playerInfo[numJoueur].position ] ] ) );
              playerInfo[numJoueur].position = playerListe[numJoueur].position;

            }
            //déplace le pion intuition
            if (playerListe[numJoueur].position < 4) {
              progression[playerListe[numJoueur].position].insertBefore(playerInfo[numJoueur].intuition, progression[playerListe[numJoueur].position].children[progression[playerListe[numJoueur].position].children.length - 1]);
            } else {
              document.getElementById(numJoueur).appendChild(playerInfo[numJoueur].intuition);
            }
            //vérifie les votes
            for (var i = 0; playerInfo[numJoueur].intuition.children.length > 1 ; i++) {
              playerInfo[numJoueur].intuition.removeChild(playerInfo[numJoueur].intuition.children[i]);
            }
          }
        }
      }
    }

    function debutPartie (){
      console.log('début de partie');
      //supression des éléments innutils
      difficult.parentNode.removeChild(difficult);

      for (var i = 0; i < debut.length; i) {
        debut[i].parentNode.removeChild(debut[0]);
      }
      //nav et send à déplacer
      textAffiche.classList.remove('div');
      textAffiche.classList.add('textAffiche');
      ecran.classList.add('image', 'background');
      jeux.appendChild(ecran);

      //création des éléments
      div = document.createElement('div');
      heure = document.createElement('div');
      vision = document.createElement('div');
      aiguille = document.createElement('img');
      aiguilleHeure = document.createElement('div');
      var position = document.createElement('div');
      var horloge = document.createElement('img');

      //ajout des class
      heure.classList.add('image', 'heure', 'couper');
      if (tour = 8) {
        tour = 7;
      }
      aiguilleHeure.classList.add('image', 'couper', heureTour[tour].div);
      aiguille.classList.add('image', heureTour[tour].img);
      position.classList.add('position');
      horloge.classList.add('horloge');

      //ajout des images
      aiguille.src = 'image/plateau.png';
      horloge.src = 'image/plateau.png';

      //ajout des éléments
      aiguilleHeure.appendChild(aiguille);
      heure.appendChild(horloge);
      heure.appendChild(aiguilleHeure);
      jeux.insertBefore(position, ecran);
      deconnection.classList.remove('image');
      deconnection.classList.add('div');
      div.classList.add('avatar');
      vision.classList.add('div');

      //si le joueur joue le fantom
      if (perso == 'fantom') {
        navigation.style.top = '722px';
        position.classList.remove('position');
        position.classList.add('div');
        position.appendChild(heure);
        var numCartes = 0;
        for (var i = 1; i <= nbPlayer; i++) {
          //ajoute les voyant et leurs cartes
          if (playerListe[i].joue != 'fantom') {
            carteFantom(div, i, numCartes);
            numCartes++;
          }
        }
        cartes.vision.forEach(function (item, index, array) {
          visionFantom(vision, index);
        });
        if (niveau == 2) {
          var divCorbeau1 = document.createElement('div');
          var imageCorbeau1 = document.createElement('img');
          var divCorbeau2 = document.createElement('div');
          var imageCorbeau2 = document.createElement('img');
          var divCorbeau3 = document.createElement('div');
          var imageCorbeau3 = document.createElement('img');

          divCorbeau1.classList.add('image', 'couper', 'corbeauDivTrois');
          imageCorbeau1.classList.add('image', 'corbeauTrois');
          divCorbeau2.classList.add('image', 'couper', 'corbeauDivDeu');
          imageCorbeau2.classList.add('image', 'corbeauDeux');
          divCorbeau3.classList.add('image', 'couper', 'corbeauUn');
          imageCorbeau3.classList.add('image', 'corbeauDivUn');

          imageCorbeau1.src = 'image/sprite plateau fantom.png';
          imageCorbeau2.src = 'image/sprite plateau fantom.png';
          imageCorbeau3.src = 'image/sprite plateau fantom.png';

          divCorbeau1.appendChild(imageCorbeau1);
          position.appendChild(divCorbeau1);
          divCorbeau2.appendChild(imageCorbeau2);
          position.appendChild(divCorbeau2);
          divCorbeau3.appendChild(imageCorbeau3);
          position.appendChild(divCorbeau3);

          contextmenu(divCorbeau1, [5]);
          contextmenu(divCorbeau2, [5]);
          contextmenu(divCorbeau3, [5]);
        } else {
          var divCorbeau = document.createElement('div');
          var imageCorbeau = document.createElement('img');

          divCorbeau.classList.add('couper', 'corbeauDivTrois');
          imageCorbeau.classList.add('image', 'corbeauTrois');

          imageCorbeau.src = 'image/sprite plateau fantom.png';

          divCorbeau.appendChild(imageCorbeau);
          position.appendChild(divCorbeau);

          contextmenu(divCorbeau, [5]);
        }
        jeux.insertBefore(div, navigation);
      } else {
        //mise en place des voyants
        navigation.style.position = 'relative';
        navigation.style.float = 'left';
        navigation.style.width = 0;
        navigation.style.top = 0;
        navigation.style.left = 0;
        textAffiche.classList.add('div');
        textAffiche.style.top = '40px';
        navigation.classList.add('div');
        textAffiche.classList.remove('textAffiche');
        div.classList.remove('avatar');
        div.classList.add('avatarVoyant', 'index1', 'couper');
        //affichage des voyant
        playerListe.forEach (function(item, index, array) {
          if (item && item.joue != 'fantom') {
            console.log(item);
            if (!playerInfo[index]) {
              playerInfo[index] = {};
            }
            playerInfo[index].position = parseInt(item.position);
            console.log(playerInfo[index].position);
            avatarVoyant(div, index, (item.joue - 1));
          }
        });
        console.log(playerInfo);
        //vérifie si il s'agit de la fase des suspects
        if (suspect) {
          //affiche les carte des voyant
          div.classList.remove('couper');
          //ajout des points si 4 joueur ou plus
          if (nbPlayer > 3) {
            var point = document.createElement('div');
            var pointInt = document.createElement('div');
            var point6 = document.createElement('img');

            point.classList.add('div', 'point', 'index2');
            pointInt.classList.add('image', 'pointInt', 'index2');
            point6.classList.add('image', 'point6', 'index2');
            point6.src = 'image/plateau.png';
            pointInt.appendChild(point6);

            //ajout du plateau de point à plus de 6 joueur
            if (nbPlayer < 6) {
              var point4 = document.createElement('img');
              point4.classList.add('image', 'point4', 'index2');
              point4.src = 'image/plateau.png';
              pointInt.appendChild(point4);
            }
            point.appendChild(pointInt);
            //parcour la liste des joueurs pour afficher leur points
            for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
              if (playerListe[numJoueur].joue != 'fantom') {
                createPoint(numJoueur, point);
              }
            }
          }
          jeux.appendChild(div);
          //place les pions intuition
          for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
            if (playerListe[numJoueur].joue != 'fantom') {
              pionsIntuition(numJoueur);
            }
          }
          if (nbPlayer > 3) {
            jeux.appendChild(point);
          }
          jeux.appendChild(textAffiche);
        } else {
          positionVoyant = document.createElement('div');
          var personnage = document.createElement('div');
          var personnageDiv = document.createElement('div');
          var personnageImage = document.createElement('img');
          var personnage1 = document.createElement('div');
          var personnage2 = document.createElement('div');
          var lieux = document.createElement('div');
          var lieuxDiv = document.createElement('div');
          var lieuxImage = document.createElement('img');
          var lieux1 = document.createElement('div');
          var lieux2 = document.createElement('div');
          var objet = document.createElement('div');
          var objetDiv = document.createElement('div');
          var objetImage = document.createElement('img');
          var objet1 = document.createElement('div');

          positionVoyant.classList.add('position');
          personnage.classList.add('div', 'centre');
          personnageDiv.classList.add('image', 'positionJoueur', 'couper');
          personnageImage.classList.add('image');
          personnage1.classList.add('div', 'index2');
          personnage2.classList.add('div', 'index2');
          lieux.classList.add('div', 'centre');
          lieuxDiv.classList.add('image', 'positionJoueur', 'couper');
          lieuxImage.classList.add('image', 'lieu');
          lieux1.classList.add('div', 'index2');
          lieux2.classList.add('div', 'index2');
          objet.classList.add('div', 'centre');
          objetDiv.classList.add('image', 'positionJoueur', 'couper');
          objetImage.classList.add('image', 'objet');
          objet1.classList.add('div', 'index2');

          lieux2.style.width = '385px';

          personnageImage.src = 'image/plateau.png';
          lieuxImage.src = 'image/plateau.png';
          objetImage.src = 'image/plateau.png';

          personnageDiv.appendChild(personnageImage);
          personnage.appendChild(personnageDiv);
          lieuxDiv.appendChild(lieuxImage);
          lieux.appendChild(lieuxDiv);
          objetDiv.appendChild(objetImage);
          objet.appendChild(objetDiv);
          positionVoyant.appendChild(personnage);
          positionVoyant.appendChild(personnage1);
          positionVoyant.appendChild(personnage2);
          positionVoyant.appendChild(lieux);
          positionVoyant.appendChild(lieux1);
          positionVoyant.appendChild(lieux2);
          positionVoyant.appendChild(objet);
          positionVoyant.appendChild(objet1);

          progression[1] = personnage;
          progression[2] = lieux;
          progression[3] = objet;

          //parcour la liste des cartes pour les afficher
          for (var numCartes = 0; numCartes < cartes.personnages.length; numCartes++) {
            if (numCartes < 5) {
              carteVoyant(numCartes, personnage1, 'personnages', 'personnage', 1);
            } else {
              carteVoyant(numCartes, personnage2, 'personnages', 'personnage', 1);
            }
          }
          for (var numCartes = 0; numCartes < cartes.cartesLieux.length; numCartes++) {
            if (numCartes < 5) {
              carteVoyant(numCartes, lieux1, 'cartesLieux', 'lieu', 2);
            } else {
              carteVoyant(numCartes, lieux2, 'cartesLieux', 'lieu', 2);
            }
          }
          for (var numCartes = 0; numCartes < cartes.cartesObjet.length; numCartes++) {
            carteVoyant(numCartes, objet1, 'cartesObjet', 'objet', 3);
          }

          heure.classList.remove('image');
          heure.classList.add('carte');
          personnage2.appendChild(heure);
          lieux2.appendChild(deconnection);
          lieux2.appendChild(navigation);
          lieux2.appendChild(textAffiche);
          //ajout des points si 4 joueur ou plus
          if (nbPlayer > 3) {
            var point = document.createElement('div');
            var pointInt = document.createElement('div');
            var point6 = document.createElement('img');

            point.classList.add('div', 'point', 'index2');
            pointInt.classList.add('image', 'pointInt', 'index2');
            point6.classList.add('image', 'point6', 'index2');
            point6.src = 'image/plateau.png';
            pointInt.appendChild(point6);

            //ajout du plateau de point à plus de 6 joueur
            if (nbPlayer < 6) {
              var point4 = document.createElement('img');
              point4.classList.add('image', 'point4', 'index2');
              point4.src = 'image/plateau.png';
              pointInt.appendChild(point4);
            }
            point.appendChild(pointInt);
            //parcour la liste des joueurs pour afficher leur points
            for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
              if (playerListe[numJoueur].joue != 'fantom') {
                createPoint(numJoueur, point);
              }
            }
          }
          jeux.appendChild(div);
          //place les pions intuition
          for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
            if (playerListe[numJoueur].joue != 'fantom') {
              pionsIntuition(numJoueur);
            }
          }
          jeux.appendChild(positionVoyant);
          if (nbPlayer > 3) {
            jeux.appendChild(point);
          }
        }
      }
      jeux.appendChild(vision);
    }

    //créé les pions intuition
    function pionsIntuition (numJoueur) {
      if (!playerInfo[numJoueur]) {
        playerInfo[numJoueur] = {};
      }
      playerInfo[numJoueur].intuition = document.createElement('div');
      var divIntuition = document.createElement('div');
      var intuition = document.createElement('img');
      intuition.classList.add(jetonPoint[playerListe[numJoueur].joue].couleur, 'image');
      divIntuition.classList.add(jetonPoint[playerListe[numJoueur].joue].couleur + 'intuition', 'couper');
      playerInfo[numJoueur].intuition.classList.add('div', 'zindex2', 'padding');
      intuition.src = '../image/plateau.png';
      divIntuition.appendChild(intuition);
      playerInfo[numJoueur].intuition.appendChild(divIntuition);
      if ( playerListe[numJoueur].position < 4 ) {
        progression[playerListe[numJoueur].position].insertBefore(playerInfo[numJoueur].intuition, progression[playerListe[numJoueur].position].children[progression[playerListe[numJoueur].position].children.length - 1]);
      } else {
        console.log(numJoueur);
        document.getElementById(numJoueur).appendChild(playerInfo[numJoueur].intuition);
      }
      if ( (nbPlayer > 3) && (numPlayer != numJoueur) ) {
        contextmenu(intuition, [0, 1], numJoueur);
      }
    };

    //affichage des cartes des joueur pour le fantom
    function carteFantom (div, numPlayer, numCartes) {
      //création des éléments et ajout des cartes
      var voyant = document.createElement('div');
      if (!playerInfo[numPlayer]) {
        playerInfo[numPlayer] = {};
      }
      playerInfo[numPlayer].jeton = document.createElement('div');
      var jeton = playerInfo[numPlayer].jeton;
      var image = document.createElement('img');
      var persoPetit = document.createElement('img');
      var persoGrand = document.createElement('img');
      var lieuxPetit = document.createElement('img');
      var lieuxGrand = document.createElement('img');
      var objetPetit = document.createElement('img');
      var objetGrand = document.createElement('img');
      var perso = document.createElement('div');
      var lieux = document.createElement('div');
      var objet = document.createElement('div');
      playerInfo[numPlayer].intuition = document.createElement('div');
      var divIntuition = document.createElement('div');
      var intuition = document.createElement('img');

      //ajout des src
      persoPetit.src = 'image/sprite carte.png';
      lieuxPetit.src = 'image/sprite carte.png';
      objetPetit.src = 'image/sprite carte.png';
      persoGrand.src = 'image/carte personnage/' + cartes.personnages[numCartes].src;
      lieuxGrand.src = 'image/carte lieu/' + cartes.cartesLieux[numCartes].src;
      objetGrand.src = 'image/carte objet/' + cartes.cartesObjet[numCartes].src;
      image.src = 'image/sprite plateau fantom.png';
      intuition.src = '../image/plateau.png';

      //ajout des class
      persoPetit.classList.add('image');
      lieuxPetit.classList.add('image');
      objetPetit.classList.add('image');
      persoGrand.classList.add('image', 'start', 'grandeCarte');
      lieuxGrand.classList.add('image', 'start', 'grandeCarte');
      objetGrand.classList.add('image', 'start', 'grandeCarte');
      perso.classList.add('couper', 'carte');
      lieux.classList.add('couper', 'carte');
      objet.classList.add('couper', 'carte');
      image.classList.add('image', joueur[playerListe[numPlayer].joue - 1]);
      jeton.classList.add('div', 'jetonFantome', 'couper');
      voyant.classList.add('div', 'voyant');
      intuition.classList.add(jetonPoint[playerListe[numPlayer].joue].couleur, 'image');
      divIntuition.classList.add(jetonPoint[playerListe[numPlayer].joue].couleur + 'intuition', 'couper');
      playerInfo[numPlayer].intuition.classList.add('div', 'zindex2', 'padding');

      //positionnement
      persoPetit.style.left = cartes.personnages[numCartes].left;
      persoPetit.style.top = cartes.personnages[numCartes].top;
      perso.style.width = cartes.personnages[numCartes].width;
      perso.style.height = cartes.personnages[numCartes].height;

      lieuxPetit.style.left = cartes.cartesLieux[numCartes].left;
      lieuxPetit.style.top = cartes.cartesLieux[numCartes].top;
      lieux.style.width = cartes.cartesLieux[numCartes].width;
      lieux.style.height = cartes.cartesLieux[numCartes].height;

      objetPetit.style.left = cartes.cartesObjet[numCartes].left;
      objetPetit.style.top = cartes.cartesObjet[numCartes].top;
      objet.style.width = cartes.cartesObjet[numCartes].width;
      objet.style.height = cartes.cartesObjet[numCartes].height;

      //ajout d'id
      perso.id = 'personnage' + numPlayer;
      lieux.id = 'lieux' + numPlayer;
      objet.id = 'objet' + numPlayer;
      jeton.id = numPlayer;

      //ajout dans le document
      jeton.appendChild(image);
      voyant.appendChild(jeton);
      div.appendChild(voyant);

      perso.appendChild(persoPetit);
      lieux.appendChild(lieuxPetit);
      objet.appendChild(objetPetit);
      voyant.appendChild(perso);
      voyant.appendChild(lieux);
      voyant.appendChild(objet);
      jeux.appendChild(persoGrand);
      jeux.appendChild(lieuxGrand);
      jeux.appendChild(objetGrand);

      divIntuition.appendChild(intuition);
      playerInfo[numPlayer].intuition.appendChild(divIntuition);
      progression[numPlayer] = [];
      progression[numPlayer][1] = perso;
      progression[numPlayer][2] = lieux;
      progression[numPlayer][3] = objet;
      if (playerListe[numPlayer].position < 4) {
        progression[numPlayer][playerListe[numPlayer].position].insertBefore(playerInfo[numPlayer].intuition, progression[numPlayer][playerListe[numPlayer].position].children[progression[numPlayer][playerListe[numPlayer].position].children.length - 1]);
      } else {
        jeton.appendChild(playerInfo[numPlayer].intuition);
      }

      //ajout des événements
      afficheImage(persoPetit, persoGrand);
      afficheImage(persoGrand, persoGrand);
      afficheImage(lieuxPetit, lieuxGrand);
      afficheImage(lieuxGrand, lieuxGrand);
      afficheImage(objetPetit, objetGrand);
      afficheImage(objetGrand, objetGrand);
      if (suspect) {
        contextmenu(playerInfo[numPlayer].jeton, [9, 13]);
      } else {
        contextmenu(jeton, [2]);
      }

    };

    //affichage des cartes des voyants
    function carteVoyant (numCartes, elementParent, nomObjet, chemin, position) {
      //créeation des éléments et ajout des cartes
      var cartePetit = document.createElement('img');
      var carteGrand = document.createElement('img');
      var carteDiv = document.createElement('div');

      //ajout des src
      cartePetit.src = 'image/sprite carte.png';
      carteGrand.src = 'image/carte ' + chemin + '/' + cartes[nomObjet][numCartes].src;

      //ajout des class
      cartePetit.classList.add('image', 'index1');
      carteGrand.classList.add('image', 'start', 'grandeCarte');
      carteDiv.classList.add('couper', 'carte', 'index1');

      //positionnement
      cartePetit.style.left = cartes[nomObjet][numCartes].left;
      cartePetit.style.top = cartes[nomObjet][numCartes].top;
      carteDiv.style.width = cartes[nomObjet][numCartes].width;
      carteDiv.style.height = cartes[nomObjet][numCartes].height;

      //ajout d'id
      cartePetit.id = chemin + numCartes;
      carteDiv.id = nomObjet + numCartes;

      //ajout dans le document
      carteDiv.appendChild(cartePetit);
      elementParent.appendChild(carteDiv);
      jeux.appendChild(carteGrand);

      //ajout des événements
      afficheImage(cartePetit, carteGrand);
      afficheImage(carteGrand, carteGrand);
      contextmenu(cartePetit, [7], position, numCartes);

    };

    //affichage des cartes trouvées des joueur
    function cardFind (numJoueur, elementParent, nomObjet, chemin) {
      //créeation des éléments et ajout des cartes
      var cartePetit = document.createElement('img');
      var carteGrand = document.createElement('img');
      var carteDiv = document.createElement('div');

      //ajout des src
      cartePetit.src = 'image/sprite carte.png';
      carteGrand.src = 'image/carte ' + chemin + '/' + playerListe[numJoueur].find[nomObjet][0].src;

      //ajout des class
      cartePetit.classList.add('image', 'zindex2');
      carteGrand.classList.add('image', 'start', 'grandeCarte');
      carteDiv.classList.add('couper', 'carte', 'zindex2');

      //positionnement
      cartePetit.style.left = playerListe[numJoueur].find[nomObjet][0].left;
      cartePetit.style.top = playerListe[numJoueur].find[nomObjet][0].top;
      carteDiv.style.width = playerListe[numJoueur].find[nomObjet][0].width;
      carteDiv.style.height = playerListe[numJoueur].find[nomObjet][0].height;

      //ajout dans le document
      carteDiv.appendChild(cartePetit);
      elementParent.appendChild(carteDiv);
      jeux.appendChild(carteGrand);

      //ajout des événements
      afficheImage(cartePetit, carteGrand);
      afficheImage(carteGrand, carteGrand);

    };

    //position des voyant
    function avatarVoyant (div, numPlayer, numCartes) {
      //créeation des éléments et ajout des cartes
      var voyant = document.createElement('div');
      playerInfo[numPlayer].voyant = voyant;
      var jeton = document.createElement('div');
      var image = document.createElement('img');

      //ajout des src
      image.src = 'image/plateau.png';

      //ajout des class
      image.classList.add('image', 'index1');
      jeton.classList.add('etuit', 'couper', 'zindex2');
      voyant.classList.add('div', 'voyant', 'zindex1');

      //ajout d'id
      jeton.id = numPlayer;
      image.id = joueurVoyant[playerListe[numPlayer].joue - 1];

      if (playerListe[numPlayer].find) {
        if (playerListe[numPlayer].find.cartesPersonnages) {
          cardFind(numPlayer, voyant, 'cartesPersonnages', 'personnage');
        }
        if (playerListe[numPlayer].find.cartesLieux) {
          cardFind(numPlayer, voyant, 'cartesLieux', 'lieu');
        }
        if (playerListe[numPlayer].find.cartesObjet) {
          cardFind(numPlayer, voyant, 'cartesObjet', 'objet');
        }
      }

      //ajoute les cartes vision
      if (playerListe[numPlayer].vision) {
        for (var numeroCarte = 0; numeroCarte < playerListe[numPlayer].vision.length; numeroCarte++) {
          //création des éléments et ajout des cartes
          var visionPetit = document.createElement('img');
          var visionGrand = document.createElement('img');
          var carte = document.createElement('div');

          //ajout des src
          visionPetit.src = 'image/spriteVisions.png';
          visionGrand.src = 'image/carte vision/' + playerListe[numPlayer].vision[numeroCarte].src;

          //ajout des class
          visionPetit.classList.add('image', 'zindex1');
          visionGrand.classList.add('image', 'start', 'grandeCarte');
          carte.classList.add('div', 'couper', 'carte', 'index2');

          //positionnement
          visionPetit.style.left = playerListe[numPlayer].vision[numeroCarte].left;
          visionPetit.style.top = playerListe[numPlayer].vision[numeroCarte].top;
          carte.style.width = playerListe[numPlayer].vision[numeroCarte].width;
          carte.style.height = playerListe[numPlayer].vision[numeroCarte].height;

          //ajout dans le document
          carte.appendChild(visionPetit);
          voyant.appendChild(carte);
          jeux.appendChild(visionGrand);

          //ajout des événements
          afficheImage(visionPetit, visionGrand);
          afficheImage(visionGrand, visionGrand);
        }
      }

      //ajout dans le document
      jeton.appendChild(image);
      voyant.insertBefore(jeton, voyant.children[0]);
      div.appendChild(voyant);

      //ajout des événements
      contextmenu(jeton, [6]);
    };

    //affichage des cartes vision pour le fantom
    function visionFantom (vision, numCartes) {
      //créeation des éléments et ajout des cartes
      var visionPetit = document.createElement('img');
      var visionGrand = document.createElement('img');
      var carte = document.createElement('div');

      //ajout des src
      visionPetit.src = 'image/spriteVisions.png';
      visionGrand.src = 'image/carte vision/' + cartes.vision[numCartes].src;

      //ajout des class
      visionPetit.classList.add('image');
      visionGrand.classList.add('image', 'start', 'grandeCarte');
      carte.classList.add('div', 'couper', 'carte');

      //positionnement
      visionPetit.style.left = cartes.vision[numCartes].left;
      visionPetit.style.top = cartes.vision[numCartes].top;
      carte.style.width = cartes.vision[numCartes].width;
      carte.style.height = cartes.vision[numCartes].height;

      //ajout d'id
      carte.id = 'vision' + numCartes;

      //ajout dans le document
      carte.appendChild(visionPetit);
      vision.appendChild(carte);
      jeux.appendChild(visionGrand);

      //ajout des événements
      afficheImage(visionPetit, visionGrand);
      afficheImage(visionGrand, visionGrand);
      contextmenu(carte, [3,4], numCartes);

    };

    var xMousePosition = 0;
    var yMousePosition = 0;
    document.addEventListener('mousemove',(e) => {
      xMousePosition = e.clientX + window.pageXOffset;
      yMousePosition = e.clientY + window.pageYOffset;
    });

    //affiche les points des joueurs
    function createPoint (numJoueur, point) {
      if ( !playerInfo[numJoueur] ) {
        playerInfo[numJoueur] = {};
      }
      playerInfo[numJoueur].carreJoueur = document.createElement('div');
      var pointJoueur = document.createElement('div');
      playerInfo[numJoueur].carreJoueur.classList.add('image', 'pointCouleurDiv', 'index2');
      pointJoueur.classList.add('image', 'pointImage');
      playerInfo[numJoueur].carreJoueur.classList.add('nbPoint' + playerListe[numJoueur].nbPoint);
      playerInfo[numJoueur].nbPoint = ('nbPoint' + playerListe[numJoueur].nbPoint);
      console.log(playerListe[numJoueur]);
      console.log(playerListe[numJoueur].joue);
      console.log(jetonPoint[playerListe[numJoueur].joue]);
      pointJoueur.id = 'pointJoueur' + jetonPoint[playerListe[numJoueur].joue].numPlayer;
      playerInfo[numJoueur].carreJoueur.appendChild(pointJoueur);
      point.appendChild(playerInfo[numJoueur].carreJoueur);
    };


    function OK(id, numJoueur)
    {
      if (playerListe[numJoueur].vote == undefined) {
        playerListe[numJoueur].vote = [];
      }
      //vérifie que le joueur ne vote pas pour lui et qu'il peut voter
      if ( (numJoueur != numPlayer) && (playerListe[numPlayer].nbJetonOK > 0) ) {
        //si il a déjà voté lui rend ses point de vote
        if (playerListe[numJoueur].vote[numPlayer] === false) {
          playerListe[numPlayer].nbJetonNOK++;
        }
        //décrémente ses point de vote et ajoute son vote
        playerListe[numPlayer].nbJetonOK--;
        playerListe[numJoueur].vote[numPlayer] = true;
        socket.emit('vote', {numPlayer: numPlayer, ok: true, votePour: numJoueur, room: room});

        //ajoute du jeton intuition
        var jeton = document.createElement('div');
        var div = document.createElement('div');
        jeton.classList.add('ok' + jetonPoint[perso].couleur);
        div.classList.add('intuition' + jetonPoint[perso].couleur);
        div.appendChild(jeton);
        playerInfo[numJoueur].intuition.insertBefore(div, playerInfo[numJoueur].intuition.children[0]);
        contextmenu(div, [8], numJoueur, div);
      } else {
        addChat('vous ne pouvez pas voter', 20000);
      }
    };

    function NOK(id, numJoueur)
    {
      if (playerListe[numJoueur].vote == undefined) {
        playerListe[numJoueur].vote = [];
      }
      //vérifie que le joueur ne vote pas pour lui et qu'il peut voter
      if ( (numJoueur != numPlayer) && (playerListe[numPlayer].nbJetonNOK > 0) ) {
        //si il a déjà voté lui rend ses point de vote
        if (playerListe[numJoueur].vote[numPlayer] === true) {
          playerListe[numPlayer].nbJetonOK++;
        }
        //décrémente ses point de vote et ajoute son vote
        playerListe[numPlayer].nbJetonNOK--;
        playerListe[numJoueur].vote[numPlayer] = false;
        socket.emit('vote', {numPlayer: numPlayer, ok: false, votePour: numJoueur, room: room});

        //ajoute du jeton intuition
        var jeton = document.createElement('div');
        var div = document.createElement('div');
        jeton.classList.add('nok' + jetonPoint[perso].couleur);
        div.classList.add('intuition' + jetonPoint[perso].couleur);
        div.appendChild(jeton);
        playerInfo[numJoueur].intuition.insertBefore(div, playerInfo[numJoueur].intuition.children[0]);
        contextmenu(div, [8], numJoueur, div);
      } else {
        addChat('vous ne pouvez pas voter', 20000);
      }
    };

    function annul(element, numJoueur)
    {
      //vérifie si le joueur à voté
      if ( (playerListe[numJoueur].vote != undefined) && (numJoueur != numPlayer) && (playerListe[numJoueur].vote[numPlayer] != undefined) ) {
        //rajoute ses jeton de vote
        if (playerListe[numJoueur].vote[numPlayer]) {
          playerListe[numPlayer].nbJetonOK++;
        } else {
          playerListe[numPlayer].nbJetonNOK++;
        }
        //annule le vote
        playerListe[numJoueur].vote[numPlayer] = undefined;
        socket.emit('vote', {numPlayer: numPlayer, votePour: numJoueur, room: room});

        //suppression du jeton intuition
        element.parentNode.removeChild(element);
      } else {
        addChat('vous n\'avez pas voté', 20000);
      }
    };

    //choix du coupable et envoie de la vision
    function sendVision(perso)
    {
      if ( choisCoupable.vision[0] && choisCoupable.vision[1] && choisCoupable.vision[2] ) {
        console.log(choisCoupable.vision);
        socket.emit('final vision', {numPlayer: numPlayer, perso: choisCoupable.perso, vision: choisCoupable.vision, room: room});
      } else {
        addChat('Vous devez selectionner une carte vision pour le coupable, le lieux et l\'objet.', 20000);
      }
    };

    //choix du coupable
    function choixCoupable(perso)
    {
      socket.emit('vote joueur', {numPlayer: numPlayer, perso: perso.id, room: room});
      addChat('Vous avez selectionner le coupable numéro: ' + perso.id, 20000);
    };

    //choix du coupable
    function coupable(perso)
    {
      choisCoupable.perso = perso.id;
      for (var numCartes = 0; numCartes < 7; numCartes++) {
        contextmenu(document.getElementById('vision' + numCartes), [10, 11, 12], numCartes);
      }
    };

    //vision du personnage coupable
    function visionPerso(e, numVision)
    {
      console.log(numVision);
      choisCoupable.vision[0] = numVision;
    };

    //vision du lieux du meutre
    function visionLieux(e, numVision)
    {
      console.log(numVision);
      choisCoupable.vision[1] = numVision;
    };

    //vision de l'objet ayant servie à tué
    function visionObjet(e, numVision)
    {
      console.log(numVision);
      choisCoupable.vision[2] = numVision;
    };

    //envoyer les vision au personnage
    function envoieVision(numJoueur)
    {
      var verifiPresenceUneCarte = false;
      choisCarte.vision.forEach(function (item, index, array) {
        if (choisCarte.vision[index] != null) {
          verifiPresenceUneCarte = true;
        }
      });
      if ( verifiPresenceUneCarte ) {
        if (!choisCarte.listesJoueur.includes(numJoueur.id)) {
          choisCarte.listesJoueur.push(numJoueur.id);
          socket.emit('send card', {numPlayer: numPlayer, perso: numJoueur.id, choisCarte: choisCarte, room: room});
          choisCarte.vision = [];
        } else {
          addChat('vous avez déjà envoyé des cartes vision au joueur: ' + numJoueur.id, 20000);
        }
      } else {
        addChat('Vous devez selectionner au moins une carte vision.', 20000);
      }
    };

    //ajouter une carte vision
    function visionListe(e, numVision)
    {
      choisCarte.vision[numVision] = true;
    };

    //supprimer une carte vision
    function supVision(e, numVision)
    {
      if (choisCarte[numVision] != null) {
        choisCarte.vision[numVision] = null;
      } else {
        addChat('Cette carte n\'a pas été selectionnée', 20000);
      }
    };

    //changer les cartes vision
    function changeVision()
    {
      if ((corbeau > 0) && corbeauUse) {
        socket.emit('modify card', {room: room, numPlayer: numPlayer});
        corbeau--;
        corbeauUse = false;
      } else {
        addChat('Vous ne pouvez plus changer vos cartes', 20000);
      }
    };

    //affiche les cartes vision
    function voirCarte(element)
    {
      element.parentNode.parentNode.classList.toggle('couper');
    };

    //positionner le pion voyant
    function intuitionPosition(element, num, numCartes)
    {
      if(playerListe[numPlayer].position == num) {
        playerInfo[numPlayer].intuitionPosition = numCartes;
        element.parentNode.insertBefore(playerInfo[numPlayer].intuition, element.parentNode.children[0]);
        socket.emit('position', {numPlayer: numPlayer, numCartes: numCartes, room: room});
      } else {
        addChat('Vous ne pouvez pas choisir cette position', 20000);
      }
    };

    //affiche les images grande ou les cache
    var afficheImage = (element, hiddenShow) => {
      element.addEventListener('click', (event) => {clic(event)});
      function clic (event) {
        hiddenShow.classList.toggle('start');
      };
    };

    //ajoute un menu contextuel
    var contextmenu = function (element, arrayRightClic, num, numCartes) {
      element.addEventListener('contextmenu', (event) => {rightClic(event)});
      function rightClic (event){
        event.preventDefault();
        var x = document.getElementById('ctxmenu1');
        if(x) x.parentNode.removeChild(x);

        var d = document.createElement('div');
        d.setAttribute('class', 'ctxmenu');
        d.setAttribute('id', 'ctxmenu1');
        d.style.zIndex = 2;
        jeux.appendChild(d);
        d.style.left = xMousePosition + "px";
        d.style.top = yMousePosition + "px";
        d.addEventListener('mouseover', function (e) { this.style.cursor = 'pointer'; });
        d.addEventListener('click', function (e) { d.parentNode.removeChild(d);  });
        // document.body.addEventListener('click', function (e) { d.parentNode.removeChild(d);  });

        //liste du menu contextuel
        var menu = [function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { OK(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'OK';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { NOK(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'NOK';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { envoieVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Envoyez la(les) carte(s) vision selectionnée(s)';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionListe(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Ajoutez cette carte à la vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { supVision(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Supprimez la carte de la vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { changeVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Changez vos cartes vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { voirCarte(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Voir ou masquer les cartes vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { intuitionPosition(element, num, numCartes); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Positionnez votre jeton ici.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { annul(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Annulez votre vote ?';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { coupable(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Choisissez ce coupable.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionPerso(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Choisissez cette carte pour le coupable.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionLieux(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Choisissez cette carte pour le lieux.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionObjet(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Choisissez cette carte pour l\'objet.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { sendVision(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Envoyez la vision final.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { choixCoupable(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Choisissez ce coupable.';
          }];

        for (var i = 0; i < arrayRightClic.length; i++) {
          menu[arrayRightClic[i]](element, num, numCartes);
        }
        return false;
      }
    };
  });

  var joueur = ['joueurQuatre', 'joueurTrois', 'joueurDeux', 'joueurSix', 'joueurCinq', 'joueurUn'];
  var joueurVoyant = ['joueurNoir', 'joueurBleu', 'joueurJaune', 'joueurBlanc', 'joueurRouge', 'joueurMauve'];
  var heureTour = [,{div: 'ah1', img: 'a1'},{div: 'ah2', img: 'a2'},{div: 'ah3', img: 'a3'},{div: 'ah4', img: 'a4'},{div: 'ah5', img: 'a5'},{div: 'ah6', img: 'a6'},{div: 'ah7', img: 'a7'}];
  var jetonPoint = [,{couleur : 'noir', numPlayer : 'Quatre'}, {couleur : 'bleu', numPlayer : 'Trois'}, {couleur : 'jaune', numPlayer : 'Deux'}, {couleur : 'blanc', numPlayer : 'Six'}, {couleur : 'rouge', numPlayer : 'Cinq'}, {couleur : 'mauve', numPlayer : 'Un'}];
  var choisCarte = {vision : [], listesJoueur : []};
  var choisCoupable = {vision:[]};
  var corbeau, time;
  var corbeauUse = true;
  var progression = [];
  var progressionVoyant = [,'personnage', 'lieu', 'objet'];
  var positionPlateau = [,'cartesPersonnages', 'cartesLieux', 'cartesObjet'];
  var idCartesSuspect = [,'personnages', 'cartesLieux', 'cartesObjet'];

})(window, io);
