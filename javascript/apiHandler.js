var googleMap;
var googleGeocoder;
var heatmapLayer;
var dataMarkers = [];
var infoWindow;

var clusters;
var zipPopDensity = [];
var selectedAgencies = [];

var firstPageLoad = true;
var menuShown = false;

//Hash change function
window.onhashchange = function() {
    data = getFilteredData();
    if(!firstPageLoad) {
        clearMap();
    }
    hash = document.URL.substr(document.URL.lastIndexOf('#'));
    refreshMapForHash(data);
    firstPageLoad = false;
}

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

function refreshMapForHash(refreshData) {
    clearMap();
    if(hash === '#heatmap') {
        parseData(refreshData);
    }
    else if(hash === '#markers') {
        setMarkers(refreshData);
    }
}

function getFilteredData(){
    data = new Array();
    for(i = 0; i < clusters.length; i++) {
        cluster = clusters[i];
        newCluster = new Array();
        for(k = 0; k < cluster.length; k++) {
            if(selectedAgencies[cluster[k]['agencyType']])
                newCluster.push(cluster[k]);
        }
        
        if(newCluster.length > 0)
            data.push(newCluster);
    }
    
    return data; 
}

function parseData(data){
	var positions = new Array(); // heatmap positions
    backupStack = new Array();
    
    averageCounter = 0;
    sumPopDensity = 0;
    for(i = 0; i < data.length; i++) {
        if(data[i].length > 4) {
            zipCode = '';
            for(k = 0; k < data[i].length; k++) {
                zipCode = parseZipCode(data[i][k].fulladdress);
                if(zipCode != '')
                    break;
            }
            
            if(zipCode != '') {
                averageCounter++;
                sumPopDensity += zipPopDensity[zipCode];
                
                weight = data[i].length / zipPopDensity[zipCode];
                var weightPoint = {
                    location : new google.maps.LatLng(data[i][0]['lat'], data[i][0]['lng']),
                    weight : weight//data[i].length
                }
                positions.push(weightPoint);
            }
            else {
                backupStack.push(data[i]);   
            }
        }
    }
    
    averagePopDensity = sumPopDensity / averageCounter;
    for(i = 0; i < backupStack.length; i++) {
        latLng = new google.maps.LatLng(backupStack[i][0]['lat'], data[i][0]['lng']);
        weightPoint = {
            location : latLng,
            weight : data[i].length / averagePopDensity
        }
        positions.push(weightPoint);
    }
	setHeatMap(positions); // heatmap positions
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	var params = {'start': start, 'end': end};
	sendGETRequst('/civicapp/php/getClusters.php', params, function(response) {
        clusters = response;
        fadeOut(document.getElementById('activityIndicator'));
        window.location.hash = 'heatmap';
    }, handleError, 'json');
}

//Animations
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


function toggleMenu() {
    console.log('fire'); 
    menuBox = document.getElementById('menuBox');
    contentPane = document.getElementById('content');
    if(!menuShown)
        contentPane.style.right = menuBox.offsetWidth + 'px';
    else
        contentPane.style.right = '0px'
    
    if(window.location.hash != '#markers')
        spinMenuImage();
        
    menuShown = !menuShown; 
}

function checkBoxClicked(el) {
    agency = el.name;
    selectedAgencies[agency] = el.checked;
}

function applyMenuButtonClicked() {
    data = getFilteredData();
    refreshMapForHash(data);
}

function spinMenuImage() {
    menuImage = document.getElementById('headerMenuButton');
    
    if(!menuShown) {
        menuImage.style.animationName = 'counterSpin';
        menuImage.style.webkitAnimationName = 'counterSpin';
    }
    else {
        menuImage.style.animationName = 'clockSpin';
        menuImage.style.webkitAnimationName = 'clockSpin';
    }
    menuImage.style.webkitAnimationDuration = '1s';
    menuImage.style.animationDuration = '1s';
    
    menuImage.addEventListener('webkitAnimationEnd', function() {
       menuImage = document.getElementById('headerMenuButton');
       menuImage.style.webkitAnimationName = ''; 
    });
    menuImage.addEventListener('animationEnd', function() {
        menuImage = document.getElementById('headerMenuButton');
        menuImage.style.animationName = '';   
    });
}
//Zipcode helper functions
function parseZipCode(address) {
    addressPieces = address.split(',');
    
    stateZip = new Array();
    if(addressPieces.length > 2) 
        stateZip = addressPieces[2].trim().split(' ');
    if(stateZip.length > 1)
        return stateZip[1].trim();
    
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
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(43.1656, -77.6114),
		mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true
	};
	// Create map
	googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    googleGeocoder = new google.maps.Geocoder();
    
    infoWindow = new google.maps.InfoWindow({
        content: '', 
    });
    
    sendGETRequst('/civicapp/data/popDensity.csv', [], function(response) {
        parseZipCSV(response);
        window.onload = getRange('2014-01-1', '2014-01-7');
    }, handleError, 'txt');
    
    sendGETRequst('/civicapp/php/getAgencies.php', [], function(response) {
        menuAddItems(response);
    }, handleError, 'json');
}

function clearMap() {
    if(heatmapLayer)
        heatmapLayer.setMap(null);
    
    for(i = 0; i < dataMarkers.length; i ++) {
        dataMarkers[i].setMap(null);   
    }
}

function getColorForAgency(agency) {
    switch(agency) {
        case 'Police':
            return '#0062E3';
        case 'Fire':
            return '#e83600';
        case 'Ambulance':
            return 'green';
        case 'Trafic':
            return '#facb04';
        default:
            return 'black';
    }
}

function menuAddItems(items) {
    menuBox = document.getElementById('menuBox');
    
    appendHTML = '<form style="margin: 25px;">';
    for(i = 0; i < items.length; i++) {
        appendHTML += buildMenuCheckBox(items[i]);
        selectedAgencies[items[i]] = true;
    }
    appendHTML += '</form>';
    menuBox.innerHTML += appendHTML;
}

function buildMenuCheckBox(title) {
    return '<div class="menuCheckbox">' + 
        '<input type="checkbox" checked="checked" id="' + title + 'checkbox" value="1" name="' + title + '" onClick="checkBoxClicked(this)"/>' +
        '<label style="border-color: ' + getColorForAgency(title) + '" for="' + title + 'checkbox"></label>' + 
        '<p>' + title + '</p>' +
        '</div>';
}
google.maps.event.addDomListener(window, 'load', initMap);