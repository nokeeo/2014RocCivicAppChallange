var clusters;
var zipPopDensity = [];

var firstPageLoad = true;

//Hash change function
window.onhashchange = function() {
    data = getFilteredData();
    if(!firstPageLoad) {
        clearMap();
    }
    refreshMapForHash(data);
    firstPageLoad = false;
}


function sendGETRequest(url, params, success, error, type) {
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

function getFilteredData(){
    data = new Array();
    for(i = 0; i < clusters.length; i++) {
        cluster = clusters[i];
        newCluster = new Array();
        for(k = 0; k < cluster.length; k++) {
            if(selectedAgencies[cluster[k]['agencyType']] && selectedRegions[cluster[k]['region']])
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
    
    incidentCount = getTotalIncidentCount(data);
    incidentMult = .0015;
    if(incidentCount < 1000)
        incidentMult = .001;
    
    averageCounter = 0;
    sumPopDensity = 0;
    for(i = 0; i < data.length; i++) {
        if(data[i].length > incidentCount * incidentMult) {
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

function getTotalIncidentCount(data) {
    count = 0;
    for(i = 0; i < data.length; i++) {
        count += data[i].length;  
    }
    return count;
}

function handleError(e){
	console.log(e);
}

function getRange(start, end){
	var params = {'start': start, 'end': end};
	sendGETRequest('/civicapp/php/getClusters.php', params, function(response) {
        clusters = response;
        console.log(calcZipPercent(clusters));
        fadeOut(document.getElementById('activityIndicator'));
        window.location.hash = 'heatmap';
    }, handleError, 'json');
}

//Zipcode helper functions
function parseZipCode(address) {
    addressPieces = address.split(',');
    
    stateZip = new Array();
    zip = '';
    if(addressPieces.length > 2) 
        stateZip = addressPieces[2].trim().split(' ');
    if(stateZip.length > 1)
        zip =  stateZip[1].trim();
    
    re = new RegExp('[0-9]+');
    if(zip.match(re))
       return zip;
    
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

function formatDate(date) {
    formatString = date.getFullYear().toString();
    formatString += '-';
    
    month = (date.getMonth()) + 1;
    if (month < 10) {
        month = '0' + month.toString();   
    }
    formatString += month + '-';
    formatString += date.getDate().toString();
    
    return formatString;
}

function calcAgencyPercent(data) {
    agencySums = [];
    sum = 0;
    for(i = 0; i < data.length; i++) {
        cluster = data[i];
        for(k = 0; k < cluster.length; k++) {
            agency = cluster[k]['agencyType'];
            
            if(agencySums[agency])
                agencySums[agency] = agencySums[agency] + 1;   
            else
                agencySums[agency] = 1;
            
            sum++;
        }
    }
    
    agencyStats = [];
    for(key in agencySums) {
        if(sum > 0) {
            agencySum = agencySums[key];
            agencyStats[key] = agencySum / sum;
        }
        else
            agencyStats[key] = 0;
    }
    return agencyStats;
}

function calcZipPercent(data) {
    sum = 0;
    zipSums = [];
    for(i = 0; i< data.length; i++) {
        cluster = data[i];
        for(k = 0; k < cluster.length; k++) {
            zip = parseZipCode(cluster[k].fulladdress);
            if(zip != '') {
                if(zipSums[zip])
                    zipSums[zip] = zipSums[zip] + 1;
                else
                    zipSums[zip] = 1;
                sum++;
            }
        }
    }
    
    zipStats = [];
    for(key in zipSums) {
        if(sum > 0)
            zipStats[key] = zipSums[key] / sum; 
        else
            zipStats[key] = 0;
    }
    
    return zipStats;
}

function calcPerCapitaZip(data) {
    zipSums = [];
    for(i = 0; i < data.length; i++) {
        cluster = data[i];
        for(k = 0; k < cluster.length; k++) {
            zip = parseZipCode(cluster[k].fulladdress);
            if(zip != '') {
                if(zipSums[zip])
                    zipSums[zip] = zipSums[zip] + 1;
                else
                    zipSums[zip] = 1;
            }   
        }
    }
    
    zipStats = [];
    for(key in zipSums) {
        if(zipPopDensity[key] > 0)
            zipStats[key] = zipSums[key] / zipPopDensity[key];
        else
            zipStats[key] = 0;
    }
    
    return zipStats;
}