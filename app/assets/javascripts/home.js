
$(document).ready(function() {
  initMap();

  $("#des-button").on("click", function(){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
      map = new google.maps.Map( document.getElementById("map"));
      directionsDisplay.setMap(map);
      var destinationInput = document.getElementById('destination-input');
      var address = destinationInput.value
      geocoder = new google.maps.Geocoder();
      var marker = null;
      geocoder.geocode({'address' : address}, function(results, status){
        if(status == 'OK') {
          map.setCenter(results[0].geometry.location);
          marker = new google.maps.Marker({
            map: map,
            postition: results[0].geometry.location
          });
          var request = {
            origin: coords,
            destination: { lat: marker.postition.lat(), lng: marker.postition.lng() },
            travelMode: google.maps.DirectionsTravelMode.DRIVING
          };


          $.ajax({
            url: "/destinations",
            method: "post",
            data:{ destination: {
              des_lat: marker.postition.lat(),
              des_lng: marker.postition.lng(),
            }}
          }).done(function(response){
            directionsService.route(request, function (response, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                var url = "/spots?lat=" + marker.postition.lat() + "&"+ "lng=" + marker.postition.lng();
                $.getJSON( url, function(results){
                  for (var i = 0; i < results.spots.length; i++) {
                    var jsonlatitude = results.spots[i].lat;
                    var jsonlong = results.spots[i].lng;
                    var latLng = new google.maps.LatLng(jsonlatitude, jsonlong);
                    var marker = new google.maps.Marker({
                      position: latLng,
                      map: map,
                      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    })
                  }
                })
                }
              });
          })

        } else {
          alert('Geocide was not successful for the following reason:' + status)
        }
      });
    });

  $("#spot-buttons").on("click", "#check-in", function(e){
    e.preventDefault();
    USER_ID = parseInt(this.name)
    window.navigator.geolocation.getCurrentPosition(function(position){
      rounded_lat = Number((position.coords.latitude).toFixed(4));
      rounded_lng = Number((position.coords.longitude).toFixed(4));
      coords = [rounded_lat, rounded_lng];
      $.ajax({
        url: "/spots",
        method: "post",
        data: { spot: {
          user_id: USER_ID,
          lat: coords[0],
          lng: coords[1],
          }
        }
      }).done(function(response){
        initMap();
        $("#spot-buttons").html(response);
      });
    });

  });

  $("#spot-buttons").on("click", "#precheckout", function(e){
    e.preventDefault();
    var spot_id = parseInt(this.name)
    $.ajax({
      url: "/spots/" + spot_id,
      method: "patch",
      data: { spot: {
        precheckout: true
        }
      }
    }).done(function(response){
      initMap();
      $("#spot-buttons").html(response);
    })
  })

  $("#spot-buttons").on("click", "#check-out", function(e){
    e.preventDefault();
    var spot_id = parseInt(this.name)
    $.ajax({
      url: "/spots/" + spot_id,
      method: "patch",
      data: { spot: {
        checkout: true
        }
      }
    }).done(function(response){
      initMap();
      $("#spot-buttons").html(response);
    })
  })


  $("#spot-buttons").on("click", "#spot-taken", function(e){
    e.preventDefault();
    window.navigator.geolocation.getCurrentPosition(function(position){
      rounded_lat = Number((position.coords.latitude).toFixed(4));
      rounded_lng = Number((position.coords.longitude).toFixed(4));
      coords = [rounded_lat, rounded_lng];
      $.ajax({
        url: "/spots/destroy",
        method: "delete",
        data: { spot: {
          lat: coords[0],
          lng: coords[1],
          }
        }
      }).done(function(response){
        initMap();
        // debugger;
        $("#spot-buttons").append(response["notice"])
      });
    });

  });

})

var map, infoWindow;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.706529, lng: -74.009141},
    zoom: 16
  });
  infoWindow = new google.maps.InfoWindow;
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      coords = new google.maps.LatLng(latitude, longitude);
      infoWindow.setPosition(coords);
      infoWindow.setContent('Current Location');
      infoWindow.open(map);
      map.setCenter(coords);
      var destinationInput = document.getElementById('destination-input');
      var destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput, {placeIdOnly: true});

      var url = "/spots?lat=" + latitude + "&"+ "lng=" + longitude;
      $.getJSON(url, function(results){
        for (var i = 0; i < results.spots.length; i++) {
          var jsonlatitude = results.spots[i].lat;
          var jsonlong = results.spots[i].lng;
          var latLng = new google.maps.LatLng(jsonlatitude, jsonlong);
          var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          })
        }
      })
    })
  }
}
