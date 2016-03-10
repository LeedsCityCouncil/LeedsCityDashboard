/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var streetCafeData;
var streetCafeLocations;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Street Cafe Licences', // (Provide a story title)
        subTitle: 'Details of street cafes in Leeds city centre', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Details of all licenced street cafes in Leeds city centre.', // (Provide a longer description of the story)
        license: 'Street Cafe Licences in Leeds, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/street-cafe-licences-in-leeds', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'blue', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {

        // Selected cafe
        var streetCafe = (this.get('selectedOption')).toString();

        // Reset the cafe content
        document.getElementById('streetCafeTable').innerHTML = "";
        document.getElementById('streetCafeTable').style.display = "block";

        var cafeSelector = streetCafeData[streetCafe];

        var cafeAddress = cafeSelector['Address'] + ", " + cafeSelector['Postcode'];
        var cafePlaces = cafeSelector['Chairs'];

        // Set information content
        document.getElementById('streetCafeTable').innerHTML += '<tr><td class="streetCafeCell"><i class="fa fa-fw fa-map-marker"></i></td><td class="streetCafeCell">' + cafeAddress + '</td></tr>';
        document.getElementById('streetCafeTable').innerHTML += '<tr><td class="streetCafeCell"><i class="fa fa-fw fa-users"></i></td><td class="streetCafeCell">' + cafePlaces + ' spaces</td></tr>';

        // Set map marker content
        var streetCafeLat = Number(cafeSelector.Latitude);
        var streetCafeLng = Number(cafeSelector.Longitude);

        var marker = Ember.A([{
            title: streetCafe,
            body: '',
            lat: streetCafeLat,
            lng: streetCafeLng,
    }, ]);

        this.set('lat', streetCafeLat);
        this.set('lng', streetCafeLng);
        this.set('markers', marker);
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
            Papa.parse('http://tomforth.co.uk/widgetCSV/streetCafe.csv', {
                download: true,
                complete: function (results) {
                    // Get the array data
                    streetCafeData = create3DjsonWithUniqueFieldNames(results.data);
                    streetCafeLocations = Object.keys(streetCafeData);
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

            function setSelectContent() {

                for (var k = 0; k < streetCafeLocations.length; k++) {

                    var individualItem = {
                        id: streetCafeLocations[k],
                        title: streetCafeLocations[k],
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