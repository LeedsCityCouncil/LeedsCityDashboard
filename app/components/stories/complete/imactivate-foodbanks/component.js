/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var foodbankData;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Leeds foodbanks', // (Provide a story title)
        subTitle: 'Information and locations of foodbanks around Leeds', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'A dataset providing a list of foodbanks around Leeds.', // (Provide a longer description of the story)
        license: 'Leeds foodbanks, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/leeds-food-banks', // (Where did the data come from?)
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
        var selectedfoodbank = (this.get('selectedOption')).toString();
        
        document.getElementById('foodbankInformationHolder').style.display = "block";

        var foodbankAddress = "";

        var i = 0;

        for (i = 1; i < 5; i++) {
            var addressSegment = "Address" + i;
            foodbankAddress = foodbankAddress + " " + foodbankData[selectedfoodbank][addressSegment];
        }

        var foodbankWebsite = foodbankData[selectedfoodbank].Website;
        var foodbankTelephone = foodbankData[selectedfoodbank].Telephone;
        var foodbankEmail = foodbankData[selectedfoodbank].Email;

        var foodbankNotes = foodbankData[selectedfoodbank].Notes;

        document.getElementById('foodbankAdd').innerHTML = "<td class='foodbankCell'><i class='foodbankIcon fa fa-fw fa-map-marker'></i></td><td class='foodbankCell'>" + foodbankAddress +"</td>";
        if (foodbankTelephone != 'null') {
            document.getElementById('foodbankTel').innerHTML = "<td class='foodbankCell'><i class='foodbankIcon fa fa-fw fa-phone'></i></td><td class='foodbankCell'>" + foodbankTelephone + "</td>";
        } else {
            document.getElementById('foodbankTel').innerHTML = "";
        }
        if (foodbankEmail != 'null') {
            document.getElementById('foodbankEmail').innerHTML = "<td class='foodbankCell'><i class='foodbankIcon fa fa-fw fa-envelope'></i></td><td class='foodbankCell'>" + foodbankEmail  + "</td>";
        } else {
            document.getElementById('foodbankEmail').innerHTML = "";
        }

        document.getElementById('foodbankWeb').innerHTML = "<td class='foodbankCell'><i class='foodbankIcon fa fa-fw fa-desktop'></i></td><td class='foodbankCell'>" + foodbankWebsite+ "</td>";

        document.getElementById('foodbankNotes').innerHTML = "<td class='foodbankCell'><i class='fa fa-fw fa-info-circle'></i></td><td class='foodbankCell'>" + foodbankNotes+ "</td>";

        document.getElementById('foodbanksMapTitle').innerHTML = selectedfoodbank;


        var foodbankLat = Number(foodbankData[selectedfoodbank].Latitude);
        var foodbankLng = Number(foodbankData[selectedfoodbank].Longitude);

        var markers = Ember.A([{
            title: selectedfoodbank,
            backgroundColor: 'blue',
            lat: foodbankLat,
            lng: foodbankLng,
            body: ''
    }]);
        this.set('lat', foodbankLat);
        this.set('lng', foodbankLng);
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
        var foodbankArray = [];
        var numberOfFoodbanks;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {

            Papa.parse("http://tomforth.co.uk/widgetCSV/foodbanks.csv", {
                download: true,
                complete: function (results) {
                    foodbankData = create3DjsonWithUniqueFieldNames(results.data);
                    populateFoodbankArray();
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

            function populateFoodbankArray() {
                numberOfFoodbanks = Object.keys(foodbankData).length;
                var j;

                for (j = 0; j < numberOfFoodbanks; j++) {
                    var foodbankLocation = Object.keys(foodbankData)[j];

                    foodbankArray.push(foodbankLocation);
                }

                setSelectContent();

            }

            function setSelectContent() {
     
                for (var k = 0; k < foodbankArray.length; k++) {

                    var individualItem = {
                        id: foodbankArray[k],
                        title: foodbankArray[k],
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