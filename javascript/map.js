var googleMap;
var googleGeocoder;
var heatmapLayer;
var dataMarkers = [];
var infoWindow;

function refreshMapForHash(refreshData) {
    clearMap();
    hash = window.location.hash;
    if(hash === '#heatmap') {
        parseData(refreshData);
    }
    else if(hash === '#markers') {
        setMarkers(refreshData);
    }
}

function setHeatMap(dataPoints){
	var points  = new google.maps.MVCArray(dataPoints);
	heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: points });
    heatmapLayer.set('radius', 1);
    heatmapLayer.set('opacity', .5);
    heatmapLayer.set('dissipating', false);
	heatmapLayer.setMap(googleMap);
}

function setMarkers(data) {
    for(i = 0; i < data.length; i++) {
        for(k = 0; k < data[i].length; k++) {
            dataPoint = data[i][k];
            latLng = new google.maps.LatLng(dataPoint['lat'], dataPoint['lng']);
            var dataMarker = new google.maps.Marker({
                position: latLng,
                map: googleMap,
                icon: getCircle(dataPoint),
            });
            bindInfoWindow(dataMarker, infoWindow, dataPoint);
            dataMarkers.push(dataMarker);
        }
    }
}

function bindInfoWindow(dataMarker, infoWindow, dataPoint) {
    google.maps.event.addListener(dataMarker, 'click', function() {
        content = '<b>' + dataPoint['event'] + '</b><br />' + dataPoint['date'];
        infoWindow.setContent(content);
        infoWindow.open(googleMap, dataMarker);
    });
}

function getCircle(dataPoint) {   
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: getColorForAgency(dataPoint['agencyType']),
        fillOpacity: 1,
        scale: 5,
        strokeColor: 'rgba(186, 186, 186, .5)',
        strokeWeight: 1,
    }
}

function initMap(){
	console.log("init");
	// Set map options
    console.log(googleMapStyles);
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(43.1656, -77.6114),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: googleMapStyles
	};
	// Create map
	googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    googleGeocoder = new google.maps.Geocoder();
    
    infoWindow = new google.maps.InfoWindow({
        content: '', 
    });
    
    sendGETRequest('/civicapp/data/popDensity.csv', [], function(response) {
        parseZipCSV(response);
        dateEnd = new Date();
        dateStart = new Date;
        dateStart.setDate(dateEnd.getDate() - 7);
        console.log(formatDate(dateStart));
        console.log(formatDate(dateEnd));
        window.onload = getRange(formatDate(dateStart), formatDate(dateEnd));
    }, handleError, 'txt');
    
    sendGETRequest('/civicapp/php/getAgencies.php', [], function(response) {
        menuAddItems(response);
    }, handleError, 'json');
    
    sendGETRequest('/civicapp/php/getRegions.php', [], function(response) {
        menuAddRegionItems(response);
    }, handleError, 'json');
}

function clearMap() {
    if(heatmapLayer)
        heatmapLayer.setMap(null);
    
    for(i = 0; i < dataMarkers.length; i ++) {
        dataMarkers[i].setMap(null);   
    }
}

google.maps.event.addDomListener(window, 'load', initMap);