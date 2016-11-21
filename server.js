
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
var vision = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126];


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
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on('room', (room) => {
    socket.join(room);
  });

  //add player
  socket.on('create player', (data) => {

    var partie = db.get().collection('partie');
    //ajoute la room dans la BDD
    partie.count((err,count) => {
      numPartie = count;
    });

    var room, numPlayer, joue, start;
    // Connection collection
    var users = db.get().collection('users');
    //vérifie si l'utilisateur existe
    users.findOne({username : data.username}, function (err, result) {

      if (result) {
        //vérifie si le joueur fait partie d'une room
        if (result.partie && result.partie.room) {
          //enregistre les information du joueur
          numPlayer = result.partie.numPlayer;
          room = result.partie.room;
          if (result.joue) {
            joue = result.joue;
            if (!rooms[room]) {
              rooms[room] = {};
            }
            if (rooms[room]['joueur' + numPlayer]) {
              rooms[room]['joueur' + numPlayer].joue = joue;
            } else {
              rooms[room]['joueur' + numPlayer] = {};
              rooms[room]['joueur' + numPlayer].username = data.username;
              rooms[room]['joueur' + numPlayer].joue = joue;
            }
          }
          if (result.start) {
            start = true;
            rooms[room].start = true;
          }
          // ajout dans la room
          socket.join(room);
        }
      } else {
        // Connection collection
        var users = db.get().collection('users');
        users.insert({username : data.username});
      }

      //vérifie que le player n'a pas de room
      if ( !room ) {
        //vérifie qu'une room existe
        if ( numPartie == 0 ) {
          //créé une nouvelle room
          room = createRoom();
          numPlayer = 1;
          rooms[room].joueur1 = {};
          rooms[room].joueur1.username = data.username;
          socket.join(room);
          // Connection collection
          var users = db.get().collection('users');
          //ajoute la room dans la BDD users
          users.updateOne({username : data.username}, { $set: {partie: {room : room, numPlayer : 1}}}, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
          var partie = db.get().collection('partie');
          //ajoute la room dans la BDD partie
          partie.updateOne({room : room}, { $set: {joueur1 : {username : data.username} } }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
        } else {
          //vérifie que la room est libre
          if ( rooms[numPartie] ) {
            //vérifie si une room à une place disponible
            if (rooms[numPartie].nbPlayer < 7) {
              //enregistre le numéro de la room
              room = numPartie;
              //incrémente le nombre de joueur
              rooms[numPartie].nbPlayer++;
              //enregistre le numéro du joueur
              numPlayer = rooms[numPartie].nbPlayer;
              //enregistre le pseudo du joueur
              rooms[numPartie]['joueur' + rooms[numPartie].nbPlayer] = {};
              rooms[numPartie]['joueur' + rooms[numPartie].nbPlayer].username = data.username;
              // Connection collection
              var users = db.get().collection('users');
              //ajoute le numéro de la room
              users.updateOne({username : data.username}, { $set: {partie: {room : numPartie, numPlayer : numPlayer}}}, (err, result) => {
                if (err) {
                  console.log(err);
                }
              });
              var partie = db.get().collection('partie');
              //ajoute la room dans la BDD partie
              partie.updateOne({room : room}, { $set: {['joueur' + numPlayer] : {username : data.username} } }, (err, result) => {
                if (err) {
                  console.log(err);
                }
              });
              socket.join(room);
            }
          }
          //vérifie qu'une room à bien était créé ou ajouté
          if (!room) {
            room = createRoom(this);
            numPlayer = 1;
            rooms[room].joueur1 = {};
            rooms[room].joueur1.username = data.username;
            // Connection collection
            var users = db.get().collection('users');
            users.updateOne({username : data.username}, { $set: {partie: {room : room, numPlayer : 1}}}, (err, result) => {
              if (err) {
                console.log(err);
              }
            });
            var partie = db.get().collection('partie');
            //ajoute la room dans la BDD
            partie.updateOne({room : room}, { $set: {joueur1 : {username : data.username} } }, (err, result) => {
              if (err) {
                console.log(err);
              }
            });
          }
        }
      }
      socket.emit('joincreateconfirm', {room: room, numPlayer: numPlayer, joue: joue, start: start});
      // Let the existing players in room know there is a new player
      // TODO -- Add room number to this / Player class
      socketIOWebSocketServer.in(room).emit('new player', {
        name:data.username
      });

    });
  });
  socket.on('disconnect', (data) => {
    console.log(data);
    // If the room is empty, remove the room and tell the players,
    // if not, just tell the players the player has left
    socket.leave(data.room);
     if(socketIOWebSocketServer.in(data.room) === []) {
        rooms.splice(rooms.indexOf(data.room), 1);
    } else {
        socketIOWebSocketServer.in(data.room).emit("remove player", {username: data.username});
    }
    // Connection collection
    var users = db.get().collection('users');
    users.updateOne({username : data.username}, { $unset: {room : ''}}, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  });

  /**
    On attache un gestionnaire d'évènement à un évènement personnalisé 'unJoueur'
    qui correspond à un événement déclaré coté client qui est déclenché lorsqu'un message
    a été reçu en provenance du client WebSocket.
  **/
  socket.on('unJoueur', (data) => {

    // Affichage du message reçu dans la console.
    console.log(data);

    // Connection collection
    var partie = db.get().collection('partie');
    var users = db.get().collection('users');
    //selection des personnnage
    if (data.choisPerso) {
      var allSelectPlayer = 0;
      //choix du fantome et le fantome n'a pas déjà été choisi
      if ( data.perso == 'fantom' && !rooms[data.room].fantom && !rooms[data.room]['joueur' + data.numPlayer].joue ) {
        //enregistre la valeur
        partie.updateOne({room : data.room}, { $set: {['joueur' + data.numPlayer] : {joue : data.perso}}}, function(err, result) {
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
        rooms[data.room]['joueur' + data.numPlayer].joue = data.perso;
        console.log(rooms[data.room]);
      } else {
        //vérifie si le fantome a déjà été choisi
        if ( rooms[data.room].fantom ) {
          //et que le joueur n'a pas déjà un personnage.
          if ( !rooms[data.room]['joueur' + data.numPlayer].joue ) {
            //enregistre la valeur
            partie.updateOne({room : data.room}, { $set: {['joueur' + data.numPlayer] : {joue : data.perso}}}, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
            users.updateOne({username : data.username}, { $set: {joue : data.perso} }, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
            rooms[data.room]['joueur' + data.numPlayer].joue = data.perso;
          }
        } else {
          data.fantom = true;
        }
      }

      //vérifie que tous les joueurs on slectionné un personnage, qu'il y en a au moins 2 et que le niveau à était selectionné
      if (rooms[data.room].nbPlayer > 1 && rooms[data.room].level) {
        for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
          if (rooms[data.room]['joueur' + i].joue) {
            allSelectPlayer++;
          }
        }
        if (allSelectPlayer == rooms[data.room].nbPlayer) {
          data.start = true;
          rooms[data.room].listesCartes = cartes.get(rooms[data.room].level, rooms[data.room].nbPlayer);
          rooms[data.room].vision = cartes.vision(vision);
          partie.updateOne({room : data.room}, { $set: {start: true, listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision}}, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
          for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
            users.updateOne({username : rooms[data.room]['joueur' + i].username}, { $set: {start: true} }, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
          }
        }
      }
    }

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('mysterium', data);
    /**
    On déclare un évènement personnalisé 'unAutreEvenement'
    dont la réception sera gérée coté client.
    **/
  });
  socket.on('chat', function (data) {

    // Envoi d'un message au client WebSocket.
    socketIOWebSocketServer.in(data.room).emit('chatMysterium', data);
    /**
    On déclare un évènement personnalisé 'unAutreEvenement'
    dont la réception sera gérée coté client.
    **/
  });
  socket.on('level', function (data) {
    rooms[data.room].level = data.level;
    var allSelectPlayer = 0;
    // Connection collection
    var partie = db.get().collection('partie');
    var users = db.get().collection('users');

    //vérifie que tous les joueurs on slectionné un personnage, qu'il y en a au moins 2
    if (rooms[data.room].nbPlayer > 1) {
      for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
        if (rooms[data.room]['joueur' + i].joue) {
          allSelectPlayer++;
        }
      }
      if (allSelectPlayer == rooms[data.room].nbPlayer) {
        data.start = true;
        rooms[data.room].listesCartes = cartes.get(rooms[data.room].level, rooms[data.room].nbPlayer);
        rooms[data.room].vision = cartes.vision(vision);
        partie.updateOne({room : data.room}, { $set: {start: true, listesCartes:rooms[data.room].listesCartes, vision : rooms[data.room].vision}}, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        });
        //enregistre que la partie à commencé pour tous les joueurs
        for (var i = 1; i <= rooms[data.room].nbPlayer; i++) {
          users.updateOne({username : rooms[data.room]['joueur' + i].username}, { $set: {start: true} }, function(err, result) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }

    // Connection collection
    var partie = db.get().collection('partie');

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
  // socket.on("ping", pong);
  // socket.on("statuschange", onStatusChange);
  // socket.on("tryJoinCreate", onJoinCreateRoom)
  // socket.on("startgame", onStartGame)


});

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
  cP('-1563px', '1300px', '381px', '249px', 'lieu 03.jpg'),
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
  cP('-804px', '2604px', '113px', '81px', 'objet 03.jpg'),
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
