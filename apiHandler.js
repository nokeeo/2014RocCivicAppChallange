var markers = [];
var fadeOutObject;

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
		var iconImage = "";
		if(e.agencyType == "Police")
		{
			iconImage="icon_4404.png";
		}
		if(e.agencyType == "Fire")
		{
			iconImage="icon_2405.png";
		}
		if(e.agencyType == "Ambulance")
		{
			iconImage="icon_3822.png";
		}
		if(e.agencyType == "Traffic")
		{
			iconImage="icon_12526.png";
		}
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng( e[i].lat, e[i].lng ),
			map: map,
			title:(String)(e[i].lat + ", " + e[i].lng),
			icon: iconImage
		  });
		markers[i] = marker;
	}
	var markerCluster = new MarkerClusterer(map, markers);

	//setHeatMap(positions); // heatmap positions
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	var params = {'start': start, 'end': end};
	sendGETRequst('/civicapp/dev/php/getIncidents.php', params, function(response) {
        parseData(response);
        fadeOut(document.getElementById('activityIndicator'));
    }, handleError);
}

function fadeOut(el) {
    el.style.transition = 'opacity 1.5s ease';
    el.style.webkitTransition = 'opacity 1.5s ease';
    fadeOutObject = el;
    var fadOutComplete = function(event) {
        fadeOutObject.style.display = 'none';
    }
    el.addEventListener('webkitTransitionEnd', fadOutComplete, false);
    el.addEventListener('transitionend', fadOutComplete, false);
    el.addEventListener('oTransitionEnd', fadOutComplete, false);
    el.style.opacity = '0';
}

window.onload = getRange('2014-02-01', '2014-02-14');
