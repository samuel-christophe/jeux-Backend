(function(window, io){
  //Au chargement du document
  window.addEventListener('DOMContentLoaded',() => {

    var room, username, numPlayer, facileLI, moyenLI, difficileLI, perso, nbPlayer, cartes;
    var playerListe = [];
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');
    // var socket = io('http://10.1.1.111:8888/');

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
      console.log(data);
      cartes = data.cartes;
      room = data.room;
      numPlayer = data.numPlayer;
      perso = data.joue;
      nbPlayer = data.nbPlayer;

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
        debutPartie();
      }

    });

    //envoie de donné privé du serveur
    socket.on('cartes', (data) => {
      console.log(data);
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
        socket.emit('chat', { room: room, username: username, texte: message.value });
        addChat(username + ' à dit: ' + message.value);
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
    socket.on('levelSelect', (data) => {
      /**
      A chaque message reçu, on affiche les données
      obtenues dans la console du navigateur Internet.
      **/
      if (username != data.username) {
        addChat(data.username + ' a selectionné la difficultée : ' + niveau[data.level - 1]);
      }
      cartes = data.cartes;
      //début de la partie
      if (data.start){
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
    };
    //chois de la difficulté
    var level = (level) => {
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
      navigation.style.top = '900px';
      textAffiche.classList.remove('div');
      textAffiche.classList.add('textAffiche');
      ecran.classList.add('image', 'background');
      jeux.appendChild(ecran);

      var div = document.createElement('div');
      var heure = document.createElement('div');
      var position = document.createElement('div');
      var horloge = document.createElement('img');
      heure.classList.add('image', 'heure', 'couper');
      position.classList.add('position');
      horloge.classList.add('horloge');
      horloge.src = 'image/plateau.png';
      heure.appendChild(horloge);
      position.appendChild(heure);
      jeux.insertBefore(position, ecran);
      div.classList.add('avatar');

      //si le joueur joue le fantom
      if (perso == 'fantom') {
        var j = 0;
        for (var i = 1; i <= nbPlayer; i++) {
          if (i != numPlayer) {
            avatar(div, playerListe[i], j);
            j++;
          }
        }
        jeux.insertBefore(div, navigation);

      } else {
      }
    }

    //ajoute l'avatar pour le fantom
    function avatar (div, numPlayer, numCartes) {
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
      image.classList.add('image', joueur[numPlayer -1]);
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
      contextmenu(jeton);

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
    }

    function NOK()
    {
      alert("Editer");
    }

    function vision(perso)
    {
      choisCarte.joueur = perso.id;
    }

    var afficheImage = (element, hiddenShow) => {
      element.addEventListener('click', (event) => {clic(event)});
      function clic (event) {
        hiddenShow.classList.toggle('start');
      };
    };

    var contextmenu = (element) => {
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

        var p = document.createElement('p');
        d.appendChild(p);
        p.addEventListener('click', function () { OK(); });
        p.setAttribute('class', 'ctxline');
        p.innerHTML = 'OK';

        var p1 = document.createElement('p');
        d.appendChild(p1);
        p1.addEventListener('click', function () { NOK(); });
        p1.setAttribute('class', 'ctxline');
        p1.innerHTML = 'NOK';

        var p2 = document.createElement('p');
        d.appendChild(p2);
        p2.addEventListener('click', function () { vision(element); });
        p2.setAttribute('class', 'ctxline');
        p2.innerHTML = 'Choisisé une carte vision';

        return false;
      }
    };
  });


  var joueur = ['joueurQuatre', 'joueurTrois', 'joueurDeux', 'joueurSix', 'joueurCinq', 'joueurUn'];
  var choisCarte = {};

})(window, io);
