var geocoder;
function init() {
  geocoder = new google.maps.Geocoder();
}
function locationChanged()
{
  var locationText = document.getElementById("locationBar").value;

  // parse address
  geocoder.geocode({ 'address': locationText}, function(results, status)
  {
    if(status == google.maps.GeocoderStatus.OK)
    {
     map.panTo(results[0].geometry.location); 
    }
  });
  console.log("Address: " + locationText);
  
  //Update HeatMap
  heatmap.setMap(null);
  getData();

}
init();
