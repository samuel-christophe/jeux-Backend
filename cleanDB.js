'use strict'
//chargement de express
var db = require('db.js');

// Connection URL
var url = 'mongodb://localhost:27017/db';

// Gestion de la connexion au démarrage
db.connect(url, function(err) {
  if (err) {
    console.log('Impossible de se connecter à la base de données.');
    process.exit(1);
  } else {
    var partie = db.get().collection('partie');
    var users = db.get().collection('users');

    partie.find({}).toArray(function(err, data) {
      data.forEach(function (item, index, array) {
        console.log(item.playerListe);
        item.playerListe.forEach(function (user, indexUser, arrayuser){
          if (user) {
            console.log(user);
            users.deleteOne({username : user.username}, function(err, result) {
              if (err) {
                console.log(err);
              }
            });
          }
          partie.deleteOne({room: item.room}, function(err, element) {
            if (err) {
              console.log(err);
            }
          });
        });
      });
    });
  }
});
