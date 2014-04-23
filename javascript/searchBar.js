var searchInfoWindow;
var searchMarker;

function locationChanged()
{
    var locationText = document.getElementById("locationBar").value;
    var contentString = locationText;

    geocoder = new google.maps.Geocoder();
    
    if(searchMarker)
        searchMarker.setMap(null);

    // parse address
    geocoder.geocode({'address': locationText}, function(results, status)
    {
        if(status == google.maps.GeocoderStatus.OK) {
            googleMap.panTo(results[0].geometry.location); 
        }
        
        searchMarker = new google.maps.Marker({
            position: results[0].geometry.location,
            map: googleMap,
            title:locationText 
        });
        
        searchInfowindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        google.maps.event.addListener(searchMarker, 'click', function() {
            searchInfowindow.open(googleMap, searchMarker);
        });

    });

}
