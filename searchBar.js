var geocoder;
function init() {
  geocoder = new google.maps.Geocoder();
}
function locationChanged()
{
  var locationText = document.getElementById("locationBar").value;
  var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<p><b>' + locationText + '</b></p>'+
      '</div>';

  // parse address
  geocoder.geocode({'address': locationText}, function(results, status)
  {
    if(status == google.maps.GeocoderStatus.OK)
    {
     map.panTo(results[0].geometry.location); 
    }
    var marker = new google.maps.Marker({
      position: results[0].geometry.location,
      map: map,
      title:locationText 
    });
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

  });

  
  console.log("Address: " + locationText);
  
  //Update HeatMap
  heatmap.setMap(null);
  getData();

}
init();
