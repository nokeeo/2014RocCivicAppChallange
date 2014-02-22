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
	for(int i = 0; i < e.length; i++){
		positions = new google.maps.LatLng( e.[i].Lat, e.[i].Lng ); // heatmap positions
	}
	setHeatMap(positions); // heatmap positions
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	var data = {'start': start, 'end': end};
	sendGETRequst('http://civicapp.gearchicken.com/dev/getIncidents.php', data, parseData, handleError);
}

window.onload = getRange('2014-02-01', '2014-02-03');