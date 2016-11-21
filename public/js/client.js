(function(window, io){
  //Au chargement du document
  window.addEventListener('DOMContentLoaded',() => {

    var room, username, numPlayer, facileLI, moyenLI, difficileLI;
    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');

    // socket : Est un objet qui représente la connexion WebSocket établie entre le client WebSocket et le serveur WebSocket.

    var send = window.document.getElementById('send');
    var chat = window.document.getElementById('chat');
    var pseudo = window.document.getElementById('pseudo');
    var message = window.document.getElementById('message');
    var difficult = window.document.getElementById('difficult');
    var start = window.document.getElementsByClassName('start');
    var HTMLaElement = window.document.getElementsByTagName('a');
    var navigation = window.document.getElementById('navigation');
    var connection = window.document.getElementById('connection');
    var textAffiche = window.document.getElementById('textAffiche');
    var connect = window.document.getElementsByClassName('connect');
    var deconnection = window.document.getElementById('deconnection');

    var niveau = ['facile', 'moyen', 'difficile'];

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
      socket.emit('room', room);
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
        //supression des éléments innutils
        difficult.parentNode.removeChild(difficult);

        //nav et send à déplacer
        navigation.style.top = '900px';
        textAffiche.classList.remove('div');
        textAffiche.classList.add('textAffiche');
      }

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
      socket.emit('disconnect', {room: room, username: username});
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
        } else {
          addChat(data.username + ' à selectionner un personnage. vous devez selectionner le fantome en premier');
        }
        //début de la partie
        if (data.start){
          console.log('la partie commence');
          //supression des éléments innutils
          difficult.parentNode.removeChild(difficult);

          //nav et send à déplacer
          navigation.style.top = '900px';
          textAffiche.classList.remove('div');
          textAffiche.classList.add('textAffiche');
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
      //début de la partie
      if (data.start){
        //supression des éléments innutils
        difficult.parentNode.removeChild(difficult);

        //nav et send à déplacer
        navigation.style.top = '900px';
        textAffiche.classList.remove('div');
        textAffiche.classList.add('textAffiche');
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

  });

})(window, io);
