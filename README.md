## Neighborhood map project
The objective of this project is to search for a location and with the help of Google Maps and thirdparty api (source: OpenWeatherMap) obtain weather information of places in the neighborhood of searched location. The locations retrieved are shown via markers in Google Maps, and weather information fetched is shown on the side. The List view helps to filter a particular location and when clicked shows the relevant place marker and weather info of the places of neighborhood.

####Part 1: On the initial rendering of the page
* Open the index.html on a browser window.
* The page loads with a search box initialized for the city Vancouver, BC, Canada, and the map is loaded.
* The markers are loaded for the location Vancouver and the surrounding places based on the result from weather api . On hovering over a marker it displays an infowindow that gives the coordinates and current weather of that place. On clicking a marker it animates with a bounce and has to be clicked again to toggle back to its stable state.
* A weather results box is displayed on the right side featuring a scrollable info of all the locations with respect to their coordinates and weather.

####Part 2: Instructions to run
* Type a place or select a place in the search box. The map will zoom to the place. Hit the enter key to retrieve weather info. The markers will appear around the place and its nearby locations.
* If typing a particular alphabet on the list view , the places suggested are as per the current neighborhood and on selecting the desired place and hitting enter key, marker corresponding to that place is shown and all other markers are rendered not visible. The appropriate coordinates and weather information of the selected place are displayed on the infowindow and the scrollable weather results box. The info of other places do not appear on the weather results box.
* After applying filter, user can enter new location to display its info or enter blank/empty value to show all original markers and weather info.


####Part 3: Design
* The framework used is Knockout and the flow starts with viewModel and the view is refreshed with observables :-that populate the listview, their selected value and current searched place of the search box.
* the search box is a ui element of jquery that uses an autocomplete feature to make autosuggestions as you type with respect to the neighborhood context.
* The map is initialized with Vancouver city as its focus in function initializeMap() and viewModel uses the function loadInitialMapData to load the map, search box, weather details of neighborhood along with the coordinates of the place. The maximum size of result to fetch from OpenWeatherMap is set to 15.
* On searching code makes an ajax call to callWeatherAPI function which makes OpenWeatherMap api call to fetch weather info of the neighborhood for display. The markers and weather box results are updated accordingly after a successful call. Any error in response is handled through code.

####Part 3: Libraries and API
* jQuery v1.11.1 - http://jquery.com/
* jQueryUI v1.11.4 - https://jqueryui.com/
* Knockout v3.2.0: http://knockoutjs.com/
* OpenWeatherMap API - http://openweathermap.org/current#cycle
