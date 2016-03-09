/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var changingPlacesData;
var facilityHeadings = [];

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Changing Places toilets', // (Provide a story title)
        subTitle: 'Toilet facilities for people with disabilities', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Changing Places are toilet facilities for people with profound and multiple disabilities. They are fitted with equipment, such as a hoist and changing bench, and provide space for up to two carers to support the person with a disability to use the Changing Place.', // (Provide a longer description of the story)
        license: 'Changing Places toilets in Leeds, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/changing-places-toilets-in-leeds', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'blue', // (Set the story colour)
        width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        slider: true, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },
    // Executes when user selects a location from the select tag.f
    selectedOptionChanged: function () {
        // Selected option
        var location = (this.get('selectedOption')).toString();
        
        document.getElementById('changingPlaceDetails').style.display = "block";
        
        var mainDetails = document.getElementById('changingPlaceDetails');

        // Reset previous content
        mainDetails.innerHTML = "";

        // Set main content
        facilityDetails.innerHTML = "<div id='facilityTitle'><strong>Facilities</strong></div>";

        // Gets the current day to get the correct opening times. 
        var currentDay = moment().format('dddd');

        var selector = changingPlacesData[location];

        // Main front page details;
        var changingPlaceAddress = "<div><i class='mainDetail fa fa-fw fa-map-marker'></i> " + selector.Address1 + ", " + selector.Address2 + ", " + selector.Postcode + "</div>";
        var changingPlaceTelephone = "<div><i class='mainDetail fa fa-fw fa-phone'></i> " + selector.Telephone + "</div>";
        var changingPlaceContact = "<div><i class='mainDetail fa fa-fw fa-envelope'></i> " + selector.Contact + "</div>";
        
        // Get the current days opening times.
        var changingPlaceTimes = "<div><i class='mainDetail fa fa-fw fa-clock-o'></i> " + selector[currentDay] + "</div>";

        mainDetails.innerHTML = changingPlaceAddress + changingPlaceTelephone + changingPlaceContact + changingPlaceTimes;

        var j;

        // Populate the list of facilities.
        for (j = 0; j < facilityHeadings.length; j++) {
            var facilityCheck = selector[facilityHeadings[j]];

            // Set based on whether the facilities are available.
            if (facilityCheck == 'Yes') {
                var facilityContent = '<i class="facilityIcon fa fa-fw fa-check"></i>';
            } else if (facilityCheck == 'No') {
                var facilityContent = '<i class="facilityIcon fa fa-fw fa-times"></i>';
            } else {
                var facilityContent = facilityCheck;
            }

            // Set facilites content.
            document.getElementById('facilityDetails').innerHTML += '<div class="facilityDetail">' + facilityHeadings[j] + ': ' + facilityContent + '</div>';
        }

        var ridingCenterLat = Number(selector.Lat);
        var ridingCenterLng = Number(selector.Lng);

        var markers = Ember.A([{
            title: location,
            lat: ridingCenterLat,
            lng: ridingCenterLng,
            body: ''
    }]);
        this.set('lat', ridingCenterLat);
        this.set('lng', ridingCenterLng);
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
        var changingPlacesLocation;
        var changingLocationDataHeadings;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse('http://tomforth.co.uk/widgetCSV/changingPlaces.csv', {
                download: true,
                complete: function (results) {
                    changingPlacesData = create3DjsonWithUniqueFieldNames(results.data);
                    getFacilitiesHeadings();
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

            function getFacilitiesHeadings() {
                changingPlacesLocation = Object.keys(changingPlacesData);
                changingLocationDataHeadings = Object.keys(changingPlacesData[changingPlacesLocation[0]]);

                var i;

                // Variable used to only select the facities headings
                var countHeadings;

                // Create an array of specific features in each location.
                for (i = 0; i < changingLocationDataHeadings.length; i++) {
                    // Only add headings from size onwards.
                    if (changingLocationDataHeadings[i] == 'Size') {
                        countHeadings = true;
                    }

                    if (countHeadings == true) {
                        facilityHeadings.push(changingLocationDataHeadings[i]);
                    }

                }

                setSelectContent();

            }

            function setSelectContent() {
                var k;

                for (k = 0; k < changingPlacesLocation.length; k++) {

                    var individualItem = {
                        id: changingPlacesLocation[k],
                        title: changingPlacesLocation[k],
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