(function(window, io){
  //Au chargement du document
  window.addEventListener('DOMContentLoaded',() => {

    var room, username, numPlayer, facileLI, moyenLI, difficileLI, perso, nbPlayer, cartes, div, heure, aiguille, vision, tour, niveau;
    var playerListe = [];
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');
    // var socket = io('http://10.1.1.203:8888/');

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
      cartes = data.cartes;
      room = data.room;
      numPlayer = data.numPlayer;
      perso = data.joue;
      nbPlayer = data.nbPlayer;
      tour = data.tour || 1;

      //enregistre les joueurs
      if ( data.playerListe ) {
        for (var i = 1; i <= nbPlayer; i++) {
          if (data.playerListe[i]) {
            playerListe[i] = data.playerListe[i].joue;
          }
        }
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
        corbeau = data.corbeau;
        debutPartie();
      }

    });

    //envoie de donné privé du serveur
    socket.on('cartes', (data) => {
      cartes = data;
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
        //début de la partie
        if (data.start){
          corbeau = data.corbeau;
          debutPartie ();
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
          addChat('tous les personnage on eux leur cartes');
        }
      } else {
      }
    });

    //selection de la difficulté
    socket.on('levelSelect', (data) => {
      if (username != data.username) {
        addChat(data.username + ' a selectionné la difficultée : ' + niveau[data.level - 1]);
      }
      cartes = data.cartes;
      //début de la partie
      if (data.start){
        corbeau = data.corbeau;
        debutPartie ();
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
      var aiguilleHeure = document.createElement('div');
      var position = document.createElement('div');
      var horloge = document.createElement('img');

      //ajout des class
      heure.classList.add('image', 'heure', 'couper');
      aiguilleHeure.classList.add('image', 'couper', 'ah1');
      aiguille.classList.add('image', 'a1');
      position.classList.add('position');
      horloge.classList.add('horloge');

      //ajout des images
      aiguille.src = 'image/plateau.png';
      horloge.src = 'image/plateau.png';

      //ajout des éléments
      aiguilleHeure.appendChild(aiguille);
      heure.appendChild(horloge);
      heure.appendChild(aiguilleHeure);
      position.appendChild(heure);
      jeux.insertBefore(position, ecran);
      div.classList.add('avatar');
      vision.classList.add('div');

      //si le joueur joue le fantom
      if (perso == 'fantom') {
        navigation.style.top = '722px';
        var numCartes = 0;
        for (var i = 1; i <= nbPlayer; i++) {
          if (i != numPlayer) {
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
        navigation.style.left = '1450px';
        navigation.style.top = '1200px';
        textAffiche.classList.remove('textAffiche');
        textAffiche.classList.add('textAfficheVoyant');
        deconnection.style.right = '10%';
        deconnection.style.top = '1170px';
        heure.style.left = '600px';
        heure.style.top = '1175px';
        div.classList.remove('avatar');
        //affichage des voyant
        for (var i = 1; i <= nbPlayer; i++) {
          if (playerListe[i] != 'fantom') {
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
        personnage.classList.add('div', 'positionJoueur', 'couper');
        personnageDiv.classList.add('image', 'centre');
        personnageImage.classList.add('image', 'perso');
        personnage1.classList.add('div');
        personnage2.classList.add('div');
        lieux.classList.add('div', 'positionJoueur', 'couper');
        lieuxDiv.classList.add('image', 'centre');
        lieuxImage.classList.add('image', 'lieu');
        lieux1.classList.add('div');
        lieux2.classList.add('div');
        objet.classList.add('div', 'positionJoueur', 'couper');
        objetDiv.classList.add('image', 'centre');
        objetImage.classList.add('image', 'objet');
        objet1.classList.add('div');

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

        //parcour la liste des cartes pour les afficher
        for (var numCartes = 0; numCartes < cartes.personnages.length; numCartes++) {
          if (numCartes < 5) {
            carteVoyant(numCartes, personnage1, lieux1, objet1);
          } else {
            carteVoyant(numCartes, personnage2, lieux2, objet1);
          }
        }
        //ajout des points si 4 joueur ou plus
        if (nbPlayer > 3) {
          var point = document.createElement('div');
          var pointInt = document.createElement('div');
          var point6 = document.createElement('img');

          point.classList.add('div', 'point');
          pointInt.classList.add('image', 'pointInt');
          point6.classList.add('image', 'point6');

          point6.src = 'image/plateau.png';

          pointInt.appendChild(point6);

          //ajout du plateau de point à plus de 6 joueur
          if (nbPlayer < 6) {
            var point4 = document.createElement('img');
            point4.classList.add('image', 'point4');
            point4.src = 'image/plateau.png';
            pointInt.appendChild(point4);
          }
          point.appendChild(pointInt);
          //parcour la liste des joueurs pour afficher leur points
          for (var i = 1; i <= nbPlayer; i++) {
            if (playerListe[i] != 'fantom') {
              var carreJoueur = document.createElement('div');
              var pointJoueur = document.createElement('image');
            }
          }
        }
        jeux.insertBefore(div, navigation);
        jeux.insertBefore(positionVoyant, navigation);
        jeux.insertBefore(point, navigation);
      }
      jeux.insertBefore(vision, navigation);
    }

    //affichage des cartes des joueur pour le fantom
    function carteFantom (div, numPlayer, numCartes) {
      //créeation des éléments et ajout des cartes
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

      //ajout des src
      persoPetit.src = 'image/sprite carte.png';
      lieuxPetit.src = 'image/sprite carte.png';
      objetPetit.src = 'image/sprite carte.png';
      persoGrand.src = 'image/carte personnage/' + cartes.personnages[numCartes].src;
      lieuxGrand.src = 'image/cartes lieu/' + cartes.cartesLieux[numCartes].src;
      objetGrand.src = 'image/carte objet/' + cartes.cartesObjet[numCartes].src;
      image.src = 'image/sprite plateau fantom.png';

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
      image.classList.add('image', joueur[playerListe[numPlayer] -1]);
      jeton.classList.add('div', 'jetonFantome', 'couper');
      voyant.classList.add('div', 'voyant');

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
    function carteVoyant (numCartes, personnage, lieux1, objet1) {
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
      lieuxGrand.src = 'image/cartes lieu/' + cartes.cartesLieux[numCartes].src;
      objetGrand.src = 'image/carte objet/' + cartes.cartesObjet[numCartes].src;

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
      contextmenu(persoPetit, [7]);
      contextmenu(objetPetit, [7]);
      contextmenu(lieuxPetit, [7]);

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
      image.classList.add('image');
      jeton.classList.add('div', 'etuit', 'couper');
      voyant.classList.add('div', 'voyant');

      //ajout d'id
      jeton.id = numPlayer;
      image.id = joueurVoyant[playerListe[numPlayer] -1];

      //ajout dans le document
      jeton.appendChild(image);
      voyant.appendChild(jeton);
      div.appendChild(voyant);

      //ajout des événements
      contextmenu(jeton, [6]);

    };

    //affichage des cartes des joueur pour le fantom fantom
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


    function OK()
    {
      alert("Renommer");
    };

    function NOK()
    {
      alert("Editer");
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
        if (!choisCarte.listesJoueur.includes(perso)) {
          choisCarte.listesJoueur.push(perso);
          choisCarte.joueur = perso;
          socket.emit('send card', {numPlayer: numPlayer, perso: perso, choisCarte: choisCarte, room: room});
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
      choisCarte.vision[numVision] = true;
    };

    //supprimer une carte vision
    function supVision(numVision)
    {
      if (choisCarte.vision[numVision] != null) {
        choisCarte.vision[numVision] = null;
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
    function voirCarte()
    {
      //code
    };

    //positionner le jeton voyant
    function voirCarte()
    {
      //code
    };

    //affiche les images grande ou les cache
    var afficheImage = (element, hiddenShow) => {
      element.addEventListener('click', (event) => {clic(event)});
      function clic (event) {
        hiddenShow.classList.toggle('start');
      };
    };

    //ajoute un menu contextuel
    var contextmenu = function (element, arrayRightClic) {
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
        document.body.addEventListener('click', function (e) { d.parentNode.removeChild(d);  });

        //liste du menu contextuel
        var menu = [function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { OK(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'OK';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { NOK(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'NOK';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { Perso(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Envoyer les cartes vision selectionné';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { visionListe(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Ajouter cette carte à la vision';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { supVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Supprimer la carte de la vision';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { changeVision(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Changer vos cartes vision';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { voirCarte(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Voir vos cartes vision';
          },function(element){
            var p = document.createElement('p');
            d.appendChild(p);
            p.addEventListener('click', function () { position(element); });
            p.setAttribute('class', 'ctxline');
            p.innerHTML = 'Positionner votre jeton ici.';
          }];

        for (var i = 0; i < arrayRightClic.length; i++) {
          menu[arrayRightClic[i]](element.id);
        }
        return false;
      }
    };
  });


  var joueur = ['joueurQuatre', 'joueurTrois', 'joueurDeux', 'joueurSix', 'joueurCinq', 'joueurUn'];
  var joueurVoyant = ['joueurNoir', 'joueurBleu', 'joueurJaune', 'joueurBlanc', 'joueurRouge', 'joueurMauve'];
  var choisCarte = {vision:[],listesJoueur:[]};
  var corbeau;
  var corbeauUse = true;

})(window, io);
