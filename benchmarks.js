// var profile = require('v8-profiler');
var io = require('socket.io-client');

// var message = "o bispo de constantinopla nao quer se desconstantinopolizar";

function user(host, port) {
  var socket = io.connect('http://' + host + ':' + port, {'force new connection': true});

  socket.on('connect', function() {
    // Start messaging loop
    if (shouldBroadcast) {
      // message will be broadcasted by server
      socket.emit('broadcast', message);
    } else {
      // message will be echoed by server
      socket.send(message);
    }

    socket.on('message', function(message) {
      socket.send(message);
    });

    socket.on('broadcastOk', function() {
      socket.emit('broadcast', message);
    });


    //--------------
    var sentData = {};
    var active = true;
    var userId = Math.random().toString(16).substring(2,15);
    var lat;
    var lng;
    var acr=1;

    // if (shouldBroadcast) {
      // while(true){
      // socket.on('send:coords',function(sentData){
        lat = randlat();
        lng = randlong();
        sentData = {
          id: userId,
          active: active,
          coords: [{
            lat: lat,
            lng: lng,
            acr: acr
          }]
        };
        socket.emit('send:coords', sentData);
      // });
    // }
  });

}

var argvIndex = 2;

var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 3000; // in seconds
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '8080';

for(var i=0; i<users; i++) {
  setTimeout(function() { user(host, port); }, i * newUserTimeout);
};
// while(true){
  
// }

//latitude -90 ------- 90
function randlat(){
  var A=-90;
  var B=90;
  return( A + (B-A)*Math.random() ); // num is random, from A to B 
}
//latitude  -180 ------ 180
function randlong(){
  var A=-180;
  var B=180;
  return( A + (B-A)*Math.random() ); // num is random, from A to B 
}
