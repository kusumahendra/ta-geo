// var profile = require('v8-profiler');
var io = require('socket.io-client');

// var message = "o bispo de constantinopla nao quer se desconstantinopolizar";

function user(host, port) {
  var socket = io.connect('http://' + host + ':' + port, {'force new connection': true});
  var sentData = {};
  var active = true;
  var userId = Math.random().toString(16).substring(2,15);
  var lat;
  var lng;
  var acr=1;

  

  socket.on('connect', function() {

    setInterval(function(){
      lat = randlat();
      lng = randlong();
      sentData = {
        id: userId,
        active: true,
        coords: [{
          lat: lat,
          lng: lng,
          acr: 1
        }]
      };
      socket.emit('send:coords', sentData);
      // console.log("send");
      // socket.on('send:coords', function(sentData) {
      //   socket.emit('send:coords', sentData);
      // });

      socket.on('load:coords', function() {

      });
    },1000);
 
  });


}

var argvIndex = 2;

var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000; // in seconds
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '3000';

for(var i=0; i<users; i++) {
  setTimeout(function() { user(host, port); }, i * newUserTimeout);
};
// while(true){
  
// }

//latitude -90 ------- 90
function randlat(){
  // var A=-90;
  // var B=90;
  // return( A + (B-A)*Math.random() ); // num is random, from A to B 
  return( -90 + (180)*Math.random() ); // num is random, from A to B 

}
//latitude  -180 ------ 180
function randlong(){
  // var A=-180;
  // var B=180;
  // return( A + (B-A)*Math.random() ); // num is random, from A to B 
  return( -180 + (360)*Math.random() ); // num is random, from A to B 

}
