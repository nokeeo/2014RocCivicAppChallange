var map; // google map 
var heatmap; // heat map layer for google map

function init(){
	console.log("init");
	// Set map options
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(43.1656, -77.6114),
		mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true
	};
	// Create map
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function setHeatMap(dataPoints){
	console.log("set");
	var points  = new google.maps.MVCArray(dataPoints);
	heatmap = new google.maps.visualization.HeatmapLayer({ data: points });
    heatmap.set('radius', 200);
    heatmap.set('opacity', .5);
    heatmap.set('dissipating', false);
	heatmap.setMap(map);
}

google.maps.event.addDomListener(window, 'load', init);
