$(function() {
	// generate unique user id
	// var userId = Math.random().toString(16).substring(2,15);
	var userId = Math.floor(Math.random()*100000).toString();
	var socket = io.connect('/');
	// var socket = io.connect('http://ta-geo.herokuapp.com/');
	var map;
	var lastLat;
	var lastLng;
	var otherMarker = {};
	map = L.map('map',{
		scrollWheelZoom:true,
		minZoom:2,
		worldCopyJump:false,
		// zoom: 15
	})
	L.tileLayer('https://api.tiles.mapbox.com/v4/kusumahendra.ecbd7387/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    // maxZoom: 18,
	    id: 'kusumahendra.ecbd7387',
	    // center: [lat, lng],
	        
	    // accessToken: 'your.mapbox.public.access.token'
	    accessToken : 'pk.eyJ1Ijoia3VzdW1haGVuZHJhIiwiYSI6ImIyM2Q2MDdhOTJlNWM3ZjI2MGRhMWVmMTQwZTk0MDQ5In0.0ORx8I2FyER8DnBtfgRr5A'
	}).addTo(map);

	var userMarker;
	var latestMarker;
	var info = $('#infobox');
	var doc = $(document);

	// custom marker's icon styles
	var tinyIcon = L.Icon.extend({
		options: {
			shadowUrl: '../assets/marker-shadow.png',
			iconSize: [25, 39],
			iconAnchor:   [12, 36],
			shadowSize: [41, 41],
			shadowAnchor: [12, 38],
			popupAnchor: [0, -30]
		}
	});
	var redIcon = new tinyIcon({ iconUrl: '../assets/marker-red.png' });
	var yellowIcon = new tinyIcon({ iconUrl: '../assets/marker-yellow.png' });

	var sentData = {};
	var received = {}
	var connects = {};
	var markers = {};
	var active = false;
	// load other user markers
	socket.on('load:coords', function(data) {
		// console.log(typeof(data.id));
		// console.log('now loading coords');
		// if (!(data.id in connects)) {
		setMarker(data);
		// }
		connects[data.id] = data;
		connects[data.id].updated = $.now(); // shothand for (new Date).getTime()
		var receivedData ={
			loc : data['loc'],
			receiver : userId,
			time : Date.now()
		}
		socket.emit('send:succeed', receivedData);
	});

	// check whether browser supports geolocation api
	if (navigator.geolocation) {
		// navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
		navigator.geolocation.getCurrentPosition(displayAndWatch, positionError, { enableHighAccuracy: true });

	} else {
		$('.map').text('Your browser is out of fashion, there\'s no geolocation!');
	}

	function displayAndWatch(position) {
	    // set current position
	    var userData = setUserLocation(position);
	    // watch position
	    watchCurrentPosition(userData);
	}
	function watchCurrentPosition(userData) {
	    var positionTimer = navigator.geolocation.watchPosition(function(position) {
	        setCurrentPosition(latestMarker,position);
	        // socket.emit('send:coords', sentData);

	        // if ( lastLat!=position.coords.latitude  ) {
		    // }
	        // map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	    });
	}
	function setCurrentPosition(userData,position){
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acr = position.coords.accuracy;
		var locId = Math.random().toString(16).substring(2,15);
		active = true;

		// alert(userId);
		if ( lastLat!=lat && lastLng!=lng ) {
			sentData = {
				loc: locId,
				id: userId,
				active: active,
				coords: [{
					lat: lat,
					lng: lng,
					acr: acr,
					time: Date.now()
				}]
			};
			// socket.emit('send:coords', sentData);
			socket.emit('send:coords', sentData);
			userMarker.setLatLng([lat,lng]).update();
			lastLat=lat;
			lastLng=lng;
			map.setView([lat,lng]);
		};
		// userMarker.setLatLng(newLatLng); 
		// userMarker.addTo(map);
	}
	function setUserLocation(position) {
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acr = position.coords.accuracy;
		var locId = Math.random().toString(16).substring(2,15);

		// mark user's position
		userMarker = L.marker([lat, lng], {
			icon: redIcon
		});
		
		map.setView([lat,lng],15);
		

		userMarker.addTo(map);
		userMarker.bindPopup('<p>You are there! Your ID is ' + userId + '</p>').openPopup();

		var emit = $.now();
		
		if ( lastLat!=lat && lastLng!=lng ) {
			sentData = {
				loc: locId,
				id: userId,
				active: active,
				coords: [{
					lat: lat,
					lng: lng,
					acr: acr,
					time: Date.now()
				}]
			};
			socket.emit('send:coords', sentData);
			userMarker.setLatLng([lat,lng]).update();
			lastLat=lat;
			lastLng=lng;
		};

		return sentData;
	}

	doc.bind('mouseup mouseleave', function() {
		active = false;
	});

	// showing markers for connections
	function setMarker(data) {
		console.log(data.id);
		for (var i = 0; i < data.coords.length; i++) {
			if(!otherMarker[data.id])
			// if (!(map.hasLayer(otherMarker[data.id[i]])))
			{
				var newMarker = L.marker([data.coords[i].lat, data.coords[i].lng], { icon: yellowIcon })
				// .addTo(map);
				otherMarker[data.id] = newMarker;
				otherMarker[data.id].addTo(map);
				otherMarker[data.id].bindPopup('<p>One more external user is here! ('+data.id+')</p>');
      			// alert('nuu');
      			console.log(otherMarker[data.id]);
			}
			else 
			{

				otherMarker[data.id].setLatLng([data.coords[i].lat, data.coords[i].lng]).update();

			}

		}
	}

	// handle geolocation api errors
	function positionError(error) {
		var errors = {
			1: 'Authorization fails', // permission denied
			2: 'Can\'t detect your location', //position unavailable
			3: 'Connection timeout' // timeout
		};
		showError('Error:' + errors[error.code]);
	}

	function showError(msg) {
		info.addClass('error').text(msg);

		doc.click(function() {
			info.removeClass('error');
		});
	}

	// delete inactive users every 15 sec
	setInterval(function() {
		for (var ident in connects){
			if ($.now() - connects[ident].updated > 15000) {
				delete connects[ident];
				map.removeLayer(markers[ident]);
			}
		}
	}, 15000);
});