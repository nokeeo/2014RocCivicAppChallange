function sendGETRequst(url, params, success, error) {
    var index = 0
    var formatParams = ''
    for(key in params) {
        //If the current element is the first
        if(index === 0) {
            formatParams += '&'
        }
        else {
            formatParams += '?'
        }
        formatParams += key + '=' + params[key]
        index++;
    }
    
    var fullUrl = url + formatParams
    
    var xmlHttp = new XMLHttpRequest()
    
    xmlHttp.onreadystatechange=function() {
        if(xmlHttp.readyState === 4) {
            if(xmlHttp.status === 200)
                success(JSON.parse(xmlHttp.responseText))
            else
                error(JSON.parse(xmlHttp.responseText))
        }
    }
    
    xmlHttp.open("GET", fullUrl, true)
    xmlHttp.send()
}

sendGETRequst('http://mcsafetyfeed.org/api/getgeo.php', {'date' : '2013-6-1', 'typeid' : '6'}, function(response) {
    console.log(response)
},
function(response) {
    console.log(response)
})