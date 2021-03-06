var http = require('http');
try {
  var exec = require('child_process').exec; 
} catch(e) {
    console.error(e.message);
    console.error("child process is probably not found. Try running `npm install mocha`.");
    process.exit(e.code);
}

try {
    var static = require('node-static');
} catch(e) {
    console.error(e.message);
    console.error("node-static is probably not found. Try running `npm install mocha`.");
    process.exit(e.code);
}
// var static = require('node-static');
var app = http.createServer(handler);

try {
	var io = require('socket.io').listen(app);
} catch(e) {
    console.error(e.message);
    console.error("socket.io is probably not found. Try running `npm install mocha`.");
    process.exit(e.code);
}

var port = (process.env.PORT || 3000);


var files = new static.Server('./public');

var timeReceived;
function handler (request, response) {
  request.on('end', function() {
    files.serve(request, response);
    }).resume();
  }
// delete to see more logs from sockets
  // io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    // users++;
    // console.log("nowwwws");

    socket.on('send:coords', function (data) {
      timeReceived= Date.now();
        // countSended += users-1;

        socket.broadcast.emit('load:coords', data);
        console.log('\t'+data['loc']+'\t'+data['id']+'\t'+data['coords'][0]['lat']+'\t'+data['coords'][0]['lng']+'\t'+data['coords'][0]['time']+'\t'+timeReceived+'\t'+ Date.now());
        // console.log(data['id']+'\t'+data['coords'][0]['lat']+'\t'+data['coords'][0]['lng']+'\t'+data['coords'][0]['time']+'\t'+timeReceived+'\t'+Date.now());

        // countReceived+= users-1;
    });
    socket.on('send:succeed',function (data){
      console.log('\t'+data['loc']+'\t'+data['receiver']+'\t\t\t\t\t'+data['time']);
    });
    socket.on('disconnect', function() {
      // users--;
    });
  });

// start app on specified port
app.listen(port);
// app.listen(process.env.PORT || port,0.0.0.0);
// app.listen(process.env.PORT || port,192.168.43.7);
// app.listen(process.env.PORT || port,'0.0.0.0');
// app.listen(process.env.PORT || port,'192.168.43.7');


console.log('Your server goes on localhost:' + port);

//----------------------------------------------------------------------
// var getCpuCommand = "ps aux " + process.pid + " | grep " + process.pid;

// var users = 0;
// var countReceived = 0;
// var countSended = 0;


function roundNumber(num, precision) {
  return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
}

// setInterval(function() {
  // var auxReceived = 
  // var msuReceived = (users > 0 ? (roundNumber(countReceived / users, 1)) : 0);

  // var auxSended = 
  // var msuSended = (users > 0 ? (roundNumber(countSended / users, 1)) : 0);

  // call a system command (ps) to get current process resources utilization
  // var child = exec(getCpuCommand, function(error, stdout, stderr) {
  //   var s = stdout.split(/\s+/);
  //   // var cpu = s[2];
  //   // var memory = s[3];

  //   var l = [
  //     'U: ' + users,
  //     'MR/S: ' + countReceived,
  //     // 'MS/S: ' + countSended,
  //     'MR/S/U: ' + (users > 0 ? (roundNumber(countReceived / users, 1)) : 0),
  //     // 'MS/S/U: ' + (users > 0 ? (roundNumber(countSended / users, 1)) : 0),
  //     'CPU: ' + s[2],
  //     'Mem: ' + s[3]
  //   ];

  //   console.log(l.join('\t'));
  //   countReceived = 0;
  //   // countSended = 0;
  // });
// }, 1000);