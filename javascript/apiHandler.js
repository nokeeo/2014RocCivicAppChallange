var markers = [];
var googleMap;
var googleGeocoder;
var heatMapLayer;

var zipPopDensity = [];

function sendGETRequst(url, params, success, error, type) {
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
                if(type === 'json')
                    success(JSON.parse(xmlHttp.responseText));
                else if(type === 'txt')
                    success(xmlHttp.responseText);
        }
    }    
    xmlHttp.open("GET", fullUrl, true);
    xmlHttp.send();
}

function parseData(data){
	var positions = new Array(); // heatmap positions
	/*for(var i = 0; i < data.length; i++){
		positions[i] = new google.maps.LatLng(data[i]['lat'], data[i]['lng']);
	}*/
    counter = 0;
    for(i = 0; i < data.length; i++) {
        if(data[i].length > 6) {
            latLng = new google.maps.LatLng(data[i][0]['lat'], data[i][0]['lng']);
            zipCode = '';
            for(k = 0; k < data[i].length; k++) {
                zipCode = parseZipCode(data[i][k].fulladdress);
                if(zipCode != '')
                    break;
            }
            
            weight = .5;
            if(zipCode != '') {
                console.log(zipPopDensity[zipCode]);
            }
            
            var weightPoint = {
                location : new google.maps.LatLng(data[i][0]['lat'], data[i][0]['lng']),
                weight : 1//data[i].length
            }
            positions.push(weightPoint);
        }
    }
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
    }, handleError, 'json');
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

//Zipcode helper functions
function parseZipCode(address) {
    addressPieces = address.split(',');
    stateZip = addressPieces[2].trim().split(' ');
    if(stateZip.length > 1)
        return stateZip[1].trim();
    else
        return '';
}

function parseZipCSV(text) {
    lines = text.split('\n');
    
    for(i = 0; i < lines.length; i++) {
        if(lines[i] != '') {
            cells = lines[i].split(',');
            zipPopDensity[cells[0]] = cells[3];
        }
    }
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
    googleGeocoder = new google.maps.Geocoder();
    
    sendGETRequst('/civicapp/data/popDensity.csv', [], function(response) {
        parseZipCSV(response);
        window.onload = getRange('2014-04-10', '2014-04-24');
    }, handleError, 'txt');
}

google.maps.event.addDomListener(window, 'load', initMap);