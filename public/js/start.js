((window, io) => {

  //Au chargement du document
  window.addEventListener('DOMContentLoaded', () => {

    /**
      Établissement d'une nouvelle connexion WebSocket vers le serveur
      WebSocket à l'aide de la fonction io fournie par le "framework"
      client socket.io.
    **/
    var socket = io('http://192.168.1.30:8888/');

    // socket : Est un objet qui représente la connexion WebSocket établie entre le client WebSocket et le serveur WebSocket.

    var HTMLaElement = window.document.getElementsByTagName('a');
    var deconnection = window.document.getElementById('deconnection');

    //parcour la liste des lien
    for (var i = 0; i < HTMLaElement.length; i++) {
      HTMLaElement[i].addEventListener('click', (event) => {
        console.log('Je clic sur mon élément.');
        var status = this.getAttribute('href');
        console.log();
        if (status != '/regles') {
          event.preventDefault();
          /**
          A chaque clic de souris sur l'élément HTML considéré
          on envoi un message à travers la connexion WebSocket.
          **/
          socket.emit('unJoueur', { texte: 'Hello !' });
          /**
          On déclare un évènement personnalisé 'unJoueur' dont
          la réception sera gérée coté serveur.
          **/
        }
      });
    }

    //deconnect le joueur
    deconnection.addEventListener('submit', (event) => {
      event.preventDefault();
      socket.emit('disconnect', {room: room, username: username});
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
      console.log(data);
    });


  });

})(window, io);
