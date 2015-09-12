function initializeMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 49.2569332,
            lng: -123.1239135
        },
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        latitude: 49.2569332,
        longitude: -123.1239135
    });

    return map;
}

// Load initial map, marker and weather data
function loadInitialMapData(viewModel) {

    var map = viewModel.map;
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');

    var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });


    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };


            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
            map.latitude = place.geometry.location.lat();
            map.longitude = place.geometry.location.lng();

        });
        map.fitBounds(bounds);

    });

    callWeatherAPI(viewModel);
}

// Make Ajax call to OpenWeatherMap API, parse the results and display
// the markers on map along with weather info on the side box
function callWeatherAPI(viewModel) {
    var map = viewModel.map;

    var openWeatherAPIKey = "32185e21f26ced31524446c346285787";
    // Get weather from OpenWeatherMap for this location and around this location
    var requestString = "http://api.openweathermap.org/data/2.5/find?units=metric&lat=" + map.latitude + "&lon=" + map.longitude + "&APPID=" + openWeatherAPIKey + "&cnt=15";

    $.ajax({
        url: requestString,
        dataType: 'text', // Choosing a text datatype
        success: function(apiresponse) {
            proccessWeatherAPIResult(viewModel, apiresponse);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Unable to load weather data now!");
        }
    });
}




// Function to process weather API result
var proccessWeatherAPIResult = function(viewModel, apiresponse) {

    var apiResultBox = document.getElementById("weatherResults");

    // clear previous results if any
    var child = apiResultBox.firstChild;
    while (child) {
        apiResultBox.removeChild(child);
        child = apiResultBox.firstChild;
    }
    var map = viewModel.map;

    map.markers.forEach(function(marker) {
        marker.setMap(null);
    });
    map.markers = [];

    viewModel.placeList.removeAll();
    for (var i = 0; i < viewModel.placeList.length; i++) {
        viewModel.placeList.pop();
    }

    var results = JSON.parse(apiresponse);
    if (results.list !== null && results.list.length > 0) {
        var bounds = new google.maps.LatLngBounds();
        var len = results.list.length;
        for (var j = 0; j < len; j++) {
            var name = results.list[j].name;
            // add to placeList
            viewModel.placeList.push(name);
            var lat = results.list[j].coord.lat;
            var lng = results.list[j].coord.lon;
            var temp = results.list[j].main.temp;
            var tempmax = results.list[j].main.temp_max;
            var tempmin = results.list[j].main.temp_min;

            var textArea = document.createElement("Label");
            var weatherBox = apiResultBox.appendChild(textArea);
            textArea.setAttribute("title", name);

            var contentString = "<h2>Location: " + name + "</h2>" + "<p>Coordinates: " + lat + "(lat), " + lng + "(long) </p>" + "<p> Current Temperature (in celsius): " + temp + ", " + tempmax + " (max), " + tempmin + " (min) </p>";

            weatherBox.innerHTML = contentString;
            weatherBox.className = "weatherBox";

            // Add markers to map

            var myLatLng = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({
                map: map,
                title: name,
                position: myLatLng,
                data: contentString
            });


            marker.addListener('click', function() {
                toggleBounce(this);
            });

          // Create a marker for each place.
          map.markers.push(marker);
          bounds.extend(myLatLng);
        }
        map.fitBounds(bounds);


    }
    // Uses jquery-ui library to autocomplete for suggestions
    $("#filterView").autocomplete({
        source: viewModel.placeList()
    });
    return viewModel.placeList;
};


function toggleBounce(marker) {
    var infowindow = new google.maps.InfoWindow({
        content: marker.data
    });
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);

    }
    else
    {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        infowindow.open(map, marker);
        marker.addListener('click', function()
        {
            infowindow.close();
        });
    }
}


// Function to animate marker with bounce

var markerInfo = function(marker) {

    var infowindow = new google.maps.InfoWindow({
        content: marker.data,
        maxWidth: 120
    });
    if(marker.getAnimation() !== null) {
        infowindow.open(map, marker);
    }
    else
        infowindow.close();

};


// View model init
var viewModel = function(initialLocation) {

    var self = this;
    self.placeList = ko.observableArray();
    self.currentplace = ko.observable(initialLocation);
    self.selectedPlace = ko.observable("");
    self.map = initializeMap();
    self.map.markers = [];
    loadInitialMapData(self);

    self.onSearch = function(data, event) {
        self.placeList.removeAll();
        if (event.keyCode === 13) {
            // Get weather from OpenWeatherMap for this location
            callWeatherAPI(self);
        }
        return true;
    };

    self.filterResults = function(data, event) {
        // Markers array hide/show
        // Resultsbox - go thru child nodes of
        console.log(this.selectedPlace());

        var map = self.map;
        // detect and handle only when enter key is pressed
        if (event.keyCode === 13) {
            map.markers.forEach(function(marker) {
                if (self.selectedPlace() === '') {
                    marker.setVisible(true);
                } else if (self.selectedPlace() != marker.title) {
                    marker.setVisible(false);
                } else {
                    toggleBounce(marker);
                    marker.setVisible(true);
                }
            });
        }


        var results = document.getElementById("weatherResults").childNodes;
        // detect and handle only when enter key is pressed
        if (event.keyCode === 13) {
            var resLen = results.length;
            for (i = 0; i < resLen; i++) {
                placeInfo = results[i];

                title = placeInfo.getAttribute("title");
                if (self.selectedPlace() === '') {
                    placeInfo.style.display = 'inline';
                } else if (self.selectedPlace() != title) {
                    placeInfo.style.display = 'none';
                } else {
                    placeInfo.style.display = 'inline';
                }
            }
        }
        return true;
    };
    // End - Intialization
};


var initialPlace = "Vancouver, BC, CA";
ko.applyBindings(new viewModel(initialPlace));
