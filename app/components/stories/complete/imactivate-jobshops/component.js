/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var jobshopData;
var jobshopLocations;

var jobshopFacilityHeadings = [];
var jobshopInformationHeadings = [];

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Jobshops', // (Provide a story title)
        subTitle: 'Information on council-run jobshops', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Information on council-run jobshops offering a variety of services, from help with writing a CV to completing application forms.', // (Provide a longer description of the story)
        license: 'Jobshops, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/jobshops', // (Where did the data come from?)
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
        // Selected location
        var jobshopLocation = (this.get('selectedOption')).toString();

        var jobshopSelector = jobshopData[jobshopLocation];

        // Reset the content of the info table.
        document.getElementById('jobshopDetails').innerHTML = "";

        // Array used to set which icons are displayed in the information panel
        var informationIcons = ['map-marker', 'phone', 'envelope', 'clock-o'];

        // Set the information icon and text
        for (var i = 0; i < jobshopInformationHeadings.length; i++) {
            var infoPoint = jobshopInformationHeadings[i];
            var infoContent = jobshopSelector[infoPoint];

            // Only add content if it exists in the array file.
            if (infoContent.length > 0) {
                document.getElementById('jobshopDetails').innerHTML += "<tr><td class='jobshopCell'><i class='fa fa-fw fa-" + informationIcons[i] + "'></i></td><td class='jobshopCell'>" + infoContent + "</td></tr>";
            }

        }

        // Display the facilities available.
        document.getElementById('jobshopFacilities').innerHTML = '<div id="jobshopFacilityTitle" class="jobCenterFacility"><strong>Facilities</strong></div>';

        for (var j = 0; j < jobshopFacilityHeadings.length; j++) {
            var facilityPoint = jobshopFacilityHeadings[j];
            var facilityContent = jobshopSelector[facilityPoint];
         
            // If the facility is available add a tick for yes, minus for no
            facilityContent = facilityContent.replace("Y", "<i class='jobFacilityIcon fa fa-check-square'></i>");
            facilityContent = facilityContent.replace("N", "<i class='jobFacilityIcon fa fa-minus-square'></i>");

            document.getElementById('jobshopFacilities').innerHTML += "<div class='jobCenterFacility'>" + facilityPoint + ": " + facilityContent + "</div>";

        }

        // Add marker to location on the map
        var jobshopLat = Number(jobshopSelector.Latitude);
        var jobshopLng = Number(jobshopSelector.Longitude);

        var markers = Ember.A([{
            title: jobshopLocation + " Jobshop",
            lat: jobshopLat,
            lng: jobshopLng,
            body: ''
    }]);
        this.set('lat', jobshopLat);
        this.set('lng', jobshopLng);
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
            Papa.parse('http://tomforth.co.uk/widgetCSV/jobshops.csv', {
                download: true,
                complete: function (results) {
                    jobshopData = create3DjsonWithUniqueFieldNames(results.data);
                    jobshopLocations = Object.keys(jobshopData);

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
                for (var k = 0; k < jobshopLocations.length; k++) {

                    var individualItem = {
                        id: jobshopLocations[k],
                        title: jobshopLocations[k],
                    };
                    items.push(individualItem);
                };

                // Populates the selection list.
                obj.set('items', items);

                setTimeout(() => {
                    obj.set('loaded', true);
                });

                getJobshopFacilitiesHeadings();

            }

            // Get the different facilities from the CSV file headings.
            function getJobshopFacilitiesHeadings() {

                var jobshopDataHeadings = Object.keys(jobshopData[jobshopLocations[0]]);

                // Variable used to only select the facities headings
                var facilityHeadings;


                // Create an array of specific features in each location.
                for (var i = 0; i < jobshopDataHeadings.length; i++) {
                    // Only add headings from toilets onwards.
                    if (jobshopDataHeadings[i] == 'Public toilets') {
                        facilityHeadings = true;
                    }
                    // Add facilities to that particular array
                    if (facilityHeadings == true) {
                        jobshopFacilityHeadings.push(jobshopDataHeadings[i]);
                    }
                    // Add information to the information array
                    else {
                        if (jobshopDataHeadings[i] != 'Latitude' && jobshopDataHeadings[i] != 'Longitude')
                            jobshopInformationHeadings.push(jobshopDataHeadings[i]);
                    }
                }
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