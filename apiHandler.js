var markers = [];
var infoWindows = [];
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
Array.prototype.marker=function()
{
 var output = new [];
for (i=0;i<this.length;i++)
  {
  output.push(this[i].marker);
  }
return output;
}
function parseData(e){
	var positions = new Array(); // heatmap positions

	for(var i = 0; i < e.length; i++){

		//positions[i] = new google.maps.LatLng( e[i].lat, e[i].lng ); // heatmap positions

          markers[i] = {'marker':new google.maps.Marker({
            position: new google.maps.LatLng( e[i].lat, e[i].lng ),
            map: map,
            title:(String)(e[i].lat + ", " + e[i].lng)
          }), 'window':null};

	//NEEDS TO CREATE AN INFO WINDOW:
	//THIS IS HOW WE WILL DISPLAY IMPORTANT DESCRIPTION INFO
          markers[i].window = new google.maps.InfoWindow({
            content: (String)('<h1>'+e[i].fulladdress+'</h1><p>'+e[i].event+'</p>')
          });
          google.maps.event.addListener(markers[i].marker, 'click', function() {
            markers[i].window.open(map,markers[i].marker);
          });
          markers.push(markers[i]);
        }


var markerCluster = new MarkerClusterer(map, markers.marker);

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
