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

function parseData(e){
	var positions = new Array(); // heatmap positions

var markers = [];
	for(var i = 0; i < e.length; i++){

		//positions[i] = new google.maps.LatLng( e[i].lat, e[i].lng ); // heatmap positions

var marker = new google.maps.Marker({
        position: new google.maps.LatLng( e[i].lat, e[i].lng ),
        map: map,
        title:(String)(e[i].lat + ", " + e[i].lng)
      });
      var infowindow = new google.maps.InfoWindow({
        content: (String)(e[i].lat + ", " + e[i].lng)
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });
markers.push(marker);




	}


var markerCluster = new MarkerClusterer(map, markers);

	//setHeatMap(positions); // heatmap positions
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	console.log("getRange");
	var data = {'start': start, 'end': end};
	sendGETRequst('http://civicapp.gearchicken.com/dev/getIncidents.php', data, parseData, handleError);
}

window.onload = getRange('2014-02-01', '2014-02-14');
