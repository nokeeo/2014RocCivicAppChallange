var markers = [];
var googleMap;
var heatMapLayer

function sendGETRequst(url, params, success, error) {
    var index = 0;
    var formatParams = '';
    for(key in params) {
        //If the current element is the first
        if(index === 0) {
            formatParams += '?';
        }
        else {
            formatParams += '&';
        }
        formatParams += key + '=' + params[key];
        index++;
    }
    
    var fullUrl = url + formatParams;
 
    var xmlHttp = new XMLHttpRequest();   
    xmlHttp.onreadystatechange=function() {
        if(xmlHttp.readyState === 4) {
            if(xmlHttp.status === 200)
                success(JSON.parse(xmlHttp.responseText));
        }
    }    
    xmlHttp.open("GET", fullUrl, true);
    xmlHttp.send();
}

function parseData(data){
	var positions = new Array(); // heatmap positions
    console.log(data);
	/*for(var i = 0; i < data.length; i++){
		positions[i] = new google.maps.LatLng(data[i]['lat'], data[i]['lng']);
	}*/
    for(i = 0; i < data.length; i++) {
        if(data[i].length > 6) {
            var weightPoint = {
                location : new google.maps.LatLng(data[i][0]['lat'], data[i][0]['lng']),
                weight : 1//data[i].length
            }
            positions.push(weightPoint);
        }
    }
    console.log(data[i]);
	setHeatMap(positions); // heatmap positions
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	var params = {'start': start, 'end': end};
	sendGETRequst('/civicapp/php/getClusters.php', params, function(response) {
        parseData(response);
        fadeOut(document.getElementById('activityIndicator'));
    }, handleError);
}

function fadeOut(el) {
    el.style.transition = 'opacity 1.5s ease';
    el.style.webkitTransition = 'opacity 1.5s ease';
    var fadeOutObject = el;
    var fadOutComplete = function(event) {
        fadeOutObject.style.display = 'none';
    }
    el.addEventListener('webkitTransitionEnd', fadOutComplete, false);
    el.addEventListener('transitionend', fadOutComplete, false);
    el.addEventListener('oTransitionEnd', fadOutComplete, false);
    el.style.opacity = '0';
}

//Heatmap Functions

function setHeatMap(dataPoints){
	console.log("set");
	var points  = new google.maps.MVCArray(dataPoints);
	heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: points });
    heatmapLayer.set('radius', 1);
    heatmapLayer.set('opacity', .5);
    heatmapLayer.set('dissipating', false);
	heatmapLayer.setMap(googleMap);
}

function initMap(){
	console.log("init");
	// Set map options
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(43.1656, -77.6114),
		mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true
	};
	// Create map
	googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initMap);
window.onload = getRange('2014-04-10', '2014-04-24');