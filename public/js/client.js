(function(window, io){
  //Au chargement du document
  window.addEventListener('DOMContentLoaded',() => {

    var room, username, numPlayer, facileLI, moyenLI, difficileLI, perso, nbPlayer, cartes, div, heure, aiguille, aiguilleHeure, vision, tour, niveau;
    var playerListe = [];
    var playerInfo = [];
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');
    // var socket = io('http://10.1.1.174:8888/');

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
        console.log('je débute la partie');
        cartes = data.cartes;
        tour = data.tour;
        corbeau = data.corbeau;
        perso = data.joue;
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
        addChat(data.name + ' viens de ce connecter.');
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
          if (status == 'fantom') {
            var li = document.createElement('li');
            var newContent = document.createTextNode('Choisissait la difficultée');
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

          //parcour la liste des lien pour les supprimer
          for (var i = 1; i < HTMLaElement.length; i) {
            status = HTMLaElement[i].getAttribute('href');
            if (status != '/regles') {
              HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
            }
          }
        } else {
          window.open('http://www.samuelchristophe.com/', 'régles', strWindowFeatures);
        }
      });
    }

    //deconnect le joueur
    deconnection.addEventListener('submit', (event) => {
      event.preventDefault();
      socket.emit('disconnected', {room: room, username: username, numPlayer: numPlayer});
        addChat('la partie est terminé!');

    });

    socket.on('remove player', (data) => {
      if (data.end) {
        addChat('la partie est terminé suite au départ de ' + data.username + '!');
      } else {
        playerListe[numPlayer] = undefined;
        nbPlayer--;
      }
    });

    //partie perdu
    socket.on('end game', (data) => {
      if (data.end) {
        addChat('la partie est terminé ' + data.message + '!');
      } else {
        playerListe[numPlayer] = undefined;
        nbPlayer--;
      }
    });
    socket.on('confrontation suspects', (data) => {
      playerListe = data.playerListe;
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
          addChat(username + ' à dit: ' + message.value);
        } else {
          addChat('en tant que fantom vous ne pouvez plus parler.');
        }
      } else {
        pseudo.placeholder = 'Veuiller sésir au minumum un caractère';
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
          //parcour la liste des lien
          for (var i = 0; i < HTMLaElement.length; i++) {
            var status = HTMLaElement[i].getAttribute('href');
            if (status == data.perso){
              HTMLaElement[i].parentNode.removeChild(HTMLaElement[i]);
              addChat(data.username + ' à selectionner un personnage.');
            }
          }
          playerListe[data.numPlayer] = data.perso;
        } else {
          addChat(data.username + ' à selectionner un personnage. vous devez selectionner le fantome en premier');
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
        addChat(data.username + ' à dit: ' + data.texte);
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
          addChat('tous les personnage ont eux leurs cartes');
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
          time = 120;
          endtour();
          addChat('tous les personnage ont eux leurs cartes vision.');
          addChat('Il vous reste 2 minute pour positionner votre pion intuition et vos jetons intuition.');
        }
      }
    });

    //selection de la difficulté
    socket.on('levelSelect', (data) => {
      if (username != data.username) {
        addChat(data.username + ' a selectionné la difficultée : ' + niveau[data.level - 1]);
      }
      //début de la partie
      if (data.start){
        tour = data.tour;
        corbeau = data.corbeau;
        // debutPartie ();
      }
    });

    //selection de la difficulté
    socket.on('end turn', (data) => {
      playerListe = data.playerListe;
      tour = data.tour;
      endTurn ();
    });

    //affiche la position du joueur
    socket.on('positionVoyant', (data) => {
      //le fantome ne vois pas le chois du joueur
      if (perso != 'fantom' && numPlayer != data.numPlayer) {
        console.log(document.getElementById(progressionVoyant[playerListe[data.numPlayer].position] + data.numCartes));
        document.getElementById(progressionVoyant[playerListe[data.numPlayer].position] + data.numCartes).insertBefore(playerInfo[data.numPlayer].intuition, document.getElementById(progressionVoyant[playerListe[data.numPlayer].position] + data.numCartes).children[0]);
        playerInfo[data.numPlayer].choisCarte = data.position;
      }
    });

    //fonction ajouter message
    var addChat = (mes) => {
      // create a new div element
      // and give it some content
      var p = document.createElement('p');
      var newContent = document.createTextNode(mes);
      p.appendChild(newContent); //add the text node to the newly created div.
      chat.appendChild(p);
      window.setTimeout(function(){p.parentNode.removeChild(p);}, 10000);
    };

    //chois de la difficulté
    var level = (level) => {
      niveau = level;
      socket.emit('level', {room: room, username: username, level: level});
      facileLI.parentNode.removeChild(facileLI);
      moyenLI.parentNode.removeChild(moyenLI);
      difficileLI.parentNode.removeChild(difficileLI);
      addChat('vous avez selectionné la difficultée : ' + niveau[level - 1]);
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
            if (playerListe[numPlayer].position < 4) {
              progression[numPlayer][playerListe[numPlayer].position].insertBefore(playerInfo[numPlayer].intuition, progression[numPlayer][playerListe[numPlayer].position].children[progression[numPlayer][playerListe[numPlayer].position].children.length - 1]);
            } else {
              div.appendChild(playerInfo[numPlayer].intuition);
            }
          }
        }
      } else {
        for (var numJoueur = 1; numJoueur <= nbPlayer; numJoueur++) {
          if (playerListe[numJoueur].joue != 'fantom') {
            //met à jour les point des joueurs
            playerInfo[numJoueur].carreJoueur.classList.remove(playerInfo[numJoueur].nbPoint);
            playerInfo[numJoueur].carreJoueur.classList.add('nbPoint' + playerListe[numJoueur].nbPoint);
            playerInfo[numJoueur].nbPoint = ('nbPoint' + playerListe[numJoueur].nbPoint);

            //met à jour les cartes trouver
            if ( playerListe[numJoueur].position > playerInfo[numJoueur].position ) {
              //supprime les carte vision
              for (var i = 0; i < document.getElementById(numJoueur).parentNode.children.length; i++) {
                if ( !document.getElementById(numJoueur).parentNode.children[i].id ) {
                  document.getElementById(numJoueur).parentNode.removeChild(document.getElementById(numJoueur).parentNode.children[i]);
                }
              }
              //ajoute la carte trouvé
              document.getElementById(numJoueur).parentNode.appendChild( document.getElementById( progressionVoyant[ playerInfo[i].position ] + playerListe[numJoueur].find[ positionPlateau[ playerInfo[numJoueur].position ] ] ) );
              playerInfo[numJoueur].position = playerListe[numJoueur].position;

              //déplace le pion intuition
              if (playerListe[numPlayer].position < 4) {
                progression[numPlayer][playerListe[numPlayer].position].insertBefore(playerInfo[numPlayer].intuition, progression[numPlayer][playerListe[numPlayer].position].children[progression[numPlayer][playerListe[numPlayer].position].children.length - 1]);
              } else {
                document.getElementById(numJoueur).appendChild(playerInfo[numPlayer].intuition);
              }
              //vérifie les votes
              for (var i = 0; playerInfo[numJoueur].intuition.children.length > 1 ; i++) {
                playerInfo[numJoueur].intuition.removeChild(playerInfo[numJoueur].intuition.children[i]);
              }
            }
          }
        }
      }
    }

    function debutPartie (){

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
        position.style.top = '236px';
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
        for (var i = 0; i < cartes.vision.length; i++) {
          visionFantom(vision, i);
        }
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

          divCorbeau.classList.add('image', 'couper', 'corbeauDivTrois');
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
        for (var i = 1; i <= nbPlayer; i++) {
          if (playerListe[i].joue != 'fantom') {
            avatarVoyant(div, i, (playerListe[i].joue - 1));
          }
        }
        var positionVoyant = document.createElement('div');
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
      jeux.appendChild(vision);
    }

    //créé les pions intuition
    function pionsIntuition (numJoueur) {
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
      var jeton = document.createElement('div');
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
      if (!playerInfo[numPlayer]) {
        playerInfo[numPlayer] = {};
      }
      playerInfo[numPlayer].intuition = document.createElement('div');
      var divIntuition = document.createElement('div');
      var intuition = document.createElement('img');

      //ajout des src
      persoPetit.src = 'image/sprite carte.png';
      lieuxPetit.src = 'image/sprite carte.png';
      objetPetit.src = 'image/sprite carte.png';
      persoGrand.src = 'image/carte personnage/' + cartes.personnages[numCartes].src;
      lieuxGrand.src = 'image/cartes lieu/' + cartes.cartesLieux[numCartes].src;
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
        div.appendChild(playerInfo[numPlayer].intuition);
      }

      //ajout des événements
      afficheImage(persoPetit, persoGrand);
      afficheImage(persoGrand, persoGrand);
      afficheImage(lieuxPetit, lieuxGrand);
      afficheImage(lieuxGrand, lieuxGrand);
      afficheImage(objetPetit, objetGrand);
      afficheImage(objetGrand, objetGrand);
      contextmenu(jeton, [2]);

    };

    //affichage des cartes des joueur
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
    //affichage des cartes des joueur
    function carteVoyant2 (numCartes, personnage, lieux1, objet1) {
      //créeation des éléments et ajout des cartes
      var persoPetit = document.createElement('img');
      var persoGrand = document.createElement('img');
      var lieuxPetit = document.createElement('img');
      var lieuxGrand = document.createElement('img');
      var objetPetit = document.createElement('img');
      var objetGrand = document.createElement('img');
      var perso = document.createElement('div');
      var lieux = document.createElement('div');
      var objet = document.createElement('div');

      //ajout des src
      persoPetit.src = 'image/sprite carte.png';
      lieuxPetit.src = 'image/sprite carte.png';
      objetPetit.src = 'image/sprite carte.png';
      persoGrand.src = 'image/carte personnage/' + cartes.personnages[numCartes].src;
      lieuxGrand.src = 'image/carte lieu/' + cartes.cartesLieux[numCartes].src;
      objetGrand.src = 'image/carte objet/' + cartes.cartesObjet[numCartes].src;

      //ajout des class
      persoPetit.classList.add('image', 'index1');
      lieuxPetit.classList.add('image', 'index1');
      objetPetit.classList.add('image', 'index1');
      persoGrand.classList.add('image', 'start', 'grandeCarte');
      lieuxGrand.classList.add('image', 'start', 'grandeCarte');
      objetGrand.classList.add('image', 'start', 'grandeCarte');
      perso.classList.add('couper', 'carte', 'index1');
      lieux.classList.add('couper', 'carte', 'index1');
      objet.classList.add('couper', 'carte', 'index1');

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
      persoPetit.id = 'persoPetit' + numCartes;
      lieuxPetit.id = 'lieuxPetit' + numCartes;
      objetPetit.id = 'objetPetit' + numCartes;
      perso.id = 'perso' + numCartes;
      lieux.id = 'lieux' + numCartes;
      objet.id = 'objet' + numCartes;

      //ajout dans le document
      perso.appendChild(persoPetit);
      lieux.appendChild(lieuxPetit);
      objet.appendChild(objetPetit);
      personnage.appendChild(perso);
      lieux1.appendChild(lieux);
      objet1.appendChild(objet);
      jeux.appendChild(persoGrand);
      jeux.appendChild(lieuxGrand);
      jeux.appendChild(objetGrand);

      //ajout des événements
      afficheImage(persoPetit, persoGrand);
      afficheImage(persoGrand, persoGrand);
      afficheImage(lieuxPetit, lieuxGrand);
      afficheImage(lieuxGrand, lieuxGrand);
      afficheImage(objetPetit, objetGrand);
      afficheImage(objetGrand, objetGrand);
      contextmenu(persoPetit, [7], 1, numCartes);
      contextmenu(lieuxPetit, [7], 2, numCartes);
      contextmenu(objetPetit, [7], 3, numCartes);

    };

    //position des voyant
    function avatarVoyant (div, numPlayer, numCartes) {
      //créeation des éléments et ajout des cartes
      var voyant = document.createElement('div');
      var jeton = document.createElement('div');
      var image = document.createElement('img');

      //ajout des src
      image.src = 'image/plateau.png';

      //ajout des class
      image.classList.add('image', 'index1');
      jeton.classList.add('image', 'etuit', 'couper', 'zindex2');
      voyant.classList.add('div', 'voyant', 'zindex1');

      //ajout d'id
      jeton.id = numPlayer;
      image.id = joueurVoyant[playerListe[numPlayer].joue - 1];

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
      voyant.appendChild(jeton);
      div.appendChild(voyant);

      //ajout des événements
      contextmenu(jeton, [6]);
    };

    //affichage des cartes des joueurs pour le fantom
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
      carte.id = numCartes;

      //ajout dans le document
      carte.appendChild(visionPetit);
      vision.appendChild(carte);
      jeux.appendChild(visionGrand);

      //ajout des événements
      afficheImage(visionPetit, visionGrand);
      afficheImage(visionGrand, visionGrand);
      contextmenu(carte, [3,4]);

    };

    var xMousePosition = 0;
    var yMousePosition = 0;
    document.addEventListener('mousemove',(e) => {
      xMousePosition = e.clientX + window.pageXOffset;
      yMousePosition = e.clientY + window.pageYOffset;
    });

    //affiche les point des joueurs
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
        addChat('vous ne pouvez pas voter');
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
        addChat('vous ne pouvez pas voter');
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
        addChat('vous n\'avez pas voté');
      }
    };

    //envoyer les vision au personnage
    function Perso(perso)
    {
      var verifiPresenceUneCarte = false;
      for (var i = 0; i < choisCarte.vision.length; i++) {
        if (choisCarte.vision[i] != null) {
          verifiPresenceUneCarte = true;
        }
      }
      if ( verifiPresenceUneCarte ) {
        if (!choisCarte.listesJoueur.includes(perso.id)) {
          choisCarte.listesJoueur.push(perso.id);
          choisCarte.joueur = perso.id;
          socket.emit('send card', {numPlayer: numPlayer, perso: perso.id, choisCarte: choisCarte, room: room});
        } else {
          addChat('vous avez déjas envoyé des cartes vision au joueur: ' + perso);
        }
      } else {
        addChat('Vous devez selectionner au moins une carte vision.');
      }
    };

    //ajouter une carte vision
    function visionListe(numVision)
    {
      choisCarte.vision[numVision.id] = true;
    };

    //supprimer une carte vision
    function supVision(numVision)
    {
      if (choisCarte.vision[numVision.id] != null) {
        choisCarte.vision[numVision.id] = null;
      } else {
        addChat('Cette carte n\'a pas été selectionné');
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
        addChat('Vous ne pouvez plus changer vos cartes');
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
        addChat('Vous ne pouvez choisir cet position');
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
            p.addEventListener('click', function () { Perso(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Envoyer les cartes vision selectionné';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionListe(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Ajouter cette carte à la vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { supVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Supprimer la carte de la vision';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { changeVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Changer vos cartes vision';
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
            p.innerHTML = 'Positionner votre jeton ici.';
          },function(){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { annul(element, num); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Annuler votre vote ?';
          }];

        for (var i = 0; i < arrayRightClic.length; i++) {
          menu[arrayRightClic[i]](element, num, numCartes);
        }
        return false;
      }
    };
  });

  function endtour () {
    var temps;
    addChat('il vous reste: ' + time + 's pour choisir.');
    if (time > 10) {
      time = time - 10;
      temps = 10000;
    } else {
      time--;
      temps = 1000;
    }
    window.setTimeout(endtour, temps);
  };

  var joueur = ['joueurQuatre', 'joueurTrois', 'joueurDeux', 'joueurSix', 'joueurCinq', 'joueurUn'];
  var joueurVoyant = ['joueurNoir', 'joueurBleu', 'joueurJaune', 'joueurBlanc', 'joueurRouge', 'joueurMauve'];
  var heureTour = [,{div: 'ah1', img: 'a1'},{div: 'ah2', img: 'a2'},{div: 'ah3', img: 'a3'},{div: 'ah4', img: 'a4'},{div: 'ah5', img: 'a5'},{div: 'ah6', img: 'a6'},{div: 'ah7', img: 'a7'}];
  var jetonPoint = [,{couleur : 'noir', numPlayer : 'Quatre'}, {couleur : 'bleu', numPlayer : 'Trois'}, {couleur : 'jaune', numPlayer : 'Deux'}, {couleur : 'blanc', numPlayer : 'Six'}, {couleur : 'rouge', numPlayer : 'Cinq'}, {couleur : 'mauve', numPlayer : 'Un'}];
  var choisCarte = {vision:[],listesJoueur:[]};
  var corbeau, time;
  var corbeauUse = true;
  var progression = [];
  var progressionVoyant = [,'perso', 'lieux', 'objet'];
  var positionPlateau = [,'cartesPersonnages', 'cartesLieux', 'cartesObjet'];

})(window, io);
