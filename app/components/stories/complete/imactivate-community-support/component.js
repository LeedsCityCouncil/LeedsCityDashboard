/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var communitySupportData;
var communitySupportLocations;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Community support organisations', // (Provide a story title)
        subTitle: 'Community support organisations in Leeds', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Details and locations of community support organisations in Leeds.', // (Provide a longer description of the story)
        license: 'Community support organisations, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/community-support-organisations', // (Where did the data come from?)
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
        // Get center from the dropdown menu
        var communitySupport = (this.get('selectedOption')).toString();

        // Reset the content
        document.getElementById('communitySupportHolder').innerHTML = "";

        var selector = communitySupportData[communitySupport];

        // Return the headings in the CSV file
        var dataHeadings = Object.keys(selector);

        // variable to hold the address
        var communitySupportAddress = "";

        // Array to hold info headings
        var communitySupportInfoArray = [];

        // Show the table
        document.getElementById('communitySupportHolder').style.display = "block";

        // Get the data headings, sort into address components and general information
        for (var i = 0; i < dataHeadings.length; i++) {
            var currentHeading = dataHeadings[i];
            if (currentHeading.indexOf('Address') != -1 && selector[currentHeading] != 'null') {
                communitySupportAddress += selector[currentHeading] + ", "
            } else {
                // Ignore lat long, all other headings are infor
                if (currentHeading != 'Latitude' && currentHeading != 'Longitude' && currentHeading != 'Postcode') {
                    communitySupportInfoArray.push(currentHeading);
                }
            }
        }

        // Add the postcode to the address
        communitySupportAddress += selector['Postcode'];

        document.getElementById('communitySupportHolder').innerHTML += '<tr><td class="communitySupportCell"><i class="fa fa-fw fa-map-marker"></i></td><td class="communitySupportCell">' + communitySupportAddress + '</td></tr>';

        // Icons used for details. 
        var iconArray = {
            'Tel': 'phone',
            'Email': 'envelope',
            'Website': 'desktop',
            'Area': 'info-circle',
        };

        // Populate information content
        for (var j = 0; j < communitySupportInfoArray.length; j++) {
            var currentInfo = communitySupportInfoArray[j];
            var currentIcon = iconArray[currentInfo];

            if (selector[currentInfo] != 'null') {
                document.getElementById('communitySupportHolder').innerHTML += '<tr><td class="communitySupportCell"><i class="fa fa-fw fa-' + currentIcon + '"></i></td><td class="communitySupportCell">' + selector[currentInfo] + '</td></tr>';
            }
        }

        // Get the latitude and longitude and add to map
        var communitySupportLat = Number(selector.Latitude);
        var communitySupportLng = Number(selector.Longitude);

        var marker = Ember.A([{
            title: communitySupport,
            body: '',
            lat: communitySupportLat,
            lng: communitySupportLng,
    }, ]);

        this.set('lat', communitySupportLat);
        this.set('lng', communitySupportLng);
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
            Papa.parse('http://tomforth.co.uk/widgetCSV/communitySupport.csv', {
                download: true,
                complete: function (results) {
                    communitySupportData = create3DjsonWithUniqueFieldNames(results.data);
                    communitySupportLocations = Object.keys(communitySupportData);
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

            // Populate the select tag
            function setSelectContent() {

                for (var k = 0; k < communitySupportLocations.length; k++) {

                    var individualItem = {
                        id: communitySupportLocations[k],
                        title: communitySupportLocations[k],
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