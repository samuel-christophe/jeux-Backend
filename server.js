'use strict'
//chargement de express
var express = require('express');
var cartes = require('cartes');
var db = require('db.js');
var app = express();
//chargement du module HTTP.
const http = require('http');

//création du serveur HTTP.
var httpServer = http.createServer();

// Connection URL
var url = 'mongodb://localhost:27017/db';

var rooms = [];
var nbCorbeau = [,8,3,1];

var numPartie;

//emplacement des fichier static
app.use(express.static('public'));

//utilisation du modul pug
app.set('view engine', 'pug');

app.get('/index',(req,res) => {
  res.redirect('/');
});

//Chargement de la page d'introduction du jeux
app.get('/',(req,res) => {
  res.render('intro');
});

//page des régles
app.get('/regles',(req,res) => {
  res.render('regles');
});

//page de connenxion
app.get('/connect',(req,res) => {
  res.render('connect');
});

//liste des cartes
var vision = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125];

var positionPlateau = [,'cartesPersonnages', 'cartesLieux', 'cartesObjet'];

var jetonClairvoyance = [0,0,0,2,2,3,3];

/**
  Le Serveur WebSocket associé au serveur HTTP.
  URL : ws://[adresse IP/nom de domaine]:8080/

  Ce serveur accepte une requête HTTP upgrade et établit
  une connexion persistante basée sur WebSocket.
**/


/**
  On installe et on utilise le package socket.io.
  La documentation est ici :
  - https://www.npmjs.com/package/socket.io
  - https://github.com/socketio/socket.io
  - http://socket.io/
**/
var socketIO = require('socket.io');

//  On utilise la fonction obtenue avec notre serveur HTTP.
var socketIOWebSocketServer = socketIO(httpServer);

/**
  Gestion de l'évènement 'connection' : correspond à la gestion
  d'une requête WebSocket provenant d'un client WebSocket.
**/
socketIOWebSocketServer.on('connection', (socket) => {

  //add player
  socket.on('create player', (data) => {

    var partie = db.get().collection('partie');
    var users = db.get().collection('users');
    //ajoute la room dans la BDD
    partie.count((err,count) => {
      numPartie = count;
    });

    var room, numPlayer, joue, start, tour, corbeau, nbPlayer;
    //vérifie si l'utilisateur existe
    users.findOne({username : data.username}, function (err, result) {

      // Connection collection
      var users = db.get().collection('users');
      var partie = db.get().collection('partie');
      if (result) {
        //vérifie si le joueur fait partie d'une room
        if (result.partie && result.partie.room) {
          //enregistre les information du joueur
          numPlayer = result.partie.numPlayer;
          room = result.partie.room;
          //enregistre le rôle
          if (result.joue) {
            joue = result.joue;
          }
          //partie commencé
          if (result.start) {
            start = true;
            tour = rooms[room].tour;
            if (joue == 'fantom') {
              corbeau = result.corbeau;
            }
          }
          // ajout dans la room
          socket.join(room);
        }
      } else {
        users.insert({username : data.username});
      }

      //vérifie que le player n'a pas de room
      if ( room == undefined ) {
        //vérifie qu'une room existe
        if ( numPartie == 0 ) {
          //créé une nouvelle room
          room = createRoom();
          numPlayer = 1;
          nbPlayer = 1;
          rooms[room].playerListe = [];
          rooms[room].playerListe[1] = {};
          rooms[room].playerListe[1].username = data.username;
          socket.join(room);
          //ajoute la room dans la BDD users
          users.updateOne({username : data.username}, { $set: { partie: { room : room, numPlayer : 1 } } }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
          //ajoute la room dans la BDD partie
          partie.updateOne({room : room}, { $set: {playerListe: rooms[room].playerListe } }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
        } else {
          //vérifie que la room est libre
          if ( rooms[numPartie] ) {
            //vérifie si une room à une place disponible
            if (rooms[numPartie].nbPlayer < 7 && !rooms[numPartie].start) {
              //enregistre le numéro de la room
              room = numPartie;
              //incrémente le nombre de joueur
              rooms[numPartie].nbPlayer++;
              for (var i = 1; i <= rooms[numPartie].nbPlayer; i++) {
                if (!rooms[numPartie].playerListe[i]) {
                  numPlayer = i;
                }
              }
              //enregistre le pseudo du joueur
              rooms[numPartie].playerListe[numPlayer] = {};
              rooms[numPartie].playerListe[numPlayer].username = data.username;
              //ajoute le numéro de la room
              users.updateOne({username : data.username}, { $set: {partie: {room : numPartie, numPlayer : numPlayer} } }, (err, result) => {
                if (err) {
                  console.log(err);
                }
              });
              //ajoute la room dans la BDD partie
              partie.updateOne({room : room}, { $set: {playerListe: rooms[room].playerListe, nbPlayer: rooms[numPartie].nbPlayer } }, (err, result) => {
                if (err) {
                  console.log(err);
                }
              });
              socket.join(room);
            }
          }
          //vérifie qu'une room à bien était créé ou ajouté
          if ( room == undefined ) {
            room = createRoom(this);
            numPlayer = 1;
            nbPlayer = 1;
            rooms[room].playerListe = [];
            rooms[room].playerListe[1] = {};
            rooms[room].playerListe[1].username = data.username;
            users.updateOne({username : data.username}, { $set: {partie: {room : room, numPlayer : 1}}}, (err, result) => {
              if (err) {
                console.log(err);
              }
            });
            //ajoute la room dans la BDD
            partie.updateOne({room : room}, { $set: { playerListe: rooms[room].playerListe, nbPlayer: nbPlayer } }, (err, result) => {
              if (err) {
                console.log(err);
              }
            });
          }
        }
      }
      var cartes;
      var playerListe = JSON.parse(JSON.stringify(rooms[room].playerListe));
      //vérifie que la partie à comencé pour envoyer les cartes
      if (rooms[room].start) {
        if (joue == 'fantom') {
          //envoie les cartes du fantome
          cartes = {
            personnages: recupCartes(cartesPersonnages, rooms[room].listesCartes.cartesPersonnages.tabFantom),
            cartesLieux: recupCartes(cartesLieux, rooms[room].listesCartes.cartesLieux.tabFantom),
            cartesObjet: recupCartes(cartesObjet, rooms[room].listesCartes.cartesObjet.tabFantom),
            vision: recupCartes(carteVisions, rooms[room].listesCartes.cardVision)
          };
        } else {
          cartes = {
            personnages: recupCartes(cartesPersonnages, rooms[room].listesCartes.cartesPersonnages.tabVoyant),
            cartesLieux: recupCartes(cartesLieux, rooms[room].listesCartes.cartesLieux.tabVoyant),
            cartesObjet: recupCartes(cartesObjet, rooms[room].listesCartes.cartesObjet.tabVoyant)
          };
          //parcour la liste des joueurs pour envoyer les cartes vision
          for (var i = 1; i < playerListe.length; i++) {
            if (playerListe[i].vision != undefined) {
              playerListe[i].vision = recupCartes(carteVisions, rooms[room].playerListe[i].vision);
            }
          }
        }
      }
      //crée une room par player
      socket.join(data.username);
      //envoie du message au player
      socketIOWebSocketServer.in(data.username).emit('joincreateconfirm', {
        room: room,
        numPlayer: numPlayer,
        joue: joue,
        start: rooms[room].start,
        playerListe: playerListe,
        nbPlayer: rooms[room].nbPlayer,
        cartes: cartes,
        tour : rooms[room].tour,
        corbeau : corbeau
      });
      // Let the existing players in room know there is a new player
      // TODO -- Add room number to this / Player class
      if (!rooms[room].start) {
        socketIOWebSocketServer.in(room).emit('new player', {
          name:data.username
        });
      }

    });
  });
  socket.on('disconnected', (data) => {
    // Connection collection
    var users = db.get().collection('users');
    var partie = db.get().collection('partie');
    // If the room is empty, remove the room and tell the players,
    // if not, just tell the players the player has left
    socket.leave(data.room);
    if (rooms[data.room].start) {
      socketIOWebSocketServer.in(data.room).emit('remove player', {end : true, username : data.username});
      //fin de partie
      partie.updateOne({room : data.room}, { $set: {end : true} }, function(err, result) {
        if (err) {
          console.log(err);
        }
      });
      for (var i = 1; i <= (rooms[data.room].nbPlayer); i++) {
        users.deleteOne({username : rooms[data.room].playerListe[i].username}, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      }
    } else {
      users.deleteOne({username : data.username});
      rooms[data.room].playerListe[data.numPlayer] = undefined;
      rooms[data.room].nbPlayer--;
      if(socketIOWebSocketServer.in(data.room) === []) {
        rooms[data.room] = undefined;
      } else {
        //informe les joueurs
        socketIOWebSocketServer.in(data.room).emit('remove player', {data});
      }
      //met la liste des joueur à jour
      partie.updateOne({room : data.room}, { $set: {playerListe : rooms[data.room].playerListe, nbPlayer : rooms[data.room].nbPlayer} }, function(err, result) {
        if (err) {
          console.log(err);
        }
      });
      //mise à jour du nombre de joueur
      for (var i = 1; i <= (rooms[data.room].nbPlayer + 1); i++) {
        if (i != data.numPlayer) {
          users.updateOne({username : rooms[data.room].playerListe[i].username}, { $set: {nbPlayer: rooms[data.room].nbPlayer} }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }
  });

  /**
    On attache un gestionnaire d'évènement à un évènement personnalisé 'unJoueur'
    qui correspond à un événement déclaré coté client qui est déclenché lorsqu'un message
    a été reçu en provenance du client WebSocket.
  **/
  socket.on('unJoueur', (data) => {

    // Affichage du message reçu dans la console.

    // Connection collection
    var partie = db.get().collection('partie');
    var users = db.get().collection('users');
    var numPlayer = data.numPlayer;
    //selection des personnnage
    if (data.choisPerso) {
      var allSelectPlayer = 0;
      var plays = [];
      for (var i = 1; i < rooms[data.room].playerListe.length; i++) {
        plays[rooms[data.room].playerListe[i].joue] = rooms[data.room].playerListe[i].joue;
      }
      //choix du fantome et le fantome n'a pas déjà été choisi
      if ( data.perso == 'fantom' && plays['fantom'] == undefined && rooms[data.room].playerListe[data.numPlayer].joue == undefined) {
        //enregistre la valeur
        partie.updateOne({room : data.room}, { $set: {playerListe: rooms[data.room].playerListe} }, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
        users.updateOne({username : data.username}, { $set: {joue : data.perso} }, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
        rooms[data.room].fantom = true;
        rooms[data.room].playerListe[data.numPlayer].joue = data.perso;
      } else {
        //vérifie si le fantome a déjà été choisi
        if ( plays['fantom'] != undefined ) {
          //et que le joueur n'a pas déjà un personnage.
          if ( rooms[data.room].playerListe[data.numPlayer].joue == undefined ) {
            //enregistre la valeur
            partie.updateOne({room : data.room}, { $set: {playerListe: rooms[data.room].playerListe}}, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
            users.updateOne({username : data.username}, { $set: {joue : data.perso} }, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
            rooms[data.room].playerListe[data.numPlayer].joue = data.perso;
          }
        } else {
          data.fantom = true;
        }
      }

      //vérifie que tous les joueurs on slectionné un personnage, qu'il y en a au moins 2 et que le niveau à était selectionné
      if (rooms[data.room].nbPlayer > 1 && rooms[data.room].level) {
        for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
          if (rooms[data.room].playerListe[i].joue) {
            allSelectPlayer++;
          }
        }
        if (allSelectPlayer == rooms[data.room].nbPlayer) {
          data.start = true;
          data.tour = 1;
          data.corbeau = nbCorbeau[rooms[data.room].level];
          rooms[data.room].corbeau = data.corbeau;
          rooms[data.room].listesCartes = cartes.get(rooms[data.room].level, rooms[data.room].nbPlayer);
          rooms[data.room].vision = cartes.vision(vision);
          rooms[data.room].listesCartes.cardVision = rooms[data.room].vision.slice(0,7);
          rooms[data.room].vision = rooms[data.room].vision.slice(7);
          //enregistre que la partie à commencé pour tous les joueurs
          for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
            users.updateOne({username : rooms[data.room].playerListe[i].username}, { $set: {start: true, corbeau: data.corbeau, nbPoint: 0, position: 1} }, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
            if (rooms[data.room].playerListe[i].joue == 'fantom') {
              //envoie les cartes du fantome
              cartes = {
                personnages: recupCartes(cartesPersonnages, rooms[data.room].listesCartes.cartesPersonnages.tabFantom),
                cartesLieux: recupCartes(cartesLieux, rooms[data.room].listesCartes.cartesLieux.tabFantom),
                cartesObjet: recupCartes(cartesObjet, rooms[data.room].listesCartes.cartesObjet.tabFantom),
                vision: recupCartes(carteVisions, rooms[data.room].listesCartes.cardVision)
              };
              socketIOWebSocketServer.in(rooms[data.room].playerListe[i].username).emit('cartes', {cartes : cartes, tour: 1, corbeau: nbCorbeau[data.level], playerListe : rooms[data.room].playerListe});
            } else {
              rooms[data.room].playerListe[i].position = 1;
              rooms[data.room].playerListe[i].nbJetonOK = jetonClairvoyance[allSelectPlayer];
              rooms[data.room].playerListe[i].nbJetonNOK = jetonClairvoyance[allSelectPlayer];
              cartes = {
                personnages: recupCartes(cartesPersonnages, rooms[data.room].listesCartes.cartesPersonnages.tabVoyant),
                cartesLieux: recupCartes(cartesLieux, rooms[data.room].listesCartes.cartesLieux.tabVoyant),
                cartesObjet: recupCartes(cartesObjet, rooms[data.room].listesCartes.cartesObjet.tabVoyant)
              };
              socketIOWebSocketServer.in(rooms[data.room].playerListe[i].username).emit('cartes', {cartes : cartes, tour: 1, corbeau: nbCorbeau[data.level], playerListe : rooms[data.room].playerListe});
            }
          }
          //enregistre les paramètre de la partie
          partie.updateOne({room : data.room}, { $set: {start: true, listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision, playerListe : rooms[data.room].playerListe, tour: 1, corbeau : data.corbeau}}, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('mysterium', data);
    /**
    On déclare un évènement personnalisé 'mysterium'
    dont la réception sera gérée coté client.
    **/
  });

  socket.on('chat', function (data) {

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('chatMysterium', data);
    /**
    On déclare un évènement personnalisé 'chatMysterium'
    dont la réception sera gérée coté client.
    **/
  });

  //vote des joueur
  socket.on('vote', function (data) {

    console.log(data);
    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('voteEnvoye', data);
  });

  //affiche la position du joueur
  socket.on('position', function (data) {

    //verifie que la carte est toujours présente
    if ( rooms[data.room].listesCartes[positionPlateau[rooms[data.room].playerListe[data.numPlayer].position]].tabVoyant[data.numCartes] != undefined ) {
      rooms[data.room].playerListe[data.numPlayer].positionCartes = rooms[data.room].listesCartes[positionPlateau[rooms[data.room].playerListe[data.numPlayer].position]].tabVoyant[data.numCartes];
      // Envoi d'un message au client WebSocket.
      socketIOWebSocketServer.in(data.room).emit('positionVoyant', data);
      //enregistre le chois du joueur
      var partie = db.get().collection('partie');
      partie.updateOne({room:data.room}, { $set: { playerListe : rooms[data.room].playerListe } }, function(err,result){});
    }
  });

  //réinitialise les vision
  socket.on('modify card', function (data) {

    if ( (rooms[data.room].playerListe[data.numPlayer].joue = 'fantom') && (rooms[data.room].corbeau > 0) ) {
      rooms[data.room].corbeau--;
      rooms[data.room].listesCartes.cardVision = [];
      //ajoute les nouvelles cartes et supprime celle de la pile vision
      for (var i = 0; i < 7; i++) {
        rooms[data.room].listesCartes.cardVision.push(rooms[data.room].vision[0]);
        rooms[data.room].vision.splice(0,1);
      }
      //récupérer les cartes pour les envoyer
      var visionFantom = recupCartes(carteVisions, rooms[data.room].listesCartes.cardVision);
      // Envoi d'un message au client WebSocket.
      socketIOWebSocketServer.in(rooms[data.room].playerListe[data.numPlayer].username).emit('receive card', visionFantom);
      //enregistre les cartes vision du joueur
      var partie = db.get().collection('partie');
      partie.updateOne({room:data.room}, { $set: { listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision, playerListe : rooms[data.room].playerListe, corbeau: rooms[data.room].corbeau } }, function(err,result){});
    }
  });

  //envoie et reception des cartes vision
  socket.on('send card', function (data) {

    var nbCardSend = 0;
    var visionFantom, vision;
    var cardSend = [];
    var playerVision = 0;
    var partie = db.get().collection('partie');
    //enregistre le numéro des cartes envoyé
    data.choisCarte.vision.forEach(function (item, index, array) {
      if (item) {
        cardSend.push(rooms[data.room].listesCartes.cardVision[index]);
        if (rooms[data.room].playerListe[data.perso].vision) {
          rooms[data.room].playerListe[data.perso].vision.push(index);
        } else {
          rooms[data.room].playerListe[data.perso].vision = [];
          rooms[data.room].playerListe[data.perso].vision.push(index);
        }
        nbCardSend++;
      }
    });

    //supprime les cartes envoyé des vision du fantom
    cardSend.forEach(function (item, index, array) {
      rooms[data.room].listesCartes.cardVision.splice(rooms[data.room].listesCartes.cardVision.indexOf(item),1);
    });
    //ajoute les nouvelles cartes et supprime celle de la pile vision
    for (var i = 0; i < nbCardSend; i++) {
      rooms[data.room].listesCartes.cardVision.push(rooms[data.room].vision[0]);
      rooms[data.room].vision.splice(0,1);
    }

    //parcour la liste des joueur pour vérifier ceux ayant eux leur visions.
    for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
      if ( rooms[data.room].playerListe[i].vision && (rooms[data.room].playerListe[i].joue != 'fantom') ) {
        playerVision++;
      }
    }

    //récupérer les cartes pour les envoyer
    visionFantom = recupCartes(carteVisions, rooms[data.room].listesCartes.cardVision);
    vision = recupCartes(carteVisions, rooms[data.room].playerListe[data.perso].vision);

    //vérifie si le tour est fini
    if (playerVision < (rooms[data.room].playerListe.length - 2) ) {
      //enregistre les cartes vision du joueur
      partie.updateOne({room:data.room}, { $set: { listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision, playerListe : rooms[data.room].playerListe, tour : rooms[data.room].tour } }, function(err,result){});
      data.endTour = false;
    } else {
      data.endTour = true;
      //enregistre les cartes vision du joueur
      partie.updateOne({room:data.room}, { $set: { listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision, playerListe : rooms[data.room].playerListe, tour : rooms[data.room].tour } }, function(err,result){});
    }

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('receive card', {joueur: data.perso, vision: vision});
    socketIOWebSocketServer.in(rooms[data.room].playerListe[data.numPlayer].username).emit('receive card', visionFantom)
  });

  //chois de la difficulté
  socket.on('level', function (data) {
    rooms[data.room].level = data.level;
    var allSelectPlayer = 0;
    // Connection collection
    var partie = db.get().collection('partie');
    var users = db.get().collection('users');

    //vérifie que tous les joueurs on slectionné un personnage, qu'il y en a au moins 2
    if (rooms[data.room].nbPlayer > 1) {
      for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
        if (rooms[data.room].playerListe[i].joue) {
          allSelectPlayer++;
        }
      }
      if (allSelectPlayer == rooms[data.room].nbPlayer) {
        data.start = true;
        data.tour = 1;
        rooms[data.room].corbeau = data.corbeau;
        rooms[data.room].listesCartes = cartes.get(rooms[data.room].level, rooms[data.room].nbPlayer);
        rooms[data.room].vision = cartes.vision(vision);
        rooms[data.room].listesCartes.cardVision = rooms[data.room].vision.slice(0,7);
        rooms[data.room].vision = rooms[data.room].vision.slice(7);

        //enregistre que la partie à commencé pour tous les joueurs
        for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
          users.updateOne({username : rooms[data.room].playerListe[i].username}, { $set: {start: true, corbeau: data.corbeau, nbPoint: 0, position: 1} }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
          if (rooms[data.room].playerListe[i].joue == 'fantom') {
            //envoie les cartes du fantome
            cartes = {
              personnages: recupCartes(cartesPersonnages, rooms[data.room].listesCartes.cartesPersonnages.tabFantom),
              cartesLieux: recupCartes(cartesLieux, rooms[data.room].listesCartes.cartesLieux.tabFantom),
              cartesObjet: recupCartes(cartesObjet, rooms[data.room].listesCartes.cartesObjet.tabFantom),
              vision: recupCartes(carteVisions, rooms[data.room].listesCartes.cardVision)
            };
            socketIOWebSocketServer.in(rooms[data.room].playerListe[i].username).emit('cartes', {cartes : cartes, tour: 1, corbeau: nbCorbeau[data.level], playerListe : rooms[data.room].playerListe});
          } else {
            rooms[data.room].playerListe[i].position = 1;
            rooms[data.room].playerListe[i].nbJetonOK = jetonClairvoyance[allSelectPlayer];
            rooms[data.room].playerListe[i].nbJetonNOK = jetonClairvoyance[allSelectPlayer];
            cartes = {
              personnages: recupCartes(cartesPersonnages, rooms[data.room].listesCartes.cartesPersonnages.tabVoyant),
              cartesLieux: recupCartes(cartesLieux, rooms[data.room].listesCartes.cartesLieux.tabVoyant),
              cartesObjet: recupCartes(cartesObjet, rooms[data.room].listesCartes.cartesObjet.tabVoyant)
            };
            socketIOWebSocketServer.in(rooms[data.room].playerListe[i].username).emit('cartes', {cartes : cartes, tour: 1, corbeau: nbCorbeau[data.level], playerListe : rooms[data.room].playerListe});
          }
        }
        //enregistre les paramètre de la partie dans la base de donné
        partie.updateOne({room : data.room}, { $set: {start: true, listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision, playerListe : rooms[data.room].playerListe, tour: 1, corbeau : data.corbeau}}, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      }
    }

    // Connection collection
    var partie = db.get().collection('partie');
    //met à jour la difficulté
    partie.updateOne({room : data.room}, { $set: {level : data.level}}, function(err, result) {
      if (err) {
        console.log(err);
      }
    });

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('levelSelect', data);
    /**
    On déclare un évènement personnalisé 'unAutreEvenement'
    dont la réception sera gérée coté client.
    **/
  });

});

function recupCartes (tabCarte, tab) {
  var listesCartes = [];
  for (var i = 0; i < tab.length; i++) {
    listesCartes[i] = tabCarte[tab[i]];
  }
  return listesCartes;
};

// Function that handles room creation
function createRoom() {
  // Connection collection
  var partie = db.get().collection('partie');
  if(numPartie != 0){
    numPartie++;
    //insertion d'une nouvelle partie
    partie.insert({room : numPartie});
  } else {
    numPartie = 1;
    //insertion d'une nouvelle partie
    partie.insert({room : 1});
  }
  rooms[numPartie] = ({room : numPartie, nbPlayer : 1});
  return numPartie;
};

httpServer.listen(8888);

// Gestion de la connexion au démarrage
db.connect(url, function(err) {
  if (err) {
    console.log('Impossible de se connecter à la base de données.');
    process.exit(1);
  } else {
    var partie = db.get().collection('partie');
    partie.count((err,count) => {
      if (err) {
        sys.put(err);
      } else {
        //récupére le nombre de partie au chargement du serveur.
        numPartie = count;
      }
    });
    //ajoute les partie commencé
    partie.find({"end":{$exists:false}}, {_id: 0}).toArray(function(err, data) {
      for (var i = 0; i < data.length; i++) {
        rooms[data[i].room] = data[i];
      };
    });
    var server = app.listen(8080, function() {
      var adressHote = server.address().address;
      var portEcoute = server.address().port;
      console.log('l\'application est disponible à l\'adresse http://%s:%s',adressHote,portEcoute);
    });
  }
});

//constructeur de position
var cP = (function() {
  // déclaration de fonction constructeur
  var ConstructOfPosition = function(left, top, width, height, src) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.src = src;
  };

  return function(l, t, w, h, s) {
    // création d'un nouvel objet avec la fonction constructeur
    return new ConstructOfPosition(l, t, w, h, s);
  }
})();

var cartesPersonnages = [
  cP('-782px', 0, '380px', '250px', 'personnage 01.jpg'),
  cP('-782px', '-260px', '380px', '250px', 'personnage 02.jpg'),
  cP('-1172px', 0, '381px', '249px', 'personnage 03.jpg'),
  cP('-1172px', '-260px', '381px', '249px', 'personnage 04.jpg'),
  cP('-1563px', 0, '381px', '250px', 'personnage 05.jpg'),
  cP('-1563px', '-260px', '381px', '249px', 'personnage 06.jpg'),
  cP('-391px', '-520px', '381px', '249px', 'personnage 07.jpg'),
  cP(0, '-520px', '381px', '249px', 'personnage 08.jpg'),
  cP('-782px', '-520px', '380px', '250px', 'personnage 09.jpg'),
  cP('-1172px', '-520px', '381px', '249px', 'personnage 10.jpg'),
  cP('-1563px', '-520px', '381px', '249px', 'personnage 11.jpg'),
  cP(0, '-780px', '381px', '250px', 'personnage 12.jpg'),
  cP('-391px', '-780px', '381px', '249px', 'personnage 13.jpg'),
  cP('-782px', '-780px', '380px', '250px', 'personnage 14.jpg'),
  cP('-1172px', '-780px', '381px', '250px', 'personnage 15.jpg'),
  cP('-1563px', '-780px', '381px', '250px', 'personnage 16.jpg'),
  cP(0, '-1040px', '380px', '250px', 'personnage 17.jpg'),
  cP('-391px', '-1040px', '381px', '250px', 'personnage 18.jpg'),
  cP('-782px', '-1040px', '381px', '250px', 'personnage 19.jpg'),
  cP('-1172px', '-1040px', '380px', '250px', 'personnage 20.jpg'),
  cP('-1563px', '-1040px', '381px', '250px', 'personnage 21.jpg'),
  cP(0, 0, '381px', '250px', 'personnage 22.jpg'),
  cP(0, '-260px', '380px', '251px', 'personnage 23.jpg'),
  cP('-391px', 0, '381px', '251px', 'personnage 24.jpg'),
  cP('-391px', '-260px', '381px', '250px', 'personnage 25.jpg')
];
var cartesLieux = [
  cP('-391px', '-1561px', '381px', '251px', 'lieu 01.jpg'),
  cP(0, '-1561px', '380px', '250px', 'lieu 02.jpg'),
  cP('-1563px', '-1300px', '381px', '249px', 'lieu 03.jpg'),
  cP('-1172px', '-1300px', '381px', '251px', 'lieu 04.jpg'),
  cP('-783px', '-1300px', '381px', '251px', 'lieu 05.jpg'),
  cP('-391px', '-1301px', '381px', '251px', 'lieu 06.jpg'),
  cP('0', '-1300px', '381px', '251px', 'lieu 07.jpg'),
  cP('-781px', '-1561px', '381px', '250px', 'lieu 08.jpg'),
  cP('-1172px', '-1561px', '381px', '250px', 'lieu 09.jpg'),
  cP('-1563px', '-1561px', '381px', '250px', 'lieu 10.jpg'),
  cP(0, '-1821px', '381px', '250px', 'lieu 11.jpg'),
  cP('-391px', '-1821px', '381px', '249px', 'lieu 12.jpg'),
  cP('-782px', '-1821px', '381px', '250px', 'lieu 13.jpg'),
  cP('-1173px', '-1822px', '381px', '250px', 'lieu 14.jpg'),
  cP(0, '-2343px', '381px', '251px', 'lieu 15.jpg'),
  cP('-1564px', '-2083px', '380px', '250px', 'lieu 16.jpg'),
  cP('-1173px', '-2082px', '380px', '251px', 'lieu 17.jpg'),
  cP('-782px', '-2082px', '381px', '250px', 'lieu 18.jpg'),
  cP('-391px', '-2082px', '381px', '250px', 'lieu 19.jpg'),
  cP(0, '-2082px', '381px', '250px', 'lieu 20.jpg'),
  cP('-1563px', '-1821px', '380px', '250px', 'lieu 21.jpg'),
  cP('-1564px', '-2344px', '381px', '250px', 'lieu 22.jpg'),
  cP('-1171px', '-2344px', '381px', '250px', 'lieu 23.jpg'),
  cP('-781px', '-2344px', '381px', '250px', 'lieu 24.jpg'),
  cP('-391px', '-2344px', '381px', '250px', 'lieu 25.jpg')
];
var cartesObjet = [
  cP('-804px', '-2768px', '113px', '81px', 'objet 01.jpg'),
  cP('-804px', '-2686px', '113px', '81px', 'objet 02.jpg'),
  cP('-804px', '-2604px', '113px', '81px', 'objet 03.jpg'),
  cP('-689px', '-2768px', '113px', '81px', 'objet 04.jpg'),
  cP('-689px', '-2686px', '113px', '81px', 'objet 05.jpg'),
  cP('-689px', '-2603px', '113px', '81px', 'objet 06.jpg'),
  cP('-575px', '-2768px', '113px', '81px', 'objet 07.jpg'),
  cP('-575px', '-2686px', '113px', '81px', 'objet 08.jpg'),
  cP('-575px', '-2604px', '113px', '81px', 'objet 09.jpg'),
  cP('-460px', '-2768px', '113px', '81px', 'objet 10.jpg'),
  cP('-460px', '-2686px', '113px', '81px', 'objet 11.jpg'),
  cP('-460px', '-2604px', '113px', '81px', 'objet 12.jpg'),
  cP('-345px', '-2768px', '113px', '81px', 'objet 13.jpg'),
  cP('-230px', '-2768px', '113px', '81px', 'objet 14.jpg'),
  cP('-115px', '-2768px', '113px', '81px', 'objet 15.jpg'),
  cP(0, '-2768px', '113px', '81px', 'objet 16.jpg'),
  cP('-345px', '-2686px', '113px', '81px', 'objet 17.jpg'),
  cP('-230px', '-2686px', '113px', '81px', 'objet 18.jpg'),
  cP('-115px', '-2686px', '113px', '81px', 'objet 19.jpg'),
  cP(0, '-2686px', '113px', '81px', 'objet 20.jpg'),
  cP('-345px', '-2604px', '113px', '81px', 'objet 21.jpg'),
  cP('-230px', '-2604px', '113px', '81px', 'objet 22.jpg'),
  cP('-115px', '-2604px', '113px', '81px', 'objet 23.jpg'),
  cP(0, '-2604px', '113px', '81px', 'objet 24.jpg')
];
var carteVisions = [
  cP(0, 0, '150px', '228px', 'carte 01.jpg'),
  cP('-155px', 0, '150px', '229px', 'carte 02.jpg'),
  cP('-310px', 0, '150px', '228px', 'carte 03.jpg'),
  cP('-465px', 0, '150px', '228px', 'carte 04.jpg'),
  cP('-620px', 0, '150px', '228px', 'carte 05.jpg'),
  cP('-775px', 0, '149px', '228px', 'carte 06.jpg'),
  cP('-929px', 0, '150px', '228px', 'carte 07.jpg'),
  cP('-1084px', 0, '150px', '227px', 'carte 08.jpg'),
  cP('-1239px', 0, '150px', '227px', 'carte 09.jpg'),
  cP('-1394px', 0, '149px', '227px', 'carte 10.jpg'),
  cP('-1548px', 0, '149px', '227px', 'carte 11.jpg'),
  cP('-1702px', 0, '150px', '227px', 'carte 12.jpg'),
  cP(0, '-235px', '150px', '228px', 'carte 13.jpg'),
  cP('-155px', '-235px', '150px', '228px', 'carte 14.jpg'),
  cP('-310px', '-235px', '150px', '228px', 'carte 15.jpg'),
  cP('-465px', '-235px', '150px', '228px', 'carte 16.jpg'),
  cP('-620px', '-235px', '150px', '228px', 'carte 17.jpg'),
  cP('-775px', '-235px', '150px', '228px', 'carte 18.jpg'),
  cP('-930px', '-235px', '150px', '228px', 'carte 19.jpg'),
  cP('-1085px', '-235px', '150px', '228px', 'carte 20.jpg'),
  cP('-1240px', '-235px', '150px', '228px', 'carte 21.jpg'),
  cP('-1395px', '-235px', '150px', '228px', 'carte 22.jpg'),
  cP('-1550px', '-235px', '150px', '228px', 'carte 23.jpg'),
  cP('-1705px', '-235px', '147px', '228px', 'carte 24.jpg'),
  cP(0, '-470px', '150px', '228px', 'carte 25.jpg'),
  cP('-155px', '-470px', '150px', '228px', 'carte 26.jpg'),
  cP('-310px', '-470px', '150px', '228px', 'carte 27.jpg'),
  cP('-465px', '-470px', '150px', '228px', 'carte 28.jpg'),
  cP('-620px', '-470px', '150px', '228px', 'carte 29.jpg'),
  cP('-775px', '-470px', '150px', '228px', 'carte 30.jpg'),
  cP('-930px', '-470px', '150px', '228px', 'carte 31.jpg'),
  cP('-1085px', '-470px', '150px', '228px', 'carte 32.jpg'),
  cP('-1240px', '-470px', '150px', '228px', 'carte 33.jpg'),
  cP('-1395px', '-470px', '150px', '228px', 'carte 34.jpg'),
  cP('-1550px', '-470px', '150px', '228px', 'carte 35.jpg'),
  cP('1704px', '-470px', '149px', '228px', 'carte 36.jpg'),
  cP(0, '-705px', '149px', '228px', 'carte 37.jpg'),
  cP('-154px', '-705px', '149px', '228px', 'carte 38.jpg'),
  cP('-309px', '-705px', '149px', '228px', 'carte 39.jpg'),
  cP('-464px', '-705px', '149px', '228px', 'carte 40.jpg'),
  cP('-620px', '-705px', '149px', '228px', 'carte 41.jpg'),
  cP('-774px', '705px', '149px', '228px', 'carte 42.jpg'),
  cP('-929px', '-705px', '149px', '228px', 'carte 43.jpg'),
  cP('-1084px', '-706px', '149px', '228px', 'carte 44.jpg'),
  cP('-1239px', '-705px', '149px', '228px', 'carte 45.jpg'),
  cP('-1394px', '-705px', '149px', '228px', 'carte 46.jpg'),
  cP('-1549px', '705px', '149px', '228px', 'carte 47.jpg'),
  cP('-1704px', '-705px', '149px', '228px', 'carte 48.jpg'),
  cP(0, '-940px', '149px', '228px', 'carte 49.jpg'),
  cP('-154px', '-940px', '149px', '228px', 'carte 50.jpg'),
  cP(0, 0, '150px', '228px', 'carte 01.jpg'),
  cP('-155px', 0, '150px', '229px', 'carte 02.jpg'),
  cP('-310px', 0, '150px', '228px', 'carte 03.jpg'),
  cP('-465px', 0, '150px', '228px', 'carte 04.jpg'),
  cP('-620px', 0, '150px', '228px', 'carte 05.jpg'),
  cP('-775px', 0, '149px', '228px', 'carte 06.jpg'),
  cP('-929px', 0, '150px', '228px', 'carte 07.jpg'),
  cP('-1084px', 0, '150px', '227px', 'carte 08.jpg'),
  cP('-1239px', 0, '150px', '227px', 'carte 09.jpg'),
  cP('-1394px', 0, '149px', '227px', 'carte 10.jpg'),
  cP('-1548px', 0, '149px', '227px', 'carte 11.jpg'),
  cP('-1702px', 0, '150px', '227px', 'carte 12.jpg'),
  cP(0, '-235px', '150px', '228px', 'carte 13.jpg'),
  cP('-155px', '-235px', '150px', '228px', 'carte 14.jpg'),
  cP('-310px', '-235px', '150px', '228px', 'carte 15.jpg'),
  cP('-465px', '-235px', '150px', '228px', 'carte 16.jpg'),
  cP('-620px', '-235px', '150px', '228px', 'carte 17.jpg'),
  cP('-775px', '-235px', '150px', '228px', 'carte 18.jpg'),
  cP('-930px', '-235px', '150px', '228px', 'carte 19.jpg'),
  cP('-1085px', '-235px', '150px', '228px', 'carte 20.jpg'),
  cP('-1240px', '-235px', '150px', '228px', 'carte 21.jpg'),
  cP('-1395px', '-235px', '150px', '228px', 'carte 22.jpg'),
  cP('-1550px', '-235px', '150px', '228px', 'carte 23.jpg'),
  cP('-1705px', '-235px', '147px', '228px', 'carte 24.jpg'),
  cP(0, '-470px', '150px', '228px', 'carte 25.jpg'),
  cP('-155px', '-470px', '150px', '228px', 'carte 26.jpg'),
  cP('-310px', '-470px', '150px', '228px', 'carte 27.jpg'),
  cP('-465px', '-470px', '150px', '228px', 'carte 28.jpg'),
  cP('-620px', '-470px', '150px', '228px', 'carte 29.jpg'),
  cP('-775px', '-470px', '150px', '228px', 'carte 30.jpg'),
  cP('-930px', '-470px', '150px', '228px', 'carte 31.jpg'),
  cP('-1085px', '-470px', '150px', '228px', 'carte 32.jpg'),
  cP('-1240px', '-470px', '150px', '228px', 'carte 33.jpg'),
  cP('-1395px', '-470px', '150px', '228px', 'carte 34.jpg'),
  cP('-1550px', '-470px', '150px', '228px', 'carte 35.jpg'),
  cP('1704px', '-470px', '149px', '228px', 'carte 36.jpg'),
  cP(0, '-705px', '149px', '228px', 'carte 37.jpg'),
  cP('-154px', '-705px', '149px', '228px', 'carte 38.jpg'),
  cP('-309px', '-705px', '149px', '228px', 'carte 39.jpg'),
  cP('-464px', '-705px', '149px', '228px', 'carte 40.jpg'),
  cP('-620px', '-705px', '149px', '228px', 'carte 41.jpg'),
  cP('-774px', '705px', '149px', '228px', 'carte 42.jpg'),
  cP('-929px', '-705px', '149px', '228px', 'carte 43.jpg'),
  cP('-1084px', '-706px', '149px', '228px', 'carte 44.jpg'),
  cP('-1239px', '-705px', '149px', '228px', 'carte 45.jpg'),
  cP('-1394px', '-705px', '149px', '228px', 'carte 46.jpg'),
  cP('-1549px', '705px', '149px', '228px', 'carte 47.jpg'),
  cP('-1704px', '-705px', '149px', '228px', 'carte 48.jpg'),
  cP(0, '-940px', '149px', '228px', 'carte 49.jpg'),
  cP('-154px', '-940px', '149px', '228px', 'carte 50.jpg'),
  cP(0, 0, '150px', '228px', 'carte 01.jpg'),
  cP('-155px', 0, '150px', '229px', 'carte 02.jpg'),
  cP('-310px', 0, '150px', '228px', 'carte 03.jpg'),
  cP('-465px', 0, '150px', '228px', 'carte 04.jpg'),
  cP('-620px', 0, '150px', '228px', 'carte 05.jpg'),
  cP('-775px', 0, '149px', '228px', 'carte 06.jpg'),
  cP('-929px', 0, '150px', '228px', 'carte 07.jpg'),
  cP('-1084px', 0, '150px', '227px', 'carte 08.jpg'),
  cP('-1239px', 0, '150px', '227px', 'carte 09.jpg'),
  cP('-1394px', 0, '149px', '227px', 'carte 10.jpg'),
  cP('-1548px', 0, '149px', '227px', 'carte 11.jpg'),
  cP('-1702px', 0, '150px', '227px', 'carte 12.jpg'),
  cP(0, '-235px', '150px', '228px', 'carte 13.jpg'),
  cP('-155px', '-235px', '150px', '228px', 'carte 14.jpg'),
  cP('-310px', '-235px', '150px', '228px', 'carte 15.jpg'),
  cP('-465px', '-235px', '150px', '228px', 'carte 16.jpg'),
  cP('-620px', '-235px', '150px', '228px', 'carte 17.jpg'),
  cP('-775px', '-235px', '150px', '228px', 'carte 18.jpg'),
  cP('-930px', '-235px', '150px', '228px', 'carte 19.jpg'),
  cP('-1085px', '-235px', '150px', '228px', 'carte 20.jpg'),
  cP('-1240px', '-235px', '150px', '228px', 'carte 21.jpg'),
  cP('-1395px', '-235px', '150px', '228px', 'carte 22.jpg'),
  cP('-1550px', '-235px', '150px', '228px', 'carte 23.jpg'),
  cP('-1705px', '-235px', '147px', '228px', 'carte 24.jpg'),
  cP('-930px', '-470px', '150px', '228px', 'carte 31.jpg'),
  cP('-1085px', '-470px', '150px', '228px', 'carte 32.jpg'),
  cP('-1240px', '-470px', '150px', '228px', 'carte 33.jpg'),
  cP('-1395px', '-470px', '150px', '228px', 'carte 34.jpg'),
  cP('-1550px', '-470px', '150px', '228px', 'carte 35.jpg')
];
