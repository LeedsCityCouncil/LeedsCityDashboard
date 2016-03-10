/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var fireStationData;
var fireStationName;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Fire Stations', // (Provide a story title)
        subTitle: 'Location of fire stations in Leeds', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Location of fire stations in the Leeds area.', // (Provide a longer description of the story)
        license: 'Leeds fire station locations, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/leeds-fire-station-locations', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'lime', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.f
    selectedOptionChanged: function () {
        // Current firestation
        var selectedStation = (this.get('selectedOption')).toString();

        // Setup a map marker
        var selectedStationLat = Number(fireStationData[selectedStation].Latitude);
        var selectedStationLng = Number(fireStationData[selectedStation].Longitude);

        var markers = Ember.A([{
            title: selectedStation,
            lat: selectedStationLat,
            lng: selectedStationLng,
            body: ''
    }]);
        this.set('lat', selectedStationLat);
        this.set('lng', selectedStationLng);
        this.set('markers', markers);
        this.set('zoom', 16);

    }.observes('selectedOption'),

    setup: function () {
        this.setProperties({
            lat: 53.801277,
            lng: -1.548567,
            zoom: 12,
            markers: Ember.A([]),
            selectedItem: null
        });
    }.on('init'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse("http://tomforth.co.uk/widgetCSV/fireStations.csv", {
                download: true,
                complete: function (results) {
                    fireStationData = create3DjsonWithUniqueFieldNames(results.data);
                    fireStationName = Object.keys(fireStationData);
                    setSelectContent();
                }
            });

            function create3DjsonWithUniqueFieldNames(jsonData) {
                var threeDjsonArray = [];
                var headerRow = jsonData[0];
                var threeDjsonArray = {};
                for (var row = 1; row < jsonData.length - 1; row++) {
                    var fieldName = jsonData[row][0];
                    var fieldElement = {};
                    for (var column = 1; column < jsonData[row].length; column++) {
                        var rowName = jsonData[0][column];
                        var fieldValue = jsonData[row][column];
                        fieldElement[rowName] = fieldValue;
                    }
                    threeDjsonArray[fieldName] = fieldElement;
                }

                return threeDjsonArray;
            }

            // Sets the dropdown content
            function setSelectContent() {
                for (var k = 0; k < fireStationName.length; k++) {
                    var individualItem = {
                        id: fireStationName[k],
                        title: fireStationName[k],
                    };
                    items.push(individualItem);
                };

                // Populates the selection list.
                obj.set('items', items);

                setTimeout(() => {
                    obj.set('loaded', true);
                });
            }

        });
    }.on('didInsertElement'),
    
    mapStyles: [{
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#0c0b0b"
    }]
  }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{
            "color": "#f2f2f2"
    }]
  }, {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{
            "saturation": -100
    }, {
            "lightness": 45
    }]
  }, {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#090909"
    }]
  }, {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{
            "visibility": "simplified"
    }]
  }, {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{
            "color": "#d4e4eb"
    }, {
            "visibility": "on"
    }]
  }, {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{
            "visibility": "on"
    }, {
            "color": "#fef7f7"
    }]
  }, {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#9b7f7f"
    }]
  }, {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#fef7f7"
    }]
  }]
});